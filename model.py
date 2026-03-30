# model.py
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import process

class Recommend:
    def __init__(self, csv_path="cities_with_images.csv"):
        self.csv_path = csv_path
        self.city_df = self._load_and_prepare_data()
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.city_embeddings = self._generate_embeddings()

    def _load_and_prepare_data(self):
        city = pd.read_csv(self.csv_path)
        city = city.drop(['Best_time_to_visit'], axis=1, errors='ignore')
        city = city.dropna(subset=['City', 'Ratings', 'Ideal_duration', 'City_desc', 'Image_URL'])
        city['City_desc'] = city['City_desc'].str.lower()
        city['City'] = city['City'].str.strip()
        return city.reset_index(drop=True)

    def _generate_embeddings(self):
        print("Generating city description embeddings...")
        return self.model.encode(self.city_df['City_desc'].tolist(), show_progress_bar=True)

    def recommend(self, query):
        print(f"Processing query: {query}")
        query_lower = query.strip().lower()

        # Fuzzy match city name (allowing for small typos)
        city_names = self.city_df['City'].str.lower().tolist()
        match = process.extractOne(query_lower, city_names, score_cutoff=80)

        exact_match_result = []
        used_indices = set()

        if match:
            matched_city = match[0]
            matched_idx = self.city_df[self.city_df['City'].str.lower() == matched_city].index[0]
            exact_match_result.append(self._build_result(matched_idx))
            used_indices.add(matched_idx)

        # Semantic similarity on City_desc
        query_embedding = self.model.encode([query_lower])[0]
        similarity_scores = cosine_similarity([query_embedding], self.city_embeddings).flatten()
        top_indices = similarity_scores.argsort()[::-1]

        recommendations = exact_match_result

        for idx in top_indices:
            if idx in used_indices:
                continue
            recommendations.append(self._build_result(idx))
            used_indices.add(idx)
            if len(recommendations) == 10:
                break

        return recommendations

    def _build_result(self, idx):
        row = self.city_df.iloc[idx]
        return {
            "name": row['City'],
            "rating": row['Ratings'],
            "duration": row['Ideal_duration'],
            "description": row['City_desc'],
            "image": row['Image_URL']
        }
if __name__ == "__main__":
    recommender = Recommend("cities_with_images.csv")  # ✅ Correct class name
    query = "manalli"  # Slight typo to test fuzzy matching
    results = recommender.recommend(query)

    for i, rec in enumerate(results, 1):
        print(f"{i}. {rec['name']} (Rating: {rec['rating']})\n   {rec['description'][:100]}...\n   {rec['image']}\n")


    
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import process
import pickle  # <-- Naya library add kiya file save karne ke liye
import os      # <-- Naya library add kiya file check karne ke liye

class Recommend:
    def __init__(self, csv_path="cities_with_images.csv"):
        self.csv_path = csv_path
        self.embeddings_file = "saved_embeddings.pkl"  # <-- Is file mein data save hoga
        self.city_df = self._load_and_prepare_data()
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.city_embeddings = self._get_embeddings()

    def _load_and_prepare_data(self):
        city = pd.read_csv(self.csv_path)
        city = city.drop(['Best_time_to_visit'], axis=1, errors='ignore')
        city = city.dropna(subset=['City', 'Ratings', 'Ideal_duration', 'City_desc', 'Image_URL'])
        city['City_desc'] = city['City_desc'].str.lower()
        city['City'] = city['City'].str.strip()
        city['Combined_Text'] = city['Category'].str.lower() + " " + city['City_desc']
        return city.reset_index(drop=True)

    def _get_embeddings(self):
        # 1. Agar file already saved hai, toh instantly load kar lo
        if os.path.exists(self.embeddings_file):
            print("🚀 Loading saved embeddings... (Super Fast!)")
            with open(self.embeddings_file, 'rb') as f:
                return pickle.load(f)
        
        # 2. Agar file nahi hai, toh calculate karo aur SAVE kar do
        print("⏳ Generating embeddings for the first time... (Please wait)")
        embeddings = self.model.encode(self.city_df['Combined_Text'].tolist(), show_progress_bar=True)
        
        with open(self.embeddings_file, 'wb') as f:
            pickle.dump(embeddings, f)
            
        return embeddings

    def recommend(self, query):
        print(f"Processing query: {query}")
        query_lower = query.strip().lower()

        expansion_dict = {
            "hot": "summer warm sunny tropical beach heat desert",
            "cold": "winter snow freezing cold chill mountains",
            "winter": "winter snow freezing cold chill mountains",
            "summer": "summer warm sunny tropical beach heat",
            "rain": "monsoon rain wet lush green nature waterfalls",
            "monsoon": "monsoon rain wet lush green nature waterfalls",
            "nature": "nature greenery mountains forest wildlife scenic"
        }

        search_query = query_lower
        if query_lower in expansion_dict:
            search_query = f"{query_lower} {expansion_dict[query_lower]}"
        elif len(query_lower.split()) <= 2:
            search_query = f"A place for a {query_lower} vacation trip"

        city_names = self.city_df['City'].str.lower().tolist()
        match = process.extractOne(query_lower, city_names, score_cutoff=80)

        exact_match_result = []
        used_indices = set()

        if match:
            matched_city = match[0]
            matched_idx = self.city_df[self.city_df['City'].str.lower() == matched_city].index[0]
            exact_match_result.append(self._build_result(matched_idx))
            used_indices.add(matched_idx)

        query_embedding = self.model.encode([search_query])[0]
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
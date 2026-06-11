import pandas as pd
from sentence_transformers import SentenceTransformer
import pickle
import os

print("🚀 Starting the AI Training Process...")

# 1. Delete the old cache if it exists to ensure a clean slate
if os.path.exists("saved_embeddings.pkl"):
    os.remove("saved_embeddings.pkl")
    print("🗑️ Deleted old saved_embeddings.pkl cache.")

# 2. Load your updated database
print("📂 Loading updated database...")
df = pd.read_csv("cities_with_images.csv")

# Ensure no empty descriptions break the model
df['City_desc'] = df['City_desc'].fillna("") 

# 3. Load the NLP Model
print("🧠 Loading AI Model (all-MiniLM-L6-v2)...")
model = SentenceTransformer('all-MiniLM-L6-v2')

# 4. Generate the new embeddings (This is the actual "training" phase)
print("⏳ Generating new mathematical vectors (embeddings)...")
descriptions = df['City_desc'].tolist()

# show_progress_bar=True will give you that nice visual loading bar in the terminal
embeddings = model.encode(descriptions, show_progress_bar=True)

# 5. Save the new brain to a .pkl file
print("💾 Saving new brain to 'saved_embeddings.pkl'...")
with open("saved_embeddings.pkl", "wb") as f:
    pickle.dump(embeddings, f)

print("✅ Success! Your model is fully updated and ready for the Flask server.")

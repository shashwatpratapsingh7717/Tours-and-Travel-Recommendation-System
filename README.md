<div align="center">

# 🌍 AI-Powered Tours & Travel Recommendation System ✈️

*Discover your next perfect destination using natural language AI.*

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Backend-black?style=for-the-badge&logo=flask&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![HuggingFace](https://img.shields.io/badge/AI_Model-Sentence_Transformers-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)

---

<img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1000&q=80" alt="Travel Banner" width="100%" style="border-radius: 15px;">

</div>

## 📖 About The Project

Traditional travel search engines rely on exact keyword matches. This project completely changes how users find destinations by using **Semantic AI Search**. 

Instead of searching for a specific city name, users can type natural thoughts like *"A quiet cold place with mountains"* or *"Sunny beaches for summer"*, and the AI engine will mathematically compute the closest matching destinations using deep learning embeddings.

### ✨ Key Features

* 🧠 **Natural Language Processing:** Powered by `sentence-transformers` (`all-MiniLM-L6-v2`) to understand the actual meaning behind search queries.
* ⚡ **Lightning Fast Caching:** Utilizes `pickle` to serialize complex AI models, reducing load times from minutes to milliseconds.
* 🎨 **Premium UI/UX:** Built with Tailwind CSS featuring glassmorphism, smooth hover-zoom animations, and dynamic loading states.
* ⭐ **Interactive Star Ratings:** Users can rate their experiences, which updates the live database instantly.
* 🕵️ **Smart History:** Integrated with **MongoDB** to track user sessions and automatically load their last searched preferences on return.
* 🛡️ **Bulletproof UI:** Custom frontend fallback handlers ensure broken image links never disrupt the visual experience.

---

## 🛠️ Technology Stack

| Domain | Tools & Libraries |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla JavaScript, Tailwind CSS |
| **Backend** | Python, Flask |
| **Database** | MongoDB, Pandas (Data Manipulation) |
| **AI / Machine Learning** | `sentence-transformers`, `rapidfuzz` (Fuzzy matching), `scikit-learn` (Cosine Similarity) |

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

You will need Python and MongoDB installed on your system.
* [Download Python](https://www.python.org/downloads/)
* [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)

### Installation

<details>
<summary><b>Click to expand installation steps</b></summary>
<br>

**1. Clone the repository**
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
2. Set up a Virtual Environment (Recommended)

Bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate
3. Install Dependencies

Bash
pip install -r requirements.txt
(Note: If you don't have a requirements.txt, install manually: pip install flask pandas pymongo sentence-transformers rapidfuzz scikit-learn)

4. Start the Application
Navigate to the backend folder and run the server:

Bash
cd Backend
python app.py
5. Open your browser
Navigate to http://127.0.0.1:5000 to view the app!

💡 How It Works (The AI Magic)
Data Preparation: City descriptions and categories are combined into a single text block.

Vectorization: The Hugging Face transformer model converts these text blocks into dense numerical arrays (embeddings).

Query Expansion: When a user types a short word (e.g., "hot"), the system secretly expands it with context (e.g., "summer warm sunny tropical beach heat").

Cosine Similarity: The system calculates the mathematical angle between the user's search vector and all city vectors to rank and return the absolute best matches.

🔮 Future Enhancements
[ ] Implement user accounts and secure login routing.

[ ] Add Google Maps API integration for location viewing.

[ ] Introduce budget filters (Low, Medium, Luxury).

[ ] Host the application live on Render or AWS.

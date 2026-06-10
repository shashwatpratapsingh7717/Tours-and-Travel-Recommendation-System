import os
from flask import Flask, render_template, request, redirect, url_for, session, flash, send_from_directory, jsonify
import pandas as pd
from pymongo import MongoClient
import hashlib
import difflib
import model

# --- FOLDER CONFIGURATION ---
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Point directly to the templates and static folders inside frontend
TEMPLATE_DIR = os.path.join(BASE_DIR, '..', 'frontend', 'templates')
STATIC_DIR = os.path.join(BASE_DIR, '..', 'frontend', 'static')

app = Flask(__name__, 
            template_folder=TEMPLATE_DIR, 
            static_folder=STATIC_DIR, 
            static_url_path='/static')

app.secret_key = '7970209315'

# Lazy-loaded variables (initialized on first use, not on startup)
recommender = None
users = None

def get_recommender():
    """Lazy load recommender on first use"""
    global recommender
    if recommender is None:
        print("Initializing recommender model...")
        recommender = model.Recommend("cities_with_images.csv")
    return recommender

def get_users_collection():
    """Lazy load MongoDB collection on first use"""
    global users
    if users is None:
        try:
            print("Connecting to MongoDB...")
            client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
            client.server_info()  # Check connection
            db = client.travel_recommendation
            users = db.users
            print("MongoDB connected successfully")
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            print("App will run but authentication features will not work")
            users = None
    return users

# ... (keep all your @app.route functions exactly the same below this line)
@app.route('/save_search', methods=['POST'])
def save_search():
    data = request.get_json()
    username = data.get('username')
    city = data.get('city')

    if not username or not city:
        return jsonify({"status": "fail", "message": "Missing username or city"}), 400

    users_col = get_users_collection()
    if users_col is None:
        return jsonify({"status": "fail", "message": "Database unavailable"}), 500

    user = users_col.find_one({"username": username})
    if user:
        history = user.get("history", [])
        history.append(city)   # allow duplicates
        users_col.update_one({"username": username}, {"$set": {"history": history}})
        return jsonify({"status": "success"}), 200
        
    return jsonify({"status": "fail", "message": "User not found"}), 404

@app.route('/')
def index():
    if 'username' in session:
        return render_template('index.html', username=session['username'])
    else:
        return redirect(url_for('login'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Hash password for security
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        users_col = get_users_collection()
        if users_col is None:
            flash('Database unavailable. Please try again later.', 'error')
            return redirect(url_for('signup'))

        # Check if user exists
        if users_col.find_one({'username': username}):
            flash('Username already exists!')
            return redirect(url_for('signup'))

        users_col.insert_one({'username': username, 'password': hashed_password})
        flash('Signup successful! Please login.')
        return redirect(url_for('login'))

    return render_template('signup.html')
@app.route('/where-to-go')
def where_to_go():
    return render_template('Where-to-go.html')  # The secondary page

@app.route('/cities_with_categories.json')
def get_city_data():
    return send_from_directory('static', 'cities_with_categories.json')

@app.route('/popular-cities')
def popular_cities():
    return render_template('Popular-cities.html')

CSV_PATH = "cities_with_images.csv"
JSON_PATH = "static/cities_with_categories.json"

@app.route('/rate-city', methods=['POST'])
def rate_city():
    data = request.json
    city_name = data.get("city")
    new_rating = data.get("rating")

    if not city_name or new_rating is None:
        return jsonify({"error": "Missing city or rating"}), 400

    if not os.path.exists(CSV_PATH):
        return jsonify({"error": "CSV file not found"}), 500

    df = pd.read_csv(CSV_PATH)

    # Fuzzy matching to handle small input errors
    all_cities = df['City'].dropna().tolist()
    closest = difflib.get_close_matches(city_name, all_cities, n=1, cutoff=0.8)

    if not closest:
        return jsonify({"error": f"City '{city_name}' not found"}), 404

    matched_city = closest[0]

    # Overwrite the rating (or average it — see note below)
    df.loc[df['City'] == matched_city, 'Ratings'] = float(new_rating)

    # Save back to CSV
    df.to_csv(CSV_PATH, index=False)

    # Save updated data to JSON
    df.to_json(JSON_PATH, orient='records', indent=2)

    return jsonify({
        "message": f"Rating for '{matched_city}' updated to {new_rating}"
    }), 200

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        users_col = get_users_collection()
        if users_col is None:
            flash('Database unavailable. Please try again later.', 'error')
            return redirect(url_for('login'))

        user = users_col.find_one({'username': username, 'password': hashed_password})

        if user:
            session['username'] = username
            session['user_id'] = str(user['_id'])  # Store user_id as string
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid credentials', 'error')
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/get_history', methods=['GET'])
def get_history():
    username = request.args.get("username")
    users_col = get_users_collection()
    if users_col is None:
        return jsonify({"status": "fail", "message": "Database unavailable"}), 500
    
    user = users_col.find_one({"username": username})
    if user:
        history = user.get("history", [])
        return jsonify({"status": "success", "history": history})
    return jsonify({"status": "fail", "message": "User not found"})


@app.route("/recommend", methods=["GET"])
def get_recommendations():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "City parameter is required"}), 400

    rec = get_recommender()
    recommendations = rec.recommend(city)


    if not recommendations:
        return jsonify({"error": "City not found"}), 404

    return jsonify({
        "query": city,
        "results": recommendations
    })

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('user_id', None)
    session.pop('_flashes', None)
    flash('You have successfully logged out.')
    return redirect(url_for('login', logout=1))




# ========== Run Server ==========
if __name__ == "__main__":
    app.run(port=5000, debug=True)
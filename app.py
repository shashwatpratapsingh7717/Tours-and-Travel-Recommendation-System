from flask import Flask, render_template, request, redirect, url_for, session, flash,send_from_directory
import pandas as pd
from pymongo import MongoClient
from flask import Flask, jsonify
from bson.objectid import ObjectId
import hashlib
from flask import request, jsonify
import difflib
import os
from model import Recommend
recommender = Recommend("cities_with_images.csv")
app = Flask(__name__)
app.secret_key = '7970209315'

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")  # or your MongoDB Atlas URL
db = client.travel_recommendation
users = db.users

@app.route('/save_search', methods=['POST'])
def save_search():
    data = request.get_json()
    username = data['username']
    city = data['city']

    user = users.find_one({"username": username})
    if user:
        history = user.get("history", [])
        history.append(city)   # ← allow duplicates
        users.update_one({"username": username}, {"$set": {"history": history}})
        return jsonify({"status": "success"})
    return jsonify({"status": "fail", "message": "User not found"})

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

        # Check if user exists
        if users.find_one({'username': username}):
            flash('Username already exists!')
            return redirect(url_for('signup'))

        users.insert_one({'username': username, 'password': hashed_password})
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
        user = users.find_one({'username': username, 'password': hashed_password})

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
    user = users.find_one({"username": username})
    if user:
        history = user.get("history", [])
        return jsonify({"status": "success", "history": history})
    return jsonify({"status": "fail", "message": "User not found"})


@app.route("/recommend", methods=["GET"])
def get_recommendations():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "City parameter is required"}), 400

    recommendations = recommender.recommend(city)


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
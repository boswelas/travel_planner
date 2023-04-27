from flask import Flask, jsonify, request, redirect, render_template
from flask import Flask, jsonify, request, redirect, render_template
from flask_cors import CORS
import os
import mysql.connector

app = Flask(__name__)
CORS(app)

HOST = os.environ['MYSQLHOST']
PORT = os.environ['MYSQLPORT']
USER = os.environ['MYSQLUSER']
PASSWORD = os.environ['MYSQLPASSWORD']
DATABASE = os.environ['MYSQLDATABASE']


def create_connection():
    db = mysql.connector.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        database=DATABASE
    )

    return db

@app.route('/')
def index():
    print("Server is running!")
    return jsonify("Welcome to the Travel Planner backend!")


@app.route('/user')
def get_all_users():

    # Opens connection & cursor
    cnx = create_connection()
    cursor = cnx.cursor()

    # Database queries & logic
    cursor.execute("SELECT * FROM user")
    result = cursor.fetchall()
    print(result)

    # Closes connection & cursor
    cursor.close()
    cnx.close()

    return jsonify(result=result)

############################# BEGIN route for Experiences #############################
@app.route("/experience", methods=["GET"])
def experience():
        
    # Display experiences using query to grab all experiences in Experiences
    if request.method == "GET":
        search_query = request.query_string.decode()
        
        # Opens connection & cursor
        cnx = create_connection()
        cur = cnx.cursor()

        if search_query:
            query = f"SELECT * FROM Experience WHERE MATCH (`title`, `description`, `geolocation`, `avg_rating`) AGAINST ('{search_query[2:]}' IN NATURAL LANGUAGE MODE);"
        else:
            query = "SELECT experience_id, location_id, title, description, geolocation, avg_rating FROM experience"

        cur.execute(query)
        data = cur.fetchall()
        cur.close()
        cnx.close()
        return jsonify(data=data)
    
@app.route("/experience/addNewExperience", methods=["POST"])
def addNewExperience():
        # Insert new experience
    print("Experiences are being triggered")
    if request.is_json:
        # Grab experience form inputs
        data = request.get_json()
        experience_id = data["experienceID"]
        location_id = data["locationID"]
        title = data["title"]
        description = data["description"]
        geolocation = data["geolocation"]
        avg_rating = data["avg_rating"]
        user_user_id = data["userID"]

        # Add data
        query = "INSERT INTO Experience (experience_id, location_id, title, description, geolocation, avg_rating, user_user_id) VALUES (%s, %s, %s, %s, %s, %s)"
        
        cnx = create_connection()
        cur = cnx.cursor()
        cur.execute(query, (experience_id, location_id, title, description, geolocation, avg_rating, user_user_id))
        cnx.commit()

        return jsonify({"success": True})
    

############################# END route for Experiences #############################


############################# BEGIN route for Search #############################
@app.route("/search", methods=["GET"])
def search():
    if request.method == "GET":
        search_term = request.args.get("search")
        print(search_term)

        if search_term:
            query = """SELECT exp.experience_id, exp.title, exp.city, exp.state, exp.country
                        FROM (
                            SELECT experience.experience_id, experience.title, experience.description, experience.avg_rating, location.city, location.state, location.country, keyword.keyword
                                FROM experience
                                JOIN location
                                ON experience.location_id = location.location_id
                                JOIN experience_has_keyword
                                ON experience.experience_id = experience_has_keyword.experience_id
                                JOIN keyword
                                ON  experience_has_keyword.keyword_id = keyword.keyword_id
                            WHERE
                                MATCH (experience.title) AGAINST (%s IN NATURAL LANGUAGE MODE)
                                OR MATCH (location.city, location.state, location.country) AGAINST (%s IN NATURAL LANGUAGE MODE)
                                OR MATCH (keyword.keyword) AGAINST (%s IN NATURAL LANGUAGE MODE)
                        ) AS exp"""
                      
            cnx = create_connection()
            cursor = cnx.cursor()

            cursor.execute(query, (search_term, search_term, search_term))

            data = cursor.fetchall()

        return jsonify(data)

############################# END route for Search #############################

if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5001))

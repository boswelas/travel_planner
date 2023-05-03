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
# Converts fetched data into dictionary
def convert_to_dict(cursor, row):
    result = {}
    for idx, col in enumerate(cursor.description):
        result[col[0]] = row[idx]
    return result

# Get all experiences
@app.route("/experience", methods=["GET"])
def experience():

    if request.method == "GET":
        cnx = create_connection()
        cur = cnx.cursor()

        query = """SELECT experience.experience_id, experience.title, location.city, location.state, location.country, experience.avg_rating, experience.description
                    FROM experience
                    JOIN location
                    ON experience.location_id = location.location_id"""
        
        cur.execute(query)
        data = cur.fetchall()
        data = [convert_to_dict(cur, row) for row in data]
        cur.close()
        cnx.close()
        return jsonify(data=data)

# Get experience based on id
@app.route("/experience/<int:experience_id>", methods=["GET"])
def get_experience(experience_id):
    cnx = create_connection()
    cur = cnx.cursor()

    query = """SELECT experience.experience_id, experience.title, location.city, location.state, location.country, experience.avg_rating, experience.description
                FROM experience
                JOIN location
                ON experience.location_id = location.location_id
                WHERE experience.experience_id = %s"""

    cur.execute(query, (experience_id,))
    data = cur.fetchone()

    data = convert_to_dict(cur, data)
    cur.close()
    cnx.close()

    return jsonify(data=data)


# Post new experience
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
        cur.execute(query, (experience_id, location_id, title,
                    description, geolocation, avg_rating, user_user_id))
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
            query = """SELECT DISTINCT exp.experience_id, exp.title, exp.city, exp.state, exp.country, exp.avg_rating, exp.description
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

        # Convert the data to a dictionary so that it shows up as an object
        payload = []
        for row in data:
            payload.append({'id': row[0], 'title': row[1], 'city': row[2], 'state': row[3], 'country': row[4], 'rating': row[5], 'description': row[6]})

        return jsonify(payload)

############################# END route for Search #############################

############################# BEGIN route for Login #############################


@app.route("/login", methods=["POST"])
def check_user_exists():
    if request.method == "POST":
        data = request.get_json()
        email = data["email"]
        query = ("SELECT * FROM user WHERE email = (%s)")
        # Opens connection & cursor
        cnx = create_connection()
        cur = cnx.cursor()

        cur.execute(query, (email,))

        data = cur.fetchall()
        cur.close()
        cnx.close()
        return jsonify({"user": data})

############################# END route for Login #############################

############################# BEGIN route for Signup #############################


@app.route('/signup', methods=['POST'])
def signup():
    if request.method == "POST":
        data = request.json

        email = data.get('email')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        birthday = data.get('birthday')

        cnx = create_connection()
        cursor = cnx.cursor()

        try:
            cursor.execute("""
                INSERT INTO user (email, first_name, last_name, birthday)
                VALUES ( %s, %s, %s, %s)
            """, (email, first_name, last_name, birthday))

            cnx.commit()
            cursor.close()
            cnx.close()

            return jsonify({'success': True}), 200
        except Exception as e:
            cnx.rollback()
            cursor.close()
            cnx.close()

            return jsonify({'error': str(e)}), 500


############################# END route for Signup #############################

############################# BEGIN route for GetID #############################
@app.route('/GetID', methods=['POST'])
def GetID():
    if request.method == "POST":
        data = request.get_json()
        email = data["email"]
        query = ("SELECT * FROM user WHERE email = (%s)")
        # Opens connection & cursor
        cnx = create_connection()
        cur = cnx.cursor()

        cur.execute(query, (email,))

        data = cur.fetchall()
        cur.close()
        cnx.close()
        return jsonify({"user": data})
    ############################# END route for GetID #############################


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5001))

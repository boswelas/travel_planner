from flask import Flask, jsonify, request
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import jwt
import requests
import mysql.connector
from datetime import datetime
from cryptography.x509 import load_pem_x509_certificate
from cryptography.hazmat.backends import default_backend

from opencage.geocoder import OpenCageGeocode


app = Flask(__name__)
CORS(app)

HOST = os.environ['MYSQLHOST']
PORT = os.environ['MYSQLPORT']
USER = os.environ['MYSQLUSER']
PASSWORD = os.environ['MYSQLPASSWORD']
DATABASE = os.environ['MYSQLDATABASE']
GEOCAGE_API = os.environ['GEOCAGE_API']


def verify_token(id_token):
    if id_token.startswith('Bearer '):
        id_token = id_token.split(' ')[1]
    header = jwt.get_unverified_header(id_token)
    alg = header["alg"]
    kid = header["kid"]

# Fetch the public key from Firebase
    response = requests.get(
        f"https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com")
    response.raise_for_status()
    keys = response.json()
    pub_key = keys[kid]

    # Load the public key and verify the token
    try:
        cert = load_pem_x509_certificate(pub_key.encode(), default_backend())
        public_key = cert.public_key()
        payload = jwt.decode(id_token, public_key, algorithms=[
                             alg], audience='travelapp-9e26b', issuer="https://securetoken.google.com/travelapp-9e26b", options={"verify_exp": True, "verify_iat": True})
        # Check if the token has expired
        if payload["exp"] < datetime.utcnow().timestamp():
            # Token has expired
            return False
        else:
            # Token is valid
            return payload['user_id']

    except jwt.ExpiredSignatureError:
        # Token has expired
        print("Token has expired")
        return False
    except Exception as e:
        # Token is invalid
        print("Token is invalid: ", e)
        return False


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

        query = """SELECT experience.experience_id, experience.title, location.city, location.state, location.country, ST_AsText(experience.geolocation) as geolocation, experience.avg_rating, experience.description, 
                GROUP_CONCAT(keyword.keyword SEPARATOR ', ') as keywords
                FROM experience
                JOIN location
                ON experience.location_id = location.location_id
                JOIN experience_has_keyword
                ON experience.experience_id = experience_has_keyword.experience_id
                LEFT JOIN keyword
                ON experience_has_keyword.keyword_id = keyword.keyword_id
                GROUP BY experience.experience_id"""

        cur.execute(query)
        data = cur.fetchall()
        data = [convert_to_dict(cur, row) for row in data]

        for item in data:
            if item['geolocation'] is not None:
                geolocation_str = item['geolocation'][6:-1]  # Remove "POINT(" at start and ")" at end
                geolocation_coords = geolocation_str.split()  # Split by space
                geolocation_coords = tuple(map(float, geolocation_coords))  # Convert to float and form a tuple
                item['geolocation'] = f"({geolocation_coords[0]}, {geolocation_coords[1]})"  # Format as a tuple string

        cur.close()
        cnx.close()
        return jsonify(data=data)

# Get experience based on id
@app.route("/experience/<int:experience_id>", methods=["GET"])
def get_experience(experience_id):
    cnx = create_connection()
    cur = cnx.cursor()

    query = """SELECT experience.experience_id, experience.title, location.city, location.state, location.country, ST_AsText(experience.geolocation) as geolocation, experience.avg_rating, experience.description, 
                GROUP_CONCAT(keyword.keyword SEPARATOR ', ') as keywords
                FROM experience
                JOIN location
                ON experience.location_id = location.location_id
                LEFT JOIN experience_has_keyword
                ON experience.experience_id = experience_has_keyword.experience_id
                LEFT JOIN keyword
                ON experience_has_keyword.keyword_id = keyword.keyword_id
                WHERE experience.experience_id = %s
                GROUP BY experience.experience_id"""

    cur.execute(query, (experience_id,))
    data = cur.fetchone()
    data = convert_to_dict(cur, data)

    if data['geolocation'] is not None:
        geolocation_str = data['geolocation'][6:-1]  # Remove "POINT(" at start and ")" at end
        geolocation_coords = geolocation_str.split()  # Split by space
        geolocation_coords = tuple(map(float, geolocation_coords))  # Convert to float and form a tuple
        data['geolocation'] = f"({geolocation_coords[0]}, {geolocation_coords[1]})"  # Format as a tuple string

    cur.close()
    cnx.close()

    return jsonify(data=data)


# Post new experience
@app.route("/experience/addNewExperience", methods=["POST"])
def addNewExperience():
    if request.method == "POST":
        header = request.headers.get('Authorization')
        user_id = verify_token(header)

        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 403

        title = request.form["title"]
        description = request.form["description"]
        geolocation = json.loads(request.form["geolocation"])
        keywords = json.loads(request.form["keywords"])
        imageURL = request.form["imageURL"]

        cnx = create_connection()
        cur = cnx.cursor()

        # Location logic
        location_id = get_or_add_location(geolocation)        

        # INSERT INTO experience
        cur.execute('INSERT INTO experience (title, description, location_id, geolocation, imageURL) VALUES (%s, %s, %s, ST_GeomFromText("POINT(%s %s)"), %s)', (title, description, location_id, geolocation[0], geolocation[1], imageURL))

        experience_id = cur.lastrowid

        # INSERT INTO keywords
        for keyword in keywords:
            cur.execute('INSERT INTO keyword (keyword) VALUES (%s)', ( keyword,))
            keyword_id = cur.lastrowid
            cur.execute('INSERT INTO experience_has_keyword (experience_id, keyword_id) VALUES (%s, %s)', (experience_id, keyword_id))

        cnx.commit()
        return jsonify({"experience_id": experience_id})

def get_or_add_location(geolocation):
    """
    Input a geolocation, returns a location_id
    Will add location if not already in database.
    """

    cnx = create_connection()
    cur = cnx.cursor()

    # Breaks out coordinates
    lat = geolocation[0]
    long = geolocation[1]
    
    # # Pulls info from API
    # OCG = OpenCageGeocode(GEOCAGE_API)
    # results = OCG.reverse_geocode(lat, long)
    # city = results[0]['components']['village']
    # state = results[0]['components']['state']
    # country = results[0]['components']['country']

    # Pulls info from API
    OCG = OpenCageGeocode(GEOCAGE_API)
    results = OCG.reverse_geocode(lat, long)

    components = results[0]['components']
    city = components.get('city') or components.get('town') or components.get('village') or components.get('state_district') or components.get('county') or components.get('region') or components.get('island') or 'Unknown'
    state = components.get('state') or 'Unknown'
    country = components.get('country') or 'Unknown'

    # Checks if location exists
    select_sql = "SELECT location_id FROM location WHERE city = %s AND state = %s AND country = %s"
    cur.execute(select_sql, (city, state, country))
    location_id = cur.fetchone()
    if location_id:
        return location_id[0]
    else:
        # If location doesn't exists, inserts location
        insert_sql = "INSERT INTO location (city, state, country) VALUES (%s, %s, %s)"
        cur.execute(insert_sql, (city, state, country))
        cnx.commit()

    # Returns the final location_id
    cur.execute(select_sql, (city, state, country))
    location_id = cur.fetchone()

    cur.close()
    cnx.close()

    return location_id[0]



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
            payload.append({'experience_id': row[0], 'title': row[1], 'city': row[2], 'state': row[3],
                           'country': row[4], 'rating': row[5], 'description': row[6]})

        return jsonify(payload)

############################# END route for Search #############################

############################# BEGIN route for Login #############################


@app.route("/login", methods=["POST"])
def check_user_exists():
    if request.method == "POST":
        data = request.get_json()
        uid = data["uid"]
        email = data["email"]
        displayName = data["displayName"]
        query = ("SELECT * FROM user WHERE user_id = (%s)")
        # Opens connection & cursor
        cnx = create_connection()
        cur = cnx.cursor()

        cur.execute(query, (uid,))
        data = cur.fetchall()
        if (len(data) == 0):
            try:
                cur.execute("""
                    INSERT INTO user (user_id, email, displayName)
                    VALUES ( %s, %s, %s)
                """, (uid, email, displayName))

                cnx.commit()
                cur.close()
                cnx.close()

            except Exception as e:
                cnx.rollback()
                cur.close()
                cnx.close()

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

############################# BEGIN route for Trip #############################


@app.route('/trip', methods=['POST'])
def Trip():
    if request.method == "POST":
        header = request.headers.get('Authorization')
        token_uid = verify_token(header)
        data = request.get_json()
        user_id = data["user_id"]
        if token_uid == user_id:
            query = (
                "SELECT * FROM trip WHERE user_id = %s")

            cnx = create_connection()
            cur = cnx.cursor()
            cur.execute(query, (user_id,))

            data = cur.fetchall()
            cur.close()
            cnx.close()
            return jsonify({"trip": data})
        return jsonify({"trip": "invalid"})


@app.route('/addTrip', methods=['POST'])
def addTrip():
    if request.method == "POST":
        header = request.headers.get('Authorization')
        token_uid = verify_token(header)
        data = request.get_json()
        name = data["name"]
        user_id = data["user_id"]
        if token_uid == user_id:
            query = "INSERT INTO trip (name, user_id) VALUES (%s, %s)"
            # Opens connection & cursor
            cnx = create_connection()
            cur = cnx.cursor()

            cur.execute(
                query, (name, user_id))
            cnx.commit()

        return jsonify({"success": True})
    return jsonify({"success": False})


@app.route('/deleteTrip', methods=['POST'])
def deleteTrip():
    if request.method == "POST":
        data = request.get_json()
        trip_id = data["trip_id"]
        user_id = data["user_id"]

        cnx = create_connection()
        cur = cnx.cursor()

        cur.execute(
            "DELETE FROM trip_has_experience WHERE trip_id = %s", (trip_id,))
        cur.execute(
            "DELETE FROM trip WHERE trip_id = %s and user_id = %s", (trip_id, user_id))

        cnx.commit()

        cur.close()
        cnx.close()

        return jsonify({"success": True})
    return jsonify({"success": False})


@app.route('/tripDetail', methods=['POST'])
def TripDetail():
    if request.method == "POST":
        header = request.headers.get('Authorization')
        token_uid = verify_token(header)
        data = request.get_json()
        trip_id = data["trip_id"]
        check_uid = "SELECT user_id FROM trip WHERE trip_id = %s"
        query = ("SELECT * FROM trip_has_experience JOIN experience ON trip_has_experience.experience_id = experience.experience_id WHERE trip_has_experience.trip_id = %s;")

        cnx = create_connection()
        cur = cnx.cursor()
        cur.execute(check_uid, (trip_id,))
        trip_user_id = cur.fetchall()

        if token_uid == trip_user_id[0][0]:
            cur.execute(query, (trip_id,))
            data = cur.fetchall()
            data = [convert_to_dict(cur, row) for row in data]
            cur.close()
            cnx.close()
            return jsonify({"trip": data})
        else:
            cur.close()
            cnx.close()
            return jsonify({"trip": "invalid"})


@app.route('/addExperienceToTrip', methods=['POST'])
def addExperienceToTrip():
    if request.method == "POST":
        try:
            data = request.get_json()
            header = request.headers.get('Authorization')
            user_id = verify_token(header)
            experience_id = data["experience_id"]
            print("experience id: %s", experience_id)
            trip_id = data["trip_id"]
            print("trip id: %s", trip_id)
            query = "INSERT INTO trip_has_experience (trip_id, experience_id) VALUES (%s, %s)"
            values = (trip_id, experience_id)
            cnx = create_connection()
            cur = cnx.cursor()
            cur.execute(query, values)
            cnx.commit()
            cur.close()
            cnx.close()

            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)})

    return jsonify({"success": False, "error": "Invalid request method"})


@app.route('/deleteExperienceFromTrip', methods=['POST'])
def deleteExperienceFromTrip():
    if request.method == "POST":
        try:
            data = request.get_json()
            trip_id = data["trip_id"]
            experience_id = data["experience_id"]

            cnx = create_connection()
            cur = cnx.cursor()

            cur.execute(
                "DELETE FROM trip_has_experience WHERE trip_id = %s AND experience_id = %s", (trip_id, experience_id))

            cnx.commit()
            cur.close()
            cnx.close()

            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)})

    return jsonify({"success": False, "error": "Invalid request method"})

############################# END route for Trip #############################

############################# BEGIN route for Latest Experience #############################


@app.route("/LatestExp", methods=["GET"])
def LatestExp():
    if request.method == "GET":
        search_term = request.args.get("count")
        print(search_term)

        if search_term is None:
            # Defaults to 3
            search_term = 3

        query = """
                SELECT experience.experience_id, experience.title, location.city, location.state, location.country, experience.avg_rating, experience.description, 
                GROUP_CONCAT(keyword.keyword SEPARATOR ', ') as keywords
                FROM experience
                JOIN location
                ON experience.location_id = location.location_id
                LEFT JOIN experience_has_keyword
                ON experience.experience_id = experience_has_keyword.experience_id
                LEFT JOIN keyword
                ON experience_has_keyword.keyword_id = keyword.keyword_id
                GROUP BY experience.experience_id
                ORDER BY experience.experience_id DESC
                LIMIT %s"""

        cnx = create_connection()
        cursor = cnx.cursor()

        cursor.execute(query, (search_term,))

        data = cursor.fetchall()

        # Convert the data to a dictionary so that it shows up as an object
        payload = []
        for row in data:
            payload.append({'experience_id': row[0], 'title': row[1], 'city': row[2], 'state': row[3],
                           'country': row[4], 'rating': row[5], 'description': row[6], 'keywords': row[7]})

        return jsonify(payload)

############################# END route for Search #############################


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5001))

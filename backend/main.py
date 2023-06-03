from flask import Flask, jsonify, request, json
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import jwt
import requests
import mysql.connector
from datetime import datetime
from cryptography.x509 import load_pem_x509_certificate
from cryptography.hazmat.backends import default_backend

from opencage.geocoder import OpenCageGeocode

from google.cloud import storage


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
       # Token is valid
        return payload['user_id']

    except jwt.ExpiredSignatureError:
        # Token has expired
        print("Token has expired - exp sig err")
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
            GROUP_CONCAT(image.img_url) as img_url,
            GROUP_CONCAT(keyword.keyword SEPARATOR ', ') as keywords
            FROM experience
            JOIN location
            ON experience.location_id = location.location_id
            JOIN experience_has_keyword
            ON experience.experience_id = experience_has_keyword.experience_id
            LEFT JOIN keyword
            ON experience_has_keyword.keyword_id = keyword.keyword_id
            LEFT JOIN experience_has_image
            ON experience.experience_id = experience_has_image.experience_id
            LEFT JOIN image
            ON experience_has_image.image_id = image.image_id
            GROUP BY experience.experience_id"""

        cur.execute(query)
        data = cur.fetchall()
        data = [convert_to_dict(cur, row) for row in data]

        for item in data:
            if item['geolocation'] is not None:
                # Remove "POINT(" at start and ")" at end
                geolocation_str = item['geolocation'][6:-1]
                geolocation_coords = geolocation_str.split()  # Split by space
                # Convert to float and form a tuple
                geolocation_coords = tuple(map(float, geolocation_coords))
                # Format as a tuple string
                item['geolocation'] = f"({geolocation_coords[0]}, {geolocation_coords[1]})"

        cur.close()
        cnx.close()
        return jsonify(data=data)

# Get experience based on id


@app.route("/experience/<int:experience_id>", methods=["GET"])
def get_experience(experience_id):
    cnx = create_connection()
    cur = cnx.cursor()

    query = """
            SELECT experience.experience_id, experience.title, location.city, location.state, location.country, ST_AsText(experience.geolocation) as geolocation, experience.avg_rating, experience.description, 
            GROUP_CONCAT(image.img_url) as img_url,
            GROUP_CONCAT(keyword.keyword SEPARATOR ', ') as keywords
            FROM experience
            JOIN location
            ON experience.location_id = location.location_id
            JOIN experience_has_keyword
            ON experience.experience_id = experience_has_keyword.experience_id
            LEFT JOIN keyword
            ON experience_has_keyword.keyword_id = keyword.keyword_id
            LEFT JOIN experience_has_image
            ON experience.experience_id = experience_has_image.experience_id
            LEFT JOIN image
            ON experience_has_image.image_id = image.image_id
            WHERE experience.experience_id = %s
            GROUP BY experience.experience_id"""

    cur.execute(query, (experience_id,))
    data = cur.fetchone()

    data = convert_to_dict(cur, data)

    if data['geolocation'] is not None:
        # Remove "POINT(" at start and ")" at end
        geolocation_str = data['geolocation'][6:-1]
        geolocation_coords = geolocation_str.split()  # Split by space
        # Convert to float and form a tuple
        geolocation_coords = tuple(map(float, geolocation_coords))
        # Format as a tuple string
        data['geolocation'] = f"({geolocation_coords[0]}, {geolocation_coords[1]})"

    cur.close()
    cnx.close()

    return jsonify(data=data)


# Post new experience
@app.route("/experience/addNewExperience", methods=["POST"])
def addNewExperience():
    if request.method == "POST":
        try:
            header = request.headers.get('Authorization')
            if header is None:
                return jsonify({"error": "Missing Authorization header"}), 401

            token_uid = verify_token(header)

            if not token_uid:
                return jsonify({"error": "Invalid token"}), 403

            title = request.form.get("title")
            description = request.form.get("description")
            geolocation = list(
                map(float, request.form.get("geolocation").split(',')))
            keywords = [keyword.strip()
                        for keyword in request.form.get("keywords").split(',')]
            img_url = request.form.get("img_url")

            cnx = create_connection()
            cur = cnx.cursor()

            # Location logic
            location_id = get_or_add_location(geolocation)

            # INSERT INTO experience
            cur.execute('INSERT INTO experience (title, description, location_id, geolocation) VALUES (%s, %s, %s, ST_GeomFromText("POINT(%s %s)"))',
                        (title, description, location_id, geolocation[0], geolocation[1]))
            experience_id = cur.lastrowid

            cur.execute(
                'INSERT INTO image (img_url) VALUES (%s)', (img_url,))

            image_id = cur.lastrowid
            print("image_id is %s", image_id)
            cur.execute(
                'INSERT INTO experience_has_image (experience_id, image_id) VALUES (%s, %s)', (experience_id, image_id))

            # INSERT INTO keywords
            for keyword in keywords:
                cur.execute(
                    'INSERT INTO keyword (keyword) VALUES (%s)', (keyword,))
                keyword_id = cur.lastrowid
                print("keyword_id is %s", keyword_id)
                cur.execute('INSERT INTO experience_has_keyword (experience_id, keyword_id) VALUES (%s, %s)',
                            (experience_id, keyword_id))

            cnx.commit()
            return jsonify({"experience_id": experience_id})
        except Exception as e:
            return jsonify({"error": str(e)}), 500


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

    # Pulls info from API
    OCG = OpenCageGeocode(GEOCAGE_API)
    results = OCG.reverse_geocode(lat, long)

    components = results[0]['components']
    city = components.get('city') or components.get('town') or components.get('village') or components.get(
        'state_district') or components.get('county') or components.get('region') or components.get('island') or 'Unknown'
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
            query = """
                    SELECT DISTINCT exp.experience_id, exp.title, exp.city, exp.state, exp.country, exp.avg_rating, exp.description, exp.geolocation, exp.img_url, exp.keywords
                    FROM (
                        SELECT experience.experience_id, experience.title, experience.description, experience.avg_rating, location.city, location.state, location.country, ST_AsText(experience.geolocation) as geolocation,
                               GROUP_CONCAT(DISTINCT keyword.keyword SEPARATOR ', ') as keywords, GROUP_CONCAT(DISTINCT image.img_url) as img_url
                        FROM experience
                        JOIN location
                        ON experience.location_id = location.location_id
                        JOIN experience_has_keyword
                        ON experience.experience_id = experience_has_keyword.experience_id
                        LEFT JOIN keyword
                        ON experience_has_keyword.keyword_id = keyword.keyword_id
                        LEFT JOIN experience_has_image
                        ON experience.experience_id = experience_has_image.experience_id
                        LEFT JOIN image
                        ON experience_has_image.image_id = image.image_id
                        WHERE
                            MATCH (experience.title) AGAINST (%s IN NATURAL LANGUAGE MODE)
                            OR MATCH (location.city, location.state, location.country) AGAINST (%s IN NATURAL LANGUAGE MODE)
                            OR MATCH (keyword.keyword) AGAINST (%s IN NATURAL LANGUAGE MODE)
                        GROUP BY experience.experience_id
                    ) AS exp"""

            cnx = create_connection()
            cursor = cnx.cursor()

            cursor.execute(query, (search_term, search_term, search_term))

            data = cursor.fetchall()

        # Convert the data to a dictionary so that it shows up as an object
        payload = []
        for row in data:
            # Parse geolocation as required
            if row[7] is not None:
                # Remove "POINT(" at start and ")" at end
                geolocation_str = row[7][6:-1]
                geolocation_coords = geolocation_str.split()  # Split by space
                # Convert to float and form a tuple
                geolocation_coords = tuple(map(float, geolocation_coords))
                # Format as a tuple string
                geolocation = f"({geolocation_coords[0]}, {geolocation_coords[1]})"
            else:
                geolocation = None

            payload.append({'experience_id': row[0], 'title': row[1], 'city': row[2], 'state': row[3], 'country': row[4],
                           'rating': row[5], 'description': row[6], 'geolocation': geolocation, 'img_url': row[8], 'keywords': row[9]})

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
        background_photo = data["background_photo"]
        if token_uid == user_id:
            query = "INSERT INTO trip (name, user_id, background_photo) VALUES (%s, %s, %s)"
            select_query = "SELECT * FROM trip WHERE user_id = %s"
            cnx = create_connection()
            cur = cnx.cursor()

            cur.execute(
                query, (name, user_id, background_photo))
            cnx.commit()

            cur.execute(select_query, (user_id, ))
            data = cur.fetchall()
            cur.close()
            cnx.close()
            return jsonify({"trip": data})
    return jsonify({"success": False})


@app.route('/updateTripName', methods=['POST'])
def updateTripName():
    if request.method == "POST":
        header = request.headers.get('Authorization')
        token_uid = verify_token(header)
        if (token_uid):
            data = request.get_json()
            trip_id = data["trip_id"]
            name = data["name"]
            query = "UPDATE trip SET name = %s WHERE trip_id = %s AND user_id = %s"
            select_query = "SELECT * FROM trip WHERE user_id = %s"
            cnx = create_connection()
            cur = cnx.cursor()
            cur.execute(
                query, (name, trip_id, token_uid))
            cnx.commit()
            cur.execute(select_query, (token_uid, ))
            data = cur.fetchall()
            cur.close()
            cnx.close()
            return jsonify({"trip": data})
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
        query = """
            SELECT trip_has_experience.*, 
            experience.*, 
            location.city, 
    location.state, 
    location.country, 
            ST_AsText(experience.geolocation) as geolocation, 
            GROUP_CONCAT(DISTINCT keyword.keyword SEPARATOR ', ') as keywords,
            GROUP_CONCAT(DISTINCT image.img_url SEPARATOR ', ') as img_url
            FROM trip_has_experience 
            JOIN experience ON trip_has_experience.experience_id = experience.experience_id
            LEFT JOIN experience_has_keyword ON experience.experience_id = experience_has_keyword.experience_id
            LEFT JOIN keyword ON experience_has_keyword.keyword_id = keyword.keyword_id
            LEFT JOIN experience_has_image ON experience.experience_id = experience_has_image.experience_id
            LEFT JOIN image ON experience_has_image.image_id = image.image_id
            JOIN location ON experience.location_id = location.location_id
            WHERE trip_has_experience.trip_id = %s
            GROUP BY experience.experience_id;
        """

        cnx = create_connection()
        cur = cnx.cursor()
        cur.execute(check_uid, (trip_id,))
        trip_user_id = cur.fetchall()

        if token_uid == trip_user_id[0][0]:
            cur.execute(query, (trip_id,))
            data = cur.fetchall()
            data = [convert_to_dict(cur, row) for row in data]
            for item in data:
                if item['geolocation'] is not None:
                    # Remove "POINT(" at start and ")" at end
                    geolocation_str = item['geolocation'][6:-1]
                    geolocation_coords = geolocation_str.split()  # Split by space
                    # Convert to float and form a tuple
                    geolocation_coords = tuple(map(float, geolocation_coords))
                    # Format as a tuple string
                    item['geolocation'] = f"({geolocation_coords[0]}, {geolocation_coords[1]})"
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
            if verify_token(header):
                experience_id = data["experience_id"]
                trip_id = data["trip_id"]
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

        if search_term is None:
            # Defaults to 3
            search_term = 3

        cnx = create_connection()
        cursor = cnx.cursor()

        query = """
                SELECT experience.experience_id, experience.title, location.city, location.state, location.country, ST_AsText(experience.geolocation) as geolocation, experience.avg_rating, experience.description, 
                GROUP_CONCAT(image.img_url) as img_url,
                GROUP_CONCAT(keyword.keyword SEPARATOR ', ') as keywords
                FROM experience
                JOIN location
                ON experience.location_id = location.location_id
                JOIN experience_has_keyword
                ON experience.experience_id = experience_has_keyword.experience_id
                LEFT JOIN keyword
                ON experience_has_keyword.keyword_id = keyword.keyword_id
                LEFT JOIN experience_has_image
                ON experience.experience_id = experience_has_image.experience_id
                LEFT JOIN image
                ON experience_has_image.image_id = image.image_id
                GROUP BY experience.experience_id
                ORDER BY experience.experience_id DESC
                LIMIT %s"""

        cursor.execute(query, (search_term,))
        data = cursor.fetchall()

        data = [convert_to_dict(cursor, row) for row in data]

        for item in data:
            if item['geolocation'] is not None:
                # Remove "POINT(" at start and ")" at end
                geolocation_str = item['geolocation'][6:-1]
                geolocation_coords = geolocation_str.split()  # Split by space
                # Convert to float and form a tuple
                geolocation_coords = tuple(map(float, geolocation_coords))
                # Format as a tuple string
                item['geolocation'] = f"({geolocation_coords[0]}, {geolocation_coords[1]})"
        cursor.close()
        cnx.close()
        return jsonify(data=data)

############################# END route for Latest Experience #############################

############################# BEGIN route for Ratings #############################


@app.route('/getUserRating', methods=['POST'])
def getUserRating():
    if request.method == "POST":
        try:
            data = request.get_json()
            header = request.headers.get('Authorization')
            user_id = verify_token(header)
            experience_id = data['experience_id']
            query = "SELECT rating FROM user_rating WHERE experience_id = %s AND user_id = %s"
            values = (experience_id, user_id)
            cnx = create_connection()
            cur = cnx.cursor()
            cur.execute(query, values)
            rating = cur.fetchone()
            cur.close()
            cnx.close()
            return jsonify({"rating": rating[0]})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)})

    return jsonify({"success": False, "error": "Invalid request method"})


@app.route('/addUserRating', methods=['POST'])
def addUserRating():
    if request.method == "POST":
        try:
            data = request.get_json()
            header = request.headers.get('Authorization')
            user_id = verify_token(header)
            experience_id = data['experience_id']
            rating = data['rating']

            # Insert user's rating into 'rating' table
            query = query = "INSERT INTO user_rating (user_id, experience_id, rating) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE rating = %s"
            values = (user_id, experience_id, rating, rating)
            cnx = create_connection()
            cur = cnx.cursor()
            cur.execute(query, values)
            data = cur.fetchall()
            cnx.commit()

            # Get new rating average for the experience
            avg_query = "SELECT AVG(rating) FROM user_rating WHERE experience_id = %s"
            avg_values = (experience_id,)
            cur.execute(avg_query, avg_values)
            avg_rating = cur.fetchone()[0]
            avg_rating = round(avg_rating, 1)

            # Update the average rating in the experience table
            update_query = "UPDATE experience SET avg_rating = %s WHERE experience_id = %s"
            update_values = (avg_rating, experience_id)
            cur.execute(update_query, update_values)
            cnx.commit()

            cur.close()
            cnx.close()
            return jsonify({"Success": True})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)})

    return jsonify({"success": False, "error": "Invalid request method"})
############################# END route for Ratings #############################


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5001))

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
@app.route("/experiences", methods=["POST", "GET"])
def experiences():
    # Insert new experience
    if request.method == "POST":
        if request.form.get("add_experience"):
            # Grab experience form inputs
            title = request.form["title"]
            description = request.form["description"]
            geo_location = request.form["geo_location"]
            image = request.form["image"]   # probably not correct syntax!!!
            keywords = request.form["keywords"]

            # Add data
            query = "INSERT INTO Experiences (title, description, geo_location, image, keywords) VALUES (%s, %s, %s, %s, %s)"
            cur = mysql.connection.cursor()
            cur.execute(query, (title, description, geo_location, image, keywords))
            mysql.connection.commit()

            # Redirect back to experiences
            return redirect("/experiences")
        
    # Display experiences using query to grab all experiences in Experiences
    if request.method == "GET":
        search_query = request.query_string.decode()
        if search_query:
            query = f"SELECT * FROM Experiences WHERE MATCH (`title`, `description`, `geo_location`, `image`, `keywords`) AGAINST ('{search_query[2:]}' IN NATURAL LANGUAGE MODE);"
            cur = mysql.connection.cursor()
            cur.execute(query)
            data = cur.fetchall()
        else:
            query1 = "SELECT title, description, geo-location, image, keywords FROM experiences"
            cur = mysql.connection.cursor()
            cur.execute(query1)
            data = cur.fetchall()
        # return render_template("experiences.j2", data=data)   # can be used later
        return jsonify(data=data)
    

############################# END route for Experiences #############################


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))

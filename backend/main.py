from flask import Flask, jsonify
import os
import mysql.connector

app = Flask(__name__)

HOST = os.environ['MYSQLHOST']
PORT = os.environ['MYSQLPORT']
USER = os.environ['MYSQLUSER']
PASSWORD = os.environ['MYSQLPASSWORD']
DATABASE = os.environ['MYSQLDATABASE']

db = mysql.connector.connect(
    host=HOST,
    port=PORT,
    user=USER,
    password=PASSWORD,
    database=DATABASE
)

@app.route('/')
def index():
    return jsonify("Welcome to the Travel Planner backend!")


@app.route('/user')
def get_all_users():

    cursor = db.cursor()
    cursor.execute("SELECT * FROM user")
    result = cursor.fetchall()
    print(result)

    return jsonify(f"database name: {result}")


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))

from flask import Blueprint, request, jsonify
from extensions import db
from models import User
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
import uuid

users_bp = Blueprint("users", __name__)

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")  # Use .env in production

# Signup route
import uuid

@users_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if not data.get("user_name") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400

    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = generate_password_hash(data["password"])

    # Generate a random UUID (string)
    random_id = str(uuid.uuid4())

    new_user = User(
        id=random_id,  # assign custom ID instead of auto increment (if your model supports it)
        user_name=data["user_name"],
        email=data["email"],
        password=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully", "id": new_user.id}), 201



# Login route
@users_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        "user_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({"message": "Login successful", "token": token})


# Logout route (JWT: client just deletes token)
@users_bp.route("/logout", methods=["POST"])    
def logout():
    # With JWT, logout is usually handled client-side by deleting the token
    return jsonify({"message": "Logout successful"}), 200

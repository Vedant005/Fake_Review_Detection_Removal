from flask import Blueprint, request, jsonify
from extensions import db
from models import User

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([{
        "id": u.id,
        "user_name": u.user_name,
        "created_at": u.created_at
    } for u in users])

@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id": user.id,
        "user_name": user.user_name,
        "created_at": user.created_at
    })

@users_bp.route("/", methods=["POST"])
def add_user():
    data = request.json
    new_user = User(user_name=data["user_name"])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created", "id": new_user.id}), 201

@users_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    user.user_name = data.get("user_name", user.user_name)
    db.session.commit()
    return jsonify({"message": "User updated"})

@users_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})

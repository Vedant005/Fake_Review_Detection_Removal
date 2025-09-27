from flask import Blueprint, request, jsonify
from extensions import db
from models import Review

reviews_bp = Blueprint("reviews", __name__)

@reviews_bp.route("/", methods=["GET"])
def get_reviews():
    reviews = Review.query.all()
    return jsonify([{
        "id": r.id,
        "product_id": r.product_id,
        "user_id": r.user_id,
        "review_title": r.review_title,
        "review_body": r.review_body,
        "rating": str(r.rating),
        "created_at": r.created_at
    } for r in reviews])

@reviews_bp.route("/<int:review_id>", methods=["GET"])
def get_review(review_id):
    r = Review.query.get_or_404(review_id)
    return jsonify({
        "id": r.id,
        "product_id": r.product_id,
        "user_id": r.user_id,
        "review_title": r.review_title,
        "review_body": r.review_body,
        "rating": str(r.rating),
        "created_at": r.created_at
    })

@reviews_bp.route("/", methods=["POST"])
def add_review():
    data = request.json
    new_review = Review(
        product_id=data["product_id"],
        user_id=data["user_id"],
        review_title=data.get("review_title"),
        review_body=data["review_body"],
        rating=data.get("rating")
    )
    db.session.add(new_review)
    db.session.commit()
    return jsonify({"message": "Review added", "id": new_review.id}), 201

@reviews_bp.route("/<int:review_id>", methods=["PUT"])
def update_review(review_id):
    review = Review.query.get_or_404(review_id)
    data = request.json
    review.review_title = data.get("review_title", review.review_title)
    review.review_body = data.get("review_body", review.review_body)
    review.rating = data.get("rating", review.rating)
    db.session.commit()
    return jsonify({"message": "Review updated"})

@reviews_bp.route("/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):
    review = Review.query.get_or_404(review_id)
    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Review deleted"})

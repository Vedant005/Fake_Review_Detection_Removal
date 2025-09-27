from flask import Blueprint, request, jsonify
from extensions import db
from models import Review
from difflib import SequenceMatcher
from faker import Faker
import re
import hashlib
import random

reviews_bp = Blueprint("reviews", __name__)
fake = Faker()

def clean_text(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9\s]", "", text.lower()).strip()

def get_duplicate_score(text, existing_texts):
    """Check similarity against past reviews (simple duplicate detector)."""
    max_score = 0
    for t in existing_texts:
        score = SequenceMatcher(None, text, t).ratio()
        max_score = max(max_score, score)
    return max_score

def compute_rules(user, review_text, ip, device_fp):
    rules = {
        "rule_rate_limit": False,
        "rule_new_account_extreme": False,
        "rule_duplicate_text": False,
        "rule_vpn_ip": False,
        "rule_same_device": False,
        "rule_low_quality": False,
        "rule_burst_activity": False,
    }
    flag_reasons = []

    # Example rule: suspicious if account age < 7 days and extreme rating
    if (user.created_at and (db.func.now() - user.created_at).days < 7) and (review_text in ["1", "5"]):
        rules["rule_new_account_extreme"] = True
        flag_reasons.append("new_account_extreme")

    # Example rule: low quality (very short text)
    if len(review_text.split()) < 3:
        rules["rule_low_quality"] = True
        flag_reasons.append("low_quality")

    # TODO: expand more rules (vpn/ip checks, burst activity, etc.)

    return rules, ", ".join(flag_reasons)

@reviews_bp.route("/", methods=["GET"])
def get_reviews():
    reviews = Review.query.all()
    return jsonify([{
        "id": r.id,
        "product_id": r.product_id,
        "user_id": r.user_id,
        "rating": str(r.rating),
        "review_text": r.review_text,
        "timestamp": r.timestamp,

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

    # Clean text
    clean_review_text = clean_text(data["review_text"])

    user_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    device_fingerprint = hashlib.md5(
        (str(data["user_id"]) + str(random.randint(1, 9999))).encode()
    ).hexdigest()

    # Duplicate check
    existing_texts = [r.review_text for r in Review.query.all()]
    duplicate_score = get_duplicate_score(clean_review_text, existing_texts)

    # Compute rules
    from models import User
    user = User.query.get(data["user_id"])
    rules, flag_reasons = compute_rules(user, clean_review_text, user_ip, device_fingerprint)

    # Weighted score (basic example)
    weighted_score_raw = duplicate_score * 0.5 + (1 if rules["rule_low_quality"] else 0.5)

    # Decide fake flag
    is_fake_rule_based = int(any(rules.values()))

    new_review = Review(
        product_id=data["product_id"],
        user_id=data["user_id"],
        review_title=data.get("review_title"),
        review_text=data["review_text"],
        rating=data.get("rating"),
        user_ip=user_ip,
        device_fingerprint=device_fingerprint,
        clean_review_text=clean_review_text,
        duplicate_review_score=duplicate_score,
        weighted_score_raw=weighted_score_raw,
        flag_reasons=flag_reasons,
        rule_rate_limit=rules["rule_rate_limit"],
        rule_new_account_extreme=rules["rule_new_account_extreme"],
        rule_duplicate_text=(duplicate_score > 0.8),
        rule_vpn_ip=rules["rule_vpn_ip"],
        rule_same_device=rules["rule_same_device"],
        rule_low_quality=rules["rule_low_quality"],
        rule_burst_activity=rules["rule_burst_activity"],
        is_fake_rule_based=is_fake_rule_based,
        label_source="rule_engine"
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

from flask import Blueprint, request, jsonify
from ml_layer import behavioral_analysis, ml_model_predict
from extensions import db
from models import Review, User
from difflib import SequenceMatcher
from datetime import datetime, timedelta
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

# --- Rule Helpers ---
def check_rate_limit(user_id):
    """Too many reviews from the same user in the last 5 minutes."""
    five_min_ago = datetime.utcnow() - timedelta(minutes=5)
    recent_reviews = Review.query.filter(
        Review.user_id == user_id,
        Review.timestamp >= five_min_ago
    ).count()
    return recent_reviews > 3  # arbitrary threshold

def check_burst_activity(product_id):
    """Too many reviews on the same product in the last 10 minutes."""
    ten_min_ago = datetime.utcnow() - timedelta(minutes=10)
    recent_reviews = Review.query.filter(
        Review.product_id == product_id,
        Review.timestamp >= ten_min_ago
    ).count()
    return recent_reviews > 10

def is_vpn_ip(ip):
    """Stub for VPN/proxy detection (replace with external API)."""
    suspicious_ranges = ["10.", "192.168", "172.16"]  # private IP ranges as example
    return any(ip.startswith(r) for r in suspicious_ranges)

def check_same_device(device_fp, user_id):
    """If same device fingerprint is linked to multiple users."""
    other_reviews = Review.query.filter(
        Review.device_fingerprint == device_fp,
        Review.user_id != user_id
    ).count()
    return other_reviews > 0

# -------------------------------
# Compute Rules
# -------------------------------
def compute_rules(user, review_text, rating, ip, device_fp, duplicate_score, product_id):
    rules = {
        "rule_rate_limit": check_rate_limit(user.id),
        "rule_new_account_extreme": False,
        "rule_duplicate_text": False,
        "rule_vpn_ip": is_vpn_ip(ip),
        "rule_same_device": check_same_device(device_fp, user.id),
        "rule_low_quality": False,
        "rule_burst_activity": check_burst_activity(product_id),
    }
    flag_reasons = []

    # Rule: new account extreme ratings
    if user.timestamp:
        account_age_days = (datetime.utcnow() - user.timestamp).days
        if account_age_days < 7 and int(rating) in [1, 5]:
            rules["rule_new_account_extreme"] = True
            flag_reasons.append("new_account_extreme")

    # Rule: low quality review
    if len(review_text.split()) < 3:
        rules["rule_low_quality"] = True
        flag_reasons.append("low_quality")

    # Rule: duplicate review
    if duplicate_score > 0.8:
        rules["rule_duplicate_text"] = True
        flag_reasons.append("duplicate_text")

    # Collect reasons
    for k, v in rules.items():
        if v:
            flag_reasons.append(k)

    return rules, ", ".join(set(flag_reasons))


@reviews_bp.route("/", methods=["GET"])
def get_reviews():
    try:
        cursor = request.args.get("cursor", None)
        limit = request.args.get("limit", 20, type=int)
        product_id = request.args.get("product_id", None)  # optional filter

        query = Review.query.order_by(Review.id)

        # Filter by product if provided
        if product_id:
            query = query.filter(Review.product_id == product_id)

        # Cursor-based pagination
        if cursor:
            query = query.filter(Review.id > cursor)

        reviews = query.limit(limit).all()

        reviews_list = []
        for r in reviews:
            reviews_list.append({
                "id": r.id,
                "product_id": r.product_id,
                "user_id": r.user_id,
                "rating": float(r.rating) if r.rating is not None else None,
                "review_text": r.review_text,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None
            })

        # Determine next cursor
        next_cursor = reviews[-1].id if reviews else None

        return jsonify({
            "success": True,
            "data": reviews_list,
            "next_cursor": next_cursor,
            "limit": limit
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

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
        "timestamp": r.timestamp
    })

@reviews_bp.route("/", methods=["POST"])
def add_review():
    data = request.json
    rating = data.get("rating", 0)

    # Clean text
    clean_review_text = clean_text(data["review_text"])

    # IP & Device Fingerprint
    user_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    device_fingerprint = hashlib.md5(
        (str(user_ip) + request.headers.get("User-Agent", "")).encode()
    ).hexdigest()

    # Duplicate check
    existing_texts = [r.clean_review_text for r in Review.query.all() if r.clean_review_text]
    duplicate_score = get_duplicate_score(clean_review_text, existing_texts)

    # Get user
    user = User.query.get(data["user_id"])

    # Compute rules
    rules, flag_reasons = compute_rules(
        user, clean_review_text, rating, user_ip, device_fingerprint, duplicate_score, data["product_id"]
    )

    # Weighted score (weights can be tuned)
    weights = {
        "rule_duplicate_text": 0.4,
        "rule_low_quality": 0.2,
        "rule_new_account_extreme": 0.2,
        "rule_rate_limit": 0.2,
        "rule_vpn_ip": 0.2,
        "rule_same_device": 0.2,
        "rule_burst_activity": 0.3,
    }
    weighted_score_raw = sum(w for r, w in weights.items() if rules[r])

    # Decide fake flag
    is_fake_rule_based = int(any(rules.values()))

    new_review = Review(
        product_id=data["product_id"],
        user_id=data["user_id"],
        review_title=data.get("review_title"),
        review_text=data["review_text"],
        rating=rating,
        user_ip=user_ip,
        device_fingerprint=device_fingerprint,
        clean_review_text=clean_review_text,
        duplicate_review_score=duplicate_score,
        weighted_score_raw=weighted_score_raw,
        flag_reasons=flag_reasons,
        rule_rate_limit=rules["rule_rate_limit"],
        rule_new_account_extreme=rules["rule_new_account_extreme"],
        rule_duplicate_text=rules["rule_duplicate_text"],
        rule_vpn_ip=rules["rule_vpn_ip"],
        rule_same_device=rules["rule_same_device"],
        rule_low_quality=rules["rule_low_quality"],
        rule_burst_activity=rules["rule_burst_activity"],
        is_fake_rule_based=is_fake_rule_based,
        label_source="rule_engine"
    )

    db.session.add(new_review)
    db.session.commit()

    return jsonify({
        "message": "Review added",
        "id": new_review.id,
        "is_fake_rule_based": is_fake_rule_based,
        "flag_reasons": flag_reasons
    }), 201

@reviews_bp.route("/<int:review_id>", methods=["PUT"])
def update_review(review_id):
    review = Review.query.get_or_404(review_id)
    data = request.json
    review.review_title = data.get("review_title", review.review_title)
    review.review_body = data.get("review_body", review.review_body)
    review.rating = data.get("rating", review.rating)
    db.session.commit()
    return jsonify({"message": "Review updated"})

@reviews_bp.route("/<string:review_id>", methods=["DELETE"])
def delete_review(review_id):
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"success": False, "error": "Review not found"}), 404

        db.session.delete(review)
        db.session.commit()

        return jsonify({"success": True, "message": "Review deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@reviews_bp.route("/analyze_all", methods=["POST"])
def analyze_all_reviews():
    # Step 1: Check if we already have analyzed reviews
    already_analyzed = Review.query.filter(Review.is_fake.isnot(None)).count()

    # if already_analyzed == 0:
    #     reviews = Review.query.all()
    # else:
    #     reviews = Review.query.filter(Review.is_fake.is_(None)).all()

    reviews = Review.query.all()

    if not reviews:
        return jsonify({"message": "No new reviews to analyze"}), 200

    # ----- Layer 2 (ML predictions per review) -----
    ml_results_map = {}
    for review in reviews:
        ml_results_map[review.id] = ml_model_predict(review.review_text)

    # ----- Layer 3 (Behavioral analysis across ALL reviews) -----
    # Convert all reviews (including old ones for context)
    all_reviews = Review.query.all()
    all_reviews_dict = [
        {
            "id": r.id,
            "user_id": r.user_id,
            "timestamp": r.timestamp,
            "device_fingerprint": r.device_fingerprint,
            "user_ip": r.user_ip,
            "is_fake_rule_based": r.is_fake_rule_based,
            "is_fake_ml": ml_results_map.get(r.id, {}).get("is_fake_ml") if r.id in ml_results_map else None,
            "clean_review_text": r.clean_review_text or r.review_text,
        }
        for r in all_reviews
    ]

    behavioral_results_map = behavioral_analysis(all_reviews_dict)
    # Example return: { review_id: { "is_fake_behavioral": bool, "flags": [...], "suspicious_score": float } }

    # ----- Final Decision and DB Update -----
    results = []
    flagged_users = set()

    for review in reviews:
        ml_results = ml_results_map[review.id]
        behavioral_results = behavioral_results_map.get(review.id, {})

        is_fake_final = (
            review.is_fake_rule_based
            or ml_results["is_fake_ml"]
            or behavioral_results.get("is_fake_behavioral", False)
        )

        review.is_fake = 1 if is_fake_final else 0

        if is_fake_final:
            flagged_users.add(review.user_id)

        results.append({
            "review_id": review.id,
            "user_id": review.user_id,
            "rule_based": review.is_fake_rule_based,
            "ml": ml_results,
            "behavioral": behavioral_results,
            "is_fake_final": is_fake_final,
        })

    db.session.commit()

    return jsonify({
        "message": "Analysis complete",
        # "mode": "full" if already_analyzed == 0 else "incremental",
        "flagged_reviews": [r for r in results if r["is_fake_final"]],
        "flagged_users": list(flagged_users),
        "total_analyzed": len(reviews),
        "fake_count": len([r for r in results if r["is_fake_final"]])
    })

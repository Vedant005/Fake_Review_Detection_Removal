# ml_layer.py
import joblib
import re
import os
import datetime
from collections import Counter
from typing import Dict, Any
from statistics import mean

from collections import defaultdict
from datetime import timedelta

MODEL_PATH = "/ml_model.pkl"
VECTORIZER_PATH = "/vectorizer.pkl"

def clean_text(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9\s]", "", text.lower()).strip()

def load_ml_model():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        print("⚠️ Model files missing. Please train in Colab first.")
        return None, None
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    return model, vectorizer

ml_model, vectorizer = load_ml_model()

def ml_model_predict(review_text: str) -> dict:
    if ml_model is None or vectorizer is None:
        return {"is_fake_ml": False, "confidence": 0.0}

    text_clean = clean_text(review_text)
    X = vectorizer.transform([text_clean])
    prob = ml_model.predict_proba(X)[0][1]

    return {
        "is_fake_ml": prob > 0.5,
        "confidence": float(prob)
    }


def behavioral_analysis(all_reviews: list) -> dict:
    """
    Analyze reviews across all users/devices for suspicious behavior.

    Input: list of dicts, each review containing:
      {
        "id": int,
        "user_id": int,
        "created_at": datetime,
        "device_fingerprint": str,
        "user_ip": str,
        "is_fake_rule_based": bool,
        "is_fake_ml": bool or None,
        "clean_review_text": str
      }

    Output: dict { review_id: { "is_fake_behavioral": bool, "flags": [...], "suspicious_score": float } }
    """
    results = {}
    flags_by_review = defaultdict(list)
    suspicious_score_by_review = defaultdict(float)

    # Group reviews by user, device, and IP
    reviews_by_user = defaultdict(list)
    reviews_by_device = defaultdict(list)
    reviews_by_ip = defaultdict(list)

    for r in all_reviews:
        reviews_by_user[r["user_id"]].append(r)
        reviews_by_device[r["device_fingerprint"]].append(r)
        reviews_by_ip[r["user_ip"]].append(r)

    # --- Rule 1: Burst activity (too many reviews in short time) ---
    for user_id, user_reviews in reviews_by_user.items():
        user_reviews_sorted = sorted(user_reviews, key=lambda x: x["created_at"])
        for i in range(1, len(user_reviews_sorted)):
            delta = user_reviews_sorted[i]["created_at"] - user_reviews_sorted[i - 1]["created_at"]
            if delta < timedelta(minutes=5):  # reviews within 5 minutes
                rid = user_reviews_sorted[i]["id"]
                flags_by_review[rid].append("burst_activity")
                suspicious_score_by_review[rid] += 0.4

    # --- Rule 2: Same device used across multiple users ---
    for device, reviews in reviews_by_device.items():
        if len({r["user_id"] for r in reviews}) > 2:  # more than 2 users share device
            for r in reviews:
                flags_by_review[r["id"]].append("shared_device")
                suspicious_score_by_review[r["id"]] += 0.5

    # --- Rule 3: Same IP used across multiple users ---
    for ip, reviews in reviews_by_ip.items():
        if len({r["user_id"] for r in reviews}) > 3:  # more than 3 users share IP
            for r in reviews:
                flags_by_review[r["id"]].append("shared_ip")
                suspicious_score_by_review[r["id"]] += 0.5

    # --- Rule 4: Users with many flagged reviews ---
    user_fake_counts = {uid: sum(1 for r in reviews if r.get("is_fake_rule_based") or r.get("is_fake_ml"))
                        for uid, reviews in reviews_by_user.items()}
    for uid, count in user_fake_counts.items():
        if count >= 3:  # if a user already has 3+ fake signals
            for r in reviews_by_user[uid]:
                flags_by_review[r["id"]].append("repeat_offender")
                suspicious_score_by_review[r["id"]] += 0.7

    # --- Combine results ---
    for r in all_reviews:
        rid = r["id"]
        score = suspicious_score_by_review[rid]
        is_fake_behavioral = score >= 0.7 or len(flags_by_review[rid]) > 0

        results[rid] = {
            "is_fake_behavioral": is_fake_behavioral,
            "flags": flags_by_review[rid],
            "suspicious_score": round(score, 2)
        }

    return results

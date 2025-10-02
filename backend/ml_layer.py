# ml_layer.py
import joblib
import re
import os

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

# ml_layer.py (or you can keep it in a separate file like behavior_layer.py)
import datetime
from collections import Counter
from typing import Dict, Any
from statistics import mean

def behavioral_analysis(user_reviews: list[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze user behavior to detect suspicious review activity.

    Args:
        user_reviews (list): List of reviews for a specific user. Each review is a dict:
            {
                "created_at": datetime,
                "device_fingerprint": str,
                "user_ip": str,
                "is_fake_rule_based": bool,
                "is_fake_ml": bool,
                ...
            }

    Returns:
        dict: {
            "suspicious_score": float,
            "behavior_flags": list,
            "is_fake_behavioral": bool
        }
    """

    if not user_reviews:
        return {
            "suspicious_score": 0.0,
            "behavior_flags": [],
            "is_fake_behavioral": False,
        }

    behavior_flags = []
    suspicious_score = 0.0

    # --- Rule 1: Burst activity (too many reviews in a short time) ---
    timestamps = sorted([r["created_at"] for r in user_reviews if "created_at" in r])
    if len(timestamps) >= 3:
        time_diffs = [
            (timestamps[i + 1] - timestamps[i]).total_seconds()
            for i in range(len(timestamps) - 1)
        ]
        avg_gap = mean(time_diffs) if time_diffs else float("inf")
        if avg_gap < 60:  # less than 1 minute avg gap
            behavior_flags.append("burst_activity")
            suspicious_score += 0.3

    # --- Rule 2: Duplicate devices or IPs used by multiple accounts ---
    device_counts = Counter([r.get("device_fingerprint") for r in user_reviews])
    ip_counts = Counter([r.get("user_ip") for r in user_reviews])

    if any(count > 3 for count in device_counts.values()):
        behavior_flags.append("same_device_multiple_reviews")
        suspicious_score += 0.25

    if any(count > 3 for count in ip_counts.values()):
        behavior_flags.append("same_ip_multiple_reviews")
        suspicious_score += 0.25

    # --- Rule 3: High proportion of previously flagged reviews ---
    flagged_reviews = sum(
        1 for r in user_reviews if r.get("is_fake_rule_based") or r.get("is_fake_ml")
    )
    if flagged_reviews / len(user_reviews) > 0.5:  # more than half flagged
        behavior_flags.append("history_of_fake_reviews")
        suspicious_score += 0.3

    # --- Rule 4: Extreme review lengths (all very short or very long) ---
    text_lengths = [len(r.get("clean_review_text", "")) for r in user_reviews]
    if text_lengths:
        avg_length = mean(text_lengths)
        if avg_length < 10:  # all too short
            behavior_flags.append("low_quality_spammy_reviews")
            suspicious_score += 0.15
        elif avg_length > 1000:  # unusually long spams
            behavior_flags.append("suspiciously_long_reviews")
            suspicious_score += 0.15

    # Cap suspicious score at 1.0
    suspicious_score = min(1.0, suspicious_score)

    return {
        "suspicious_score": suspicious_score,
        "behavior_flags": behavior_flags,
        "is_fake_behavioral": suspicious_score >= 0.5,
    }

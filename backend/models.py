from extensions import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(255), primary_key=True)
    user_name = db.Column(db.String(255))
    email = db.Column(db.String(255))
    password = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(5000), nullable=False)
    category = db.Column(db.String(255))
    about_product = db.Column(db.String(6000))
    rating = db.Column(db.Numeric)
    rating_count = db.Column(db.Numeric)
    discount_percentage = db.Column(db.Text)
    actual_price = db.Column(db.Text)

class Review(db.Model):
    __tablename__ = "reviews"
    id = db.Column(db.String(255), primary_key=True)
    product_id = db.Column(db.String(255), db.ForeignKey("products.id", ondelete="CASCADE"))
    user_id = db.Column(db.String(255), db.ForeignKey("users.id", ondelete="CASCADE"))

    # Original fields
    rating = db.Column(db.Numeric)
    review_text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    # --- Metadata fields ---
    user_ip = db.Column(db.String(100))
    device_fingerprint = db.Column(db.String(100))
    clean_review_text = db.Column(db.Text)  # preprocessed version

    duplicate_review_score = db.Column(db.Float)
    suspicion_score_weighted = db.Column(db.Float)
    
    flag_reasons = db.Column(db.Text)  # comma-separated reasons



    # Rule flags (Numerics or integers)
    rule_rate_limit = db.Column(db.Numeric)
    rule_new_account_extreme = db.Column(db.Numeric)
    rule_duplicate_text = db.Column(db.Numeric)
    rule_vpn_ip = db.Column(db.Numeric)
    rule_same_device = db.Column(db.Numeric)
    rule_low_quality = db.Column(db.Numeric)
    rule_burst_activity = db.Column(db.Numeric)


    # --- Labeling/Decision fields ---
    is_fake = db.Column(db.Numeric)
    is_fake_rule_based = db.Column(db.Numeric)
    label_source = db.Column(db.String(100))

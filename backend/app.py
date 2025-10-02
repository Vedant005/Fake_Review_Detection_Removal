from flask import Flask
from extensions import db, migrate
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config.from_object("config")

db.init_app(app)
migrate.init_app(app, db)

# Import models after db
from models import User, Product, Review

# Register blueprints
from routes.users import users_bp
from routes.products import products_bp
from routes.reviews import reviews_bp


app.register_blueprint(users_bp, url_prefix="/api/users")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(reviews_bp, url_prefix="/api/reviews")

if __name__ == "__main__":
    app.run(debug=True)

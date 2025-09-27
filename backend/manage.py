from app import app, db
from flask_migrate import Migrate

migrate = Migrate(app, db)

# Import models so Flask-Migrate knows them
from models import User, Product, Review, Detection

if __name__ == "__main__":
    app.run(debug=True)

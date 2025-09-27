from flask import Blueprint, request, jsonify
from extensions import db
from models import Product

products_bp = Blueprint("products", __name__)


@products_bp.route("/", methods=["GET"])
def get_all_products():
    try:
        products = Product.query.all()
      
        products_list = []
        for p in products:
            products_list.append({
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "about_product": p.about_product,
                "rating": float(p.rating) if p.rating is not None else None,
                "rating_count": float(p.rating_count) if p.rating_count is not None else None,
                "discount_percentage": p.discount_percentage,
                "actual_price": p.actual_price
            })
        return jsonify({"success": True, "data": products_list}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
from flask import Blueprint, request, jsonify
from extensions import db
from models import Product

products_bp = Blueprint("products", __name__)

@products_bp.route("/", methods=["GET"])
def get_all_products():
    try:
        cursor = request.args.get("cursor", None)
        limit = request.args.get("limit", 20, type=int)

        query = Product.query.order_by(Product.id)

        if cursor:
        
            query = query.filter(Product.id > cursor)

        products = query.limit(limit).all()

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

        # Determine next cursor
        next_cursor = products[-1].id if products else None

        return jsonify({
            "success": True,
            "data": products_list,
            "next_cursor": next_cursor,
            "limit": limit
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

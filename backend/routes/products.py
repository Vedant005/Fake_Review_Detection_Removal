from flask import Blueprint, request, jsonify
from extensions import db
from models import Product

products_bp = Blueprint("products", __name__)

@products_bp.route("/", methods=["GET"])
def get_all_products():
    try:
       
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 20, type=int)
        offset = (page - 1) * limit

        products = Product.query.offset(offset).limit(limit).all()

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

        total_products = Product.query.count()
        total_pages = (total_products + limit - 1) // limit

        return jsonify({
            "success": True,
            "data": products_list,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_pages": total_pages,
                "total_products": total_products
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

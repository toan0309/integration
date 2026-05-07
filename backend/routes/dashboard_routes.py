from flask import Blueprint

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard')
def dashboard():
    return {
        "message": "Dashboard API working"
    }

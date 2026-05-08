from flask import Flask
from flask_cors import CORS
import os
import sys

# Add the parent directory to sys.path so 'backend' can be resolved as a package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routes.auth_routes import auth_routes_bp
from backend.routes.user_routes import user_routes_bp
from backend.routes.role_routes import role_routes_bp

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes (important for React frontend to communicate with Flask)
    CORS(app, supports_credentials=True)
    
    # Register blueprints
    app.register_blueprint(auth_routes_bp)
    app.register_blueprint(user_routes_bp)
    app.register_blueprint(role_routes_bp)
    
    # Root route for testing
    @app.route('/')
    def index():
        return {"status": "ok", "message": "HR Management System API is running"}
        
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=True)

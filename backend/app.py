from flask import Flask
from flask_cors import CORS

from routes.dashboard_routes import dashboard_bp
from routes.health_routes import health_bp
from routes.department_routes import department_bp
from routes.position_routes import position_bp
from routes.employee_routes import employee_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(dashboard_bp)
app.register_blueprint(health_bp)
app.register_blueprint(department_bp)
app.register_blueprint(position_bp)
app.register_blueprint(employee_bp)

@app.route("/")
def home():
    return {
        "message": "Backend running successfully"
    }

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)

from flask import Flask
from flask_cors import CORS

from routes.dashboard_routes import dashboard_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(dashboard_bp)

@app.route("/")
def home():
    return {
        "message": "Backend running successfully"
    }

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
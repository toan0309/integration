from flask import Flask
from flask_cors import CORS

from routes.attendance_routes import attendance_bp
from routes.report_routes import report_routes_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(attendance_bp)
app.register_blueprint(report_routes_bp)

@app.route("/")
def home():
    return {"message": "Backend running successfully"}

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)

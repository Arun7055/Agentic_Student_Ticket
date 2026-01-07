from flask import Flask, request, jsonify

app = Flask(__name__)

@app.get("/hostel")
def start_hostel():
    
    # ----- RESPONSE -----
    return jsonify({
        "success": True,
        "message": "Hostel started successfully",
    }), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)

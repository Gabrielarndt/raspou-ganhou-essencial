from flask import Flask, send_from_directory

app = Flask(__name__, static_folder="static", static_url_path="/")

@app.route("/", methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>", methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def serve_static(path):
    if path != "index.html":
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3000)


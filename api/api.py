from flask import Flask, request
from pymongo import MongoClient
from flask_cors import CORS
import json

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

mongoClient = MongoClient('mongodb://localhost:27017')
db = mongoClient.get_database('weatherdb')
reports = db.get_collection('reports')


@app.route('/getData/', methods=["POST"], strict_slashes=False)
def get_data():
    filterData = request.json
    data = []
    for entry in reports.find(
            filterData,
            {"properties.meldungId": 1, "geometry.coordinates": 1, "properties.category": 1,
             "properties.auspraegung": 1, "properties.timestamp": 1, "properties.imageUrl": 1, "properties.timesReportedForImage": 1}):
        data.append({
            "id": entry["properties"]["meldungId"],
            "coordinates": entry["geometry"]["coordinates"],
            "category": entry["properties"]["category"],
            "auspraegung": entry["properties"]["auspraegung"],
            "timestamp": entry["properties"]["timestamp"],
            "imageName": None if entry["properties"]["imageUrl"] is None or entry["properties"]["timesReportedForImage"] > 0 else entry["properties"]["imageUrl"][(entry["properties"]["imageUrl"].rfind("/") + 1):],
        })
    print(data)
    return json.dumps(data)

@app.route('/readcsv/', methods=["GET"])
def readcsv():
    return 'Rajib Cse Duet'

if __name__ == "__main__":
    app.run(debug=True)

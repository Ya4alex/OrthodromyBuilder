from flask import Flask, render_template, request, flash
from pyproj import Geod

app = Flask(__name__)


@app.route("/")
@app.route("/index", methods=["GET"])
def index() -> str:
    if request.method == 'GET':
        nodes = request.args.get('nodes')
        point1 = request.args.get('point1')
        point2 = request.args.get('point2')
        if (nodes is None) or (point1 is None) or (point2 is None):
            flash("Ошибка получения данных")
        else:
            line = getLineData(point1, point2, nodes)
            flash(line)
    return render_template('index.html')


def calcLine(begin: list, end: list, nodes_count: int) -> list:
    geoid = Geod(ellps="WGS84")
    line_points = geoid.npts(begin[0], begin[1], end[0], end[1], nodes_count)
    return line_points


def lineToRequestResult(line_points: list) -> str:
    result = "<success>"
    result += "LINESTRING("
    for point in line_points:
        result += "{0} {1}, ".format(point[0], point[1])
    result = result[:-2] + ")"
    result += "</success>"
    return result


def getLineData(point1: str, point2: str, nodes: str) -> str:
    try:
        begin = list(map(float, point1.split()))
    except ValueError:
        return "Error"
    try:
        end = list(map(float, point2.split()))
    except ValueError:
        return "Error"
    try:
        nodes_count = int(nodes)
    except ValueError:
        return "Error"
    return lineToRequestResult(calcLine(begin, end, nodes_count))


if __name__ == "__main__":
    app.secret_key = 'kill your self'
    app.run(debug=True)
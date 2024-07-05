from flask import Flask, request, abort, send_file, Response
from pyproj import CRS
import re

STATIC_FOLDER = '../frontend/dist'

app = Flask(__name__,
            static_url_path='/static',
            static_folder=STATIC_FOLDER)

ALLOWED_EPSG_CODES = [4326, 4284, 3857]
ALLOWED_EPSG = list(map(lambda c: f'EPSG:{c}', ALLOWED_EPSG_CODES))

POINT_PATTERN = r'POINT\((-?\d*\.?\d+) (-?\d*\.?\d+)\)'


@app.route("/")
def index() -> Response:
    return send_file(f'{STATIC_FOLDER}/index.html')


@app.route("/api/orthodromy", methods=["GET"])
def orthodromy():
    try:
        count = int(request.args['count'])
        point1_s = request.args['point1']
        point2_s = request.args['point2']
        cs = request.args['cs']
        if cs not in ALLOWED_EPSG:
            raise TypeError
        point1 = tuple(map(float, re.findall(POINT_PATTERN, point1_s)[0]))
        point2 = tuple(map(float, re.findall(POINT_PATTERN, point2_s)[0]))

        return orthodromy_to_wkt(calc_orthodromy(point1, point2, cs, count))
    except KeyError:
        abort(400, description="missing args")
    except (TypeError, IndexError):
        abort(400, description="incorrect args")
    except:
        abort(400, description="error")


def calc_orthodromy(begin: (float, float), end: (float, float), cs: str, nodes_count: int) -> [(float, float)]:
    geoid = CRS(cs).get_geod()
    print(geoid)
    line_points = [begin] + geoid.npts(begin[0], begin[1], end[0], end[1], nodes_count) + [end]
    print(line_points)
    return line_points


def orthodromy_to_wkt(line_points: [(float, float)]) -> str:
    return f"LINESTRING({', '.join([f"{point[0]} {point[1]}" for point in line_points])})"


if __name__ == "__main__":
    app.secret_key = 'secret key'
    app.run(debug=True)

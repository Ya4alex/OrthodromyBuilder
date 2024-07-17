from pprint import pprint

from flask import Flask, request, abort, send_file, Response
from pyproj import CRS
import re

from functools import wraps
from pyproj import Transformer


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
        point1 = normalise(tuple(map(float, re.findall(POINT_PATTERN, point1_s)[0])), cs)
        point2 = normalise(tuple(map(float, re.findall(POINT_PATTERN, point2_s)[0])), cs)
        if count == 0:
            return orthodromy_to_wkt([point1, point2])
        return orthodromy_to_wkt(calc_orthodromy(point1, point2, cs, count))
    except KeyError:
        abort(400, description="missing args")
    except (TypeError, IndexError):
        abort(400, description="incorrect args")
    except:
        abort(400, description="error")


def normalise(point, cs):
    if cs != 'EPSG:3857':
        return (point[0] + 180) % 360 - 180, point[1]
    return (point[0] + 20037508.34) % (20037508.34 * 2) - 20037508.34, point[1]


def transform_points(points, transformer):
    return [transformer.transform(x, y) for x, y in points]


def orthodromy_decorator(func):
    @wraps(func)
    def wrapper(begin, end, cs, nodes_count):
        if cs == 'EPSG:3857':
            transformer_to_wgs84 = Transformer.from_crs('EPSG:3857', 'EPSG:4326', always_xy=True)
            transformer_to_mercator = Transformer.from_crs('EPSG:4326', 'EPSG:3857', always_xy=True)

            begin_wgs84 = transformer_to_wgs84.transform(*begin)
            end_wgs84 = transformer_to_wgs84.transform(*end)

            result_wgs84 = func(begin_wgs84, end_wgs84, 'EPSG:4326', nodes_count)
            result_mercator = transform_points(result_wgs84, transformer_to_mercator)

            return result_mercator
        else:
            return func(begin, end, cs, nodes_count)

    return wrapper


@orthodromy_decorator
def calc_orthodromy(begin: (float, float), end: (float, float), cs: str, nodes_count: int) -> [(float, float)]:
    geoid = CRS(cs).get_geod()
    line_points = [begin] + geoid.npts(begin[0], begin[1], end[0], end[1], nodes_count) + [end]
    pprint(line_points)
    return line_points


def orthodromy_to_wkt(line_points: [(float, float)]) -> str:
    return f"LINESTRING({', '.join([f"{point[0]} {point[1]}" for point in line_points])})"


if __name__ == "__main__":
    app.secret_key = 'secret key'
    app.run(debug=True)

from flask import Flask, request, abort, send_file, Response
from pyproj import CRS, Transformer
from typing import Tuple, List
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
        return orthodromy_to_wkt(calc_orthodromy_solution(point1, point2, cs, count))
    except KeyError:
        abort(400, description="missing args")
    except (TypeError, IndexError):
        abort(400, description="incorrect args")
    except Exception:
        abort(400, description="error")


def normolize_coord(coord: float) -> float:
    return (coord + 180) % 360 - 180


def calc_orthodromy_solution(begin: Tuple[float, float], end: Tuple[float, float], cs: str, nodes_count: int) -> List[List[float]]:
    if cs == "EPSG:3857":
        line_points = calc_orthodromy_mercator(begin, end, nodes_count)
    else:
        begin = (normolize_coord(begin[0]), normolize_coord(begin[1]))
        end = (normolize_coord(end[0]), normolize_coord(end[1]))
        line_points = calc_orthodromy(begin, end, cs, nodes_count)
    
    return line_points


def calc_orthodromy(begin: Tuple[float, float], end: Tuple[float, float], cs: str, nodes_count: int) -> List[List[float]]:
    geoid = CRS(cs).get_geod()
    if geoid is None:
        raise Exception
    line_points = [begin] + geoid.npts(begin[0], begin[1], end[0], end[1], nodes_count) + [end]
    return line_points


def calc_orthodromy_mercator(begin: Tuple[float, float], end: Tuple[float, float], nodes_count: int) -> List[List[float]]:
    cs = "EPSG:4326"
    begin = transform_mercator_to_wgs(begin)
    end = transform_mercator_to_wgs(end)
    print(begin, end)
    line_points = calc_orthodromy(begin, end, cs, nodes_count)  
    line_points = [list(transform_wgs_to_mercator((point[0], point[1]))) for point in line_points]
    print(line_points)
    return line_points


def transform_wgs_to_mercator(point: Tuple[float, float]) -> Tuple[float, float]:
    epsg4326 = CRS("EPSG:4326")
    epsg3857 = CRS("EPSG:3857")
    transformer = Transformer.from_crs(epsg4326, epsg3857)
    new_point = transformer.transform(point[0], point[1])
    return new_point


def transform_mercator_to_wgs(point: Tuple[float, float]) -> Tuple[float, float]:
    epsg4326 = CRS("EPSG:4326")
    epsg3857 = CRS("EPSG:3857")
    transformer = Transformer.from_crs(epsg3857, epsg4326)
    new_point = transformer.transform(point[0], point[1])
    return new_point


def orthodromy_to_wkt(line_points: List[List[float]]) -> str:
    return f"LINESTRING({', '.join([f"{point[0]} {point[1]}" for point in line_points])})"


if __name__ == "__main__":
    app.secret_key = 'secret key'
    app.run(debug=True)

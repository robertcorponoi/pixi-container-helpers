function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var earcut_1 = earcut;
var _default = earcut;

function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode || outerNode.next === outerNode.prev) return triangles;

    var minX, minY, maxX, maxY, x, y, invSize;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and invSize are later used to transform coords into integers for z-order calculation
        invSize = Math.max(maxX - minX, maxY - minY);
        invSize = invSize !== 0 ? 1 / invSize : 0;
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, invSize);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) break;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            removeNode(ear);

            // skipping the next vertex leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, invSize);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
        if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, invSize) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, invSize),
        maxZ = zOrder(maxTX, maxTY, minX, minY, invSize);

    var p = ear.prevZ,
        n = ear.nextZ;

    // look for points inside the triangle in both directions
    while (p && p.z >= minZ && n && n.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;

        if (n !== ear.prev && n !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
            area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    // look for remaining points in decreasing z-order
    while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    // look for remaining points in increasing z-order
    while (n && n.z <= maxZ) {
        if (n !== ear.prev && n !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
            area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return filterPoints(p);
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, invSize);
                earcutLinked(c, triangles, dim, minX, minY, invSize);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, hole);

        // filter collinear points around the cuts
        filterPoints(outerNode, outerNode.next);
        filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                if (x === hx) {
                    if (hy === p.y) return p;
                    if (hy === p.next.y) return p.next;
                }
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hx === qx) return m; // hole touches outer segment; pick leftmost endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        mx = m.x,
        my = m.y,
        tanMin = Infinity,
        tan;

    p = m;

    do {
        if (hx >= p.x && p.x >= mx && hx !== p.x &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if (locallyInside(p, hole) &&
                (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    } while (p !== stop);

    return m;
}

// whether sector in vertex m contains sector in vertex p in the same coordinates
function sectorContainsSector(m, p) {
    return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, invSize) {
    var p = start;
    do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, invSize);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }
            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and inverse of the longer side of data bbox
function zOrder(x, y, minX, minY, invSize) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) * invSize;
    y = 32767 * (y - minY) * invSize;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
           (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
           (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // dones't intersect other edges
           (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
            (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
            equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0); // special zero-length case
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    var o1 = sign(area(p1, q1, p2));
    var o2 = sign(area(p1, q1, q2));
    var o3 = sign(area(p2, q2, p1));
    var o4 = sign(area(p2, q2, q1));

    if (o1 !== o2 && o3 !== o4) return true; // general case

    if (o1 === 0 && onSegment(p1, p2, q1)) return true; // p1, q1 and p2 are collinear and p2 lies on p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true; // p1, q1 and q2 are collinear and q2 lies on p1q1
    if (o3 === 0 && onSegment(p2, p1, q2)) return true; // p2, q2 and p1 are collinear and p1 lies on p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true; // p2, q2 and q1 are collinear and q1 lies on p2q2

    return false;
}

// for collinear points p, q, r, check if point q lies on segment pr
function onSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

function sign(num) {
    return num > 0 ? 1 : num < 0 ? -1 : 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertex index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertex nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

// return a percentage difference between the polygon area and its triangulation area;
// used to verify correctness of triangulation
earcut.deviation = function (data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length;

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
        for (var i = 0, len = holeIndices.length; i < len; i++) {
            var start = holeIndices[i] * dim;
            var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
    }

    var trianglesArea = 0;
    for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
            (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
            (data[a] - data[b]) * (data[c + 1] - data[a + 1]));
    }

    return polygonArea === 0 && trianglesArea === 0 ? 0 :
        Math.abs((trianglesArea - polygonArea) / polygonArea);
};

function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
earcut.flatten = function (data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};
earcut_1.default = _default;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var Vector = /*#__PURE__*/function () {
  /**
   * The x coordinate of this vector.
   * 
   * @private
   * 
   * @property {number}
   */

  /**
   * The y coordinate of this vector.
   * 
   * @private
   * 
   * @property {number}
   */

  /**
   * @param {number} [x=0] The x coordinate of this vector.
   * @param {number} [y=0] The y coordinate of this vector.
   */
  function Vector() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, Vector);

    _defineProperty(this, "_x", 0);

    _defineProperty(this, "_y", 0);

    this._x = x;
    this._y = y;
  }
  /**
   * Returns the x value of this vector.
   * 
   * @returns {number}
   */


  _createClass(Vector, [{
    key: "copy",

    /**
     * Copy the values of another Vector into this one.
     * 
     * @param {Vector} other The other Vector.
     * 
     * @returns {Vector} Returns this for chaining.
     */
    value: function copy(other) {
      this._x = other.x;
      this._y = other.y;
      return this;
    }
    /**
     * Create a new Vector with the same coordinates as the one.
     * 
     * @returns {Vector} The new cloned Vector.
     */

  }, {
    key: "clone",
    value: function clone() {
      return new Vector(this.x, this.y);
    }
    /**
     * Change this Vector to be perpendicular to what it was before.
     * 
     * Effectively this rotates it 90 degrees in a clockwise direction.
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "perp",
    value: function perp() {
      var x = this.x;
      this._x = this.y;
      this._y = -x;
      return this;
    }
    /**
     * Rotate this Vector (counter-clockwise) by the specified angle (in radians).
     * 
     * @param {number} angle The angle to rotate (in radians).
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "rotate",
    value: function rotate(angle) {
      var x = this.x;
      var y = this.y;
      this._x = x * Math.cos(angle) - y * Math.sin(angle);
      this._y = x * Math.sin(angle) + y * Math.cos(angle);
      return this;
    }
    /**
     * Reverse this Vector.
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "reverse",
    value: function reverse() {
      this._x = -this.x;
      this._y = -this.y;
      return this;
    }
    /**
     * Normalize this vector (make it have a length of `1`).
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "normalize",
    value: function normalize() {
      var d = this.len();

      if (d > 0) {
        this._x = this.x / d;
        this._y = this.y / d;
      }

      return this;
    }
    /**
     * Add another Vector to this one.
     * 
     * @param {Vector} other The other Vector.
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "add",
    value: function add(other) {
      this._x += other.x;
      this._y += other.y;
      return this;
    }
    /**
     * Subtract another Vector from this one.
     * 
     * @param {Vector} other The other Vector.
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "sub",
    value: function sub(other) {
      this._x -= other.x;
      this._y -= other.y;
      return this;
    }
    /**
     * Scale this Vector.
     * 
     * An independent scaling factor can be provided for each axis, or a single scaling factor will scale both `x` and `y`.
     * 
     * @param {number} x The scaling factor in the x direction.
     * @param {number} [y] The scaling factor in the y direction.
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "scale",
    value: function scale(x, y) {
      this._x *= x;
      this._y *= typeof y != 'undefined' ? y : x;
      return this;
    }
    /**
     * Project this Vector onto another Vector.
     * 
     * @param {Vector} other The Vector to project onto.
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "project",
    value: function project(other) {
      var amt = this.dot(other) / other.len2();
      this._x = amt * other.x;
      this._y = amt * other.y;
      return this;
    }
    /**
     * Project this Vector onto a Vector of unit length.
     * 
     * This is slightly more efficient than `project` when dealing with unit vectors.
     * 
     * @param {Vector} other The unit vector to project onto.
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "projectN",
    value: function projectN(other) {
      var amt = this.dot(other);
      this._x = amt * other.x;
      this._y = amt * other.y;
      return this;
    }
    /**
     * Reflect this Vector on an arbitrary axis.
     * 
     * @param {Vector} axis The Vector representing the axis.
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "reflect",
    value: function reflect(axis) {
      var x = this.x;
      var y = this.y;
      this.project(axis).scale(2);
      this._x -= x;
      this._y -= y;
      return this;
    }
    /**
     * Reflect this Vector on an arbitrary axis.
     * 
     * This is slightly more efficient than `reflect` when dealing with an axis that is a unit vector.
     * 
     * @param {Vector} axis The Vector representing the axis.
     * 
     * @returns {Vector} Returns this for chaining.
     */

  }, {
    key: "reflectN",
    value: function reflectN(axis) {
      var x = this.x;
      var y = this.y;
      this.projectN(axis).scale(2);
      this._x -= x;
      this._y -= y;
      return this;
    }
    /**
     * Get the dot product of this Vector and another.
     * 
     * @param {Vector} other The Vector to dot this one against.
     * 
     * @returns {number} Returns the dot product of this vector.
     */

  }, {
    key: "dot",
    value: function dot(other) {
      return this.x * other.x + this.y * other.y;
    }
    /**
     * Get the squared length of this Vector.
     * 
     * @returns {number} Returns the squared length of this vector.
     */

  }, {
    key: "len2",
    value: function len2() {
      return this.dot(this);
    }
    /**
     * Get the length of this Vector.
     * 
     * @returns {number} Returns the length of this vector.
     */

  }, {
    key: "len",
    value: function len() {
      return Math.sqrt(this.len2());
    }
  }, {
    key: "x",
    get: function get() {
      return this._x;
    }
    /**
     * Returns the y value of this vector.
     * 
     * @returns {number}
     */
    ,

    /**
     * Sets a new x value for this vector.
     * 
     * @param {number} x The new x value for this vector.
     */
    set: function set(x) {
      this._x = x;
    }
    /**
     * Sets a new y value for this vector.
     * 
     * @param {number} y The new y value for this vector.
     */

  }, {
    key: "y",
    get: function get() {
      return this._y;
    },
    set: function set(y) {
      this._y = y;
    }
  }]);

  return Vector;
}();

/**
 * Represents a *convex* polygon with any number of points (specified in counter-clockwise order).
 * 
 * Note: Do _not_ manually change the `points`, `angle`, or `offset` properties. Use the provided  setters. 
 * Otherwise the calculated properties will not be updated correctly.
 * 
 * The `pos` property can be changed directly.
 */

var Polygon = /*#__PURE__*/function () {
  /**
   * A vector representing the origin of this polygon (all other points are relative to this one).
   * 
   * @private
   * 
   * @property {Vector}
   */

  /**
   * An array of vectors representing the points in the polygon, in counter-clockwise order.
   * 
   * @private
   * 
   * @property {Array<Vector>}
   */

  /**
   * An Array of the points of this polygon as numbers instead of Vectors.
   * 
   * @private
   * 
   * @property {Array<number>}
   */

  /**
   * The angle of this polygon.
   * 
   * @private
   * 
   * @property {number}
   */

  /**
   * The offset of this polygon.
   * 
   * @private
   * 
   * @property {Vector}
   */

  /**
   * The calculated points of this polygon.
   * 
   * @private
   * 
   * @property {Array<Vector>}
   */

  /**
   * The edges of this polygon.
   * 
   * @private
   * 
   * @property {Array<Vector>}
   */

  /**
   * The normals of this polygon.
   * 
   * @private
   * 
   * @property {Array<Vector>}
   */

  /**
   * Create a new polygon, passing in a position vector, and an array of points (represented by vectors 
   * relative to the position vector). If no position is passed in, the position of the polygon will be `(0,0)`.
   * 
   * @param {Vector} [position=Vector] A vector representing the origin of the polygon (all other points are relative to this one)
   * @param {Array<Vector>} [points=[]] An array of vectors representing the points in the polygon, in counter-clockwise order.
   */
  function Polygon() {
    var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector();
    var points = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, Polygon);

    _defineProperty(this, "_position", new Vector());

    _defineProperty(this, "_points", []);

    _defineProperty(this, "_pointsGeneric", []);

    _defineProperty(this, "_angle", 0);

    _defineProperty(this, "_offset", new Vector());

    _defineProperty(this, "_calcPoints", []);

    _defineProperty(this, "_edges", []);

    _defineProperty(this, "_normals", []);

    this._position = position;
    this.setPoints(points);
  }
  /**
   * Returns the position of this polygon.
   * 
   * @returns {Vector}
   */


  _createClass(Polygon, [{
    key: "setPoints",

    /**
     * Set the points of the polygon. Any consecutive duplicate points will be combined.
     * 
     * Note: The points are counter-clockwise *with respect to the coordinate system*. If you directly draw the points on a screen 
     * that has the origin at the top-left corner it will _appear_ visually that the points are being specified clockwise. This is 
     * just because of the inversion of the Y-axis when being displayed.
     * 
     * @param {Array<Vector>} points An array of vectors representing the points in the polygon, in counter-clockwise order.
     *    * 
     * @returns {Polygon} Returns this for chaining.
     */
    value: function setPoints(points) {
      // Only re-allocate if this is a new polygon or the number of points has changed.
      var lengthChanged = !this.points || this.points.length !== points.length;

      if (lengthChanged) {
        var i;
        var calcPoints = this._calcPoints = [];
        var edges = this._edges = [];
        var normals = this._normals = []; // Allocate the vector arrays for the calculated properties

        for (i = 0; i < points.length; i++) {
          // Remove consecutive duplicate points
          var p1 = points[i];
          var p2 = i < points.length - 1 ? points[i + 1] : points[0]; // Push the points to the generic points Array.

          this._pointsGeneric.push(points[i].x, points[i].y);

          if (p1 !== p2 && p1.x === p2.x && p1.y === p2.y) {
            points.splice(i, 1);
            i -= 1;
            continue;
          }

          calcPoints.push(new Vector());
          edges.push(new Vector());
          normals.push(new Vector());
        }
      }

      this._points = points;

      this._recalc();

      return this;
    }
    /**
     * Set the current rotation angle of the polygon.
     * 
     * @param {number} angle The current rotation angle (in radians).
     * 
     * @returns {Polygon} Returns this for chaining.
     */

  }, {
    key: "setAngle",
    value: function setAngle(angle) {
      this._angle = angle;

      this._recalc();

      return this;
    }
    /**
     * Set the current offset to apply to the `points` before applying the `angle` rotation.
     * 
     * @param {Vector} offset The new offset Vector.
     * 
     * @returns {Polygon} Returns this for chaining.
     */

  }, {
    key: "setOffset",
    value: function setOffset(offset) {
      this._offset = offset;

      this._recalc();

      return this;
    }
    /**
     * Rotates this Polygon counter-clockwise around the origin of *its local coordinate system* (i.e. `position`).
     * 
     * Note: This changes the **original** points (so any `angle` will be applied on top of this rotation).
     * 
     * @param {number} angle The angle to rotate (in radians).
     * 
     * @returns {Polygon} Returns this for chaining.
     */

  }, {
    key: "rotate",
    value: function rotate(angle) {
      var points = this.points;
      var len = points.length;

      for (var i = 0; i < len; i++) {
        points[i].rotate(angle);
      }

      this._recalc();

      return this;
    }
    /**
     * Translates the points of this polygon by a specified amount relative to the origin of *its own coordinate system* (i.e. `position`).
     * 
     * Note: This changes the **original** points (so any `offset` will be applied on top of this translation)
     * 
     * @param {number} x The horizontal amount to translate.
     * @param {number} y The vertical amount to translate.
     * 
     * @returns {Polygon} Returns this for chaining.
     */

  }, {
    key: "translate",
    value: function translate(x, y) {
      var points = this.points;
      var len = points.length;

      for (var i = 0; i < len; i++) {
        points[i].x += x;
        points[i].y += y;
      }

      this._recalc();

      return this;
    }
    /**
     * Computes the calculated collision Polygon.
     * 
     * This applies the `angle` and `offset` to the original points then recalculates the edges and normals of the collision Polygon.
     * 
     * @private
     * 
     * @returns {Polygon} Returns this for chaining.
     */

  }, {
    key: "_recalc",
    value: function _recalc() {
      // Calculated points - this is what is used for underlying collisions and takes into account
      // the angle/offset set on the polygon.
      var calcPoints = this.calcPoints; // The edges here are the direction of the `n`th edge of the polygon, relative to
      // the `n`th point. If you want to draw a given edge from the edge value, you must
      // first translate to the position of the starting point.

      var edges = this._edges; // The normals here are the direction of the normal for the `n`th edge of the polygon, relative
      // to the position of the `n`th point. If you want to draw an edge normal, you must first
      // translate to the position of the starting point.

      var normals = this._normals; // Copy the original points array and apply the offset/angle

      var points = this.points;
      var offset = this.offset;
      var angle = this.angle;
      var len = points.length;
      var i;

      for (i = 0; i < len; i++) {
        var calcPoint = calcPoints[i].copy(points[i]);
        calcPoint.x += offset.x;
        calcPoint.y += offset.y;
        if (angle !== 0) calcPoint.rotate(angle);
      } // Calculate the edges/normals


      for (i = 0; i < len; i++) {
        var p1 = calcPoints[i];
        var p2 = i < len - 1 ? calcPoints[i + 1] : calcPoints[0];
        var e = edges[i].copy(p2).sub(p1);
        normals[i].copy(e).perp().normalize();
      }

      return this;
    }
    /**
     * Compute the axis-aligned bounding box.
     * 
     * Any current state (translations/rotations) will be applied before constructing the AABB.
     * 
     * Note: Returns a _new_ `Polygon` each time you call this.
     * 
     * @returns {Polygon} Returns this for chaining.
     */

  }, {
    key: "getAABB",
    value: function getAABB() {
      var points = this.calcPoints;
      var len = points.length;
      var xMin = points[0].x;
      var yMin = points[0].y;
      var xMax = points[0].x;
      var yMax = points[0].y;

      for (var i = 1; i < len; i++) {
        var point = points[i];
        if (point["x"] < xMin) xMin = point["x"];else if (point["x"] > xMax) xMax = point["x"];
        if (point["y"] < yMin) yMin = point["y"];else if (point["y"] > yMax) yMax = point["y"];
      }

      return new Polygon(this._position.clone().add(new Vector(xMin, yMin)), [new Vector(), new Vector(xMax - xMin, 0), new Vector(xMax - xMin, yMax - yMin), new Vector(0, yMax - yMin)]);
    }
    /**
     * Compute the centroid (geometric center) of the Polygon.
     * 
     * Any current state (translations/rotations) will be applied before computing the centroid.
     * 
     * See https://en.wikipedia.org/wiki/Centroid#Centroid_of_a_polygon
     * 
     * Note: Returns a _new_ `Vector` each time you call this.
     * 
     * @returns {Vector} Returns a Vector that contains the coordinates of the centroid.
     */

  }, {
    key: "getCentroid",
    value: function getCentroid() {
      var points = this.calcPoints;
      var len = points.length;
      var cx = 0;
      var cy = 0;
      var ar = 0;

      for (var i = 0; i < len; i++) {
        var p1 = points[i];
        var p2 = i === len - 1 ? points[0] : points[i + 1]; // Loop around if last point

        var a = p1["x"] * p2["y"] - p2["x"] * p1["y"];
        cx += (p1["x"] + p2["x"]) * a;
        cy += (p1["y"] + p2["y"]) * a;
        ar += a;
      }

      ar = ar * 3; // we want 1 / 6 the area and we currently have 2*area

      cx = cx / ar;
      cy = cy / ar;
      return new Vector(cx, cy);
    }
  }, {
    key: "position",
    get: function get() {
      return this._position;
    }
    /**
     * **Note:** Not sure if this will be kept or not but for now it's disabled.
     * 
     * Sets a new position for this polygon and recalculates the points.
     * 
     * @param {Vector} position A Vector representing the new position of this polygon.
     */
    // set position(position: Vector) {
    //   const diffX: number = -(this._position.x - position.x);
    //   const diffY: number = -(this._position.y - position.y);
    //   const diffPoint: Vector = new Vector(diffX, diffY);
    //   const points: Array<Vector> = [];
    //   this._points.map((point: Vector) => {
    //     const tempX: number = point.x;
    //     const tempY: number = point.y;
    //     const tempPoint: Vector = new Vector(tempX, tempY);
    //     const calculatedPoint: Vector = tempPoint.add(diffPoint);
    //     points.push(calculatedPoint);
    //   });
    //   this.setPoints(points, true);
    // }

    /**
     * Returns the points of this polygon.
     * 
     * @returns {Array<Vector>}
     */

  }, {
    key: "points",
    get: function get() {
      return this._points;
    }
    /**
     * Returns the points of this polygon as numbers instead of Vectors.
     * 
     * @returns {Array<number>}
     */

  }, {
    key: "pointsGeneric",
    get: function get() {
      return this._pointsGeneric;
    }
    /**
     * Returns the calculated points of this polygon.
     * 
     * @returns {Array<Vector>}
     */

  }, {
    key: "calcPoints",
    get: function get() {
      return this._calcPoints;
    }
    /**
     * Returns the offset of this polygon.
     * 
     * @returns {Vector}
     */

  }, {
    key: "offset",
    get: function get() {
      return this._offset;
    }
    /**
     * Returns the angle of this polygon.
     * 
     * @returns {number}
     */

  }, {
    key: "angle",
    get: function get() {
      return this._angle;
    }
    /**
     * Returns the edges of this polygon.
     * 
     * @returns {Array<Vector>}
     */

  }, {
    key: "edges",
    get: function get() {
      return this._edges;
    }
    /**
     * Returns the normals of this polygon.
     * 
     * @returns {Array<Vector>}
     */

  }, {
    key: "normals",
    get: function get() {
      return this._normals;
    }
  }]);

  return Polygon;
}();

/**
 * Places the items in the container into a grid.
 * 
 * @param {PIXI.Container} container The container to place the items of into a grid.
 * @param {number} width The number of items that can fit in the grid horizontally before it splits into a new row.
 * @param {GridAlignOptions} [options] The optional arguments that can be passed to this function.
 * @param {number} [options.horizontalPadding=0] The amount of padding that should be between items in the grid horizontally.
 * @param {number} [options.verticalPadding=0] The amount of padding that should be between rows in the grid.
 */

function gridAlign(container, width, options) {
  // Since we need to cast the children of the container into `PIXI.Container`because we need
  // to make sure they have `width` and `height` properties, we have to create a new Array
  // and add the casted versions of the container children to it.
  var itemsToPlace = [];
  var currentWidth = 0;
  var x = 0;
  var y = 0;

  for (var i = 0; i < container.children.length; ++i) {
    // Save the current child to a variable.
    var item = container.children[i]; // If we can't cast the child which is a `DisplayObject` to a `Container` then we
    // have to skip this child as we need `height` and `width` properties to work with.

    var itemAsContainer = item;

    if (!itemAsContainer) {
      console.warn("Child of container does not inherit from PIXI.DisplayObject, skipping...");
      continue;
    }

    itemsToPlace.push(itemAsContainer); // Check to see if we need to break to a new line or not. We perform this check by
    // checking the value of `i` against the value of the `width` argument. If we need
    // to break to a new row, we set the `y` to increment by the height of the first
    // item in the current row.

    if (currentWidth == width) {
      currentWidth = 0;
      x = 0;
      y += itemsToPlace[i - (width - 1)].height; // If there needs to be vertical padding we add it here or else every item in
      // the row will be lower than the previous.

      if (options === null || options === void 0 ? void 0 : options.paddingBetweenRows) y += options.paddingBetweenRows;
    } // We add the horizontal padding here as horizontal space is calculated with every
    // item.


    if (options === null || options === void 0 ? void 0 : options.paddingBetweenColumns) x += options.paddingBetweenColumns;
    item.position.set(x, y);
    currentWidth++; // Lastly we increment the `x` by the width of the previous element.

    x += i == 0 ? itemsToPlace[i].width : itemsToPlace[i - 1].width;
  }
}
/**
 * Places the items in the container onto a circle.
 *
 * @param {PIXI.Container} container The container to place the items of onto a circle.
 * @param {number} radius The radius of the circle to place the items onto.
 * @param {CirclePlementOptions} [options] The optional arguments that can be passed to this function.
 * @param {boolean} [options.rotateItems=false] Indicates whether the items in the container should be rotated to match their angles or not.
 * @param {boolean} [options.rotateItemsInverse=false] Indicates whether the items in the ground should be rotated to their inverse angle or not.
 */

function placeOnCircle(container, radius, options) {
  // First, we have to know at what degree increments we have to place the items. Since a
  // circle has 360 degrees, we divide that by the number of children in the container to get
  // the degree increments.
  var degreeIncrement = 360 / container.children.length;
  var currentAngle = 0;
  container.children.forEach(function (item) {
    // Since the circle works in radians we have to convert from deg to rad.
    var radian = currentAngle * 0.0174532925;
    var x = radius * Math.cos(radian);
    var y = radius * Math.sin(radian);
    item.position.set(x, y);

    if ((options === null || options === void 0 ? void 0 : options.rotateItems) || (options === null || options === void 0 ? void 0 : options.rotateItemsInverse)) {
      var itemAsContainer = item;
      item.pivot.set(itemAsContainer.width / 2, itemAsContainer.height / 2);
      if (options.rotateItems) item.angle = currentAngle;else if (options.rotateItemsInverse) item.angle = (currentAngle + 180) % 360;
    }

    currentAngle += degreeIncrement;
  });
}
/**
 * Places the items in the container onto a line.
 * 
 * @param {PIXI.Container} container The container to place the items of onto a line.
 * @param {number} startX The x value of the position to start the line.
 * @param {number} startY The y value of the position to start the line.
 * @param {number} endX The x value of the position to end the line.
 * @param {number} endY The y value of the position to end the line.
 */

function placeOnLine(container, startX, startY, endX, endY) {
  // First we have to find out the spacing on the x and y axis so we know how far apart
  // to put the items.
  var numItemsToDivideBy = container.children.length - 1;
  var xSegmentLength = (endX - startX) / numItemsToDivideBy;
  var ySegmentLength = (endY - startY) / numItemsToDivideBy;
  container.children.forEach(function (item, index) {
    // Now for each item we place it on the line, starting from the start point, with
    // each item being a multiple of the segment length.
    item.position.set(startX + xSegmentLength * index, startY + ySegmentLength * index);
  });
}
/**
 * Places the items in the container onto a polygon.
 * 
 * @param {PIXI.Container} container The container to place the items of onto a Polygon.
 * @param {Polygon} polygon The Polygon to use to place the items.
 */

function placeOnPolygon(container, polygon) {
  // Since the Polygon has a position, we set the position of the container to the position
  // of the Polygon.
  container.position.set(polygon.position.x, polygon.position.y);
  var itemsDividedByEdges = (container.children.length - 1) / polygon.edges.length;
  var polygonLines = [];

  for (var i = 0; i < polygon.points.length; ++i) {
    var currentPoint = polygon.points[i]; // We create a line object that contains the start Vector of the line, the end
    // Vector of the line, and the length of its segments.

    var line = {
      start: currentPoint,
      end: polygon.points[i + 1],
      points: 0,
      xSegmentLength: 0,
      ySegmentLength: 0
    }; // If the point we're on is currently the last point of the Polygon then we need
    // to set its end to be the first point to close the Polygon.

    if (i == polygon.points.length - 1) line.end = polygon.points[0];
    line.xSegmentLength = (line.end.x - line.start.x) / itemsDividedByEdges;
    line.ySegmentLength = (line.end.y - line.start.y) / itemsDividedByEdges;
    polygonLines.push(line);
  }

  var currentLineIndex = 0;
  container.children.forEach(function (item) {
    var currentLine = polygonLines[currentLineIndex]; // We set the point on this line depending on how many points are already on
    // this line and then increment the amount of points.

    item.position.set(currentLine.start.x + currentLine.xSegmentLength * currentLine.points, currentLine.start.y + currentLine.ySegmentLength * currentLine.points);
    currentLine.points++; // If we're currently at the last line in the Array then we want to reset
    // back to the first line. Otherwise we just go on to the next line.

    if (currentLineIndex == polygonLines.length - 1) currentLineIndex = 0;else currentLineIndex++;
  });
}
/**
 * Places the items in the container into a circle in a random fashion.
 * 
 * @param {PIXI.Container} container The container to place the items of into a circle.
 * @param {number} radius The radius of the circle to place the items in.
 */

function placeInCircle(container, radius) {
  container.children.forEach(function (item) {
    var a = Math.random() * 2 * Math.PI;
    var r = radius * Math.sqrt(Math.random());
    var x = r * Math.cos(a);
    var y = r * Math.sin(a);
    item.position.set(x, y);
  });
}
/**
 * Places the items in the container into a Polygon in a random fashion.
 * 
 * @param {PIXI.Container} container The container to place the items of into a Polygon.
 * @param {Polygon} polygon The Polygon to use to place the items in.
 */

function placeInPolygon(container, polygon) {
  container.position.set(polygon.position.x, polygon.position.y); // First we get the triangles from the Polygon.

  var triangles = getTrianglesFromPolygon(polygon);
  container.children.forEach(function (item) {
    // Select a random triangle within the Polygon to add the item to.
    var triangle = selectRandomTriangle(triangles); // Next we select a random point from within that triangle which will be the [x, y]
    // coordinates we position our item.

    var pointInTriangle = getRandomPointInTriangle(triangle); // Lastly we position the item at that random point.

    item.position.set(pointInTriangle[0], pointInTriangle[1]);
  });
}
/**
 * Sets the alpha of the container items from a starting value to an unknown value
 * with an optional step value that can be added to increase the rate of change.
 * 
 * @param {PIXI.Container} container The container to set the alpha for.
 * @param {number} start The starting alpha of the container items.
 * @param {number} [step=1] The rate of change of the alpha value, in items.
 */

function setAlpha(container, start) {
  var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var currentAlpha = start;
  container.children.forEach(function (item) {
    item.alpha = currentAlpha;
    currentAlpha += step * 1;
  });
}
/**
 * Sets the alpha of the container items from a start value to an end value based
 * on a provided easing function.
 * 
 * @param {PIXI.Container} container The container to set the alpha for.
 * @param {number} start The starting alpha of the container items.
 * @param {number} end The ending alpha of the container items.
 * @param {Function} easing The easing function to use to ease the value.
 */

function setAlphaEase(container, start, end, easing) {
  var currentAlpha = start;
  container.children.forEach(function (item, index) {
    // We want to ease depending on what item we are at in the loop.
    var percentToEnd = index / (container.children.length - 1);
    var alpha = easing(percentToEnd);
    currentAlpha = end > start ? end * alpha : 1 - alpha;
    item.alpha = currentAlpha;
  });
}
/**
 * Places the items onto a circle and rotates them around a pivot point. Note that
 * the method needs to be placed in some sort of game loop in order to update the
 * positions of the items.
 * 
 * @param {PIXI.Container} container The container to rotate the items of.
 * @param {number} x The x location of the point to pivot around. 
 * @param {number} y The y location of the point to pivot around. 
 * @param {number} radius The radius of the circle to place the items on.
 * @param {number} delta The delta time from the game loop update function.
 * @param {number} [speed=1] A number that controls the 
 */

function rotateAroundPoint(container, x, y, radius, delta) {
  var speed = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
  container.position.set(x, y);
  placeOnCircle(container, radius);
  container.rotation += speed * delta;
}
/**
 * Splits a Polygon into triangles using the Polygon's `genericPoints` property
 * and the `earcut` module.
 * 
 * @param {Polygon} polygon The Polygon to get the triangles of.
 * 
 * @returns {Array<Array<Array<number>>>} Returns the triangles from the Polygon.
 */

function getTrianglesFromPolygon(polygon) {
  // Get the triangle indice of the Polygon.
  var indices = earcut_1(polygon.pointsGeneric);
  var triangles = [];

  for (var i = 0; i < indices.length; i += 3) {
    // Create the triangles by mapping the indices to the values they correspond to in
    // the `polygon.pointsGeneric` Array used to create the indices.
    var triangleIndices = [indices[i], indices[i + 1], indices[i + 2]];
    var points = triangleIndices.map(function (index) {
      var x = polygon.pointsGeneric[index * 2];
      var y = polygon.pointsGeneric[index * 2 + 1];
      return [x, y];
    });
    triangles.push(points);
  }

  return triangles;
}
/**
 * Returns the area of a triangle.
 * 
 * @param {Array<Array<number>>} triangle The triangle to get the area of.
 * 
 * @returns {number} Returns the area of the provided triangle.
 */


function getTriangleArea(triangle) {
  var _triangle = _slicedToArray(triangle, 3),
      a = _triangle[0],
      b = _triangle[1],
      c = _triangle[2];

  return 0.5 * ((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]));
}
/**
 * Get the distributions of the triangles over the Polygon.
 * 
 * @param {Array<Array<Array<number>>>} triangles The triangles to get the distribution of.
 * 
 * @returns {number} Returns the distributions of the triangles.
 */


function generateDistribution(triangles) {
  var totalArea = triangles.reduce(function (sum, triangle) {
    return sum + getTriangleArea(triangle);
  }, 0);
  var cumulativeDistribution = [];

  for (var i = 0; i < triangles.length; ++i) {
    var lastValue = cumulativeDistribution[i - 1] || 0;
    var nextValue = lastValue + getTriangleArea(triangles[i]) / totalArea;
    cumulativeDistribution.push(nextValue);
  }

  return cumulativeDistribution;
}
/**
 * Chooses a random triangle from the Array of triangles based on the cumulative
 * distribution.
 * 
 * @param {Array<Array<Array<number>>>} triangles The triangles to select a random triangle from.
 * 
 * @returns {Array<Array<number>>} Returns a random triangle.
 */


function selectRandomTriangle(triangles) {
  var cumulativeDistribution = generateDistribution(triangles);
  var index = cumulativeDistribution.findIndex(function (v) {
    return v > Math.random();
  });
  return triangles[index];
}
/**
 * Gets a random point from a triangle.
 * 
 * @param {Array<Array<number>>} triangle The triangle to get a random point from.
 * 
 * @returns {Array<number>} Returns an [x, y] value from the provided triangle.
 */


function getRandomPointInTriangle(triangle) {
  var wb = Math.random();
  var wc = Math.random(); // point will be outside of the triangle, invert weights

  if (wb + wc > 1) {
    wb = 1 - wb;
    wc = 1 - wc;
  }

  var _triangle$map = triangle.map(function (coords) {
    return {
      x: coords[0],
      y: coords[1]
    };
  }),
      _triangle$map2 = _slicedToArray(_triangle$map, 3),
      a = _triangle$map2[0],
      b = _triangle$map2[1],
      c = _triangle$map2[2];

  var rb_x = wb * (b.x - a.x);
  var rb_y = wb * (b.y - a.y);
  var rc_x = wc * (c.x - a.x);
  var rc_y = wc * (c.y - a.y);
  var r_x = rb_x + rc_x + a.x;
  var r_y = rb_y + rc_y + a.y;
  return [r_x, r_y];
}

export { Polygon, Vector, gridAlign, placeInCircle, placeInPolygon, placeOnCircle, placeOnLine, placeOnPolygon, rotateAroundPoint, setAlpha, setAlphaEase };

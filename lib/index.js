'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridAlign = gridAlign;
exports.placeOnCircle = placeOnCircle;
exports.placeOnLine = placeOnLine;
exports.placeOnPolygon = placeOnPolygon;
exports.placeInCircle = placeInCircle;
exports.placeInPolygon = placeInPolygon;
exports.setAlpha = setAlpha;
exports.setAlphaEase = setAlphaEase;
exports.rotateAroundPoint = rotateAroundPoint;
Object.defineProperty(exports, "Vector", {
  enumerable: true,
  get: function get() {
    return _collider2d.Vector;
  }
});
Object.defineProperty(exports, "Polygon", {
  enumerable: true,
  get: function get() {
    return _collider2d.Polygon;
  }
});

var _earcut = _interopRequireDefault(require("earcut"));

var _collider2d = require("collider2d");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
  var indices = (0, _earcut["default"])(polygon.pointsGeneric);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6WyJncmlkQWxpZ24iLCJjb250YWluZXIiLCJ3aWR0aCIsIm9wdGlvbnMiLCJpdGVtc1RvUGxhY2UiLCJjdXJyZW50V2lkdGgiLCJ4IiwieSIsImkiLCJjaGlsZHJlbiIsImxlbmd0aCIsIml0ZW0iLCJpdGVtQXNDb250YWluZXIiLCJjb25zb2xlIiwid2FybiIsInB1c2giLCJoZWlnaHQiLCJwYWRkaW5nQmV0d2VlblJvd3MiLCJwYWRkaW5nQmV0d2VlbkNvbHVtbnMiLCJwb3NpdGlvbiIsInNldCIsInBsYWNlT25DaXJjbGUiLCJyYWRpdXMiLCJkZWdyZWVJbmNyZW1lbnQiLCJjdXJyZW50QW5nbGUiLCJmb3JFYWNoIiwicmFkaWFuIiwiTWF0aCIsImNvcyIsInNpbiIsInJvdGF0ZUl0ZW1zIiwicm90YXRlSXRlbXNJbnZlcnNlIiwicGl2b3QiLCJhbmdsZSIsInBsYWNlT25MaW5lIiwic3RhcnRYIiwic3RhcnRZIiwiZW5kWCIsImVuZFkiLCJudW1JdGVtc1RvRGl2aWRlQnkiLCJ4U2VnbWVudExlbmd0aCIsInlTZWdtZW50TGVuZ3RoIiwiaW5kZXgiLCJwbGFjZU9uUG9seWdvbiIsInBvbHlnb24iLCJpdGVtc0RpdmlkZWRCeUVkZ2VzIiwiZWRnZXMiLCJwb2x5Z29uTGluZXMiLCJwb2ludHMiLCJjdXJyZW50UG9pbnQiLCJsaW5lIiwic3RhcnQiLCJlbmQiLCJjdXJyZW50TGluZUluZGV4IiwiY3VycmVudExpbmUiLCJwbGFjZUluQ2lyY2xlIiwiYSIsInJhbmRvbSIsIlBJIiwiciIsInNxcnQiLCJwbGFjZUluUG9seWdvbiIsInRyaWFuZ2xlcyIsImdldFRyaWFuZ2xlc0Zyb21Qb2x5Z29uIiwidHJpYW5nbGUiLCJzZWxlY3RSYW5kb21UcmlhbmdsZSIsInBvaW50SW5UcmlhbmdsZSIsImdldFJhbmRvbVBvaW50SW5UcmlhbmdsZSIsInNldEFscGhhIiwic3RlcCIsImN1cnJlbnRBbHBoYSIsImFscGhhIiwic2V0QWxwaGFFYXNlIiwiZWFzaW5nIiwicGVyY2VudFRvRW5kIiwicm90YXRlQXJvdW5kUG9pbnQiLCJkZWx0YSIsInNwZWVkIiwicm90YXRpb24iLCJpbmRpY2VzIiwicG9pbnRzR2VuZXJpYyIsInRyaWFuZ2xlSW5kaWNlcyIsIm1hcCIsImdldFRyaWFuZ2xlQXJlYSIsImIiLCJjIiwiZ2VuZXJhdGVEaXN0cmlidXRpb24iLCJ0b3RhbEFyZWEiLCJyZWR1Y2UiLCJzdW0iLCJjdW11bGF0aXZlRGlzdHJpYnV0aW9uIiwibGFzdFZhbHVlIiwibmV4dFZhbHVlIiwiZmluZEluZGV4IiwidiIsIndiIiwid2MiLCJjb29yZHMiLCJyYl94IiwicmJfeSIsInJjX3giLCJyY195Iiwicl94Iiwicl95Il0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUE7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sU0FBU0EsU0FBVCxDQUFtQkMsU0FBbkIsRUFBOENDLEtBQTlDLEVBQTZEQyxPQUE3RCxFQUF5RjtBQUM1RjtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxZQUFZLEdBQUcsRUFBckI7QUFDQSxNQUFJQyxZQUFZLEdBQUcsQ0FBbkI7QUFFQSxNQUFJQyxDQUFDLEdBQUcsQ0FBUjtBQUNBLE1BQUlDLENBQUMsR0FBRyxDQUFSOztBQUVBLE9BQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR1AsU0FBUyxDQUFDUSxRQUFWLENBQW1CQyxNQUF2QyxFQUErQyxFQUFFRixDQUFqRCxFQUFvRDtBQUNoRDtBQUNBLFFBQU1HLElBQUksR0FBR1YsU0FBUyxDQUFDUSxRQUFWLENBQW1CRCxDQUFuQixDQUFiLENBRmdELENBSWhEO0FBQ0E7O0FBQ0EsUUFBTUksZUFBZSxHQUFHRCxJQUF4Qjs7QUFDQSxRQUFJLENBQUNDLGVBQUwsRUFBc0I7QUFDbEJDLE1BQUFBLE9BQU8sQ0FBQ0Ms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LEdBQU1rRCxDQUFDLENBQUNsRCxDQUFaLENBQWY7QUFDQSxNQUFNK0YsSUFBSSxHQUFHTCxFQUFFLElBQUlYLENBQUMsQ0FBQzlFLENBQUYsR0FBTWlELENBQUMsQ0FBQ2pELENBQVosQ0FBZjtBQUVBLE1BQU0rRixHQUFHLEdBQUdKLElBQUksR0FBR0UsSUFBUCxHQUFjNUMsQ0FBQyxDQUFDbEQsQ0FBNUI7QUFDQSxNQUFNaUcsR0FBRyxHQUFHSixJQUFJLEdBQUdFLElBQVAsR0FBYzdDLENBQUMsQ0FBQ2pELENBQTVCO0FBRUEsU0FBTyxDQUFDK0YsR0FBRCxFQUFNQyxHQUFOLENBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xyXG5cclxuaW1wb3J0IGVhcmN1dCBmcm9tICdlYXJjdXQnO1xyXG5pbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnO1xyXG5pbXBvcnQgeyBWZWN0b3IsIFBvbHlnb24gfSBmcm9tICdjb2xsaWRlcjJkJztcclxuaW1wb3J0IHsgR3JpZEFsaWduT3B0aW9ucywgQ2lyY2xlUGxhY2VtZW50T3B0aW9ucyB9IGZyb20gJy4vb3B0aW9ucyc7XHJcblxyXG4vKipcclxuICogUGl4aSBDb250YWluZXIgSGVscGVycyBpcyB1c2VkIHRvIHByb3ZpZGUgaGVscGVyIG1ldGhvZHMgdG8gd29yayB3aXRoXHJcbiAqIGNvbnRhaW5lcnMgaW4gdmFyaW91cyB3YXlzLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBFeHBvcnQgdGhlIGBWZWN0b3JgIGFuZCBgUG9seWdvbmAgb2JqZWN0cyBpbiBjYXNlIHRoZSBgcGxhY2VPblBvbHlnb25gIG1ldGhvZFxyXG4gKiBpcyB1c2VkLlxyXG4gKi9cclxuZXhwb3J0IHtcclxuICAgIFZlY3RvcixcclxuICAgIFBvbHlnb24sXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQbGFjZXMgdGhlIGl0ZW1zIGluIHRoZSBjb250YWluZXIgaW50byBhIGdyaWQuXHJcbiAqIFxyXG4gKiBAcGFyYW0ge1BJWEkuQ29udGFpbmVyfSBjb250YWluZXIgVGhlIGNvbnRhaW5lciB0byBwbGFjZSB0aGUgaXRlbXMgb2YgaW50byBhIGdyaWQuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBUaGUgbnVtYmVyIG9mIGl0ZW1zIHRoYXQgY2FuIGZpdCBpbiB0aGUgZ3JpZCBob3Jpem9udGFsbHkgYmVmb3JlIGl0IHNwbGl0cyBpbnRvIGEgbmV3IHJvdy5cclxuICogQHBhcmFtIHtHcmlkQWxpZ25PcHRpb25zfSBbb3B0aW9uc10gVGhlIG9wdGlvbmFsIGFyZ3VtZW50cyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmhvcml6b250YWxQYWRkaW5nPTBdIFRoZSBhbW91bnQgb2YgcGFkZGluZyB0aGF0IHNob3VsZCBiZSBiZXR3ZWVuIGl0ZW1zIGluIHRoZSBncmlkIGhvcml6b250YWxseS5cclxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnZlcnRpY2FsUGFkZGluZz0wXSBUaGUgYW1vdW50IG9mIHBhZGRpbmcgdGhhdCBzaG91bGQgYmUgYmV0d2VlbiByb3dzIGluIHRoZSBncmlkLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdyaWRBbGlnbihjb250YWluZXI6IFBJWEkuQ29udGFpbmVyLCB3aWR0aDogbnVtYmVyLCBvcHRpb25zPzogR3JpZEFsaWduT3B0aW9ucykge1xyXG4gICAgLy8gU2luY2Ugd2UgbmVlZCB0byBjYXN0IHRoZSBjaGlsZHJlbiBvZiB0aGUgY29udGFpbmVyIGludG8gYFBJWEkuQ29udGFpbmVyYGJlY2F1c2Ugd2UgbmVlZFxyXG4gICAgLy8gdG8gbWFrZSBzdXJlIHRoZXkgaGF2ZSBgd2lkdGhgIGFuZCBgaGVpZ2h0YCBwcm9wZXJ0aWVzLCB3ZSBoYXZlIHRvIGNyZWF0ZSBhIG5ldyBBcnJheVxyXG4gICAgLy8gYW5kIGFkZCB0aGUgY2FzdGVkIHZlcnNpb25zIG9mIHRoZSBjb250YWluZXIgY2hpbGRyZW4gdG8gaXQuXHJcbiAgICBjb25zdCBpdGVtc1RvUGxhY2UgPSBbXTtcclxuICAgIGxldCBjdXJyZW50V2lkdGggPSAwO1xyXG5cclxuICAgIGxldCB4ID0gMDtcclxuICAgIGxldCB5ID0gMDtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRhaW5lci5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIC8vIFNhdmUgdGhlIGN1cnJlbnQgY2hpbGQgdG8gYSB2YXJpYWJsZS5cclxuICAgICAgICBjb25zdCBpdGVtID0gY29udGFpbmVyLmNoaWxkcmVuW2ldO1xyXG5cclxuICAgICAgICAvLyBJZiB3ZSBjYW4ndCBjYXN0IHRoZSBjaGlsZCB3aGljaCBpcyBhIGBEaXNwbGF5T2JqZWN0YCB0byBhIGBDb250YWluZXJgIHRoZW4gd2VcclxuICAgICAgICAvLyBoYXZlIHRvIHNraXAgdGhpcyBjaGlsZCBhcyB3ZSBuZWVkIGBoZWlnaHRgIGFuZCBgd2lkdGhgIHByb3BlcnRpZXMgdG8gd29yayB3aXRoLlxyXG4gICAgICAgIGNvbnN0IGl0ZW1Bc0NvbnRhaW5lciA9IGl0ZW0gYXMgUElYSS5Db250YWluZXI7XHJcbiAgICAgICAgaWYgKCFpdGVtQXNDb250YWluZXIpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBDaGlsZCBvZiBjb250YWluZXIgZG9lcyBub3QgaW5oZXJpdCBmcm9tIFBJWEkuRGlzcGxheU9iamVjdCwgc2tpcHBpbmcuLi5gKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW1zVG9QbGFjZS5wdXNoKGl0ZW1Bc0NvbnRhaW5lcilcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIG5lZWQgdG8gYnJlYWsgdG8gYSBuZXcgbGluZSBvciBub3QuIFdlIHBlcmZvcm0gdGhpcyBjaGVjayBieVxyXG4gICAgICAgIC8vIGNoZWNraW5nIHRoZSB2YWx1ZSBvZiBgaWAgYWdhaW5zdCB0aGUgdmFsdWUgb2YgdGhlIGB3aWR0aGAgYXJndW1lbnQuIElmIHdlIG5lZWRcclxuICAgICAgICAvLyB0byBicmVhayB0byBhIG5ldyByb3csIHdlIHNldCB0aGUgYHlgIHRvIGluY3JlbWVudCBieSB0aGUgaGVpZ2h0IG9mIHRoZSBmaXJzdFxyXG4gICAgICAgIC8vIGl0ZW0gaW4gdGhlIGN1cnJlbnQgcm93LlxyXG4gICAgICAgIGlmIChjdXJyZW50V2lkdGggPT0gd2lkdGgpIHtcclxuICAgICAgICAgICAgY3VycmVudFdpZHRoID0gMDtcclxuICAgICAgICAgICAgeCA9IDA7XHJcbiAgICAgICAgICAgIHkgKz0gaXRlbXNUb1BsYWNlW2kgLSAod2lkdGggLSAxKV0uaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgbmVlZHMgdG8gYmUgdmVydGljYWwgcGFkZGluZyB3ZSBhZGQgaXQgaGVyZSBvciBlbHNlIGV2ZXJ5IGl0ZW0gaW5cclxuICAgICAgICAgICAgLy8gdGhlIHJvdyB3aWxsIGJlIGxvd2VyIHRoYW4gdGhlIHByZXZpb3VzLlxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucz8ucGFkZGluZ0JldHdlZW5Sb3dzKSB5ICs9IG9wdGlvbnMucGFkZGluZ0JldHdlZW5Sb3dzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gV2UgYWRkIHRoZSBob3Jpem9udGFsIHBhZGRpbmcgaGVyZSBhcyBob3Jpem9udGFsIHNwYWNlIGlzIGNhbGN1bGF0ZWQgd2l0aCBldmVyeVxyXG4gICAgICAgIC8vIGl0ZW0uXHJcbiAgICAgICAgaWYgKG9wdGlvbnM/LnBhZGRpbmdCZXR3ZWVuQ29sdW1ucykgeCArPSBvcHRpb25zLnBhZGRpbmdCZXR3ZWVuQ29sdW1ucztcclxuXHJcbiAgICAgICAgaXRlbS5wb3NpdGlvbi5zZXQoeCwgeSk7XHJcbiAgICAgICAgY3VycmVudFdpZHRoKys7XHJcblxyXG4gICAgICAgIC8vIExhc3RseSB3ZSBpbmNyZW1lbnQgdGhlIGB4YCBieSB0aGUgd2lkdGggb2YgdGhlIHByZXZpb3VzIGVsZW1lbnQuXHJcbiAgICAgICAgeCArPSBpID09IDAgPyBpdGVtc1RvUGxhY2VbaV0ud2lkdGggOiBpdGVtc1RvUGxhY2VbaSAtIDFdLndpZHRoO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUGxhY2VzIHRoZSBpdGVtcyBpbiB0aGUgY29udGFpbmVyIG9udG8gYSBjaXJjbGUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7UElYSS5Db250YWluZXJ9IGNvbnRhaW5lciBUaGUgY29udGFpbmVyIHRvIHBsYWNlIHRoZSBpdGVtcyBvZiBvbnRvIGEgY2lyY2xlLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIFRoZSByYWRpdXMgb2YgdGhlIGNpcmNsZSB0byBwbGFjZSB0aGUgaXRlbXMgb250by5cclxuICogQHBhcmFtIHtDaXJjbGVQbGVtZW50T3B0aW9uc30gW29wdGlvbnNdIFRoZSBvcHRpb25hbCBhcmd1bWVudHMgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24uXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucm90YXRlSXRlbXM9ZmFsc2VdIEluZGljYXRlcyB3aGV0aGVyIHRoZSBpdGVtcyBpbiB0aGUgY29udGFpbmVyIHNob3VsZCBiZSByb3RhdGVkIHRvIG1hdGNoIHRoZWlyIGFuZ2xlcyBvciBub3QuXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucm90YXRlSXRlbXNJbnZlcnNlPWZhbHNlXSBJbmRpY2F0ZXMgd2hldGhlciB0aGUgaXRlbXMgaW4gdGhlIGdyb3VuZCBzaG91bGQgYmUgcm90YXRlZCB0byB0aGVpciBpbnZlcnNlIGFuZ2xlIG9yIG5vdC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwbGFjZU9uQ2lyY2xlKGNvbnRhaW5lcjogUElYSS5Db250YWluZXIsIHJhZGl1czogbnVtYmVyLCBvcHRpb25zPzogQ2lyY2xlUGxhY2VtZW50T3B0aW9ucykge1xyXG4gICAgLy8gRmlyc3QsIHdlIGhhdmUgdG8ga25vdyBhdCB3aGF0IGRlZ3JlZSBpbmNyZW1lbnRzIHdlIGhhdmUgdG8gcGxhY2UgdGhlIGl0ZW1zLiBTaW5jZSBhXHJcbiAgICAvLyBjaXJjbGUgaGFzIDM2MCBkZWdyZWVzLCB3ZSBkaXZpZGUgdGhhdCBieSB0aGUgbnVtYmVyIG9mIGNoaWxkcmVuIGluIHRoZSBjb250YWluZXIgdG8gZ2V0XHJcbiAgICAvLyB0aGUgZGVncmVlIGluY3JlbWVudHMuXHJcbiAgICBjb25zdCBkZWdyZWVJbmNyZW1lbnQgPSAzNjAgLyBjb250YWluZXIuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgbGV0IGN1cnJlbnRBbmdsZSA9IDA7XHJcblxyXG4gICAgY29udGFpbmVyLmNoaWxkcmVuLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgLy8gU2luY2UgdGhlIGNpcmNsZSB3b3JrcyBpbiByYWRpYW5zIHdlIGhhdmUgdG8gY29udmVydCBmcm9tIGRlZyB0byByYWQuXHJcbiAgICAgICAgY29uc3QgcmFkaWFuID0gY3VycmVudEFuZ2xlICogMC4wMTc0NTMyOTI1XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSByYWRpdXMgKiBNYXRoLmNvcyhyYWRpYW4pO1xyXG4gICAgICAgIGNvbnN0IHkgPSByYWRpdXMgKiBNYXRoLnNpbihyYWRpYW4pO1xyXG5cclxuICAgICAgICBpdGVtLnBvc2l0aW9uLnNldCh4LCB5KTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnM/LnJvdGF0ZUl0ZW1zIHx8IG9wdGlvbnM/LnJvdGF0ZUl0ZW1zSW52ZXJzZSkge1xyXG4gICAgICAgICAgICBjb25zdCBpdGVtQXNDb250YWluZXIgPSBpdGVtIGFzIFBJWEkuQ29udGFpbmVyO1xyXG4gICAgICAgICAgICBpdGVtLnBpdm90LnNldChpdGVtQXNDb250YWluZXIud2lkdGggLyAyLCBpdGVtQXNDb250YWluZXIuaGVpZ2h0IC8gMik7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5yb3RhdGVJdGVtcykgaXRlbS5hbmdsZSA9IGN1cnJlbnRBbmdsZTtcclxuICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5yb3RhdGVJdGVtc0ludmVyc2UpIGl0ZW0uYW5nbGUgPSAoY3VycmVudEFuZ2xlICsgMTgwKSAlIDM2MDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN1cnJlbnRBbmdsZSArPSBkZWdyZWVJbmNyZW1lbnQ7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBsYWNlcyB0aGUgaXRlbXMgaW4gdGhlIGNvbnRhaW5lciBvbnRvIGEgbGluZS5cclxuICogXHJcbiAqIEBwYXJhbSB7UElYSS5Db250YWluZXJ9IGNvbnRhaW5lciBUaGUgY29udGFpbmVyIHRvIHBsYWNlIHRoZSBpdGVtcyBvZiBvbnRvIGEgbGluZS5cclxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0WCBUaGUgeCB2YWx1ZSBvZiB0aGUgcG9zaXRpb24gdG8gc3RhcnQgdGhlIGxpbmUuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFkgVGhlIHkgdmFsdWUgb2YgdGhlIHBvc2l0aW9uIHRvIHN0YXJ0IHRoZSBsaW5lLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gZW5kWCBUaGUgeCB2YWx1ZSBvZiB0aGUgcG9zaXRpb24gdG8gZW5kIHRoZSBsaW5lLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gZW5kWSBUaGUgeSB2YWx1ZSBvZiB0aGUgcG9zaXRpb24gdG8gZW5kIHRoZSBsaW5lLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBsYWNlT25MaW5lKGNvbnRhaW5lcjogUElYSS5Db250YWluZXIsIHN0YXJ0WDogbnVtYmVyLCBzdGFydFk6IG51bWJlciwgZW5kWDogbnVtYmVyLCBlbmRZOiBudW1iZXIpIHtcclxuICAgIC8vIEZpcnN0IHdlIGhhdmUgdG8gZmluZCBvdXQgdGhlIHNwYWNpbmcgb24gdGhlIHggYW5kIHkgYXhpcyBzbyB3ZSBrbm93IGhvdyBmYXIgYXBhcnRcclxuICAgIC8vIHRvIHB1dCB0aGUgaXRlbXMuXHJcbiAgICBjb25zdCBudW1JdGVtc1RvRGl2aWRlQnkgPSBjb250YWluZXIuY2hpbGRyZW4ubGVuZ3RoIC0gMTtcclxuICAgIGNvbnN0IHhTZWdtZW50TGVuZ3RoID0gKGVuZFggLSBzdGFydFgpIC8gbnVtSXRlbXNUb0RpdmlkZUJ5O1xyXG4gICAgY29uc3QgeVNlZ21lbnRMZW5ndGggPSAoZW5kWSAtIHN0YXJ0WSkgLyBudW1JdGVtc1RvRGl2aWRlQnk7XHJcblxyXG4gICAgY29udGFpbmVyLmNoaWxkcmVuLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XHJcbiAgICAgICAgLy8gTm93IGZvciBlYWNoIGl0ZW0gd2UgcGxhY2UgaXQgb24gdGhlIGxpbmUsIHN0YXJ0aW5nIGZyb20gdGhlIHN0YXJ0IHBvaW50LCB3aXRoXHJcbiAgICAgICAgLy8gZWFjaCBpdGVtIGJlaW5nIGEgbXVsdGlwbGUgb2YgdGhlIHNlZ21lbnQgbGVuZ3RoLlxyXG4gICAgICAgIGl0ZW0ucG9zaXRpb24uc2V0KHN0YXJ0WCArIHhTZWdtZW50TGVuZ3RoICogaW5kZXgsIHN0YXJ0WSArIHlTZWdtZW50TGVuZ3RoICogaW5kZXgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQbGFjZXMgdGhlIGl0ZW1zIGluIHRoZSBjb250YWluZXIgb250byBhIHBvbHlnb24uXHJcbiAqIFxyXG4gKiBAcGFyYW0ge1BJWEkuQ29udGFpbmVyfSBjb250YWluZXIgVGhlIGNvbnRhaW5lciB0byBwbGFjZSB0aGUgaXRlbXMgb2Ygb250byBhIFBvbHlnb24uXHJcbiAqIEBwYXJhbSB7UG9seWdvbn0gcG9seWdvbiBUaGUgUG9seWdvbiB0byB1c2UgdG8gcGxhY2UgdGhlIGl0ZW1zLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBsYWNlT25Qb2x5Z29uKGNvbnRhaW5lcjogUElYSS5Db250YWluZXIsIHBvbHlnb246IFBvbHlnb24pIHtcclxuICAgIC8vIFNpbmNlIHRoZSBQb2x5Z29uIGhhcyBhIHBvc2l0aW9uLCB3ZSBzZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBjb250YWluZXIgdG8gdGhlIHBvc2l0aW9uXHJcbiAgICAvLyBvZiB0aGUgUG9seWdvbi5cclxuICAgIGNvbnRhaW5lci5wb3NpdGlvbi5zZXQocG9seWdvbi5wb3NpdGlvbi54LCBwb2x5Z29uLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgIGNvbnN0IGl0ZW1zRGl2aWRlZEJ5RWRnZXMgPSAoY29udGFpbmVyLmNoaWxkcmVuLmxlbmd0aCAtIDEpIC8gcG9seWdvbi5lZGdlcy5sZW5ndGg7XHJcbiAgICBjb25zdCBwb2x5Z29uTGluZXM6IEFycmF5PGFueT4gPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvbHlnb24ucG9pbnRzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFBvaW50ID0gcG9seWdvbi5wb2ludHNbaV07XHJcblxyXG4gICAgICAgIC8vIFdlIGNyZWF0ZSBhIGxpbmUgb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHN0YXJ0IFZlY3RvciBvZiB0aGUgbGluZSwgdGhlIGVuZFxyXG4gICAgICAgIC8vIFZlY3RvciBvZiB0aGUgbGluZSwgYW5kIHRoZSBsZW5ndGggb2YgaXRzIHNlZ21lbnRzLlxyXG4gICAgICAgIGNvbnN0IGxpbmUgPSB7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBjdXJyZW50UG9pbnQsXHJcbiAgICAgICAgICAgIGVuZDogcG9seWdvbi5wb2ludHNbaSArIDFdLFxyXG4gICAgICAgICAgICBwb2ludHM6IDAsXHJcbiAgICAgICAgICAgIHhTZWdtZW50TGVuZ3RoOiAwLFxyXG4gICAgICAgICAgICB5U2VnbWVudExlbmd0aDogMCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgcG9pbnQgd2UncmUgb24gaXMgY3VycmVudGx5IHRoZSBsYXN0IHBvaW50IG9mIHRoZSBQb2x5Z29uIHRoZW4gd2UgbmVlZFxyXG4gICAgICAgIC8vIHRvIHNldCBpdHMgZW5kIHRvIGJlIHRoZSBmaXJzdCBwb2ludCB0byBjbG9zZSB0aGUgUG9seWdvbi5cclxuICAgICAgICBpZiAoaSA9PSBwb2x5Z29uLnBvaW50cy5sZW5ndGggLSAxKSBsaW5lLmVuZCA9IHBvbHlnb24ucG9pbnRzWzBdO1xyXG5cclxuICAgICAgICBsaW5lLnhTZWdtZW50TGVuZ3RoID0gKGxpbmUuZW5kLnggLSBsaW5lLnN0YXJ0LngpIC8gaXRlbXNEaXZpZGVkQnlFZGdlcztcclxuICAgICAgICBsaW5lLnlTZWdtZW50TGVuZ3RoID0gKGxpbmUuZW5kLnkgLSBsaW5lLnN0YXJ0LnkpIC8gaXRlbXNEaXZpZGVkQnlFZGdlcztcclxuXHJcbiAgICAgICAgcG9seWdvbkxpbmVzLnB1c2gobGluZSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGN1cnJlbnRMaW5lSW5kZXggPSAwO1xyXG4gICAgY29udGFpbmVyLmNoaWxkcmVuLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudExpbmUgPSBwb2x5Z29uTGluZXNbY3VycmVudExpbmVJbmRleF07XHJcblxyXG4gICAgICAgIC8vIFdlIHNldCB0aGUgcG9pbnQgb24gdGhpcyBsaW5lIGRlcGVuZGluZyBvbiBob3cgbWFueSBwb2ludHMgYXJlIGFscmVhZHkgb25cclxuICAgICAgICAvLyB0aGlzIGxpbmUgYW5kIHRoZW4gaW5jcmVtZW50IHRoZSBhbW91bnQgb2YgcG9pbnRzLlxyXG4gICAgICAgIGl0ZW0ucG9zaXRpb24uc2V0KFxyXG4gICAgICAgICAgICBjdXJyZW50TGluZS5zdGFydC54ICsgY3VycmVudExpbmUueFNlZ21lbnRMZW5ndGggKiBjdXJyZW50TGluZS5wb2ludHMsXHJcbiAgICAgICAgICAgIGN1cnJlbnRMaW5lLnN0YXJ0LnkgKyBjdXJyZW50TGluZS55U2VnbWVudExlbmd0aCAqIGN1cnJlbnRMaW5lLnBvaW50cyxcclxuICAgICAgICApO1xyXG4gICAgICAgIGN1cnJlbnRMaW5lLnBvaW50cysrO1xyXG5cclxuICAgICAgICAvLyBJZiB3ZSdyZSBjdXJyZW50bHkgYXQgdGhlIGxhc3QgbGluZSBpbiB0aGUgQXJyYXkgdGhlbiB3ZSB3YW50IHRvIHJlc2V0XHJcbiAgICAgICAgLy8gYmFjayB0byB0aGUgZmlyc3QgbGluZS4gT3RoZXJ3aXNlIHdlIGp1c3QgZ28gb24gdG8gdGhlIG5leHQgbGluZS5cclxuICAgICAgICBpZiAoY3VycmVudExpbmVJbmRleCA9PSBwb2x5Z29uTGluZXMubGVuZ3RoIC0gMSkgY3VycmVudExpbmVJbmRleCA9IDA7XHJcbiAgICAgICAgZWxzZSBjdXJyZW50TGluZUluZGV4Kys7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBsYWNlcyB0aGUgaXRlbXMgaW4gdGhlIGNvbnRhaW5lciBpbnRvIGEgY2lyY2xlIGluIGEgcmFuZG9tIGZhc2hpb24uXHJcbiAqIFxyXG4gKiBAcGFyYW0ge1BJWEkuQ29udGFpbmVyfSBjb250YWluZXIgVGhlIGNvbnRhaW5lciB0byBwbGFjZSB0aGUgaXRlbXMgb2YgaW50byBhIGNpcmNsZS5cclxuICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyBUaGUgcmFkaXVzIG9mIHRoZSBjaXJjbGUgdG8gcGxhY2UgdGhlIGl0ZW1zIGluLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBsYWNlSW5DaXJjbGUoY29udGFpbmVyOiBQSVhJLkNvbnRhaW5lciwgcmFkaXVzOiBudW1iZXIpIHtcclxuICAgIGNvbnRhaW5lci5jaGlsZHJlbi5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICAgIGNvbnN0IGEgPSBNYXRoLnJhbmRvbSgpICogMiAqIE1hdGguUEk7XHJcbiAgICAgICAgY29uc3QgciA9IHJhZGl1cyAqIE1hdGguc3FydChNYXRoLnJhbmRvbSgpKTtcclxuXHJcbiAgICAgICAgY29uc3QgeCA9IHIgKiBNYXRoLmNvcyhhKTtcclxuICAgICAgICBjb25zdCB5ID0gciAqIE1hdGguc2luKGEpO1xyXG5cclxuICAgICAgICBpdGVtLnBvc2l0aW9uLnNldCh4LCB5KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogUGxhY2VzIHRoZSBpdGVtcyBpbiB0aGUgY29udGFpbmVyIGludG8gYSBQb2x5Z29uIGluIGEgcmFuZG9tIGZhc2hpb24uXHJcbiAqIFxyXG4gKiBAcGFyYW0ge1BJWEkuQ29udGFpbmVyfSBjb250YWluZXIgVGhlIGNvbnRhaW5lciB0byBwbGFjZSB0aGUgaXRlbXMgb2YgaW50byBhIFBvbHlnb24uXHJcbiAqIEBwYXJhbSB7UG9seWdvbn0gcG9seWdvbiBUaGUgUG9seWdvbiB0byB1c2UgdG8gcGxhY2UgdGhlIGl0ZW1zIGluLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBsYWNlSW5Qb2x5Z29uKGNvbnRhaW5lcjogUElYSS5Db250YWluZXIsIHBvbHlnb246IFBvbHlnb24pIHtcclxuICAgIGNvbnRhaW5lci5wb3NpdGlvbi5zZXQocG9seWdvbi5wb3NpdGlvbi54LCBwb2x5Z29uLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgIC8vIEZpcnN0IHdlIGdldCB0aGUgdHJpYW5nbGVzIGZyb20gdGhlIFBvbHlnb24uXHJcbiAgICBjb25zdCB0cmlhbmdsZXMgPSBnZXRUcmlhbmdsZXNGcm9tUG9seWdvbihwb2x5Z29uKTtcclxuXHJcbiAgICBjb250YWluZXIuY2hpbGRyZW4uZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICAvLyBTZWxlY3QgYSByYW5kb20gdHJpYW5nbGUgd2l0aGluIHRoZSBQb2x5Z29uIHRvIGFkZCB0aGUgaXRlbSB0by5cclxuICAgICAgICBjb25zdCB0cmlhbmdsZSA9IHNlbGVjdFJhbmRvbVRyaWFuZ2xlKHRyaWFuZ2xlcyk7XHJcblxyXG4gICAgICAgIC8vIE5leHQgd2Ugc2VsZWN0IGEgcmFuZG9tIHBvaW50IGZyb20gd2l0aGluIHRoYXQgdHJpYW5nbGUgd2hpY2ggd2lsbCBiZSB0aGUgW3gsIHldXHJcbiAgICAgICAgLy8gY29vcmRpbmF0ZXMgd2UgcG9zaXRpb24gb3VyIGl0ZW0uXHJcbiAgICAgICAgY29uc3QgcG9pbnRJblRyaWFuZ2xlID0gZ2V0UmFuZG9tUG9pbnRJblRyaWFuZ2xlKHRyaWFuZ2xlKTtcclxuXHJcbiAgICAgICAgLy8gTGFzdGx5IHdlIHBvc2l0aW9uIHRoZSBpdGVtIGF0IHRoYXQgcmFuZG9tIHBvaW50LlxyXG4gICAgICAgIGl0ZW0ucG9zaXRpb24uc2V0KHBvaW50SW5UcmlhbmdsZVswXSwgcG9pbnRJblRyaWFuZ2xlWzFdKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogU2V0cyB0aGUgYWxwaGEgb2YgdGhlIGNvbnRhaW5lciBpdGVtcyBmcm9tIGEgc3RhcnRpbmcgdmFsdWUgdG8gYW4gdW5rbm93biB2YWx1ZVxyXG4gKiB3aXRoIGFuIG9wdGlvbmFsIHN0ZXAgdmFsdWUgdGhhdCBjYW4gYmUgYWRkZWQgdG8gaW5jcmVhc2UgdGhlIHJhdGUgb2YgY2hhbmdlLlxyXG4gKiBcclxuICogQHBhcmFtIHtQSVhJLkNvbnRhaW5lcn0gY29udGFpbmVyIFRoZSBjb250YWluZXIgdG8gc2V0IHRoZSBhbHBoYSBmb3IuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydCBUaGUgc3RhcnRpbmcgYWxwaGEgb2YgdGhlIGNvbnRhaW5lciBpdGVtcy5cclxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGVwPTFdIFRoZSByYXRlIG9mIGNoYW5nZSBvZiB0aGUgYWxwaGEgdmFsdWUsIGluIGl0ZW1zLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEFscGhhKGNvbnRhaW5lcjogUElYSS5Db250YWluZXIsIHN0YXJ0OiBudW1iZXIsIHN0ZXA6IG51bWJlciA9IDEpIHtcclxuICAgIGxldCBjdXJyZW50QWxwaGEgPSBzdGFydDtcclxuXHJcbiAgICBjb250YWluZXIuY2hpbGRyZW4uZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICBpdGVtLmFscGhhID0gY3VycmVudEFscGhhO1xyXG4gICAgICAgIGN1cnJlbnRBbHBoYSArPSBzdGVwICogMTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogU2V0cyB0aGUgYWxwaGEgb2YgdGhlIGNvbnRhaW5lciBpdGVtcyBmcm9tIGEgc3RhcnQgdmFsdWUgdG8gYW4gZW5kIHZhbHVlIGJhc2VkXHJcbiAqIG9uIGEgcHJvdmlkZWQgZWFzaW5nIGZ1bmN0aW9uLlxyXG4gKiBcclxuICogQHBhcmFtIHtQSVhJLkNvbnRhaW5lcn0gY29udGFpbmVyIFRoZSBjb250YWluZXIgdG8gc2V0IHRoZSBhbHBoYSBmb3IuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydCBUaGUgc3RhcnRpbmcgYWxwaGEgb2YgdGhlIGNvbnRhaW5lciBpdGVtcy5cclxuICogQHBhcmFtIHtudW1iZXJ9IGVuZCBUaGUgZW5kaW5nIGFscGhhIG9mIHRoZSBjb250YWluZXIgaXRlbXMuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVhc2luZyBUaGUgZWFzaW5nIGZ1bmN0aW9uIHRvIHVzZSB0byBlYXNlIHRoZSB2YWx1ZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRBbHBoYUVhc2UoY29udGFpbmVyOiBQSVhJLkNvbnRhaW5lciwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIGVhc2luZzogRnVuY3Rpb24pIHtcclxuICAgIGxldCBjdXJyZW50QWxwaGEgPSBzdGFydDtcclxuXHJcbiAgICBjb250YWluZXIuY2hpbGRyZW4uZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcclxuICAgICAgICAvLyBXZSB3YW50IHRvIGVhc2UgZGVwZW5kaW5nIG9uIHdoYXQgaXRlbSB3ZSBhcmUgYXQgaW4gdGhlIGxvb3AuXHJcbiAgICAgICAgY29uc3QgcGVyY2VudFRvRW5kID0gaW5kZXggLyAoY29udGFpbmVyLmNoaWxkcmVuLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgIGNvbnN0IGFscGhhID0gZWFzaW5nKHBlcmNlbnRUb0VuZCk7XHJcblxyXG4gICAgICAgIGN1cnJlbnRBbHBoYSA9IGVuZCA+IHN0YXJ0ID8gZW5kICogYWxwaGEgOiAxIC0gYWxwaGE7XHJcbiAgICAgICAgaXRlbS5hbHBoYSA9IGN1cnJlbnRBbHBoYTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogUGxhY2VzIHRoZSBpdGVtcyBvbnRvIGEgY2lyY2xlIGFuZCByb3RhdGVzIHRoZW0gYXJvdW5kIGEgcGl2b3QgcG9pbnQuIE5vdGUgdGhhdFxyXG4gKiB0aGUgbWV0aG9kIG5lZWRzIHRvIGJlIHBsYWNlZCBpbiBzb21lIHNvcnQgb2YgZ2FtZSBsb29wIGluIG9yZGVyIHRvIHVwZGF0ZSB0aGVcclxuICogcG9zaXRpb25zIG9mIHRoZSBpdGVtcy5cclxuICogXHJcbiAqIEBwYXJhbSB7UElYSS5Db250YWluZXJ9IGNvbnRhaW5lciBUaGUgY29udGFpbmVyIHRvIHJvdGF0ZSB0aGUgaXRlbXMgb2YuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IFRoZSB4IGxvY2F0aW9uIG9mIHRoZSBwb2ludCB0byBwaXZvdCBhcm91bmQuIFxyXG4gKiBAcGFyYW0ge251bWJlcn0geSBUaGUgeSBsb2NhdGlvbiBvZiB0aGUgcG9pbnQgdG8gcGl2b3QgYXJvdW5kLiBcclxuICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyBUaGUgcmFkaXVzIG9mIHRoZSBjaXJjbGUgdG8gcGxhY2UgdGhlIGl0ZW1zIG9uLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGVsdGEgVGhlIGRlbHRhIHRpbWUgZnJvbSB0aGUgZ2FtZSBsb29wIHVwZGF0ZSBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtudW1iZXJ9IFtzcGVlZD0xXSBBIG51bWJlciB0aGF0IGNvbnRyb2xzIHRoZSBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVBcm91bmRQb2ludChjb250YWluZXI6IFBJWEkuQ29udGFpbmVyLCB4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXIsIGRlbHRhOiBudW1iZXIsIHNwZWVkOiBudW1iZXIgPSAxKSB7XHJcbiAgICBjb250YWluZXIucG9zaXRpb24uc2V0KHgsIHkpO1xyXG4gICAgcGxhY2VPbkNpcmNsZShjb250YWluZXIsIHJhZGl1cyk7XHJcblxyXG4gICAgY29udGFpbmVyLnJvdGF0aW9uICs9IHNwZWVkICogZGVsdGE7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTcGxpdHMgYSBQb2x5Z29uIGludG8gdHJpYW5nbGVzIHVzaW5nIHRoZSBQb2x5Z29uJ3MgYGdlbmVyaWNQb2ludHNgIHByb3BlcnR5XHJcbiAqIGFuZCB0aGUgYGVhcmN1dGAgbW9kdWxlLlxyXG4gKiBcclxuICogQHBhcmFtIHtQb2x5Z29ufSBwb2x5Z29uIFRoZSBQb2x5Z29uIHRvIGdldCB0aGUgdHJpYW5nbGVzIG9mLlxyXG4gKiBcclxuICogQHJldHVybnMge0FycmF5PEFycmF5PEFycmF5PG51bWJlcj4+Pn0gUmV0dXJucyB0aGUgdHJpYW5nbGVzIGZyb20gdGhlIFBvbHlnb24uXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRUcmlhbmdsZXNGcm9tUG9seWdvbihwb2x5Z29uOiBQb2x5Z29uKTogQXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+IHtcclxuICAgIC8vIEdldCB0aGUgdHJpYW5nbGUgaW5kaWNlIG9mIHRoZSBQb2x5Z29uLlxyXG4gICAgY29uc3QgaW5kaWNlcyA9IGVhcmN1dChwb2x5Z29uLnBvaW50c0dlbmVyaWMpO1xyXG5cclxuICAgIGNvbnN0IHRyaWFuZ2xlczogQXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+ID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGljZXMubGVuZ3RoOyBpICs9IDMpIHtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIHRyaWFuZ2xlcyBieSBtYXBwaW5nIHRoZSBpbmRpY2VzIHRvIHRoZSB2YWx1ZXMgdGhleSBjb3JyZXNwb25kIHRvIGluXHJcbiAgICAgICAgLy8gdGhlIGBwb2x5Z29uLnBvaW50c0dlbmVyaWNgIEFycmF5IHVzZWQgdG8gY3JlYXRlIHRoZSBpbmRpY2VzLlxyXG4gICAgICAgIGNvbnN0IHRyaWFuZ2xlSW5kaWNlcyA9IFtpbmRpY2VzW2ldLCBpbmRpY2VzW2kgKyAxXSwgaW5kaWNlc1tpICsgMl1dO1xyXG4gICAgICAgIGNvbnN0IHBvaW50cyA9IHRyaWFuZ2xlSW5kaWNlcy5tYXAoaW5kZXggPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gcG9seWdvbi5wb2ludHNHZW5lcmljW2luZGV4ICogMl07XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBwb2x5Z29uLnBvaW50c0dlbmVyaWNbaW5kZXggKiAyICsgMV07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3gsIHldO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0cmlhbmdsZXMucHVzaChwb2ludHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cmlhbmdsZXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBhcmVhIG9mIGEgdHJpYW5nbGUuXHJcbiAqIFxyXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSB0cmlhbmdsZSBUaGUgdHJpYW5nbGUgdG8gZ2V0IHRoZSBhcmVhIG9mLlxyXG4gKiBcclxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgYXJlYSBvZiB0aGUgcHJvdmlkZWQgdHJpYW5nbGUuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRUcmlhbmdsZUFyZWEodHJpYW5nbGU6IEFycmF5PEFycmF5PG51bWJlcj4+KTogbnVtYmVyIHtcclxuICAgIGNvbnN0IFthLCBiLCBjXSA9IHRyaWFuZ2xlO1xyXG5cclxuICAgIHJldHVybiAwLjUgKiAoXHJcbiAgICAgICAgKGJbMF0gLSBhWzBdKSAqIChjWzFdIC0gYVsxXSkgLVxyXG4gICAgICAgIChjWzBdIC0gYVswXSkgKiAoYlsxXSAtIGFbMV0pXHJcbiAgICApO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRoZSBkaXN0cmlidXRpb25zIG9mIHRoZSB0cmlhbmdsZXMgb3ZlciB0aGUgUG9seWdvbi5cclxuICogXHJcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+fSB0cmlhbmdsZXMgVGhlIHRyaWFuZ2xlcyB0byBnZXQgdGhlIGRpc3RyaWJ1dGlvbiBvZi5cclxuICogXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGRpc3RyaWJ1dGlvbnMgb2YgdGhlIHRyaWFuZ2xlcy5cclxuICovXHJcbmZ1bmN0aW9uIGdlbmVyYXRlRGlzdHJpYnV0aW9uKHRyaWFuZ2xlczogQXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+KTogQXJyYXk8bnVtYmVyPiB7XHJcbiAgICBjb25zdCB0b3RhbEFyZWEgPSB0cmlhbmdsZXMucmVkdWNlKChzdW0sIHRyaWFuZ2xlKSA9PiBzdW0gKyBnZXRUcmlhbmdsZUFyZWEodHJpYW5nbGUpLCAwKTtcclxuICAgIGNvbnN0IGN1bXVsYXRpdmVEaXN0cmlidXRpb24gPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyaWFuZ2xlcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGNvbnN0IGxhc3RWYWx1ZTogbnVtYmVyID0gY3VtdWxhdGl2ZURpc3RyaWJ1dGlvbltpIC0gMV0gfHwgMDtcclxuICAgICAgICBjb25zdCBuZXh0VmFsdWU6IG51bWJlciA9IGxhc3RWYWx1ZSArIGdldFRyaWFuZ2xlQXJlYSh0cmlhbmdsZXNbaV0pIC8gdG90YWxBcmVhO1xyXG5cclxuICAgICAgICBjdW11bGF0aXZlRGlzdHJpYnV0aW9uLnB1c2gobmV4dFZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY3VtdWxhdGl2ZURpc3RyaWJ1dGlvbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENob29zZXMgYSByYW5kb20gdHJpYW5nbGUgZnJvbSB0aGUgQXJyYXkgb2YgdHJpYW5nbGVzIGJhc2VkIG9uIHRoZSBjdW11bGF0aXZlXHJcbiAqIGRpc3RyaWJ1dGlvbi5cclxuICogXHJcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+fSB0cmlhbmdsZXMgVGhlIHRyaWFuZ2xlcyB0byBzZWxlY3QgYSByYW5kb20gdHJpYW5nbGUgZnJvbS5cclxuICogXHJcbiAqIEByZXR1cm5zIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gUmV0dXJucyBhIHJhbmRvbSB0cmlhbmdsZS5cclxuICovXHJcbmZ1bmN0aW9uIHNlbGVjdFJhbmRvbVRyaWFuZ2xlKHRyaWFuZ2xlczogQXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+KTogQXJyYXk8QXJyYXk8bnVtYmVyPj4ge1xyXG4gICAgY29uc3QgY3VtdWxhdGl2ZURpc3RyaWJ1dGlvbiA9IGdlbmVyYXRlRGlzdHJpYnV0aW9uKHRyaWFuZ2xlcyk7XHJcbiAgICBjb25zdCBpbmRleCA9IGN1bXVsYXRpdmVEaXN0cmlidXRpb24uZmluZEluZGV4KHYgPT4gdiA+IE1hdGgucmFuZG9tKCkpO1xyXG5cclxuICAgIHJldHVybiB0cmlhbmdsZXNbaW5kZXhdO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBhIHJhbmRvbSBwb2ludCBmcm9tIGEgdHJpYW5nbGUuXHJcbiAqIFxyXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSB0cmlhbmdsZSBUaGUgdHJpYW5nbGUgdG8gZ2V0IGEgcmFuZG9tIHBvaW50IGZyb20uXHJcbiAqIFxyXG4gKiBAcmV0dXJucyB7QXJyYXk8bnVtYmVyPn0gUmV0dXJucyBhbiBbeCwgeV0gdmFsdWUgZnJvbSB0aGUgcHJvdmlkZWQgdHJpYW5nbGUuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRSYW5kb21Qb2ludEluVHJpYW5nbGUodHJpYW5nbGU6IEFycmF5PEFycmF5PG51bWJlcj4+KTogQXJyYXk8bnVtYmVyPiB7XHJcbiAgICBsZXQgd2IgPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgbGV0IHdjID0gTWF0aC5yYW5kb20oKTtcclxuXHJcbiAgICAvLyBwb2ludCB3aWxsIGJlIG91dHNpZGUgb2YgdGhlIHRyaWFuZ2xlLCBpbnZlcnQgd2VpZ2h0c1xyXG4gICAgaWYgKHdiICsgd2MgPiAxKSB7XHJcbiAgICAgICAgd2IgPSAxIC0gd2I7XHJcbiAgICAgICAgd2MgPSAxIC0gd2M7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgW2EsIGIsIGNdID0gdHJpYW5nbGUubWFwKGNvb3JkcyA9PiAoeyB4OiBjb29yZHNbMF0sIHk6IGNvb3Jkc1sxXSB9KSk7XHJcblxyXG4gICAgY29uc3QgcmJfeCA9IHdiICogKGIueCAtIGEueCk7XHJcbiAgICBjb25zdCByYl95ID0gd2IgKiAoYi55IC0gYS55KTtcclxuICAgIGNvbnN0IHJjX3ggPSB3YyAqIChjLnggLSBhLngpO1xyXG4gICAgY29uc3QgcmNfeSA9IHdjICogKGMueSAtIGEueSk7XHJcblxyXG4gICAgY29uc3Qgcl94ID0gcmJfeCArIHJjX3ggKyBhLng7XHJcbiAgICBjb25zdCByX3kgPSByYl95ICsgcmNfeSArIGEueTtcclxuXHJcbiAgICByZXR1cm4gW3JfeCwgcl95XVxyXG59Il19
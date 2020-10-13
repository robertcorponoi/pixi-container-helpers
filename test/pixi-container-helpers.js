/**
 * Pixi Container Helpers is used to provide helper methods to work with
 * containers in various ways.
 */

/**
 * Places the items in the container into a grid.
 * 
 * @param {PIXI.Container} container The container to place the items of into a grid.
 * @param {number} width The number of items that can fit in the grid horizontally before it splits into a new row.
 * @param {GridAlignOptions} [options] The optional arguments that can be passed to this function.
 * @param {number} [options.horizontalPadding] The amount of padding that should be between items in the grid horizontally.
 * @param {number} [options.verticalPadding] The amount of padding that should be between rows in the grid.
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
 * Places the items in the container onto a circle. The container's position will be
 * moved to the center position of the circle and the items will be arranged 
 * in relation to that point.
 *
 * @param {PIXI.Container} container The container to place the items of onto a circle.
 * @param {number} radius The radius of the circle to place the items onto.
 * @param {CirclePlementOptions} [options] The optional arguments that can be passed to this function.
 * @param {boolean} [options.rotateItems] Indicates whether the items in the container should be rotated to match their angles or not.
 * @param {boolean} [options.rotateItemsInverse] Indicates whether the items in the ground should be rotated to their inverse angle or not.
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

export { gridAlign, placeOnCircle, placeOnLine, placeOnPolygon };

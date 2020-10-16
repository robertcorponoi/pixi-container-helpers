'use strict'

import earcut from 'earcut';
import * as PIXI from 'pixi.js';
import { Vector, Polygon } from 'collider2d';
import { GridAlignOptions, CirclePlacementOptions } from './options';

/**
 * Pixi Container Helpers is used to provide helper methods to work with
 * containers in various ways.
 */

/**
 * Export the `Vector` and `Polygon` objects in case the `placeOnPolygon` method
 * is used.
 */
export {
    Vector,
    Polygon,
}

/**
 * Places the items in the container into a grid.
 * 
 * @param {PIXI.Container} container The container to place the items of into a grid.
 * @param {number} width The number of items that can fit in the grid horizontally before it splits into a new row.
 * @param {GridAlignOptions} [options] The optional arguments that can be passed to this function.
 * @param {number} [options.horizontalPadding=0] The amount of padding that should be between items in the grid horizontally.
 * @param {number} [options.verticalPadding=0] The amount of padding that should be between rows in the grid.
 */
export function gridAlign(container: PIXI.Container, width: number, options?: GridAlignOptions) {
    // Since we need to cast the children of the container into `PIXI.Container`because we need
    // to make sure they have `width` and `height` properties, we have to create a new Array
    // and add the casted versions of the container children to it.
    const itemsToPlace = [];
    let currentWidth = 0;

    let x = 0;
    let y = 0;

    for (let i = 0; i < container.children.length; ++i) {
        // Save the current child to a variable.
        const item = container.children[i];

        // If we can't cast the child which is a `DisplayObject` to a `Container` then we
        // have to skip this child as we need `height` and `width` properties to work with.
        const itemAsContainer = item as PIXI.Container;
        if (!itemAsContainer) {
            console.warn(`Child of container does not inherit from PIXI.DisplayObject, skipping...`);
            continue;
        }
        itemsToPlace.push(itemAsContainer)

        // Check to see if we need to break to a new line or not. We perform this check by
        // checking the value of `i` against the value of the `width` argument. If we need
        // to break to a new row, we set the `y` to increment by the height of the first
        // item in the current row.
        if (currentWidth == width) {
            currentWidth = 0;
            x = 0;
            y += itemsToPlace[i - (width - 1)].height;

            // If there needs to be vertical padding we add it here or else every item in
            // the row will be lower than the previous.
            if (options?.paddingBetweenRows) y += options.paddingBetweenRows;
        }

        // We add the horizontal padding here as horizontal space is calculated with every
        // item.
        if (options?.paddingBetweenColumns) x += options.paddingBetweenColumns;

        item.position.set(x, y);
        currentWidth++;

        // Lastly we increment the `x` by the width of the previous element.
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
export function placeOnCircle(container: PIXI.Container, radius: number, options?: CirclePlacementOptions) {
    // First, we have to know at what degree increments we have to place the items. Since a
    // circle has 360 degrees, we divide that by the number of children in the container to get
    // the degree increments.
    const degreeIncrement = 360 / container.children.length;
    let currentAngle = 0;

    container.children.forEach(item => {
        // Since the circle works in radians we have to convert from deg to rad.
        const radian = currentAngle * 0.0174532925

        const x = radius * Math.cos(radian);
        const y = radius * Math.sin(radian);

        item.position.set(x, y);

        if (options?.rotateItems || options?.rotateItemsInverse) {
            const itemAsContainer = item as PIXI.Container;
            item.pivot.set(itemAsContainer.width / 2, itemAsContainer.height / 2);

            if (options.rotateItems) item.angle = currentAngle;
            else if (options.rotateItemsInverse) item.angle = (currentAngle + 180) % 360;
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
export function placeOnLine(container: PIXI.Container, startX: number, startY: number, endX: number, endY: number) {
    // First we have to find out the spacing on the x and y axis so we know how far apart
    // to put the items.
    const numItemsToDivideBy = container.children.length - 1;
    const xSegmentLength = (endX - startX) / numItemsToDivideBy;
    const ySegmentLength = (endY - startY) / numItemsToDivideBy;

    container.children.forEach((item, index) => {
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
export function placeOnPolygon(container: PIXI.Container, polygon: Polygon) {
    // Since the Polygon has a position, we set the position of the container to the position
    // of the Polygon.
    container.position.set(polygon.position.x, polygon.position.y);

    const itemsDividedByEdges = (container.children.length - 1) / polygon.edges.length;
    const polygonLines: Array<any> = [];

    for (let i = 0; i < polygon.points.length; ++i) {
        const currentPoint = polygon.points[i];

        // We create a line object that contains the start Vector of the line, the end
        // Vector of the line, and the length of its segments.
        const line = {
            start: currentPoint,
            end: polygon.points[i + 1],
            points: 0,
            xSegmentLength: 0,
            ySegmentLength: 0,
        };

        // If the point we're on is currently the last point of the Polygon then we need
        // to set its end to be the first point to close the Polygon.
        if (i == polygon.points.length - 1) line.end = polygon.points[0];

        line.xSegmentLength = (line.end.x - line.start.x) / itemsDividedByEdges;
        line.ySegmentLength = (line.end.y - line.start.y) / itemsDividedByEdges;

        polygonLines.push(line);
    }

    let currentLineIndex = 0;
    container.children.forEach(item => {
        const currentLine = polygonLines[currentLineIndex];

        // We set the point on this line depending on how many points are already on
        // this line and then increment the amount of points.
        item.position.set(
            currentLine.start.x + currentLine.xSegmentLength * currentLine.points,
            currentLine.start.y + currentLine.ySegmentLength * currentLine.points,
        );
        currentLine.points++;

        // If we're currently at the last line in the Array then we want to reset
        // back to the first line. Otherwise we just go on to the next line.
        if (currentLineIndex == polygonLines.length - 1) currentLineIndex = 0;
        else currentLineIndex++;
    });
}

/**
 * Places the items in the container into a circle in a random fashion.
 * 
 * @param {PIXI.Container} container The container to place the items of into a circle.
 * @param {number} radius The radius of the circle to place the items in.
 */
export function placeInCircle(container: PIXI.Container, radius: number) {
    container.children.forEach(item => {
        const a = Math.random() * 2 * Math.PI;
        const r = radius * Math.sqrt(Math.random());

        const x = r * Math.cos(a);
        const y = r * Math.sin(a);

        item.position.set(x, y);
    });
}

/**
 * Places the items in the container into a Polygon in a random fashion.
 * 
 * @param {PIXI.Container} container The container to place the items of into a Polygon.
 * @param {Polygon} polygon The Polygon to use to place the items in.
 */
export function placeInPolygon(container: PIXI.Container, polygon: Polygon) {
    container.position.set(polygon.position.x, polygon.position.y);

    // First we get the triangles from the Polygon.
    const triangles = getTrianglesFromPolygon(polygon);

    container.children.forEach(item => {
        // Select a random triangle within the Polygon to add the item to.
        const triangle = selectRandomTriangle(triangles);

        // Next we select a random point from within that triangle which will be the [x, y]
        // coordinates we position our item.
        const pointInTriangle = getRandomPointInTriangle(triangle);

        // Lastly we position the item at that random point.
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
export function setAlpha(container: PIXI.Container, start: number, step: number = 1) {
    let currentAlpha = start;

    container.children.forEach(item => {
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
export function setAlphaEase(container: PIXI.Container, start: number, end: number, easing: Function) {
    let currentAlpha = start;

    container.children.forEach((item, index) => {
        // We want to ease depending on what item we are at in the loop.
        const percentToEnd = index / (container.children.length - 1);
        const alpha = easing(percentToEnd);

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
export function rotateAroundPoint(container: PIXI.Container, x: number, y: number, radius: number, delta: number, speed: number = 1) {
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
function getTrianglesFromPolygon(polygon: Polygon): Array<Array<Array<number>>> {
    // Get the triangle indice of the Polygon.
    const indices = earcut(polygon.pointsGeneric);

    const triangles: Array<Array<Array<number>>> = [];
    for (let i = 0; i < indices.length; i += 3) {
        // Create the triangles by mapping the indices to the values they correspond to in
        // the `polygon.pointsGeneric` Array used to create the indices.
        const triangleIndices = [indices[i], indices[i + 1], indices[i + 2]];
        const points = triangleIndices.map(index => {
            const x = polygon.pointsGeneric[index * 2];
            const y = polygon.pointsGeneric[index * 2 + 1];

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
function getTriangleArea(triangle: Array<Array<number>>): number {
    const [a, b, c] = triangle;

    return 0.5 * (
        (b[0] - a[0]) * (c[1] - a[1]) -
        (c[0] - a[0]) * (b[1] - a[1])
    );
}

/**
 * Get the distributions of the triangles over the Polygon.
 * 
 * @param {Array<Array<Array<number>>>} triangles The triangles to get the distribution of.
 * 
 * @returns {number} Returns the distributions of the triangles.
 */
function generateDistribution(triangles: Array<Array<Array<number>>>): Array<number> {
    const totalArea = triangles.reduce((sum, triangle) => sum + getTriangleArea(triangle), 0);
    const cumulativeDistribution = [];

    for (let i = 0; i < triangles.length; ++i) {
        const lastValue: number = cumulativeDistribution[i - 1] || 0;
        const nextValue: number = lastValue + getTriangleArea(triangles[i]) / totalArea;

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
function selectRandomTriangle(triangles: Array<Array<Array<number>>>): Array<Array<number>> {
    const cumulativeDistribution = generateDistribution(triangles);
    const index = cumulativeDistribution.findIndex(v => v > Math.random());

    return triangles[index];
}

/**
 * Gets a random point from a triangle.
 * 
 * @param {Array<Array<number>>} triangle The triangle to get a random point from.
 * 
 * @returns {Array<number>} Returns an [x, y] value from the provided triangle.
 */
function getRandomPointInTriangle(triangle: Array<Array<number>>): Array<number> {
    let wb = Math.random();
    let wc = Math.random();

    // point will be outside of the triangle, invert weights
    if (wb + wc > 1) {
        wb = 1 - wb;
        wc = 1 - wc;
    }

    const [a, b, c] = triangle.map(coords => ({ x: coords[0], y: coords[1] }));

    const rb_x = wb * (b.x - a.x);
    const rb_y = wb * (b.y - a.y);
    const rc_x = wc * (c.x - a.x);
    const rc_y = wc * (c.y - a.y);

    const r_x = rb_x + rc_x + a.x;
    const r_y = rb_y + rc_y + a.y;

    return [r_x, r_y]
}
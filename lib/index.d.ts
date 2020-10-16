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
export { Vector, Polygon, };
/**
 * Places the items in the container into a grid.
 *
 * @param {PIXI.Container} container The container to place the items of into a grid.
 * @param {number} width The number of items that can fit in the grid horizontally before it splits into a new row.
 * @param {GridAlignOptions} [options] The optional arguments that can be passed to this function.
 * @param {number} [options.horizontalPadding=0] The amount of padding that should be between items in the grid horizontally.
 * @param {number} [options.verticalPadding=0] The amount of padding that should be between rows in the grid.
 */
export declare function gridAlign(container: PIXI.Container, width: number, options?: GridAlignOptions): void;
/**
 * Places the items in the container onto a circle.
 *
 * @param {PIXI.Container} container The container to place the items of onto a circle.
 * @param {number} radius The radius of the circle to place the items onto.
 * @param {CirclePlementOptions} [options] The optional arguments that can be passed to this function.
 * @param {boolean} [options.rotateItems=false] Indicates whether the items in the container should be rotated to match their angles or not.
 * @param {boolean} [options.rotateItemsInverse=false] Indicates whether the items in the ground should be rotated to their inverse angle or not.
 */
export declare function placeOnCircle(container: PIXI.Container, radius: number, options?: CirclePlacementOptions): void;
/**
 * Places the items in the container onto a line.
 *
 * @param {PIXI.Container} container The container to place the items of onto a line.
 * @param {number} startX The x value of the position to start the line.
 * @param {number} startY The y value of the position to start the line.
 * @param {number} endX The x value of the position to end the line.
 * @param {number} endY The y value of the position to end the line.
 */
export declare function placeOnLine(container: PIXI.Container, startX: number, startY: number, endX: number, endY: number): void;
/**
 * Places the items in the container onto a polygon.
 *
 * @param {PIXI.Container} container The container to place the items of onto a Polygon.
 * @param {Polygon} polygon The Polygon to use to place the items.
 */
export declare function placeOnPolygon(container: PIXI.Container, polygon: Polygon): void;
/**
 * Places the items in the container into a circle in a random fashion.
 *
 * @param {PIXI.Container} container The container to place the items of into a circle.
 * @param {number} radius The radius of the circle to place the items in.
 */
export declare function placeInCircle(container: PIXI.Container, radius: number): void;
/**
 * Places the items in the container into a Polygon in a random fashion.
 *
 * @param {PIXI.Container} container The container to place the items of into a Polygon.
 * @param {Polygon} polygon The Polygon to use to place the items in.
 */
export declare function placeInPolygon(container: PIXI.Container, polygon: Polygon): void;
/**
 * Sets the alpha of the container items from a starting value to an unknown value
 * with an optional step value that can be added to increase the rate of change.
 *
 * @param {PIXI.Container} container The container to set the alpha for.
 * @param {number} start The starting alpha of the container items.
 * @param {number} [step=1] The rate of change of the alpha value, in items.
 */
export declare function setAlpha(container: PIXI.Container, start: number, step?: number): void;
/**
 * Sets the alpha of the container items from a start value to an end value based
 * on a provided easing function.
 *
 * @param {PIXI.Container} container The container to set the alpha for.
 * @param {number} start The starting alpha of the container items.
 * @param {number} end The ending alpha of the container items.
 * @param {Function} easing The easing function to use to ease the value.
 */
export declare function setAlphaEase(container: PIXI.Container, start: number, end: number, easing: Function): void;
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
export declare function rotateAroundPoint(container: PIXI.Container, x: number, y: number, radius: number, delta: number, speed?: number): void;

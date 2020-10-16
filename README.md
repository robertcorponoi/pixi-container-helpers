<p align="center">
  <img width="250" height="250" src="https://github.com/robertcorponoi/graphics/blob/master/pixi-container-helpers/logo.png?raw=true">
</p>

<h1 align="center">PIXI Container Helpers</h1>

<p align="center">pixi-container-helpers is a set of helper functions help position your containers in various ways.<p>

<div align="center">

  [![NPM version](https://img.shields.io/npm/v/pixi-container-helpers.svg?style=flat)](https://www.npmjs.com/package/pixi-container-helpers)
  [![Known Vulnerabilities](https://snyk.io/test/github/robertcorponoi/pixi-container-helpers/badge.svg)](https://snyk.io/test/github/robertcorponoi/pixi-container-helpers)
  ![npm](https://img.shields.io/npm/dt/pixi-container-helpers)
  [![NPM downloads](https://img.shields.io/npm/dm/pixi-container-helpers.svg?style=flat)](https://www.npmjs.com/package/pixi-container-helpers)
  <a href="https://badge.fury.io/js/pixi-container-helpers"><img src="https://img.shields.io/github/issues/robertcorponoi/pixi-container-helpers.svg" alt="issues" height="18"></a>
  <a href="https://badge.fury.io/js/pixi-container-helpers"><img src="https://img.shields.io/github/license/robertcorponoi/pixi-container-helpers.svg" alt="license" height="18"></a>
  [![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/robertcorponoi)

</div>

## **Installation**

To install this module through npm, simply use the following command:

```
$ npm install pixi-container-helpers
```

and to use it, you can import it as an ES6 module:

```js
// Webpack
import pixi-container-helpers from 'pixi-container-helpers';

// Browser
import pixi-container-helpers from './node_modules/pixi-container-helpers/pixi-container-helpers.js';
```

## **API**

`pixi-container-helpers` is just a set of functions that can be imported individually that work with your existing containers.

### **gridAlign**

Places the items in the container into a grid.

| param                     | type           | description                                                                               | default |
|---------------------------|----------------|-------------------------------------------------------------------------------------------|---------|
| container                 | PIXI.Container | The container to place the items of into a grid.                                          |         |
| width                     | number         | The number of items that can fit into the grid horizontally before breaking to a new row. |         |
| options                   | Object         |                                                                                           |         |
| options.horizontalPadding | number         | The amount of padding that should be between grid columns.                                | 0       |
| options.verticalPadding   | number         | The amount of padding that should be between rows.                                        | 0       |

**Example:**

```js
import { gridAlign } from 'pixi-container-helpers';

const group = new PIXI.Container();

// Places the items of the container into a grid with 4 items per row.
gridAlign(group, 4);
```

### **placeOnCircle**

Places the items in the container onto a circle.

| param                      | type           | description                                                                                                            | default |
|----------------------------|----------------|------------------------------------------------------------------------------------------------------------------------|---------|
| container                  | PIXI.Container | The container to place the items of onto a circle.                                                                     |         |
| radius                     | number         | The radius of the circle to place the items onto.                                                                      |         |
| options                    | Object         |                                                                                                                        |         |
| options.rotateItems        | boolean        | Indicates whether the items should be rotated to point towards the center of the circle or not.                        | false   |
| options.rotateItemsInverse | boolean        | Indicates whether the items should be rotated so that the opposite end points towards the center of the circle or not. | false   |

**Example:**

```js
import { placeOnCircle } from 'pixi-container-helpers';

const group = new PIXI.Container();

// Places the items of the container onto a circle with a radius of 50.
placeOnCircle(group, 50);
```

### **placeOnLine**

Places the items in the container onto a line.

| param     | type           | description                                      | default |
|-----------|----------------|--------------------------------------------------|---------|
| container | PIXI.Container | The container to place the items of onto a line. |         |
| startX    | number         | The starting x location of the line.             |         |
| startY    | number         | The starting y location of the line.             |         |
| endX      | number         | The ending x location of the line.               |         |
| endY      | number         | The ending y location of the line.               |         |

**Example:**

```js
import { placeOnLine } from 'pixi-container-helpers';

const group = new PIXI.Container();

// Places the items of the container onto a line going from (10, 10) to (200, 300).
placeOnLine(group, 10, 10, 200, 300);
```

### **placeOnPolygon**

Places the items in the container onto a polygon.

| param     | type           | description                                         | default |
|-----------|----------------|-----------------------------------------------------|---------|
| container | PIXI.Container | The container to place the items of onto a polygon. |         |
| polygon   | Polygon        | The Polygon object to place the items onto.         |         |


**Example:**

```js
import {
    Vector,
    Polygon,
    placeOnPolygon,
} from 'pixi-container-helpers';

const group = new PIXI.Container();

// Places the items of the container onto a square.
const polygon = new Polygon(new Vector(100, 100), [
            new Vector(0, 0),
            new Vector(100, 0),
            new Vector(100, 100),
            new Vector(0, 100),
        ]);
placeOnPolygon(group, polygon);
```

### **placeInCircle**

Places the items in the container into a circle in a random fashion.

| param     | type           | description                                        | default |
|-----------|----------------|----------------------------------------------------|---------|
| container | PIXI.Container | The container to place the items of into a circle. |         |
| radius    | number         | The radius of the circle to place the items into.  |         |

**Example:**

```js
import { placeInCircle } from 'pixi-container-helpers';

const group = new PIXI.Container();

// Places the items of the container into a circle with a radius of 50.
placeInCircle(group, 50);
```

### **placeInPolygon**

Places the items in the container into a polygon in a random fashion.

| param     | type           | description                                         | default |
|-----------|----------------|-----------------------------------------------------|---------|
| container | PIXI.Container | The container to place the items of into a polygon. |         |
| polygon   | Polygon        | The Polygon to place the items of into.             |         |

**Example:**

```js
import {
    Vector,
    Polygon,
    placeInPolygon,
} from 'pixi-container-helpers';

const group = new PIXI.Container();

// Places the items of the container into a square.
const polygon = new Polygon(new Vector(100, 100), [
            new Vector(0, 0),
            new Vector(100, 0),
            new Vector(100, 100),
            new Vector(0, 100),
        ]);
placeInPolygon(group, polygon);
```

### **setAlpha**

Sets the alpha of the container items from a starting value to an unknown value with an optional step value that can be added to increase the rate of change.

| param     | type           | description                                     | default |
|-----------|----------------|-------------------------------------------------|---------|
| container | PIXI.Container | The container to set the alpha of the items of. |         |
| start     | number         | The starting alpha of the container items.      |         |
| step      | number         | The rate of change of the alpha.                | 1       |

**Example:**

```js
import { setAlpha } from 'pixi-container-helpers';

const group = new PIXI.Container();

// Sets the alpha of the items in ascending order.
setAlpha(group, 0, 1 / 5);
```

### **setAlphaEase**

Sets the alpha of the items in the container from a starting value to an ending value using a provided easing function.

| param     | type           | description                                                        | default |
|-----------|----------------|--------------------------------------------------------------------|---------|
| container | PIXI.Container | The container to set the alpha of the items of.                    |         |
| start     | number         | The starting alpha of the container items.                         |         |
| end       | number         | The ending alpha of the container items.                           |         |
| easing    | Function       | The easing function to use which accepts a single parameter, time. |         |

**Example:**

```js
import { setAlphaEase } from 'pixi-container-helpers';

/**
 * Ease-In Sine.
 * 
 * @param {number} x A value between 0 and 1 representing the percent of the animation that has completed.
 * 
 * @returns {number} Returns a value between 0 and 1 which should be used to multiply the value to animate by.
 */
function easeInSine(x) {
    return 1 - Math.cos((x * Math.PI) / 2);
}

// Eases opacity of the items in the group from 0 to 1 using a ease-in-sine function.
setAlphaEase(group, 0, 1, easeInSine);
```

### **rotateAroundPoint**

Places the items onto a circle and rotates them around a pivot point. Note that the method needs to be placed in some sort of game loop in order to update the positions of the items.

| param     | type           | description                                              | default |
|-----------|----------------|----------------------------------------------------------|---------|
| container | PIXI.Container | The container to set the alpha of the items of.          |         |
| x         | number         | The x location of the point to rotate around.            |         |
| y         | number         | The y location of the point to rotate around.            |         |
| radius    | number         | The radius of the circle to place the items on.          |         |
| delta     | number         | The delta time from the update function.                 |         |
| speed     | number         | Used to slow down or speed up the rotation of the items. | 1       |

**Example:**

```js
import { rotateAroundPoint } from 'pixi-container-helpers';
import Deltaframe from 'deltaframe';

const deltaframe = new Deltaframe;

// Create the group and set the pivot point to it's center so that it will rotate around it's center point.
const group = new PIXI.Container();
group.pivot.set(group.width / 2, group.height / 2);

// Every frame update we set the group to rotate around its pivot point.
deltaframe.start((time, delta, deltaAverage) => rotateAroundPoint(group, 100, 100, delta));
```

## **Tests**

The tests for pixi-container-helpers are browser based so to run them you will first need to start the local testing server like so:

```bash
$ npm run test
```

then you will need to navigate to https://localhost:3000 in your browser to run all of the available tests.

## **License**

MIT
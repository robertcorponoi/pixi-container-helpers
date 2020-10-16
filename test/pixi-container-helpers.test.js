'use strict'

import {
    Vector,
    Polygon,
    gridAlign,
    placeOnCircle,
    placeOnLine,
    placeOnPolygon,
    placeInCircle,
    placeInPolygon,
    setAlpha,
    setAlphaEase,
    rotateAroundPoint,
} from './pixi-container-helpers.js';
import Deltaframe from './deltaframe.js';

// I use Vue devtools so it has to be defined in the globals.
mocha.setup({ globals: ['__VUE_DEVTOOLS_TOAST__'] });

/**
 * Creates an array of diamond of square sprites to be used for tests.
 * 
 * @param {string} shape The shape to create an array of sprites for. This can be either 'diamond' or 'square'.
 * @param {number} length The number of sprites that should be in the array.
 * 
 * @returns {Array<Sprite>} Returns the created sprites as an array.
 */
function createSprites(shape, length) {
    const colors = ['blue', 'green', 'purple', 'red', 'silver', 'yellow'];

    let colorIndex = 0;
    const shapes = [];

    for (let i = 0; i < length; ++i) {
        if (colorIndex === colors.length - 1) colorIndex = 0;

        const shapeToAdd = PIXI.Sprite.from(`assets/shapes/${shape}_${colors[colorIndex]}.png`);
        shapes.push(shapeToAdd);

        colorIndex++;
    }

    return shapes;
}

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

/**
 * Ease-Out Sine.
 * 
 * @param {number} x A value between 0 and 1 representing the percent of the animation that has completed.
 * 
 * @returns {number} Returns a value between 0 and 1 which should be used to multiply the value to animate by.
 */
function easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
}

describe('Grid Align', function () {
    it('should align the items in a 4x4 grid', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();
        group.position.set(100, 100);

        const shapes = createSprites('diamond', 12);
        shapes.forEach(shape => group.addChild(shape));

        setTimeout(function () {
            gridAlign(group, 4);
            app.stage.addChild(group);

            chai.expect(group.children[0].x).to.equal(0);
            chai.expect(group.children[0].y).to.equal(0);

            chai.expect(group.children[2].x).to.equal(96);
            chai.expect(group.children[2].y).to.equal(0);

            chai.expect(group.children[5].x).to.equal(48);
            chai.expect(group.children[5].y).to.equal(48);

            chai.expect(group.children[11].x).to.equal(144);
            chai.expect(group.children[11].y).to.equal(96);

            done();
        }, 1000);
    });

    it('should align the items in a 3x3 grid with padding on the rows and columns', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();
        group.position.set(50, 50);

        const shapes = createSprites('diamond', 9);
        shapes.forEach(shape => group.addChild(shape));

        setTimeout(function () {
            gridAlign(group, 3, { paddingBetweenRows: 10, paddingBetweenColumns: 10 });
            app.stage.addChild(group);

            chai.expect(group.children[2].x).to.equal(126);
            chai.expect(group.children[2].y).to.equal(0);

            chai.expect(group.children[3].x).to.equal(10);
            chai.expect(group.children[3].y).to.equal(58);

            chai.expect(group.children[7].x).to.equal(68);
            chai.expect(group.children[7].y).to.equal(116);

            done();
        }, 1000);
    });
});

describe('Place On Circle', function () {
    it('should place the items on a circle with a radius of 100', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();
        group.position.set(150, 150);

        const shapes = createSprites('square', 8);
        shapes.forEach(shape => group.addChild(shape));

        setTimeout(function () {
            placeOnCircle(group, 100);
            app.stage.addChild(group);

            chai.expect(group.children[0].x).to.equal(100);
            chai.expect(group.children[0].y).to.equal(0);

            chai.expect(group.children[2].x).to.equal(1.7948967369654109e-7);
            chai.expect(group.children[2].y).to.equal(100);

            chai.expect(group.children[4].x).to.equal(-100);
            chai.expect(group.children[4].y).to.equal(3.5897934739308217e-7);

            chai.expect(group.children[6].x).to.equal(-5.384690210896233e-7);
            chai.expect(group.children[6].y).to.equal(-100);

            done();
        }, 1000);
    });

    it('should place the items on a circle with the `rotateItems` option set to `true`', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();
        group.position.set(150, 150);

        const shapes = createSprites('square', 8);
        shapes.forEach(shape => group.addChild(shape));

        setTimeout(function () {
            placeOnCircle(group, 100, { rotateItems: true });
            app.stage.addChild(group);

            chai.expect(group.children[0].angle).to.equal(0);
            chai.expect(group.children[1].angle).to.equal(45);
            chai.expect(group.children[2].angle).to.equal(90);
            chai.expect(group.children[3].angle).to.equal(135);
            chai.expect(group.children[4].angle).to.equal(180);
            chai.expect(group.children[5].angle).to.equal(225);
            chai.expect(group.children[6].angle).to.equal(270);
            chai.expect(group.children[7].angle).to.equal(315);

            done();
        }, 1000);
    });

    it('should place the items on a circle with the `rotateItemsInverse` option set to `true`', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();
        group.position.set(150, 150);

        const shapes = createSprites('square', 8);
        shapes.forEach(shape => group.addChild(shape));

        setTimeout(function () {
            placeOnCircle(group, 100, { rotateItemsInverse: true });
            app.stage.addChild(group);

            chai.expect(group.children[0].angle).to.equal(180);
            chai.expect(group.children[1].angle).to.equal(225);
            chai.expect(group.children[2].angle).to.equal(270);
            chai.expect(group.children[3].angle).to.equal(315);
            chai.expect(group.children[4].angle).to.equal(0);
            chai.expect(group.children[5].angle).to.equal(45);
            chai.expect(group.children[6].angle).to.equal(90);
            chai.expect(group.children[7].angle).to.equal(135);

            done();
        }, 1000);
    });
});

describe('Place On Line', function () {
    it('should align the items on a line spaced equally apart', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();

        const shapes = createSprites('diamond', 5);
        shapes.forEach(shape => group.addChild(shape));

        setTimeout(function () {
            placeOnLine(group, 10, 10, 200, 250);
            app.stage.addChild(group);

            chai.expect(group.children[0].x).to.equal(10);
            chai.expect(group.children[0].y).to.equal(10);

            chai.expect(group.children[1].x).to.equal(57.5);
            chai.expect(group.children[1].y).to.equal(70);

            chai.expect(group.children[2].x).to.equal(105);
            chai.expect(group.children[2].y).to.equal(130);

            chai.expect(group.children[3].x).to.equal(152.5);
            chai.expect(group.children[3].y).to.equal(190);

            chai.expect(group.children[4].x).to.equal(200);
            chai.expect(group.children[4].y).to.equal(250);

            done();
        }, 1000);
    });
});

describe('Place On Polygon', function () {
    it('should align the items on a rectangle', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();

        const shapes = createSprites('diamond', 4);
        shapes.forEach(shape => group.addChild(shape));

        const polygon = new Polygon(new Vector(100, 100), [
            new Vector(0, 0),
            new Vector(100, 0),
            new Vector(100, 100),
            new Vector(0, 100),
        ]);

        setTimeout(function () {
            placeOnPolygon(group, polygon);
            app.stage.addChild(group);

            chai.expect(group.children[0].x).to.equal(0);
            chai.expect(group.children[0].y).to.equal(0);

            chai.expect(group.children[1].x).to.equal(100);
            chai.expect(group.children[1].y).to.equal(0);

            chai.expect(group.children[2].x).to.equal(100);
            chai.expect(group.children[2].y).to.equal(100);

            chai.expect(group.children[3].x).to.equal(0);
            chai.expect(group.children[3].y).to.equal(100);

            done();
        }, 1000);
    });

    it('should align the items on an octagon', function (done) {
        const app = new PIXI.Application({ width: 1200, height: 800, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();

        const shapes = createSprites('diamond', 16);
        shapes.forEach(shape => group.addChild(shape));

        const polygon = new Polygon(new Vector(600, 400), [
            new Vector(-100, 100),
            new Vector(100, 100),
            new Vector(200, 0),
            new Vector(200, -200),
            new Vector(100, -300),
            new Vector(-100, -300),
            new Vector(-200, -200),
            new Vector(-200, 0),
        ]);

        setTimeout(function () {
            placeOnPolygon(group, polygon);
            app.stage.addChild(group);

            chai.expect(group.children[0].x).to.equal(-100);
            chai.expect(group.children[0].y).to.equal(100);

            chai.expect(group.children[2].x).to.equal(200);
            chai.expect(group.children[2].y).to.equal(0);

            chai.expect(group.children[4].x).to.equal(100);
            chai.expect(group.children[4].y).to.equal(-300);

            chai.expect(group.children[6].x).to.equal(-200);
            chai.expect(group.children[6].y).to.equal(-200);

            chai.expect(group.children[8].x).to.equal(6.666666666666671);
            chai.expect(group.children[8].y).to.equal(100);

            chai.expect(group.children[10].x).to.equal(200);
            chai.expect(group.children[10].y).to.equal(-106.66666666666667);

            chai.expect(group.children[12].x).to.equal(-6.666666666666671);
            chai.expect(group.children[12].y).to.equal(-300);

            chai.expect(group.children[14].x).to.equal(-200);
            chai.expect(group.children[14].y).to.equal(-93.33333333333333);

            chai.expect(group.children[15].x).to.equal(-146.66666666666666);
            chai.expect(group.children[15].y).to.equal(53.333333333333336);

            done();
        }, 1000);
    });
});

describe('Changing alpha', function () {
    it('should set the alpha of items in ascending order', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();

        const shapes = createSprites('diamond', 5);
        shapes.forEach(shape => group.addChild(shape));

        setTimeout(function () {
            placeOnLine(group, 10, 10, 200, 250);
            setAlpha(group, 0, 1 / 5);
            app.stage.addChild(group);

            chai.expect(group.children[0].alpha).to.equal(0);
            chai.expect(group.children[1].alpha).to.equal(0.2);
            chai.expect(group.children[2].alpha).to.equal(0.4);
            chai.expect(group.children[3].alpha).to.equal(0.6000000000000001);
            chai.expect(group.children[4].alpha).to.equal(0.8);

            done();
        }, 1000);
    });

    it('should set the alpha of items in descending order', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();

        const shapes = createSprites('diamond', 5);
        shapes.forEach(shape => group.addChild(shape));

        setTimeout(function () {
            placeOnLine(group, 10, 10, 200, 250);
            setAlpha(group, 1, -1 / 5);
            app.stage.addChild(group);

            chai.expect(group.children[0].alpha).to.equal(1);
            chai.expect(group.children[1].alpha).to.equal(0.8);
            chai.expect(group.children[2].alpha).to.equal(0.6000000000000001);
            chai.expect(group.children[3].alpha).to.equal(0.4000000000000001);
            chai.expect(group.children[4].alpha).to.equal(0.20000000000000007);

            done();
        }, 1000);
    });

    it('should set the alpha of items in ascending order using the ease-in-sine function', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();

        const shapes = createSprites('diamond', 5);
        shapes.forEach(shape => group.addChild(shape));

        setTimeout(function () {
            placeOnLine(group, 10, 10, 200, 250);
            setAlphaEase(group, 0, 1, easeInSine);
            app.stage.addChild(group);

            chai.expect(group.children[0].alpha).to.equal(0);
            chai.expect(group.children[1].alpha).to.equal(0.07612046748871326);
            chai.expect(group.children[2].alpha).to.equal(0.2928932188134524);
            chai.expect(group.children[3].alpha).to.equal(0.6173165676349102);
            chai.expect(group.children[4].alpha).to.equal(0.9999999999999999);

            done();
        }, 1000);
    });

    it('should set the alpha of items in descending order using the ease-in-sine function', function (done) {
        const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
        document.body.appendChild(app.view);

        const group = new PIXI.Container();

        const shapes = createSprites('diamond', 5);
        shapes.forEach(shape => group.addChild(shape));

        setTimeout(function () {
            placeOnLine(group, 10, 10, 200, 250);
            setAlphaEase(group, 1, 0, easeOutSine);
            app.stage.addChild(group);

            chai.expect(group.children[0].alpha).to.equal(1);
            chai.expect(group.children[1].alpha).to.equal(0.6173165676349102);
            chai.expect(group.children[2].alpha).to.equal(0.2928932188134524);
            chai.expect(group.children[3].alpha).to.equal(0.07612046748871326);
            chai.expect(group.children[4].alpha).to.equal(0);

            done();
        }, 1000);
    });
});

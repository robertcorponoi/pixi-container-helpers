'use strict'

import {
    gridAlign,
    placeOnCircle,
    placeOnLine,
} from './pixi-container-helpers.js';

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

// describe('Grid Align', function () {
//     it('should align the items in a 4x4 grid', function (done) {
//         const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
//         document.body.appendChild(app.view);

//         const group = new PIXI.Container();
//         group.position.set(100, 100);

//         const shapes = createSprites('diamond', 12);
//         shapes.forEach(shape => group.addChild(shape));

//         setTimeout(function () {
//             gridAlign(group, 4);
//             app.stage.addChild(group);

//             chai.expect(group.children[0].x).to.equal(0);
//             chai.expect(group.children[0].y).to.equal(0);

//             chai.expect(group.children[2].x).to.equal(96);
//             chai.expect(group.children[2].y).to.equal(0);

//             chai.expect(group.children[5].x).to.equal(48);
//             chai.expect(group.children[5].y).to.equal(48);

//             chai.expect(group.children[11].x).to.equal(144);
//             chai.expect(group.children[11].y).to.equal(96);

//             done();
//         }, 1000);
//     });

//     it('should align the items in a 3x3 grid with padding on the rows and columns', function (done) {
//         const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
//         document.body.appendChild(app.view);

//         const group = new PIXI.Container();
//         group.position.set(50, 50);

//         const shapes = createSprites('diamond', 9);
//         shapes.forEach(shape => group.addChild(shape));

//         setTimeout(function () {
//             gridAlign(group, 3, { paddingBetweenRows: 10, paddingBetweenColumns: 10 });
//             app.stage.addChild(group);

//             chai.expect(group.children[2].x).to.equal(126);
//             chai.expect(group.children[2].y).to.equal(0);

//             chai.expect(group.children[3].x).to.equal(10);
//             chai.expect(group.children[3].y).to.equal(58);

//             chai.expect(group.children[7].x).to.equal(68);
//             chai.expect(group.children[7].y).to.equal(116);

//             done();
//         }, 1000);
//     });
// });

// describe('Place On Circle', function () {
//     it('should place the items on a circle with a radius of 100', function (done) {
//         const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
//         document.body.appendChild(app.view);

//         const group = new PIXI.Container();
//         group.position.set(150, 150);

//         const shapes = createSprites('square', 8);
//         shapes.forEach(shape => group.addChild(shape));

//         setTimeout(function () {
//             placeOnCircle(group, 100);
//             app.stage.addChild(group);

//             chai.expect(group.children[0].x).to.equal(100);
//             chai.expect(group.children[0].y).to.equal(0);

//             chai.expect(group.children[1].x).to.equal(70.71067818211394);
//             chai.expect(group.children[1].y).to.equal(70.71067805519557);

//             chai.expect(group.children[2].x).to.equal(1.7948967369654109e-7);
//             chai.expect(group.children[2].y).to.equal(100);

//             chai.expect(group.children[3].x).to.equal(-70.7106779282772);
//             chai.expect(group.children[3].y).to.equal(70.7106783090323);

//             chai.expect(group.children[4].x).to.equal(-100);
//             chai.expect(group.children[4].y).to.equal(3.5897934739308217e-7);

//             chai.expect(group.children[5].x).to.equal(-70.71067843595067);
//             chai.expect(group.children[5].y).to.equal(-70.71067780135884);

//             chai.expect(group.children[6].x).to.equal(-5.384690210896233e-7);
//             chai.expect(group.children[6].y).to.equal(-100);

//             chai.expect(group.children[7].x).to.equal(70.71067767444048);
//             chai.expect(group.children[7].y).to.equal(-70.71067856286903);

//             done();
//         }, 1000);
//     });

//     it('should place the items on a circle with the `rotateItems` option set to `true`', function (done) {
//         const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
//         document.body.appendChild(app.view);

//         const group = new PIXI.Container();
//         group.position.set(150, 150);

//         const shapes = createSprites('square', 8);
//         shapes.forEach(shape => group.addChild(shape));

//         setTimeout(function () {
//             placeOnCircle(group, 100, { rotateItems: true });
//             app.stage.addChild(group);

//             chai.expect(group.children[0].angle).to.equal(0);
//             chai.expect(group.children[1].angle).to.equal(45);
//             chai.expect(group.children[2].angle).to.equal(90);
//             chai.expect(group.children[3].angle).to.equal(135);
//             chai.expect(group.children[4].angle).to.equal(180);
//             chai.expect(group.children[5].angle).to.equal(225);
//             chai.expect(group.children[6].angle).to.equal(270);
//             chai.expect(group.children[7].angle).to.equal(315);

//             done();
//         }, 1000);
//     });

//     it('should place the items on a circle with the `rotateItemsInverse` option set to `true`', function (done) {
//         const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
//         document.body.appendChild(app.view);

//         const group = new PIXI.Container();
//         group.position.set(150, 150);

//         const shapes = createSprites('square', 8);
//         shapes.forEach(shape => group.addChild(shape));

//         setTimeout(function () {
//             placeOnCircle(group, 100, { rotateItemsInverse: true });
//             app.stage.addChild(group);

//             chai.expect(group.children[0].angle).to.equal(180);
//             chai.expect(group.children[1].angle).to.equal(225);
//             chai.expect(group.children[2].angle).to.equal(270);
//             chai.expect(group.children[3].angle).to.equal(315);
//             chai.expect(group.children[4].angle).to.equal(0);
//             chai.expect(group.children[5].angle).to.equal(45);
//             chai.expect(group.children[6].angle).to.equal(90);
//             chai.expect(group.children[7].angle).to.equal(135);

//             done();
//         }, 1000);
//     });
// });

// describe('Place On Line', function () {
//     it('should align the items on a line spaced equally apart', function (done) {
//         const app = new PIXI.Application({ width: 500, height: 300, backgroundColor: 0x337ab7 });
//         document.body.appendChild(app.view);

//         const group = new PIXI.Container();

//         const shapes = createSprites('diamond', 5);
//         shapes.forEach(shape => group.addChild(shape));

//         setTimeout(function () {
//             placeOnLine(group, 10, 10, 200, 250);
//             app.stage.addChild(group);

//             chai.expect(group.children[0].x).to.equal(10);
//             chai.expect(group.children[0].y).to.equal(10);

//             chai.expect(group.children[1].x).to.equal(57.5);
//             chai.expect(group.children[1].y).to.equal(70);

//             chai.expect(group.children[2].x).to.equal(105);
//             chai.expect(group.children[2].y).to.equal(130);

//             chai.expect(group.children[3].x).to.equal(152.5);
//             chai.expect(group.children[3].y).to.equal(190);

//             chai.expect(group.children[4].x).to.equal(200);
//             chai.expect(group.children[4].y).to.equal(250);

//             done();
//         }, 1000);
//     });
// });

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
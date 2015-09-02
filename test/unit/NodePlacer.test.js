/**
 *
 * @license
 *
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Intel Corporation
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Authors:
 *   Elliot Smith <elliot.smith@intel.com>
 *   Max Waterman <max.waterman@intel.com>
 *
 **/
// test framework
var chai = require('chai');
chai.should();
var expect = chai.expect;

var System = require('../systemjs-with-paths');

describe('NodePlacer', function () {
  var nodePlacer;
  var snap = 1;

  beforeEach(function (done) {
    System.import('NodePlacer').then(function (NodePlacer) {
      nodePlacer = NodePlacer();
      done();
    });
  });

  it('should find overlaps between bounding boxes', function () {
    var newBox1 = { x: 0, y: 0, height: 2, width: 2 };
    var newBox2 = { x: 5, y: 5, height: 2, width: 2 };

    // this fits entirely inside the second element of boxes
    var newBox3 = { x: 2, y: 2, width: 1, height: 1 };

    var boxes = [
      { x: 20, y: 20, height: 3, width: 3 },
      { x: 1, y: 1, height: 3, width: 3 }
    ];

    nodePlacer.overlaps(newBox1, boxes).should.be.true;
    nodePlacer.overlaps(newBox2, boxes).should.be.false;
    nodePlacer.overlaps(newBox3, boxes).should.be.true;
  });

  it('should lay out boxes to the right', function () {
    // 2x2 grid
    var constrainingBox = { minX: 0, minY: 0, maxX: 5 };

    // there's a gap in the top "row" of the grid
    var box1 = { x: 0, y: 0, width: 1, height: 1 };
    var box2 = { x: 4, y: 0, width: 1, height: 1 };
    var boxes = [ box1, box2 ];

    var expected = { width: 1, height: 1, x: 2, y: 0 };

    var boxToPlace = { width: 1, height: 1 };

    var actual = nodePlacer.findPlace(boxToPlace, constrainingBox, boxes, snap);

    actual.should.eql(expected);
  });

  it('should lay out boxes to the right then down', function () {
    // 2x2 grid
    var constrainingBox = { minX: 0, minY: 0, maxX: 3 };

    // there's a gap in the second "row" of the grid
    var box1 = { x: 0, y: 0, width: 1, height: 1 };
    var box2 = { x: 2, y: 0, width: 1, height: 1 };
    var box3 = { x: 2, y: 2, width: 1, height: 1 };
    var boxes = [ box1, box2, box3 ];

    var expected = { width: 1, height: 1, x: 0, y: 2 };

    var boxToPlace = { width: 1, height: 1 };

    var actual = nodePlacer.findPlace(boxToPlace, constrainingBox, boxes, snap);

    actual.should.eql(expected);
  });

  it('should lay out boxes below constraining box if it is full', function () {
    // 2x2 grid
    var constrainingBox = { minX: 0, minY: 0, maxX: 2 };

    // box in every position on the grid
    var box1 = { x: 0, y: 0, width: 1, height: 1 };
    var box2 = { x: 1, y: 0, width: 1, height: 1 };
    var box3 = { x: 0, y: 1, width: 1, height: 1 };
    var box4 = { x: 1, y: 1, width: 1, height: 1 };
    var boxes = [ box1, box2, box3, box4 ];

    // box narrower than the grid, but which won't fit into the grid
    var expected = { x: 0, y: 3, width: 1, height: 1 };

    var boxToPlace = { width: 1, height: 1 };

    var actual = nodePlacer.findPlace(boxToPlace, constrainingBox, boxes, snap);

    actual.should.eql(expected);

    // try with a box which is wider than the constraining box;
    // it should still eventually be placed under the constraining box
    expected = { x: 0, y: 3, width: 4, height: 4 };

    boxToPlace = { width: 4, height: 4 };

    actual = nodePlacer.findPlace(boxToPlace, constrainingBox, boxes, snap);

    actual.should.eql(expected);
  });

  // the data in this test case is from a bug where a certain configuration
  // of nodes would cause an infinite loop; this is to ensure that this
  // doesn't happen
  it('should not go into an infinite loop', function () {
    var boxToPlace = { x: 0, y: -36, height: 72, width: 72 };
    var constrainingBox = { minX: -142, minY: -54, maxX: 1964 };
    var boxes = [
      { x: 36, y: 36, height: 72, width: 72, },
      { x: 144, y: 36, height: 72, width: 72 },
      { x: 252, y: -36, height: 72, width: 72 },
      { x: -72, y: 36, height: 72, width: 72 },
      { x: 360, y: 36, height: 72, width: 72 },
      { x: 468, y: 36, height: 72, width: 72 }
    ];
    var snap = 36;

    var expected = { x:576, y: -36, height: 72, width:72 };

    var actual = nodePlacer.findPlace(boxToPlace, constrainingBox, boxes, snap);

    actual.should.eql(expected);
  });

});

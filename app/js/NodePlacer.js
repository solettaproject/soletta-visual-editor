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
define(['lodash'], function (_) {
  'use strict';

  // round num to the nearest multiple of snap (or zero), e.g.
  // roundToSnap(10, 32) -> 32
  // roundToSnap(56, 32) -> 64
  // roundToSnap(-10, 32) -> 0
  // roundToSnap(-56, 32) -> -32
  var roundToSnap = function (num, snap) {
    var rounded = snap * parseInt(num / snap, 10);
    var remainder = num - rounded;
    if (remainder > 0) {
      rounded += snap;
    }
    return rounded;
  };

  /**
   * Class for placing nodes onto a graph, taking the current
   * zoom level and pan position into account
   */
  var NodePlacer = function () {
    if (!(this instanceof NodePlacer)) {
      return new NodePlacer();
    }
  };

  /**
   * Test whether a bounding box <newBox> overlaps any existing boxes.
   *
   * @param {object} newBox    Box to test; has x, y, height and
   * width attributes
   * @param {object|object[]} boxes    Box or boxes to test against,
   * with the same properties as newBox
   *
   * @returns true if newBox overlaps box/any of boxes, false otherwise
   */
  NodePlacer.prototype.overlaps = function (newBox, boxes) {
    if (!_.isArray(boxes)) {
      boxes = [boxes];
    }

    var overlapper = _.find(boxes, function (box) {
      return (newBox.x + newBox.width >= box.x) &&
             (newBox.x <= box.x + box.width) &&
             (newBox.y + newBox.height >= box.y) &&
             (newBox.y <= box.y + box.height);
    });

    return !!overlapper;
  };

  /**
   * Find the next available "slot" within the grid, preferably
   * inside constrainingBox and avoiding boxes. If no position is found
   * inside constrainingBox, use the next available spot
   * under the constrainingBox (NB there may be boxes outside the
   * constraining box, so these still have to be avoided).
   *
   * @param {object} box    Object with width and height properties
   * and optional x and y properties; if x and y aren't set, start
   * from the top-left of the constrainingBox
   * @param {object} constrainingBox    Object which defines the
   * edges of the area within which box should preferably fit;
   * { minX: <smallest x position>, minY: <smallest y position>,
   *   maxX: <largest x position> }
   * note that there's no maximum y position, as the grid will be
   * extended in the y dimension if there's no room for the node
   * within the constraining box
   * @param {float} snap    Distance between snap points in the grid
   */
  NodePlacer.prototype.findPlace = function (box, constrainingBox, boxes, snap) {
    box.x = _.isNumber(box.x) ? box.x : constrainingBox.minX;
    box.y = _.isNumber(box.y) ? box.y : constrainingBox.minY;

    box.x = roundToSnap(box.x, snap);
    box.y = roundToSnap(box.y, snap);

    // check whether box is over the right edge of the constrainingBox;
    // if it is, try the next "row" down
    var overRightEdge = (box.x + box.width) >= constrainingBox.maxX;

    if (overRightEdge) {
      // push back to the left-hand edge, but further down the grid
      box.x = roundToSnap(constrainingBox.minX, snap);
      box.y += snap;
    }

    // if box is overlapping an existing box, try the next "column" across
    if (this.overlaps(box, boxes)) {
      box.x += snap;
      return this.findPlace(box, constrainingBox, boxes, snap);
    }

    return box;
  };

  return NodePlacer;
});

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

var stubLibrary = {
  content: []
};

var a1 = {category: 'A', name: '1'};
var a2 = {category: 'A', name: '2'};
var b1 = {category: 'B', name: 'one'};
var b2 = {category: 'B', name: 'two'};
var b3 = {category: 'B', name: 'three'};
var u1 = {name: '1'};
var u2 = {name: '2'};

describe('ComponentCategoryGrouper', function () {

  var ComponentCategoryGrouper;

  beforeEach(function (done) {
    System.import('ComponentCategoryGrouper').then(function (CCG) {
      ComponentCategoryGrouper = CCG;
      done();
    });
  });

  it('should sort its library content by category', function () {
    stubLibrary.content = [b3, a1, b2, a2, b1];

    var grouper = ComponentCategoryGrouper({library: stubLibrary});

    var expected = [
      {groupName: 'A', items: [a1, a2]},
      {groupName: 'B', items: [b1, b3, b2]}
    ];

    grouper.group().should.eql(expected);
  });

  it('should sort items without categories into "unknown" group', function () {
    stubLibrary.content = [u2, b3, a1, u1, b2, a2, b1];

    var grouper = ComponentCategoryGrouper({library: stubLibrary});

    var expected = [
      {groupName: 'A', items: [a1, a2]},
      {groupName: 'B', items: [b1, b3, b2]},
      {groupName: 'unknown', items: [u1, u2]}
    ];

    grouper.group().should.eql(expected);
  });
});

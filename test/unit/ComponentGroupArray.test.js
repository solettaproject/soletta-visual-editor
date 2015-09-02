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

// class under test
describe('ComponentGroupArray', function () {
  var ComponentGroupArray;

  beforeEach(function (done) {
    System.import('ComponentGroupArray').then(function (CGA) {
      ComponentGroupArray = CGA;
      done();
    });
  });

  var a1 = {name: '1', category: 'A'};
  var a2 = {name: '2', category: 'A'};
  var b1 = {name: '1', category: 'B'};
  var b2 = {name: '2', category: 'B'};
  var b3 = {name: '3', category: 'B'};

  it('should sort a component map into an array sorted by group name', function () {
    var components = {
      'B': [b2, b3, b1],
      'A': [a2, a1]
    };

    var expected = [
      {groupName: 'A', items: [a1, a2]},
      {groupName: 'B', items: [b1, b2, b3]}
    ];

    var actual = ComponentGroupArray.create(components);

    actual.should.eql(expected);
  });

  it('should sort a component map into an array and keep original sort order', function () {
    var components = {
      'B': [b2, b3, b1],
      'A': [a2, a1]
    };

    var expected = [
      {groupName: 'B', items: [b1, b2, b3]},
      {groupName: 'A', items: [a1, a2]}
    ];

    var keepOriginalSort = true;
    var actual = ComponentGroupArray.create(components, keepOriginalSort);

    actual.should.eql(expected);
  });

});

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

// use requirejs to load modules from the app
var System = require('../systemjs-with-paths');

// class under test
describe('ComponentLibrary', function () {
  var ComponentLibrary;
  var Component;

  var componentLibrary;
  var c1;
  var c2;
  var c3;
  var c4;
  var c5;

  beforeEach(function (done) {
    Promise.all([
      System.import('ComponentLibrary'),
      System.import('Component')
    ])
    .then(function (imports) {
      ComponentLibrary = imports[0];
      Component = imports[1];

      c1 = Component.create({
        name: 'foo',
        description: 'foofoo',
        category: 'theusual',
        inports: [
          { name: 'in1', type: 'string', required: true, array_size: 0 },
          { name: 'in2', type: 'int', required: false, array_size: 1 }
        ],
        outports: [
          { name: 'out1', type: 'boolean', required: true, array_size: 0 },
        ]
      });

      c2 = Component.create({
        name: 'bar',
        description: 'barbar',
        category: 'theusual',
        inports: [
          { name: 'value1', type: 'string', required: false, array_size: 1 },
          { name: 'value2', type: 'int', required: true, array_size: 0 }
        ],
        outports: [
          { name: 'return1', type: 'boolean', required: false, array_size: 1 }
        ]
      });

      c3 = Component.create({
        name: 'girl',
        category: 'humanbein',
        description: 'thing',
        inports: [
          { name: 'in1', type: 'string', required: true, array_size: 0 },
          { name: 'in2', type: 'int', required: false, array_size: 1 }
        ],
        outports: [
          { name: 'out1', type: 'string', required: true, array_size: 0 }
        ]
      });

      c4 = Component.create({
        name: 'boy',
        category: 'humanbein',
        description: 'another thing',
        inports: [
          { name: 'in1', type: 'boolean', required: true, array_size: 0 },
          { name: 'in2', type: 'int', required: false, array_size: 1 }
        ],
        outports: [
          { name: 'out1', type: 'string', required: true, array_size: 0 }
        ]
      });

      c5 = Component.create({
        name: 'flute',
        category: 'musical',
        description: 'yet another thing',
        inports: [
          { name: 'value1', type: 'string', required: false, array_size: 1 },
          { name: 'value2', type: 'any', required: true, array_size: 1 }
        ],
        outports: [
          { name: 'return1', type: 'boolean', required: false, array_size: 0 }
        ]
      });

      componentLibrary = ComponentLibrary();

      done();
    });
  });

  describe('findMatchingComponents()', function () {

    it('should return an empty array if no components match', function () {
      componentLibrary.findMatchingComponents(c1).should.eql([]);
    });

    it('should return an array of components with matching ports', function () {
      componentLibrary.add(c2);
      componentLibrary.findMatchingComponents(c1).should.eql([c2]);
    });

    it('should not match components if the number of ports differ', function () {
      componentLibrary.add(c2);
      componentLibrary.add(c3);
      componentLibrary.findMatchingComponents(c1).should.eql([c2]);
    });

    it('should not match components if the types of ports differ', function () {
      componentLibrary.add(c2);
      componentLibrary.add(c4);
      componentLibrary.findMatchingComponents(c1).should.eql([c2]);
    });

  });

  describe('mapPorts()', function () {

    it('should return null if mapping ports between incompatible components', function () {
      componentLibrary.add(c3);
      componentLibrary.add(c4);
      expect(componentLibrary.mapPorts(c3, c4)).to.be.null;
    });

    it('should return a port mapping for compatible components', function () {
      var expected = {
        inports: {'in1': 'value1', 'in2': 'value2'},
        outports: {'out1': 'return1'}
      };

      componentLibrary.add(c1);
      componentLibrary.add(c2);
      componentLibrary.mapPorts(c1, c2).should.eql(expected)
    });

    it('should use ports with type "any" if no compatible ports', function () {
      var expected = {
        inports: {'in1': 'value1', 'in2': 'value2'},
        outports: {'out1': 'return1'}
      };

      componentLibrary.add(c1);
      componentLibrary.add(c5);
      componentLibrary.mapPorts(c1, c5).should.eql(expected)
    });

  });

  describe('hasOutport()', function () {

    it('should return true if named port is an outport of component', function () {
      componentLibrary.hasOutport(c5, 'return1').should.be.true;
    });

    it('should return false if named port is an inport of component', function () {
      componentLibrary.hasOutport(c5, 'value1').should.be.false;
    });

    it('should return false if named port is not a port of component', function () {
      componentLibrary.hasOutport(c5, 'footle').should.be.false;
    });

  });

  describe('hasInport()', function () {

    it('should return true if named port is an inport of component', function () {
      componentLibrary.hasInport(c5, 'value1').should.be.true;
    });

    it('should return false if named port is an outport of component', function () {
      componentLibrary.hasInport(c5, 'return1').should.be.false;
    });

    it('should return false if named port is not a port of component', function () {
      componentLibrary.hasInport(c5, 'footle').should.be.false;
    });

  });

  describe('canConnect()', function () {

    it('should return false if source component doesn\'t exist', function () {
      componentLibrary.add(c4);
      componentLibrary.canConnect('marmalade', 'sandwich', 'boy', 'in1').should.be.false;
    });

    it('should return false if target component doesn\'t exist', function () {
      componentLibrary.add(c4);
      componentLibrary.canConnect('boy', 'out1', 'marmalade', 'sandwich').should.be.false;
    });

    it('should return false if source port doesn\'t exist', function () {
      componentLibrary.add(c2);
      componentLibrary.add(c4);
      componentLibrary.canConnect('bar', 'volixExempliar', 'boy', 'in1').should.be.false;
    });

    it('should return false if target port doesn\'t exist', function () {
      componentLibrary.add(c2);
      componentLibrary.add(c4);
      componentLibrary.canConnect('bar', 'return1', 'boy', 'aberplanz').should.be.false;
    });

    it('should return false if components and ports aren\'t compatible', function () {
      componentLibrary.add(c2);
      componentLibrary.add(c5);
      componentLibrary.canConnect('bar', 'return1', 'flute', 'value1').should.be.false;
    });

    it('should return true for valid inport -> outport connection', function () {
      componentLibrary.add(c2);
      componentLibrary.add(c4);
      componentLibrary.canConnect('bar', 'return1', 'boy', 'in1').should.be.true;
    });

    it('should return true or valid outport -> inport connection', function () {
      componentLibrary.add(c2);
      componentLibrary.add(c4);
      componentLibrary.canConnect('boy', 'in1', 'bar', 'return1').should.be.true;
    });

    it('should return true for valid connection to input with type "any"', function () {
      componentLibrary.add(c2);

      // value2 inport on c5 has type 'any'
      componentLibrary.add(c5);

      componentLibrary.canConnect('bar', 'return1', 'flute', 'value2').should.be.true;
    });

  });

});

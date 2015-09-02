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
var sinon = require('sinon');

var noflo = require('../../bower_components/the-graph/node_modules/noflo/lib/NoFlo');

// use requirejs to load modules from the app
var System = require('../systemjs-with-paths');

var stubLibrary = {
  'boolean/and': {
    inports: [],
    outports: []
  },

  'boolean/or': {
    inports: [],
    outports: [
      { name: 'out', type: 'boolean' }
    ]
  },

  'boolean/not': {
    inports: [
      { name: 'in', type: 'boolean' },
      { name: 'value1', type: 'boolean' }
    ],
    outports: [
      { name: 'nottyout', type: 'boolean' }
    ]
  }
};

describe('GraphQuery', function () {
  var GraphQuery;

  beforeEach(function (done) {
    System.import('GraphQuery').then(function (GQ) {
      GraphQuery = GQ;
      done();
    });
  });

  describe('getNode()', function () {

    it('should return null if asked to get a node and no graph set', function () {
      var graphQuery = GraphQuery();
      expect(graphQuery.getNode('x')).to.be.null;
    });

    it('should return null if asked to get a non-existent node', function () {
      var graph = new noflo.Graph();
      graph.library = stubLibrary;
      graph.addNode('node1', 'boolean/and');

      var graphQuery = GraphQuery({ graph: graph });
      expect(graphQuery.getNode('x')).to.be.null;
    });

    it('should return a node by ID', function () {
      var graph = new noflo.Graph();
      graph.library = stubLibrary;
      graph.addNode('node1', 'boolean/and');

      var expected = { id: 'node1', component: 'boolean/and', metadata: {} };

      var graphQuery = GraphQuery({ graph: graph });
      graphQuery.getNode('node1').should.eql(expected);
    });

  });

  describe('hasEdgeAttached()', function () {
    var graph = new noflo.Graph();
    graph.library = stubLibrary;
    graph.addNode('node1', 'boolean/or');
    graph.addNode('node2', 'boolean/not');
    graph.addEdge('node1', 'out', 'node2', 'in');

    // to check ports, to ensure that we're not getting false positives
    // in the tests due to a port not existing
    var portExists = function (nodeId, portName) {
      var node = graph.getNode(nodeId);
      var componentName = node.component;
      var component = graph.library[componentName];
      var allPorts = component.inports.concat(component.outports);
      return !!_.find(allPorts, function (port) {
        return port.name === portName
      });
    };

    it('should return true if an edge is attached to specified node+inport', function () {
      var graphQuery = GraphQuery({graph: graph});
      graphQuery.hasEdgeAttached('node1', 'out').should.be.true;
    });

    it('should return true if an edge is attached to specified node+outport', function () {
      var graphQuery = GraphQuery({graph: graph});
      graphQuery.hasEdgeAttached('node2', 'in').should.be.true;
    });

    it('should return false if a node+inport has no edge attached', function () {
      var graphQuery = GraphQuery({graph: graph});
      portExists('node2', 'value1').should.be.true;
      graphQuery.hasEdgeAttached('node2', 'value1').should.be.false;
    });

    it('should return false if a node+outport has no edge attached', function () {
      var graphQuery = GraphQuery({graph: graph});
      portExists('node2', 'nottyout').should.be.true;
      graphQuery.hasEdgeAttached('node2', 'nottyout').should.be.false;
    });

  });
});

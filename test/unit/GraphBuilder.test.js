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
var sinon = require('sinon');

var noflo = require('../../bower_components/the-graph/node_modules/noflo/lib/NoFlo');

var System = require('../systemjs-with-paths');

describe('GraphBuilder', function () {
  var GraphBuilder;

  // components to load into NoFlo graphs
  var boolean_and;
  var oops;
  var vonce;

  beforeEach(function (done) {
    Promise.all([
      System.import('GraphBuilder'),
      System.import('Component')
    ])
    .then(function (imports) {
      GraphBuilder = imports[0];
      Component = imports[1];

      boolean_and = Component.convertSolComponent({
        name: 'boolean_and',
        category: 'logical',
        inports: [
          {name: 'IN1', type: 'boolean'},
          {name: 'IN2', type: 'boolean'}
        ],
        outports: [
          {name: 'OUT1', type: 'boolean'}
        ]
      });

      oops = Component.convertSolComponent({
        name: 'oops',
        category: 'logical',
        inports: [
          {name: 'R1', type: 'any'},
          {name: 'R2', type: 'boolean'}
        ],
        outports: [
          {name: 'amiright', type: 'boolean'}
        ]
      });

      vonce = Component.convertSolComponent({
        name: 'vonce',
        category: 'illogical',
        inports: [],
        outports: [],
        options: {
          members: [
            {
              name: 'samples',
              default: {
                max: 100,
                min: 1,
                step: 2,
                val: 100
              }
            },

            {
              name: 'prefix',
              default: 'moohaha'
            }
          ]
        }
      });

      done();
    });
  });

  it('should reset the node ID counter', function () {
    var stubGraph = {
      nodes: [
        {id: 'a'},
        {id: 'node27'},
        {id: 'node15'},
        {id: 'node16_1'},
        {id: 'node17_36'},
        {id: 'node'},
        {id: 'node3'},
        {id: 'b'},
        {id: 'supercalifragi'}
      ],

      on: function () {}
    };

    var graphBuilder = GraphBuilder();
    graphBuilder.setGraph(stubGraph);

    graphBuilder.nodeId.should.equal(28);
  });

  it('should set the node ID counter to 1 if there is no graph', function () {
    var graphBuilder = GraphBuilder();
    graphBuilder.nodeId.should.equal(1);
  });

  it('should set the node ID counter to 1 if graph has no nodes', function () {
    var stubGraph = {
      nodes: [],
      on: function () {}
    };

    var graphBuilder = GraphBuilder();
    graphBuilder.setGraph(stubGraph);

    graphBuilder.nodeId.should.equal(1);
  });

  it('should set the node ID counter to 1 if graph node IDs are non-standard', function () {
    var stubGraph = {
      nodes: [
        {id: 'anode27'},
        {id: 'spome'}
      ],
      on: function () {}
    };

    var graphBuilder = GraphBuilder();
    graphBuilder.setGraph(stubGraph);

    graphBuilder.nodeId.should.equal(1);
  });

  it('should replace a node with a clone with a different component type', function (done) {
    var stubLibrary = {
      get: sinon.stub(),
      mapPorts: sinon.stub()
    };

    stubLibrary.get.withArgs('boolean_and').returns(boolean_and);
    stubLibrary.get.withArgs('oops').returns(oops);
    stubLibrary.mapPorts.withArgs(boolean_and, oops).returns({
      inports: {
        'IN1': 'R1',
        'IN2': 'R2'
      },

      outports: {
        'OUT1': 'amiright'
      }
    });

    var graph = new noflo.Graph();
    graph.library = {
      'boolean_and': boolean_and,
      'oops': oops
    };

    var builder = GraphBuilder({
      graph: graph,
      library: stubLibrary
    });

    builder.signals.addNodeError.add(function (err) {
      done(err);
    });

    builder.signals.addEdgeError.add(function (err) {
      done(err);
    });

    builder.signals.componentChanged.add(function (node) {
      // note port mappings have changed to the inports and outports
      // on the component changed to
      var expectedEdges = [
        {
          "from": {
            "node": "node1",
            "port": "OUT1"
          },
          "to": {
            "node": "node3_1",
            "port": "R1"
          },
          "metadata": {}
        },
        {
          "from": {
            "node": "node2",
            "port": "OUT1"
          },
          "to": {
            "node": "node3_1",
            "port": "R2"
          },
          "metadata": {}
        },
        {
          "from": {
            "node": "node3_1",
            "port": "amiright"
          },
          "to": {
            "node": "node4",
            "port": "IN1"
          },
          "metadata": {}
        }
      ];

      var expectedNode = {
        "id": "node3_1",
        "component": "oops",
        "metadata": {
          "label": "node3",
          "x": 50,
          "y": 65
        }
      };

      graph.edges.should.eql(expectedEdges);
      graph.getNode('node3_1').should.eql(expectedNode);

      done();
    });

    builder.addNode('boolean_and', {x: 20, y: 25}, 'node1');
    builder.addNode('boolean_and', {x: 30, y: 40}, 'node2');

    // this is the node we're going to change
    builder.addNode('boolean_and', {x: 50, y: 65}, 'node3');

    builder.addNode('boolean_and', {x: 150, y: 165}, 'node4');

    builder.addEdge('node1', 'OUT1', 'node3', 'IN1');
    builder.addEdge('node2', 'OUT1', 'node3', 'IN2');
    builder.addEdge('node3', 'OUT1', 'node4', 'IN1');

    builder.changeComponent('node3', oops);
  });

  it('should add an IIP for a node', function (done) {
    var nodeIdX = 'node1';

    var portName1 = 'R1';
    var data1 = 'hello world';

    var portName2 = 'R2';
    var data2 = false;

    var stubLibrary = {
      get: sinon.stub()
    };
    stubLibrary.get.withArgs('oops').returns(oops);

    var graph = new noflo.Graph();
    graph.library = {
      oops: oops
    };

    var builder = GraphBuilder({
      graph: graph,
      library: stubLibrary
    });

    var IIPCount = 0;

    builder.signals.addIIP.add(function (data, nodeId, portName) {
      if (portName === portName1) {
        data.should.eql(data1);
        nodeId.should.equal(nodeIdX);
        portName.should.equal(portName1);
        IIPCount++;
      }
      else if (portName === portName2) {
        data.should.eql(data2);
        nodeId.should.equal(nodeIdX);
        portName.should.equal(portName2);
        IIPCount++;

        IIPCount.should.equal(2);

        done();
      }
    });

    builder.addNode('oops', {}, nodeIdX);

    builder.addIIP(data1, nodeIdX, portName1);
    builder.addIIP(data2, nodeIdX, portName2);
  });

  it('should remove an IIP for a node', function (done) {
    var nodeId = 'node1';
    var portName = 'R1';
    var data = 'hello world';

    var stubLibrary = {
      get: sinon.stub()
    };
    stubLibrary.get.withArgs('oops').returns(oops);

    var graph = new noflo.Graph();
    graph.library = {
      oops: oops
    };

    var builder = GraphBuilder({
      graph: graph,
      library: stubLibrary
    });

    builder.signals.removeIIP.add(function (dataRemoved, nodeIdRemoved, portNameRemoved) {
      dataRemoved.should.eql(data);
      nodeIdRemoved.should.eql(nodeId);
      portNameRemoved.should.eql(portName);
      done();
    });

    builder.signals.addIIP.add(function (data, nodeId, portName) {
      builder.removeIIP(nodeId, portName);
    });

    builder.addNode('oops', {}, nodeId);

    builder.addIIP(data, nodeId, portName);
  });

  it('should set values for default member variables on added nodes', function (done) {
    var nodeId = 'node1';

    var stubLibrary = {
      get: sinon.stub()
    };
    stubLibrary.get.withArgs('vonce').returns(vonce);

    var graph = new noflo.Graph();
    graph.library = {
      vonce: vonce
    };

    var builder = GraphBuilder({
      graph: graph,
      library: stubLibrary
    });

    builder.signals.addNodeError.add(function (err) {
      done(err);
    });

    builder.signals.addNode.add(function (node) {
      var expected = {
        label: nodeId,

        samples: {
          max: 100,
          min: 1,
          step: 2,
          val: 100
        },

        prefix: "moohaha"
      };

      node.metadata.should.eql(expected);

      done();
    });

    builder.addNode('vonce', {}, nodeId);
  });

  it('should write member variables on existing nodes', function (done) {
    var nodeId = 'node1';

    var stubLibrary = {
      get: sinon.stub()
    };
    stubLibrary.get.withArgs('vonce').returns(vonce);

    var graph = new noflo.Graph();
    graph.library = {
      vonce: vonce
    };

    var builder = GraphBuilder({
      graph: graph,
      library: stubLibrary
    });

    builder.signals.addNodeError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChangedError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChanged.add(function (node) {
      var expected = {
        label: nodeId,

        samples: {
          max: 100,
          min: 1,
          step: 2,
          val: 100
        },

        prefix: 'flummox'
      };

      node.metadata.should.eql(expected);

      done();
    });

    builder.signals.addNode.add(function (node) {
      builder.setMetadata(nodeId, nodeId, {
        prefix: 'flummox'
      });
    });

    builder.addNode('vonce', {}, nodeId);
  });

  it('should write reserved member variables on existing nodes with force option', function (done) {
    var nodeId = 'node1';

    var stubLibrary = {
      get: sinon.stub()
    };
    stubLibrary.get.withArgs('vonce').returns(vonce);

    var graph = new noflo.Graph();
    graph.library = {
      vonce: vonce
    };

    var builder = GraphBuilder({
      graph: graph,
      library: stubLibrary
    });

    builder.signals.addNodeError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChangedError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChanged.add(function (node) {
      var expected = {
        // from component default memebers
        prefix: 'moohaha',
        samples: {"max":100,"min":1,"step":2,"val":100},

        // set by second param of setMetadata()
        label: 'newNode',

        // new ones, normally not setable, except with force
        x: 1,
        y: 2,
        width: 3,
        height: 4
      };

      node.metadata.should.eql(expected);

      done();
    });

    builder.signals.addNode.add(function (node) {
      builder.setMetadata(nodeId, 'newNode',
        {
          x: 1,
          y: 2,
          width: 3,
          height: 4
        },
        { force: true }
      );
    });

    builder.addNode('vonce',
      {
        label: 'oldNode',
        x: 0,
        y: 1,
        width: 2,
        height: 3
      }, nodeId);
  });

  it('should move node down', function (done) {
    var nodeId = 'node1';

    var stubLibrary = {
      get: sinon.stub()
    };
    stubLibrary.get.withArgs('vonce').returns(vonce);

    var graph = new noflo.Graph();
    graph.library = {
      vonce: vonce
    };

    var builder = GraphBuilder({
      graph: graph,
      library: stubLibrary
    });

    var editor = {
      getScale: function() {
        return 1;
      }
    };

    builder.setEditor(editor);

    builder.signals.addNodeError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChangedError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChanged.add(function (node) {
      var expected = {
        x: 0,
        y: 10
      };

      Object.keys(expected).forEach(function (key) {
        node.metadata[key].should.eql(expected[key]);
      });

      done();
    });

    builder.signals.addNode.add(function (node) {
      builder.moveNodes([node], 'down');
    });

    builder.addNode('vonce',
      {
        x: 0,
        y: 0,
      }, nodeId);
  });

  it('should move node up', function (done) {
    var nodeId = 'node1';

    var stubLibrary = {
      get: sinon.stub()
    };
    stubLibrary.get.withArgs('vonce').returns(vonce);

    var graph = new noflo.Graph();
    graph.library = {
      vonce: vonce
    };

    var builder = GraphBuilder({
      graph: graph,
      library: stubLibrary
    });

    var editor = {
      getScale: function() {
        return 1;
      }
    };

    builder.setEditor(editor);

    builder.signals.addNodeError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChangedError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChanged.add(function (node) {
      var expected = {
        x: 0,
        y: -10
      };

      Object.keys(expected).forEach(function (key) {
        node.metadata[key].should.eql(expected[key]);
      });

      done();
    });

    builder.signals.addNode.add(function (node) {
      builder.moveNodes([node], 'up');
    });

    builder.addNode('vonce',
      {
        x: 0,
        y: 0,
      }, nodeId);
  });

  it('should move node right', function (done) {
    var nodeId = 'node1';

    var stubLibrary = {
      get: sinon.stub()
    };
    stubLibrary.get.withArgs('vonce').returns(vonce);

    var graph = new noflo.Graph();
    graph.library = {
      vonce: vonce
    };

    var builder = GraphBuilder({
      graph: graph,
      library: stubLibrary
    });

    var editor = {
      getScale: function() {
        return 1;
      }
    };

    builder.setEditor(editor);

    builder.signals.addNodeError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChangedError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChanged.add(function (node) {
      var expected = {
        x: 10,
        y: 0
      };

      Object.keys(expected).forEach(function (key) {
        node.metadata[key].should.eql(expected[key]);
      });

      done();
    });

    builder.signals.addNode.add(function (node) {
      builder.moveNodes([node], 'right');
    });

    builder.addNode('vonce',
      {
        x: 0,
        y: 0,
      }, nodeId);
  });

  it('should move node left', function (done) {
    var nodeId = 'node1';

    var stubLibrary = {
      get: sinon.stub()
    };
    stubLibrary.get.withArgs('vonce').returns(vonce);

    var graph = new noflo.Graph();
    graph.library = {
      vonce: vonce
    };

    var builder = GraphBuilder({
      graph: graph,
      library: stubLibrary
    });

    var editor = {
      getScale: function() {
        return 1;
      }
    };

    builder.setEditor(editor);

    builder.signals.addNodeError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChangedError.add(function (err) {
      done(err);
    });

    builder.signals.nodeChanged.add(function (node) {
      var expected = {
        x: -10,
        y: 0
      };

      Object.keys(expected).forEach(function (key) {
        node.metadata[key].should.eql(expected[key]);
      });

      done();
    });

    builder.signals.addNode.add(function (node) {
      builder.moveNodes([node], 'left');
    });

    builder.addNode('vonce',
      {
        x: 0,
        y: 0,
      }, nodeId);
  });

  it('extract nothing from empty fbp', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'wallclock/hour': {
            'members': {}
          },
          'converter/empty-to-boolean': {
            'members': {
              'some_member': {
                'type': 'int'
              },
              'output_value': {
                'type': 'boolean'
              },
              'true_range': {
                'type': 'int'
              }
            }
          },
          'drange/equal': {
            'members': {}
          },
        }[name];
      },
    });

    var rawFbp = '';
    var expected = {};
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  it('extract nothing from fbp no type (invalid, but anyway)', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
        }[name];
      },
    });

    var rawFbp = 'node5 OUT -> IN node3_1';
    var expected = {};
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  it('extract nothing from fbp with no metadata', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'wallclock/hour': {
            'members': {}
          },
          'converter/empty-to-boolean': {
            'members': {}
          },
        }[name];
      },
    });

    var rawFbp = 'node5(wallclock/hour:label=node5) OUT -> IN node3_1(converter/empty-to-boolean:label=node3)';
    var expected = {};
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  it('extract nothing from fbp with no metadata including newline', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'wallclock/hour': {
            'members': {}
          },
          'converter/empty-to-boolean': {
            'members': {
              'some_member': {
                'type': 'int'
              },
              'output_value': {
                'type': 'boolean'
              },
              'true_range': {
                'type': 'int'
              }
            }
          },
          'drange/equal': {
            'members': {}
          },
        }[name];
      },
    });

    var rawFbp = 'node5(wallclock/hour:label=node5) OUT -> IN node3_1(converter/empty-to-boolean:label=node3)\n';
    var expected = {};
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  it('extract nothing from fbp with no metadata including newline and blank line', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'wallclock/hour': {
            'members': {}
          },
          'converter/empty-to-boolean': {
            'members': {}
          },
        }[name];
      },
    });

    var rawFbp = 'node5(wallclock/hour:label=node5) OUT -> IN node3_1(converter/empty-to-boolean:label=node3)\n' +
      '\n';
    var expected = {};
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  it('extract metadata - bug test', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'wallclock/hour': {
            'members': {}
          },
          'converter/empty-to-boolean': {
            'members': {}
          },
          'drange/equal': {
            'members': {}
          },
        }[name];
      },
    });

    var rawFbp = 'node5(wallclock/hour:label=node5) OUT -> IN node3_1(converter/empty-to-boolean:label=node3)\n' +
      'node3_1(converter/empty-to-boolean:label=node3) OUT -> IN1 node6(drange/equal:label=node6)\n';
    var expected = {};
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  it('extract metadata - bug test - one simple member variable', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'wallclock/hour': {
            'members': {}
          },
          'converter/empty-to-boolean': {
            'members': [
              {
                'name': 'output_value',
                'type': 'boolean'
              }
            ]
          },
          'drange/equal': {
            'members': {}
          }
        }[name];
      },
    });

    var rawFbp = 'node5(wallclock/hour:label=node5) OUT -> IN node3_1(converter/empty-to-boolean:label=node3,output_value=false)\n' +
      'node3_1 OUT -> IN1 node6(drange/equal:label=node6)';
    var expected = {
      'node3_1': {
        'output_value': false
      }
    };
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  it('extract metadata - bug test - one complex member variable', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'wallclock/hour': {
            'members': {}
          },
          'converter/empty-to-boolean': {
            'members': [
              {
                'name': 'true_range',
                'type': 'int'
              }
            ]
          },
          'drange/equal': {
            'members': {}
          }
        }[name];
      },
    });

    var rawFbp = 'node5(wallclock/hour:label=node5) OUT -> IN node3_1(converter/empty-to-boolean:label=node3,true_range=max:255|min:1|step:0|val:128)\n' +
      'node3_1 OUT -> IN1 node6(drange/equal:label=node6)';
    var expected = {
      'node3_1': {
        'true_range': {
          'max': 255,
          'min': 1,
          'step': 0,
          'val': 128
        }
      }
    };
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  it('extract metadata - bug test - complex member and simple variables', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'wallclock/hour': {
            'members': {}
          },
          'converter/empty-to-boolean': {
            'members': [
              {
                'name': 'output_value',
                'type': 'boolean'
              },
              {
                'name': 'true_range',
                'type': 'int'
              }
            ]
          },
          'drange/equal': {
            'members': {}
          }
        }[name];
      },
    });

    var rawFbp = 'node5(wallclock/hour:label=node5) OUT -> IN node3_1(converter/empty-to-boolean:label=node3,output_value=false,true_range=max:255|min:1|step:0|val:128)\n' +
      'node3_1 OUT -> IN1 node6(drange/equal:label=node6)';
    var expected = {
      'node3_1': {
        'output_value': false,
        'true_range': {
          'max': 255,
          'min': 1,
          'step': 0,
          'val': 128
        }
      }
    };
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  it('extract metadata - bug test - multiple complex member variables', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'wallclock/hour': {
            'members': {}
          },
          'converter/empty-to-boolean': {
            'members': [
              {
                'name': 'some_member',
                'type': 'int'
              },
              {
                'name': 'true_range',
                'type': 'int'
              }
            ]
          },
          'drange/equal': {
            'members': {}
          }
        }[name];
      },
    });

    var rawFbp = 'node5(wallclock/hour:label=node5) OUT -> IN node3_1(converter/empty-to-boolean:label=node3,some_member=a:1|b:2|c:3,true_range=max:255|min:1|step:0|val:128)\n' +
      'node3_1 OUT -> IN1 node6(drange/equal:label=node6)';
    var expected = {
      'node3_1': {
        'some_member': {
          'a': 1,
          'b': 2,
          'c': 3
        },
        'true_range': {
          'max': 255,
          'min': 1,
          'step': 0,
          'val': 128
        }
      }
    };
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  /**
   * we shouldn't get 'undefined' strings, but best to cope with it and make sure the
   * members are really undefined and not just the string 'undefined'
   */
  it('extract metadata - undefined', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'converter/boolean-to-byte': {
            'members': [
              {
                'name': 'some_member',
                'type': 'byte'
              }
            ]
          }
        }[name];
      },
    });

    var rawFbp = 'node1(converter/boolean-to-byte:label=node1,false_value=undefined,true_value=undefined) OUT -> FALSE_VALUE node2(converter/boolean-to-byte:label=node2,false_value=undefined,true_value=undefined)\n';
    var expected = {
      'node1': {
        'false_value': undefined,
        'true_value': undefined
      },
      'node2': {
        'false_value': undefined,
        'true_value': undefined
      }
    };
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  /**
   * make sure it extracts members when the contain a string that has a ) in it
   */
  it('extract metadata - ) in a string', function (done) {
    var graphBuilder = GraphBuilder();
    graphBuilder.setLibrary({
      get: function(name) {
        return {
          'converter/boolean-to-byte': {
            'members': [
              {
                'name': 'value',
                'type': 'string'
              }
            ]
          }
        }[name];
      },
    });

    var rawFbp = 'node1(converter/boolean-to-byte:value=")") OUT -> FALSE_VALUE node2(converter/boolean-to-byte:label=node2,false_value=undefined,true_value=undefined)\n';
    var expected = {
      'node1': {
        'value': ')'
      },
      'node2': {
        'false_value': undefined,
        'true_value': undefined
      }
    };
    var actual = graphBuilder.extractAllMembers(rawFbp);
    actual.should.eql(expected);
    done();
  });

  describe('GraphBuilder.getNextNodeLabel()', function () {
    // note that the nodes list for the stub graph should mirror
    // the situation where the next node label is requested for a node
    // which is being copied, if a base label is passed to this method:
    // a node with the copied node's label will already exist in the graph
    var stubGraph = {
      on: function () {}
    };

    it('should return node1 when there are no nodes', function () {
      stubGraph.nodes = [];

      var gb = GraphBuilder({
        graph: stubGraph
      });

      gb.getNextNodeLabel().should.equal('node1');
    });

    it('should return nodeX+1 when label nodeX exists in the graph', function () {
      stubGraph.nodes = [
        { metadata: { label: 'node1' } },
        { metadata: { label: 'node3' } },
        { metadata: { label: 'node2' } }
      ];

      var gb = GraphBuilder({
        graph: stubGraph
      });

      gb.getNextNodeLabel().should.equal('node4');
    });

    it('should return nodeX+1 when label nodeX exists in the graph and base label provided', function () {
      stubGraph.nodes = [
        { metadata: { label: 'node1' } },
        { metadata: { label: 'node3' } },
        { metadata: { label: 'node2' } }
      ];

      var gb = GraphBuilder({
        graph: stubGraph
      });

      gb.getNextNodeLabel('node2').should.equal('node4');
    });

    it('should increment custom base label without a numeric suffix', function () {
      stubGraph.nodes = [
        { metadata: { label: 'FOO' } },
        { metadata: { label: 'node3' } },
        { metadata: { label: 'node2' } }
      ];

      var gb = GraphBuilder({
        graph: stubGraph
      });

      gb.getNextNodeLabel('FOO').should.equal('FOO1');
    });

    it('should return next free label for custom base label without numeric suffix', function () {
      stubGraph.nodes = [
        { metadata: { label: 'FOO' } },
        { metadata: { label: 'FOO1' } },
        { metadata: { label: 'node3' } },
        { metadata: { label: 'node2' } }
      ];

      var gb = GraphBuilder({
        graph: stubGraph
      });

      gb.getNextNodeLabel('FOO').should.equal('FOO2');
    });

    it('should return next free label for custom base label with numeric suffix', function () {
      var gb = GraphBuilder({
        graph: stubGraph
      });

      stubGraph.nodes = [
        { metadata: { label: 'FOO3' } },
        { metadata: { label: 'FOO1' } },
        { metadata: { label: 'node3' } },
        { metadata: { label: 'node2' } }
      ];

      gb.getNextNodeLabel('FOO1').should.equal('FOO2');

      stubGraph.nodes = [
        { metadata: { label: 'FOO3' } },
        { metadata: { label: 'FOO' } },
        { metadata: { label: 'node3' } },
        { metadata: { label: 'node2' } }
      ];

      gb.getNextNodeLabel('FOO').should.equal('FOO1');

      stubGraph.nodes = [
        { metadata: { label: 'FOO3' } },
        { metadata: { label: 'FOO2' } },
        { metadata: { label: 'FOO1' } },
        { metadata: { label: 'node3' } },
        { metadata: { label: 'node2' } }
      ];

      gb.getNextNodeLabel('FOO3').should.equal('FOO4');
    });

  });

  describe('GraphBuilder.moveNodeDeclarations()', function () {

    it('should move one declaration into a definition', function () {
      var rawFbp = 'MYNODE1(value=0)\nMYNODE1 OUT -> IN MYNODE2';

      var gb = GraphBuilder({
      });

      gb.moveNodeDeclarations(rawFbp).should.equal('MYNODE1(value=0) OUT -> IN MYNODE2');
    });

    it('should move two declarations into a definition', function () {
      var rawFbp = 'MYNODE1(value=0)\nMYNODE2(value=1)\nMYNODE1 OUT -> IN MYNODE2';

      var gb = GraphBuilder({
      });

      gb.moveNodeDeclarations(rawFbp).should.equal('MYNODE1(value=0) OUT -> IN MYNODE2(value=1)');
    });

    it('should move one declaration into a only first definition', function () {
      var rawFbp = 'MYNODE1(value=0)\nMYNODE1 OUT -> IN MYNODE2(value=1)\nMYNODE1 OUT -> IN MYNODE3';

      var gb = GraphBuilder({
      });

      gb.moveNodeDeclarations(rawFbp).should.equal('MYNODE1(value=0) OUT -> IN MYNODE2(value=1)\nMYNODE1 OUT -> IN MYNODE3');
    });

    it('should move declarations with quotes in metadata', function () {
      var rawFbp = 'MYNODE1(value="some string")\nMYNODE1 OUT -> IN MYNODE2(value=1)\nMYNODE1 OUT -> IN MYNODE3';

      var gb = GraphBuilder({
      });

      gb.moveNodeDeclarations(rawFbp).should.equal('MYNODE1(value="some string") OUT -> IN MYNODE2(value=1)\nMYNODE1 OUT -> IN MYNODE3');
    });

    it('should move declarations with ) in metadata', function () {
      var rawFbp = 'MYNODE1(value="some (string)")\nMYNODE1 OUT -> IN MYNODE2(value=1)\nMYNODE1 OUT -> IN MYNODE3';

      var gb = GraphBuilder({
      });

      gb.moveNodeDeclarations(rawFbp).should.equal('MYNODE1(value="some (string)") OUT -> IN MYNODE2(value=1)\nMYNODE1 OUT -> IN MYNODE3');
    });

  });

  describe('GraphBuilder.renameAnonymousNodes()', function () {

    it('should rename anonymous nodes', function () {
      var rawFbp = '_(value=0) OUT -> IN _(value=1)\n_() OUT -> IN _()';

      var gb = GraphBuilder({
      });

      gb.renameAnonymousNodes(rawFbp).should.equal('anon1(value=0) OUT -> IN anon2(value=1)\nanon3() OUT -> IN anon4()');
    });

  });

});



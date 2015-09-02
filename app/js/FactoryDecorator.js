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
define(function () {
  'use strict';

  // returns true if the currently-drawing edge can be attached
  // to the target node in props
  var canConnect = function (decorator, props) {
    var result = true;

    if (decorator.currentEdgeSource) {
      var sourceComponentName = decorator.currentEdgeSource.sourceComponentName;
      var sourcePortName = decorator.currentEdgeSource.sourcePortName;
      var targetComponentName = props.node.component;
      var targetPortName = props.label;

      result = decorator.library.canConnect(
        sourceComponentName,
        sourcePortName,
        targetComponentName,
        targetPortName
      );
    }

    return result;
  };

  // returns true if the node/port combo in props has an edge
  // attached to it
  var edgeAttached = function (decorator, props) {
    var nodeId = props.node.id;
    var portName = props.label;
    return decorator.graphQuery.hasEdgeAttached(nodeId, portName);
  };

  // in the wrapper functions below, "this" is scoped to the object
  // being used as the basis for the SVG element being created; it
  // has a props property which includes the node, graph etc.; for
  // example:
  //   var portName = this.props.label;
  //   var node = this.props.node;

  // wrap the function which draws the port "arc", so
  // that ports can show whether the edge currently being drawn can be
  // attached to them
  var addPortConnectableWrapper = function (decorator) {
    // the arc is the semi-circle of a port; colour this if the port
    // can't be connected
    var wrappedArc = decorator.TheGraph.factories.port.createPortArc;

    decorator.TheGraph.factories.port.createPortArc = function (options) {
      if (!canConnect(decorator, this.props)) {
        options.className += ' slv-cannot-connect-port';
      }
      else if (decorator.currentEdgeSource) {
        options.className += ' slv-can-connect-port';
      }

      return wrappedArc.call(this, options);
    };
  };

  // add a class to ports which have an edge attached to them
  var addPortEdgeAttachedWrapper = function (decorator) {
    var wrapped = decorator.TheGraph.factories.port.createPortArc;

    decorator.TheGraph.factories.port.createPortArc = function (options) {
      if (edgeAttached(decorator, this.props)) {
        options.className += ' slv-edge-attached';
      }

      return wrapped.call(this, options);
    };
  };

  // wrap the factory function which creates the background circle
  // for ports, so it is larger; this provides a bigger drop area for
  // the end of a pipe so it can snap correctly to the nearest port
  var addEnlargePortDropAreaWrapper = function (decorator) {
    var wrapped = decorator.TheGraph.factories.port.createPortBackgroundCircle;

    decorator.TheGraph.factories.port.createPortBackgroundCircle = function (options) {
      // the factor can't be higher than 1.7, otherwise the port drop
      // areas overlap
      options.r = options.r * 1.7;

      return wrapped.call(this, options);
    };
  };

  /**
   * Decorator for the-graph drawing functions, to enable custom classes
   * can be added to nodes/edges.
   *
   * Note that because this has to do some DOM drawing and interact
   * with TheGraph, but we still want to unit test it, the dependencies
   * are passed into the constructor rather than require'd. This is
   * so they can be stubbed out in unit tests.
   *
   * This is constructed by a <slv-editor> in the app, and given
   * the correct dependencies.
   *
   * @param {object} options
   * @param {ComponentLibrary} [options.library]    NB this must be
   * set before decorate() can be called
   * @param {GraphQuery} [options.graphQuery]    NB this must be
   * set before decorate() can be called
   * @param {TheGraph} [options.TheGraph=window.TheGraph]    An instance
   * of TheGraph to wrap; defaults to the globally-available TheGraph
   */
  var FactoryDecorator = function (options) {
    if (!(this instanceof FactoryDecorator)) {
      return new FactoryDecorator(options);
    }

    options = options || {};

    if (!options.graphQuery) {
      throw new Error('cannot decorate factory functions: no GraphQuery ' +
                      'has been set on FactoryDecorator');
    }
    this.graphQuery = options.graphQuery;

    this.library = options.library;
    this.TheGraph = options.TheGraph || window.TheGraph;

    // guard against multiply-decorating functions
    this.hasDecorated = false;

    // for tracking the source of the edge currently being drawn; an
    // object with this structure:
    // {
    //   sourceNode: <NoFlo node>,
    //   sourcePortName: <port name>,
    //   sourceComponentName: <name of node's component>
    // }
    this.currentEdgeSource = null;
  };

  /**
   * Set the library for component lookups.
   *
   * @param {ComponentLibrary} library
   */
  FactoryDecorator.prototype.setLibrary = function (library) {
    if (!library) {
      throw new Error('FactoryDecorator\'s library must not be falsy');
    }

    this.library = library;
  };

  /**
   * A new edge started on slv-editor, so modify port appearance
   * according to its properties.
   *
   * The assumption is that only one edge can be drawn at a time,
   * so calling this multiple times in succession will just modify
   * a single context property.
   */
  FactoryDecorator.prototype.setEdgeStarted = function (eventDetail) {
    if (this.currentEdgeSource === null) {
      var sourceNodeId = eventDetail.port.process;
      var sourceNode = this.graphQuery.getNode(sourceNodeId);
      var sourceComponentName = sourceNode.component;
      var sourcePortName = eventDetail.port.port;

      this.currentEdgeSource = {
        sourceNode: sourceNode,
        sourceComponentName: sourceComponentName,
        sourcePortName: sourcePortName
      };
    }
    // edge was connected to an inport on a different node, so it
    // has ended
    else {
      this.setEdgeEnded();
    }
  };

  /**
   * The edge being drawn on slv-editor ended, so stop modifying
   * the appearance of ports.
   */
  FactoryDecorator.prototype.setEdgeEnded = function () {
    this.currentEdgeSource = null;
  };

  /**
   * Wrap the-graph's factory functions for drawing nodes so we
   * can add our own modifications.
   *
   * This looks up components in the library associated
   * with this FactoryDecorator as nodes are added. It then modifies
   * the properties passed to the functions which draw nodes/edges,
   * based on the components which were looked up.
   */
  FactoryDecorator.prototype.decorate = function () {
    if (!this.TheGraph) {
      throw new Error('TheGraph property is not set; unable to ' +
                      'decorate its functions');
    }

    if (!this.library) {
      throw new Error('cannot decorate factory functions: no ' +
                      'ComponentLibrary has been set on FactoryDecorator');
    }

    if (this.hasDecorated) {
      return;
    }

    // enlarge the area around a port where an edge can be dropped
    // and still create the connection
    addEnlargePortDropAreaWrapper(this);

    // show which ports can be connected to an edge in progress;
    // this MUST be applied after addEnlargePortDropAreaWrapper()
    // is called
    addPortConnectableWrapper(this);

    // show ports in a different colour if they have one or more edges
    // attached
    addPortEdgeAttachedWrapper(this);

    this.hasDecorated = true;
  };

  return FactoryDecorator;
});

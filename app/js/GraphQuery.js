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

  /**
   * Runs queries over a NoFlo graph.
   */
  var GraphQuery = function (options) {
    if (!(this instanceof GraphQuery)) {
      return new GraphQuery(options);
    }

    options = options || {};

    this.setGraph(options.graph);
  };

  /**
   * Set the noflo.Graph to query.es-edit-iips-71
   *
   * @param {noflo.Graph} graph
   */
  GraphQuery.prototype.setGraph = function (graph) {
    if (!graph) {
      this.graph = null;
      return;
    }

    this.graph = graph;
  };

  /**
   * Get the node with ID <nodeId>.
   *
   * @param {string} nodeId    ID of node to retrieve
   *
   * @returns {object} node object from the noflo.Graph, or null if
   * the node doesn't exist or graph isn't set
   */
  GraphQuery.prototype.getNode = function (nodeId) {
    if (!this.graph) {
      return null;
    }

    return this.graph.getNode(nodeId) || null;
  };

  /**
   * Get the IIP value for node with ID <nodeId> on port <port>. If a
   * node + port has multiple IIPs (not desirable but possible in NoFlo),
   * only the first is returned.
   *
   * @param {string} nodeId    ID of the node the port is attached to
   * @param {string} portName   Name of the inport on the node
   *
   * @returns {any} IIP value on port; or null if there is no IIP
   * for that node + port, or if graph is not set
   */
  GraphQuery.prototype.getIIP = function (nodeId, portName) {
    if (!this.graph) {
      return null;
    }

    var iip = _.find(this.graph.initializers, function (initializer) {
      return initializer.to.node === nodeId &&
             initializer.to.port === portName;
    });

    if (iip) {
      return iip.from.data;
    }
    else {
      return null;
    }
  };

  /**
   * Check whether the port <portName> on node with ID <nodeId>
   * has an edge attached to it.
   */
  GraphQuery.prototype.hasEdgeAttached = function (nodeId, portName) {
    if (!this.graph) {
      return false;
    }

    var attachedEdge = _.find(this.graph.edges, function (edge) {
      return ((edge.to.node === nodeId) && (edge.to.port === portName) ||
              (edge.from.node === nodeId) && (edge.from.port === portName));
    });

    return !!attachedEdge;
  };

  /**
   * Return an array of edges attached to any nodes in an array of nodes.
   */
  GraphQuery.prototype.getEdgesAttachedToNodes = function (nodes) {
    if (!this.graph) {
      return false;
    }

    var nodeIds = _.pluck(nodes, 'id');

    var attachedEdges = _.filter(this.graph.edges, function (edge) {
      return ((nodeIds.indexOf(edge.to.node) !== -1) ||
              (nodeIds.indexOf(edge.from.node) !== -1));
    });

    return attachedEdges;
  };

  return GraphQuery;
});

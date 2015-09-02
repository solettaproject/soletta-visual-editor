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
define(['GraphBuilder', 'lodash'], function (GraphBuilder, _) {
  'use strict';

  /**
   * A GraphBuilder which provides undo/redo capabilities.
   *
   * The basic principle is to keep two stacks, one for undo operations
   * and one for redo operations.
   *
   * When an event occurs on the graph, an object is pushed to the
   * undo stack which contains "back" and "forward" commands
   * relating to the event. The "back" command contains the method name
   * and parameters necessary to undo the event (e.g. "_removeNode" if
   * the event was an "addNode" event); the "forward" command contains
   * the method name and parameters to redo the event (e.g.
   * "addNode" for our "addNode" event).
   *
   * If the user undoes an event (e.g. undo "addNode"), the "back"
   * command is applied; when the user redoes an event, the "forward"
   * command is applied.
   *
   * Event handlers on the graph instance watch for changes and populate
   * the undo/redo stacks.
   *
   * The stacks are popped to get the next redo/undo event when
   * invoked by the user. When an event leaves the undo stack, it is
   * pushed onto the redo stack (so a user can undo an event, then
   * redo that same event).
   *
   * To prevent undo/redo actions triggering more undo/redo objects being
   * pushed onto the stacks, these actions are routed directly to the
   * GraphBuilder. This means that any changes they make to the graph
   * are not captured as new events.

   * The underscore methods in this class proxy onto GraphBuilder and
   * aren't captured; the non-underscore methods set up the necessary
   * config to capture the events which are going to be generated,
   * then invoke the underscore methods to actually make the changes
   * to the graph.
   *
   * Some actions which are atomic for SLV are not for TheGraph: for
   * example, replacing a node's component, moving a group of nodes
   * via the keyboard, or pasting a group of nodes. To cope with these,
   * the undo/redo stacks can have substacks. These are effectively
   * stacks within the parent undo/redo stack which capture a series
   * of events and enable them to be treated as a single event (from
   * the parent stack's point of view).
   *
   * For example:
   *
   * 1. user adds two nodes
   * the undo stack contains a command to undo/redo the events,
   * which would enable the nodes to be added again on redo or
   * removed on undo:
   * [
   *   {
   *     forward: { cmd: 'addNode', args: ['node1', ...] },
   *     back: { cmd: 'removeNode', args: ['node1', ...] }
   *   },
   *   {
   *     forward: { cmd: 'addNode', args: ['node2', ...] },
   *     back: { cmd: 'removeNode', args: ['node2', ...] }
   *   }
   * ]
   *
   * 2. user copies and pastes these two nodes, which causes two more
   * addNode events to trigger; this creates two more command objects:
   *   {
   *     forward: { cmd: 'addNode', args: ['node1_1', ...] },
   *     back: { cmd: 'removeNode', args: ['node1_1', ...] }
   *   },
   *   {
   *     forward: { cmd: 'addNode', args: ['node2_1', ...] },
   *     back: { cmd: 'removeNode', args: ['node2_1', ...] }
   *   }
   * however, these are treated as a "substack" and added to the undo
   * stack as a single object, e.g. the undo stack would look like
   * this:
   * [
   *   {
   *     forward: { cmd: 'addNode', args: ['node1', ...] },
   *     back: { cmd: 'removeNode', args: ['node1', ...] }
   *   },
   *   {
   *     forward: { cmd: 'addNode', args: ['node2', ...] },
   *     back: { cmd: 'removeNode', args: ['node2', ...] }
   *   },
   *   [
   *     {
   *       forward: { cmd: 'addNode', args: ['node1_1', ...] },
   *       back: { cmd: 'removeNode', args: ['node1_1', ...] }
   *     },
   *     {
   *       forward: { cmd: 'addNode', args: ['node2_1', ...] },
   *       back: { cmd: 'removeNode', args: ['node2_1', ...] }
   *     }
   *   ]
   * ]
   *
   * @extends GraphBuilder
   */
  var VersionedGraphBuilder = function (options) {
    if (!(this instanceof VersionedGraphBuilder)) {
      return new VersionedGraphBuilder(options);
    }

    GraphBuilder.call(this, options);

    this.undoStack = [];
    this.redoStack = [];
    this.activeUndoStack = this.undoStack;
    this.activeRedoStack = this.redoStack;

    // set to true if listening for node moves
    this.listeningToNodeMove = false;

    // set to false to turn off event listeners
    this.listeningToGraphEvents = false;
  };

  VersionedGraphBuilder.prototype = _.create(GraphBuilder.prototype);

  VersionedGraphBuilder.prototype.openSubstack = function () {
    var newStack = [];

    var parent = [].concat(this.activeUndoStack);
    parent.push(newStack);

    newStack.parent = parent;

    this.activeUndoStack = newStack;
  };

  VersionedGraphBuilder.prototype.closeSubstack = function () {
    if (this.activeUndoStack.parent) {
      this.activeUndoStack = this.activeUndoStack.parent;
    }
  };

  VersionedGraphBuilder.prototype.addCommand = function (command) {
    this.activeUndoStack.push(command);
    this.activeRedoStack.length = 0;
  };

  var execute = function (graphBuilder, commands, isUndo) {
    var i;

    if (_.isArray(commands)) {
      if (isUndo) {
        for (i = commands.length - 1; i >= 0; i--) {
          execute(graphBuilder, commands[i], isUndo);
        }
      }
      else { // redo: apply changes in reverse
        for (i = 0; i < commands.length; i++) {
          execute(graphBuilder, commands[i], isUndo);
        }
      }
    }
    else {
      if (isUndo) {
        VersionedGraphBuilder.prototype[commands.back.cmd].apply(
          graphBuilder,
          commands.back.args
        );
      }
      else {
        VersionedGraphBuilder.prototype[commands.forward.cmd].apply(
          graphBuilder,
          commands.forward.args
        );
      }
    }
  };

  VersionedGraphBuilder.prototype.undo = function () {
    var command = this.activeUndoStack.pop();
    if (command) {
      execute(this, command, true);
      this.activeRedoStack.push(command);
    }
  };

  VersionedGraphBuilder.prototype.redo = function () {
    var command = this.activeRedoStack.pop();
    if (command) {
      execute(this, command, false);
      this.activeUndoStack.push(command);
    }
  };

  VersionedGraphBuilder.prototype.setGraph = function (graph) {
    if (!graph) {
      this.graph = null;
      return;
    }

    GraphBuilder.prototype.setGraph.call(this, graph);

    var self = this;

    // catch nodes being moved; the "substack" is used so that
    // all events relating to the node(s) being moved are captured
    // as a single redo/undo step
    graph.on('startTransaction', function (id) {
      if ((id === 'movenode' || id === 'movegroup') &&
           !self.listeningToNodeMove) {
        self.openSubstack();
        self.listeningToNodeMove = true;
      }
    });

    graph.on('endTransaction', function (id) {
      if ((id === 'movenode' || id === 'movegroup') &&
           self.listeningToNodeMove) {
        self.closeSubstack();
        self.listeningToNodeMove = false;
      }
    });

    graph.on('changeNode', function (nodeNow, metaBefore) {
      if (!(self.listeningToGraphEvents || self.listeningToNodeMove)) {
        return;
      }

      if (_.isEqual(nodeNow.metadata, metaBefore)) {
        return;
      }

      var deepClone = true;
      var command = {
        back: {
          cmd: '_setMetadata',
          args: [
            nodeNow.id,
            metaBefore.label,
            _.clone(metaBefore, deepClone),
            { force: true }
          ]
        },

        forward: {
          cmd: '_setMetadata',
          args: [
            nodeNow.id,
            nodeNow.metadata.label,
            _.clone(nodeNow.metadata, deepClone),
            { force: true }
          ]
        }
      };

      self.addCommand(command);
    });

    graph.on('removeNode', function (removedNode) {
      if (!self.listeningToGraphEvents) {
        return;
      }

      var deepClone = true;

      var command = {
        back: {
          cmd: '_addNode',
          args: [
            removedNode.component,
            _.clone(removedNode.metadata, deepClone),
            removedNode.id
          ]
        },

        forward: {
          cmd: '_removeNode',
          args: [
            removedNode.id
          ]
        }
      };

      self.addCommand(command);
    });

    graph.on('addNode', function (addedNode) {
      if (!self.listeningToGraphEvents) {
        return;
      }

      var deepClone = true;

      var command = {
        back: {
          cmd: '_removeNode',
          args: [
            addedNode.id
          ]
        },

        forward: {
          cmd: '_addNode',
          args: [
            addedNode.component,
            _.clone(addedNode.metadata, deepClone),
            addedNode.id
          ]
        }
      };

      self.addCommand(command);
    });

    graph.on('addEdge', function (addedEdge) {
      if (!self.listeningToGraphEvents) {
        return;
      }

      var fromNode = addedEdge.from.node;
      var fromPort = addedEdge.from.port;
      var toNode = addedEdge.to.node;
      var toPort = addedEdge.to.port;

      var command = {
        back: {
          cmd: '_removeEdge',
          args: [ fromNode, fromPort, toNode, toPort ]
        },

        forward: {
          cmd: '_addEdge',
          args: [ fromNode, fromPort, toNode, toPort ]
        }
      };

      self.addCommand(command);
    });

    graph.on('removeEdge', function (removedEdge) {
      if (!self.listeningToGraphEvents) {
        return;
      }

      var fromNode = removedEdge.from.node;
      var fromPort = removedEdge.from.port;
      var toNode = removedEdge.to.node;
      var toPort = removedEdge.to.port;

      var command = {
        back: {
          cmd: '_addEdge',
          args: [ fromNode, fromPort, toNode, toPort ]
        },

        forward: {
          cmd: '_removeEdge',
          args: [ fromNode, fromPort, toNode, toPort ]
        }
      };

      self.addCommand(command);
    });
  };

  // versioned setMetadata()
  VersionedGraphBuilder.prototype._setMetadata = function () {
    GraphBuilder.prototype.setMetadata.apply(this, arguments);
  };

  VersionedGraphBuilder.prototype.setMetadata = function () {
    this.listeningToGraphEvents = true;
    this._setMetadata.apply(this, arguments);
    this.listeningToGraphEvents = false;
  };

  // moveNodes() piggy-backs on the capture of metadata changes;
  // all the metadata changes are grouped into a single operation
  // via the substack() calls
  VersionedGraphBuilder.prototype.moveNodes = function () {
    this.openSubstack();
    GraphBuilder.prototype.moveNodes.apply(this, arguments);
    this.closeSubstack();
  };

  // versioned removeNode()
  VersionedGraphBuilder.prototype._removeNode = function () {
    GraphBuilder.prototype.removeNode.apply(this, arguments);
  };

  VersionedGraphBuilder.prototype.removeNode = function () {
    this.listeningToGraphEvents = true;
    this.openSubstack();
    this._removeNode.apply(this, arguments);
    this.closeSubstack();
    this.listeningToGraphEvents = false;
  };

  // versioned del()
  VersionedGraphBuilder.prototype._del = function () {
    GraphBuilder.prototype.del.apply(this, arguments);
  };

  VersionedGraphBuilder.prototype.del = function () {
    this.listeningToGraphEvents = true;
    this.openSubstack();
    this._del.apply(this, arguments);
    this.closeSubstack();
    this.listeningToGraphEvents = false;
  };

  // versioned addNode()
  VersionedGraphBuilder.prototype._addNode = function () {
    GraphBuilder.prototype.addNode.apply(this, arguments);
  };

  VersionedGraphBuilder.prototype.addNode = function () {
    this.listeningToGraphEvents = true;
    this._addNode.apply(this, arguments);
    this.listeningToGraphEvents = false;
  };

  // versioned paste(); this is captured as a group of addNode()
  // events on a substack
  VersionedGraphBuilder.prototype._paste = function () {
    GraphBuilder.prototype.paste.apply(this, arguments);
  };

  VersionedGraphBuilder.prototype.paste = function () {
    this.listeningToGraphEvents = true;
    this.openSubstack();
    this._paste.apply(this, arguments);
    this.closeSubstack();
    this.listeningToGraphEvents = false;
  };

  // versioned addEdge()
  VersionedGraphBuilder.prototype._addEdge = function () {
    GraphBuilder.prototype.addEdge.apply(this, arguments);
  };

  VersionedGraphBuilder.prototype.addEdge = function () {
    this.listeningToGraphEvents = true;
    this._addEdge.apply(this, arguments);
    this.listeningToGraphEvents = false;
  };

  // versioned removeEdge()
  VersionedGraphBuilder.prototype._removeEdge = function () {
    GraphBuilder.prototype.removeEdge.apply(this, arguments);
  };

  VersionedGraphBuilder.prototype.removeEdge = function () {
    this.listeningToGraphEvents = true;
    this._removeEdge.apply(this, arguments);
    this.listeningToGraphEvents = false;
  };

  // versioned changeComponent()
  VersionedGraphBuilder.prototype._changeComponent = function () {
    GraphBuilder.prototype.changeComponent.apply(this, arguments);
  };

  VersionedGraphBuilder.prototype.changeComponent = function () {
    this.listeningToGraphEvents = true;
    this.openSubstack();
    this._changeComponent.apply(this, arguments);
    this.closeSubstack();
    this.listeningToGraphEvents = false;
  };

  return VersionedGraphBuilder;
});

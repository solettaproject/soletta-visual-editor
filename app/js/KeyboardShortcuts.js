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
define(['lodash', 'js-signals'], function (_, jssignals) {
  'use strict';

  var graph = null;
  var editor = null;
  var selectedNodes = [];
  var selectedEdges = [];

  var signals = {
    'open': new jssignals.Signal(),
    'save': new jssignals.Signal(),
    'undo': new jssignals.Signal(),
    'redo': new jssignals.Signal(),
    'copy': new jssignals.Signal(),
    'paste': new jssignals.Signal(),
    'del': new jssignals.Signal(),
    'keyboardInput': new jssignals.Signal()
  };

  var enable = function () {
    _installKeyboardShortcuts();
  };

  var disable = function () {
    Mousetrap.reset();
    _installed = false;
  };

  var setGraph = function (newGraph) {
    graph = newGraph;
    selectedNodes = [];
    _installKeyboardShortcuts();
  };

  var setEditor = function (newEditor) {
    editor = newEditor;
    _installKeyboardShortcuts();
  };

  var getSelectedNodes = function () {
    return selectedNodes;
  };

  var getSelectedNodeIds = function () {
    return _.pluck(selectedNodes, 'id');
  };

  var setSelectedNodes = function (newSelectedNodes) {
    if (newSelectedNodes.length > 0) {
      selectedNodes = newSelectedNodes;
    }
    else if (selectedNodes.length > 0) {
      selectedNodes = [];
    }
  };

  var setSelectedEdges = function (newSelectedEdges) {
    if (newSelectedEdges.length > 0) {
      selectedEdges = newSelectedEdges;
    }
    else if (selectedEdges.length > 0) {
      selectedEdges = [];
    }
  };

  var _installed = false;
  var _installKeyboardShortcuts = function () {
    if (!_installed) {
      Mousetrap.bind('del', function () {
        signals.del.dispatch(selectedNodes, selectedEdges);

        return false;
      });
      Mousetrap.bind('ctrl+c', function () {
        signals.copy.dispatch(_.pluck(selectedNodes, 'id'));

        return false;
      });
      Mousetrap.bind('ctrl+x', function () {
        signals.copy.dispatch(_.pluck(selectedNodes, 'id'));
        signals.del.dispatch(selectedNodes, selectedEdges);

        return false;
      });
      Mousetrap.bind('ctrl+v', function () {
        signals.paste.dispatch();
        return false;
      });
      Mousetrap.bind('ctrl+s', function () {
        signals.save.dispatch();
        return false;
      });
      Mousetrap.bind('ctrl+o', function () {
        signals.open.dispatch();
        return false;
      });
      Mousetrap.bind('ctrl+z', function () {
        signals.undo.dispatch();
        return false;
      });
      Mousetrap.bind('ctrl+y', function () {
        signals.redo.dispatch();
        return false;
      });
      Mousetrap.bind('ctrl+shift+z', function () {
        signals.redo.dispatch();
        return false;
      });
      Mousetrap.bind(
        ['up', 'down', 'left', 'right', 'pagedown', 'pageup', '+', 'enter'],
        function (e, combo) {
          signals.keyboardInput.dispatch(combo, selectedNodes);
          return false;
        }
      );

      _installed = true;
    }
  };

  return {
    disable: disable,
    enable: enable,
    setGraph: setGraph,
    setEditor: setEditor,
    setSelectedEdges: setSelectedEdges,
    setSelectedNodes: setSelectedNodes,
    getSelectedNodes: getSelectedNodes,
    getSelectedNodeIds: getSelectedNodeIds,
    signals: signals
  };
});



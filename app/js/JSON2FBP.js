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

  var library = null;

  var stringifyMetadata = function (metadata, memberTypes) {
    var kvp = [];
    var keys = Object.keys(metadata);
    var numKeys = keys.length;

    var quoteString = function (value) {
      var retVal = value;
      retVal = retVal.replace(/"/g, '\\"');
      retVal = '"' + retVal + '"';

      return retVal;
    };

    /**
     * join key and value, separated by sep and push it onto array
     * use type to determine whether to quote or not
     */
    var joinAndPush = function (array, key, sep, value, type, options) {
      options = options || {};
      if (options.quoteStrings === undefined) {
        options.quoteStrings = true;
      }

      // undefined strings don't get exported
      if (typeof value !== 'undefined') {
        // surround strings in double quotes

        // never quote numeric values - eg INT32_MAX is not quoted
        var typeIsNumeric = ['int', 'float', 'double'].indexOf(type) !== -1;

        // never quote boolean values
        var typeIsBoolean = type==='boolean';

        if (options.quoteStrings &&
            typeof value === 'string' &&
            !typeIsNumeric &&
            !typeIsBoolean) {
          value = quoteString(value);
        }

        array.push(key + sep + value);
      }
    };

    var joinAndPushSubMetadata = function (array, thisMetadata, type) {
      var subKeys = Object.keys(thisMetadata);
      var numSubKeys = subKeys.length;
      var subKvp = [];
      for (var j = 0; j < numSubKeys; j++) {
        var thisSubKey = subKeys[j];
        var thisSubmetadata = thisMetadata[thisSubKey];
        if (typeof thisSubmetadata !== 'undefined' && thisSubmetadata !== null) {
          joinAndPush(subKvp, thisSubKey, ':', thisSubmetadata, type);
        }
      }

      if (subKvp.length > 0) {
        joinAndPush(array, thisKey, '=', subKvp.join('|'), type, {quoteStrings: false});
      }
    };

    for (var i = 0; i < numKeys; i++) {
      var thisKey = keys[i];
      var thisMetadata = metadata[thisKey];
      var thisType = memberTypes[thisKey];

      if (thisMetadata !== undefined && thisMetadata !== null) {
        if (typeof thisMetadata === 'object') {
          joinAndPushSubMetadata(kvp, thisMetadata, thisType);
        } else {
          joinAndPush(kvp, thisKey, '=', thisMetadata, thisType);
        }
      }
    }

    return kvp.join(',');
  };

  var _extractMetadata = function (graph) {
    /*
     * {
     *   'nodeId': {
     *     key: value,
     *     ...
     *   },
     *   ...
     * }
     **/
    var metadata = {};

    var omitMetadata = [ 'label', 'width', 'height', 'x', 'y' ];

    graph.nodes.forEach(function (node) {
      metadata[node.id] = _.omit(node.metadata,omitMetadata);
    });

    return metadata;
  };

  /**
   * Make a map to easily look up the data type of a particular component using
   * its name
   */
  var makeNameTypeMap = function (component) {
    var memberTypes = [];

    library.map[component].members.forEach( function(member) {
      memberTypes[member.name] = member.type;
    });

    return memberTypes;
  };

  var convert = function (rawGraph) {
    var metadata = _extractMetadata(rawGraph);
    var json = rawGraph.toJSON();
    var connections = json.connections;
    var processes = json.processes;
    var fbp = '';
    var detailDone = {};

    connections.forEach(function (connection, i) {
      // from https://github.com/noflo/fbp#readme
      // added metadata
      // A(Component1:metadata1) X -> Y B(Component2:metadata2)
      // metadata => key:value,key:value,key:value...
      // value => value || key:value|key:value|key:value...

      var processA = connection.src.process;
      var sanitizedProcessA = processA.replace(/[^a-zA-Z0-9_]/, '_', 'g');
      var component1 = processes[processA].component.replace(/ /, '_', 'g');
      var memberTypes1 = makeNameTypeMap(component1);
      var metadata1 = stringifyMetadata(metadata[processA], memberTypes1);
      var portX = connection.src.port.toUpperCase();

      var processB = connection.tgt.process;
      var sanitizedProcessB = processB.replace(/[^a-zA-Z0-9_]/, '_', 'g');
      var component2 = processes[processB].component.replace(/ /, '_', 'g');
      var memberTypes2 = makeNameTypeMap(component2);
      var metadata2 = stringifyMetadata(metadata[processB], memberTypes2);
      var portY = connection.tgt.port.toUpperCase();
      
      var detailA = detailDone[processA]?'':'(' + component1 + ((metadata1.length>0)?':'+metadata1:'') + ')';
      var detailB = detailDone[processB]?'':'(' + component2 + ((metadata2.length>0)?':'+metadata2:'') + ')';

      fbp += sanitizedProcessA + detailA + ' ' + portX +
             ' -> ' +
             portY + ' ' + sanitizedProcessB + detailB;

      var notLastConnection = (i < connections.length-1);
      if (notLastConnection) {
        fbp += '\n';
      }

      detailDone[processA] = true;
      detailDone[processB] = true;
    });

    return fbp;
  };

  var setLibrary = function (newLibrary) {
    library = newLibrary;
  };

  return {
    convert: convert,
    setLibrary: setLibrary
  };
});

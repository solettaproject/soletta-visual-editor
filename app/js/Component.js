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

  // find the alphabetically last item in array <arr> which regex matches
  // string <str>, then return the trailing digits on the matching item
  // as an integer
  // e.g. lastItem(['in1', 'in2', 'in3'], 'in') returns 3
  var getPortIndex = function (arr, str) {
    var pattern = new RegExp(str + '(\\d+)$');

    var indices = _.reduce(arr, function (memo, item) {
      if (item) {
        var matching = pattern.exec(item);

        if (matching) {
          memo.push(parseInt(matching[1], 10));
        }
      }

      return memo;
    }, []);

    if (indices.length > 0) {
      indices.sort(function (a, b) {
        return a - b;
      });

      return _.last(indices);
    }
    else {
      return 0;
    }
  };

  /**
   * Factory function to return representation of a component suitable
   * for adding as a node to a NoFlo graph element. All this
   * does is some sanity checking on an object to ensure it has
   * all required properties with appropriate values.
   *
   * @param {object} options    Options for the component.
   * @param {string} options.name
   * @param {object[]} [options.inports=[]]    input ports for the component,
   * in the format {type: '<type>', name: '<port name>'}
   * @param {object[]} [options.outports=[]]    Output ports for the
   * components, in the format {type: '<NoFlo type>', name: '<port name>'}
   *
   * @returns {object} component object in the format
   * {
   *   name: <name of component>,
   *   category: <category of component>,
   *   inports: [
   *     { name: <name>, type: <type>, required: <boolean>,
   *       max_connections: <integer> }, ...
   *   ],
   *   outports: [
   *     { name: <name>, type: <type>, required: <boolean>,
   *        max_connections: <integer> }, ...
   *   ],
   *   members: [
   *     {
   *       type: "boolean",
   *       default: false,
   *       description: "the initial state, defaults to false.",
   *       name: "initial_state",
   *       required: false
   *     }
   *   ]
   * }
   */
  var Component = function (options) {
    options = options || {};
    options.inports = options.inports || [];
    options.outports = options.outports || [];
    options.members = options.members || [];

    if (!_.isString(options.name) || options.name === '') {
      throw new Error('Component must be instantiated with options.name [string]');
    }

    if (!_.isString(options.description)) {
      throw new Error('Component must be instantiated with options.description [string]');
    }

    if (!_.isString(options.category) || options.category === '') {
      throw new Error('Component must be instantiated with options.category [string]');
    }

    if (!_.isArray(options.inports)) {
      throw new Error('Component must be instantiated with options.inports [array]');
    }

    if (!_.isArray(options.outports)) {
      throw new Error('Component must be instantiated with options.outports [array]');
    }

    this.name = options.name;
    this.description = options.description;
    this.category = options.category;
    this.inports = options.inports;
    this.outports = options.outports;
    this.members = options.members;
  };

  /**
   * Return default member variable values for this component.
   *
   * @returns {object} Name/value pairs mapping from member variable
   * name to default value; note that the value for an int or float
   * is an object with max, min, step and val properties
   */
  Component.prototype.getDefaultMembers = function () {
    var members = {};

    if (this.members) {
      _.each(this.members, function (member) {
        var isUndefinedString = (member.type === 'string' && member.default === undefined);
        members[member.name] = isUndefinedString?'':member.default;
      });
    }

    return members;
  };

  /**
   * @returns {boolean} true if the Component has at least one member,
   * or false otherwise.
   */
  Component.prototype.hasMembers = function () {
    return this.members.length > 0;
  };

  /**
   * Convert a Soletta component into an object suitable for
   * adding to a NoFlo graph.
   *
   * @param {object} solComponent    Component from a Soletta system with
   * this structure:
   *
   {
     "author": null,
     "category": "logical/boolean",
     "description": "Receives an empty packet and toggle the boolean output.",
     "in_ports": [
      {
       "data_type": "any",
       "description": "Where to receive the toggle trigger",
       "name": "IN",
       "required": false
      }
     ],
     "license": null,
     "name": "boolean/toggle",
     "options": {
      "members": [
       {
        "data_type": "boolean",
        "default": false,
        "description": "the initial state, defaults to false.",
        "name": "initial_state",
        "required": false
       }
      ],
      "required": false,
      "version": 1
     },
     "out_ports": [
      {
       "data_type": "boolean",
       "description": null,
       "name": "OUT",
       "required": false
      }
     ],
     "url": "http://soletta.org/doc/latest/node_types/boolean/toggle.html",
     "version": null
   }

   * port names do not have to be unique
   *
   * @returns a Component object with name, required, inports,
   * outports properties which define a component suitable for adding
   * to a graph; see create()
   */
  var convertSolComponent = function (solComponent) {
    var inports = [];
    var outports = [];
    var members = [];
    solComponent.in_ports = solComponent.in_ports || [];
    solComponent.out_ports = solComponent.out_ports || [];

    var inPortCounter = getPortIndex(
      _.pluck(solComponent.in_ports, 'name'),
      'in'
    );

    var outPortCounter = getPortIndex(
      _.pluck(solComponent.out_ports, 'name'),
      'out'
    );

    var memberCounter = 0;
    if (solComponent.options && solComponent.options.members) {
      memberCounter = getPortIndex(
        _.pluck(solComponent.options.members, 'name'),
        'member'
      );
    }

    var port;
    var name;

    for (var i = 0; i < solComponent.in_ports.length; i++) {
      port = solComponent.in_ports[i];
      name = port.name || 'in' + (++inPortCounter);

      inports.push({
        name: name,
        type: port.data_type || 'any',
        required: !!port.required,
        description: port.description || '',
        max_connections: port.max_connections || 0
      });
    }

    for (i = 0; i < solComponent.out_ports.length; i++) {
      port = solComponent.out_ports[i];
      name = port.name || 'out' + (++outPortCounter);

      outports.push({
        name: name,
        type: port.data_type || 'any',
        required: !!port.required,
        description: port.description || '',
        max_connections: port.max_connections || 0
      });
    }

    if (solComponent.options && solComponent.options.members) {
      var member;
      for (i = 0; i < solComponent.options.members.length; i++) {
        member = solComponent.options.members[i];
        name = member.name || 'member' + (++memberCounter);

        var thisObj = {
          name: name,
          type: member.data_type,
          required: !!member.required,
          'default': member['default'],
          description: member.description || ''
        };

        members.push(thisObj);
      }
    }

    var options = {
      name: solComponent.name,
      description: solComponent.description || '',
      category: solComponent.category,
      inports: inports,
      outports: outports
    };

    if (members.length > 0) {
      options.members = members;
    }

    return new Component(options);
  };

  return {
    create: function (options) {
      return new Component(options);
    },
    convertSolComponent: convertSolComponent
  };
});

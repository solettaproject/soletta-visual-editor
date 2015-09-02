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

  // remove objects from arr with a name property matching one of
  // the values in names
  var removeItemsWithNames = function (arr, names) {
    _.remove(arr, function (item) {
      var shouldRemove = false;

      for (var j = 0; j < names.length; j++) {
        if (names[j] === item.name) {
          shouldRemove = true;
          break;
        }
      }

      return shouldRemove;
    });
  };

  /**
   * Library to store and sort objects, where those objects have
   * unique names.
   */
  var NamedObjectLibrary = function () {
    if (!(this instanceof NamedObjectLibrary)) {
      return new NamedObjectLibrary();
    }

    this.reset();
  };

  NamedObjectLibrary.prototype.reset = function () {
    // map from names to objects, for fast lookup; this is also
    // used by the NoFlo graph as its library (see main.js)
    this.map = {};

    // objects maintained in name sort order
    this.content = [];
  };

  /**
   * Sort objects by name.
   */
  NamedObjectLibrary.prototype.sort = function () {
    this.content.sort(function (a, b) {
      if (a.name < b.name) {
        return -1;
      }
      else if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  };

  /**
   * Add objects to the library. If any objects with the same
   * name already exist, they are overwritten.
   *
   * @param {object|object[]} objs    Object(s) to add; each should
   * have a "name" property as a minimum
   */
  NamedObjectLibrary.prototype.add = function (objs) {
    if (!_.isArray(objs)) {
      objs = [objs];
    }

    // names of objects to remove
    var toRemove = [];

    // objects to add
    var toAdd = [];

    for (var i = 0; i < objs.length; i++) {
      var obj = objs[i];

      if (this.map[obj.name]) {
        toRemove.push(name);
      }

      this.map[obj.name] = obj;

      toAdd.push(obj);
    }

    removeItemsWithNames(this.content, toRemove);

    for (i = 0; i < toAdd.length; i++) {
      this.content.push(toAdd[i]);
    }

    this.sort();
  };

  /**
   * Remove objects from the library which match the names
   * of <objs>.
   *
   * @param {object|object[]} objs    Object(s) to remove
   */
  NamedObjectLibrary.prototype.remove = function (objs) {
    if (!_.isArray(objs)) {
      objs = [objs];
    }

    var toRemove = [];

    for (var i = 0; i < objs.length; i++) {
      var obj = objs[i];

      if (this.map[obj.name]) {
        delete this.map[obj.name];
      }

      toRemove.push(obj.name);
    }

    removeItemsWithNames(this.content, toRemove);

    this.sort();
  };

  /**
   * Get the object with name matching <name>. If the object
   * doesn't exist, returns undefined.
   *
   * @param {string} name    Name of object to retrieve
   * @returns {object|undefined} Object with matching name or undefined
   */
  NamedObjectLibrary.prototype.get = function (name) {
    return this.map[name];
  };

  /**
   * Get objects which return true for a given function.
   */
  NamedObjectLibrary.prototype.getMatching = function (fn) {
    return _.select(this.content, fn);
  };

  /**
   * Get all objects.
   *
   * @returns [objects] Array of object
   */
  NamedObjectLibrary.prototype.getAll = function () {
    return this.content;
  };

  return NamedObjectLibrary;
});

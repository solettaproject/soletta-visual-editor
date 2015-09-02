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
define(['ComponentGroupArray'], function (ComponentGroupArray) {
  'use strict';

  /**
   * ComponentGrouper which groups the Components in a ComponentLibrary
   * according to their category.
   */
  var ComponentCategoryGrouper = function (options) {
    if (!(this instanceof ComponentCategoryGrouper)) {
      return new ComponentCategoryGrouper(options);
    }

    options = options || {};

    if (!options.library) {
      throw new Error('ComponentCategoryGrouper must be instantiated with ' +
                      'options.library');
    }

    this.library = options.library;
  };

  /**
   * Group components in this grouper's library by category.
   *
   * @returns {ComponentGroupArray} sorted by category
   */
  ComponentCategoryGrouper.prototype.group = function () {
    // map from groupNames to arrays of components
    var result = {};
    var components = this.library.content;

    var component;
    var category;
    for (var i = 0; i < components.length; i++) {
      component = components[i];
      category = component.category || 'unknown';

      if (!result[category]) {
        result[category] = [];
      }

      result[category].push(component);
    }

    return ComponentGroupArray.create(result);
  };

  return ComponentCategoryGrouper;
});

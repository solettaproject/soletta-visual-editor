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
define(['ComponentGroupArray', 'lodash'], function (ComponentGroupArray, _) {
  'use strict';

  /**
   * Component grouper which divides components into two groups:
   * 1. Components with the same ports and category as the
   * "target" Component
   * 2. Components with the same ports as the "target" component
   * but in a different category
   */
  var ComponentSimilarGrouper = function (options) {
    if (!(this instanceof ComponentSimilarGrouper)) {
      return new ComponentSimilarGrouper(options);
    }

    options = options || {};

    if (!options.library) {
      throw new Error('ComponentSimilarGrouper must be instantiated with ' +
                      'options.library');
    }

    this.library = options.library;

    // Component to compare against
    this.target = null;
  };

  // group names, used to create headings in the slv-component-select
  ComponentSimilarGrouper.PORTS_AND_CATEGORY = 'Matching ports and category';
  ComponentSimilarGrouper.PORTS = 'Matching ports';

  /**
   * Set the target component. Calling group() will then select
   * components from the library which have inports and
   * outports matching those of the target.
   *
   * @param {Component|string} target    Target to use for filtering the
   * library; if a string, it's assumed to be the component name
   */
  ComponentSimilarGrouper.prototype.setTarget = function (target) {
    if (_.isString(target)) {
      this.target = this.library.get(target);
    }
    else {
      this.target = target;
    }
  };

  /**
   * Return components matching the ports of the this.target (a Component)
   * in "same ports + category" and "same ports" groups.
   *
   * @returns {object[]} ComponentGroupArray
   */
  ComponentSimilarGrouper.prototype.group = function () {
    if (!this.target) {
      return [];
    }

    var portsAndCategory = ComponentSimilarGrouper.PORTS_AND_CATEGORY;
    var ports = ComponentSimilarGrouper.PORTS;

    // map from groupNames to arrays of components
    var result = {};
    result[portsAndCategory] = [];
    result[ports] = [];

    var matchingComponents = this.library.findMatchingComponents(this.target);
    var targetCategory = this.target.category;

    var component;
    for (var i = 0; i < matchingComponents.length; i++) {
      component = matchingComponents[i];
      if (component.category === targetCategory) {
        result[portsAndCategory].push(component);
      }
      else {
        result[ports].push(component);
      }
    }

    var keepOriginalSort = true;
    return ComponentGroupArray.create(result, keepOriginalSort);
  };

  return ComponentSimilarGrouper;
});

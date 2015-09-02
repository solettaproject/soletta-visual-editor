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
   * Create an array of component groups from a map of group
   * names to items in that group with optional sort by group name.
   *
   * @param {object} componentMap    Map from group names to items
   * { 'group1': [item1, item2], 'group2': [item3, item4], ...}
   * @param {boolean} [keepOriginalSort=false]    If false, the output
   * is sorted alphabetically by group name; if false, the ordering in
   * componentMap is maintained.
   *
   * @returns {object[]} Array of groups in format
   * {groupName: <category>, items: [<item>, ...]
   */
  var create = function (componentMap, keepOriginalSort) {
    var groups = _.reduce(componentMap, function (memo, items, groupName) {
      var sortedItems = _.sortBy(items, function (item) {
        return item.name;
      });

      memo.push({
        groupName: groupName,
        items: sortedItems
      });

      return memo;
    }, []);

    if (!keepOriginalSort) {
      groups = _.sortBy(groups, function (group) {
        return group.groupName;
      });
    }

    return groups;
  };

  return {
    create: create
  };
});

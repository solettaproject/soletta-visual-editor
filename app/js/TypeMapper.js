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

  var returnString = function (string) {
    return string;
  };

  var SOL_TYPES = {
    'blob': function (string) {
      return new Blob(string);
    },
    'boolean': function (string) {
      var value;
      if (string === 'true') {
        value = true;
      } else
      if (string === 'false') {
        value = false;
      } else {
        console.warn('unknown boolean string');
        value = string;
      }

      return value;
    },
    'float': function (string) {
      return parseFloat(string);
    },
    'int': function (string) {
      return parseInt(string,10);
    },
    'string': function (string) {
      var value = string;
      // remove quotes from beginning and end of string
      value = value.replace(/^"/, '');
      value = value.replace(/"$/, '');
      // unescape quotes
      value = value.replace(/\\"/g, '"');

      return value;
    },
    'any': returnString,
    'byte': returnString,
    'empty': returnString,
    'rgb': returnString,
    'error': returnString,
  };

  var convertType = function (string, type) {
    var value;

    if (string !== 'undefined') {
      if (SOL_TYPES[type]) {
        value = SOL_TYPES[type](string);
      } else {
        // don't know this type so assume it is a string
        value = string;
      }
    } else {
      value = undefined;
    }

    return value;
  };

  // export type map
  var solTypesMap = _.reduce(Object.keys(SOL_TYPES), function (memo, solType) {
    memo[solType] = solType;
    return memo;
  }, {});

  return {
    SOL_TYPES: solTypesMap,
    SOL_TYPES_ARRAY: Object.keys(SOL_TYPES),
    convertType: convertType
  };
});


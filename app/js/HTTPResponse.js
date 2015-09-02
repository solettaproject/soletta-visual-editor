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
   * Factory function to return HTTP response object with all
   * required properties; if any properties are missing from
   * options, an exception is thrown. This is to enforce the response
   * API to make sure we don't break it.
   *
   * @param {object} options    Options for the response.
   * @param {any} options.body    HTTP response body
   * @param {integer} options.statusCode    HTTP status code
   * @returns {object} response object
   */
  return function (options) {
    options = options || {};

    if (options.body === null || options.body === undefined) {
      throw new Error('HTTPResponse must be instantiated with options.body');
    }

    if (!_.isNumber(options.statusCode)) {
      throw new Error('HTTPResponse must be instantiated with options.statusCode [number]');
    }

    return {
      body: options.body,
      statusCode: options.statusCode
    };
  };
});

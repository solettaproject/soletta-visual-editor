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
define(['q', 'HTTPResponse'], function (Q, HTTPResponse) {
  'use strict';

  /**
   * Wrapper round someone else's HTTP client implementation,
   * so we can adapt its API to suit what we need.
   *
   * @param {object} options    Options for the client
   * @param {function} [options.XMLHttpRequest=XMLHttpRequest]    XML
   * HTTP request implementation to use; defaults to the native
   * XMLHttpRequest
   */
  var HTTPClient = function (options) {
    options = options || {};
    this.createXMLHttpRequest = function () {
      var Impl = options.XMLHttpRequest;
      if (!Impl && typeof XMLHttpRequest !== 'undefined') {
        Impl = XMLHttpRequest;
      }
      return new Impl();
    };
  };

  /**
   * Fetch a URL and convert it into a response object with our desired
   * properties.
   *
   * @param {string} url    URL to GET
   * @returns {Promise} Q-compatible promise which either rejects
   * with an Error or resolves to an HTTPResponse object.
   */
  HTTPClient.prototype.get = function (url) {
    var dfd = Q.defer();

    try {
      var req = this.createXMLHttpRequest();

      req.onreadystatechange = function () {
        if (req.readyState === 4) {
          // status is 0 for file:// URI requests
          if (req.status === 200 || req.status === 0) {
            var response = HTTPResponse({
              body: req.responseText,
              statusCode: req.status
            });

            dfd.resolve(response);
          }
          else {
            dfd.reject(new Error('bad reponse code (not 0 or 200): ' +
                                 req.status));
          }
        }
      };

      req.open('GET', url, true);
      req.send();
    }
    catch (err) {
      dfd.reject(err);
    }

    return dfd.promise;
  };

  return function (options) {
    return new HTTPClient(options);
  };
});

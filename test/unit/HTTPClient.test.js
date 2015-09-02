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
// test framework
var chai = require('chai');
chai.should();
var expect = chai.expect;
var sinon = require('sinon');

var path = require('path');
var fs = require('fs');

// use requirejs to load modules from the app
var System = require('../systemjs-with-paths');

describe('HTTPClient', function () {
  var httpClient;

  // set the behaviour of the XMLHttpRequest stub
  var XMLHttpRequestOptions = {
    // modify this to replace the status code
    defaultStatusCode: 0,

    // modify this to change how responses are handled
    send: function (req) {
      req.responseText = fs.readFileSync(req.url, 'utf-8');
      req.status = this.defaultStatusCode;
      req.readyState = 4;
      req.onreadystatechange();
    }
  };

  // stub for XMLHttpRequest which reads files from the filesystem
  var XMLHttpRequest = function () {
    var req = {};

    req.open = function (method, url) {
      req.url = url.replace('file://', '');
    };

    req.send = function () {
      XMLHttpRequestOptions.send(req);
    };

    return req;
  };

  // test JSON file
  var testFilePath = path.join(
    __dirname,
    'data',
    'httpclient-test-file.json'
  );

  beforeEach(function (done) {
    System.import('HTTPClient').then(function (HTTPClient) {
      httpClient = HTTPClient({XMLHttpRequest: XMLHttpRequest});
      done();
    });
  });

  it('should fetch files by URL', function (done) {
    var expected = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));

    var promise = httpClient.get('file://' + testFilePath);

    promise.then(
      function (response) {
        JSON.parse(response.body).should.eql(expected);
        response.statusCode.should.equal(0);
        done();
      },

      done
    )
    .catch(done);
  });

  it('should fail gracefully if response is an error', function (done) {
    var oldSend = XMLHttpRequestOptions.send;

    var reset = function (err) {
      XMLHttpRequestOptions.send = oldSend;
      done(err);
    };

    XMLHttpRequestOptions.send = function (req) {
      req.status = 404;
      req.readyState = 4;
      req.onreadystatechange();
    };

    var promise = httpClient.get('file://' + testFilePath);

    promise.then(
      function (response) {
        reset(new Error('promise should not resolve'));
      },

      function (err) {
        err.message.should.match(/bad reponse code/);
        reset();
      }
    )
    .catch(reset);
  });

});

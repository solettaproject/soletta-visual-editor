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

// use requirejs to load modules from the app
var System = require('../systemjs-with-paths');

// tests
describe('HTTPResponse', function () {
  var HTTPResponse;

  beforeEach(function (done) {
    System.import('HTTPResponse').then(function (HR) {
      HTTPResponse = HR;
      done();
    });
  });

  it('should throw an error if options.body is not set', function () {
    var fn = function () { return HTTPResponse({}); };
    expect(fn).to.throw(Error, 'must be instantiated with options.body');
  });

  it('should throw an error if options.body is null or undefined', function () {
    var fn = function () { return HTTPResponse({body: null}); };
    expect(fn).to.throw(Error, 'must be instantiated with options.body');

    fn = function () { return HTTPResponse({body: undefined}); };
    expect(fn).to.throw(Error, 'must be instantiated with options.body');
  });

  it('should throw an error if options.statusCode is not defined', function () {
    var fn = function () { return HTTPResponse({body: ''}); };
    expect(fn).to.throw(Error, 'must be instantiated with options.statusCode');
  });

  it('should throw an error if options.statusCode is not a number', function () {
    var fn = function () { return HTTPResponse({body: '', statusCode: 'X'}); };
    expect(fn).to.throw(Error, 'must be instantiated with options.statusCode');
  });

  it('should return an object if all options are correct', function () {
    // NB HTTPResponse just mirrors the object you put in, but
    // throws an error if any required options are missing or have
    // the wrong type
    var expected = {
      body: '',
      statusCode: 200
    };

    HTTPResponse(expected).should.eql(expected);
  });

});

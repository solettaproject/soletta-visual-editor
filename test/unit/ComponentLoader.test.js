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
var fs = require('fs');
var path = require('path');

// test framework
var sinon = require('sinon');
var chai = require('chai');
chai.should();
var expect = chai.expect;

// use requirejs to load modules from the app
var System = require('../systemjs-with-paths');

// tests
describe('ComponentLoader', function () {
  var Q;
  var ComponentLoader;
  var componentLoader;
  var stubFileReader;
  var stubHTTPClient;

  var jsonFilePath = path.join(__dirname, 'data', 'da-components.json');
  var jsonFileContent = fs.readFileSync(jsonFilePath, 'utf-8');

  // this should match the parsed content of the file at jsonFilePath
  var expected;

  beforeEach(function (done) {
    Promise.all([
      System.import('ComponentLoader'),
      System.import('Component'),
      System.import('q')
    ])
    .then(function (imports) {
      ComponentLoader = imports[0];
      Component = imports[1];
      Q = imports[2];

      expected = [
        Component.create({
          'name': 'udev/boolean',
          'category': 'output/sw',
          'description': 'Provides boolean packets after a device attach or dettach',
          'inports': [],
          'outports': [
            {
              'name': 'out1',
              'type': 'boolean',
              'description': 'A boolean packet when udev changes. If it\'s attached true, otherwise false.',
              'required': false,
              'max_connections': 0
            }
          ],
          'members': [
            {
              'name': 'address',
              'description': 'The device\'s syspath that should be monitored',
              'type': 'string',
              'required': true,
              'default': null
            }
          ]
        }),

        Component.create({
          'name': 'boolean/and',
          'category': 'logical/boolean',
          'description': 'Boolean And',
          'inports': [
            {
              'name': 'in1',
              'type': 'boolean',
              'description': 'First port of AND operation.',
              'required': false,
              'max_connections': 0
            },
            {
              'name': 'in2',
              'type': 'boolean',
              'description': 'Second port of AND operation.',
              'required': false,
              'max_connections': 0
            }
          ],
          'outports': [
            {
              'name': 'out1',
              'type': 'boolean',
              'description': 'True if both in0 and in1 are true.',
              'required': false,
              'max_connections': 0
            }
          ]
        })
      ];

      // stub HTTP client
      stubHTTPClient = { get: sinon.stub() };

      // stub FileReader
      stubFileReader = { readAsText: null };

      componentLoader = ComponentLoader({
        httpClient: stubHTTPClient,
        fileReader: stubFileReader
      });

      done();
    });
  });

  it('should send an error signal if HTTP response status code is not 200 or 0', function (done) {
    stubHTTPClient.get.returns(Q.reject(new Error('bad status code')));

    componentLoader.signals.error.add(function (err) {
      err.message.should.match(/bad status code/);
      done();
    });

    componentLoader.loadJSON('da-components.json');
  });

  it('should send a newComponents signal if HTTP GET was successful', function (done) {
    stubHTTPClient.get.returns(Q.resolve({
      body: jsonFileContent,
      statusCode: 200
    }));

    componentLoader.signals.error.add(done);

    componentLoader.signals.newComponents.add(function (components) {
      components.should.eql(expected);
      done();
    });

    componentLoader.loadJSON('da-components.json');
  });

  it('should send an error signal if reading from File fails', function (done) {
    // mimic a failed read from a file
    stubFileReader.readAsText = function () {
      stubFileReader.onerror(new Error('bad file read'));
    };

    componentLoader.signals.error.add(function (err) {
      err.message.should.equal('bad file read');
      done();
    });

    componentLoader.signals.newComponents.add(function (components) {
      done(new Error('newComponents signal should not be dispatched'));
    });

    componentLoader.loadJSON({});
  });

  it('should read JSON from a File object', function (done) {
    // mimic a successful read from a file
    stubFileReader.readAsText = function () {
      stubFileReader.onload({
        target: {
          result: jsonFileContent
        }
      });
    };

    componentLoader.signals.error.add(done);

    componentLoader.signals.newComponents.add(function (components) {
      components.should.eql(expected);
      done();
    });

    componentLoader.loadJSON({});
  });

});

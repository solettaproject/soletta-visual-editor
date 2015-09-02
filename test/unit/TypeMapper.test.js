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

var tests = [

  {
    assertion: 'should convert positive integer string into an int',
    input: {
      'string': '1',
      'type': 'int'
    },
    output: 1
  },

  {
    assertion: 'should convert a negative integer string into an int',
    input: {
      'string': '-1',
      'type': 'int'
    },
    output: -1
  },

  {
    assertion: 'should convert a positive float string into a float',
    input: {
      'string': '3.1415',
      'type': 'float'
    },
    output: 3.1415
  },

  {
    assertion: 'should convert a negative float string into a float',
    input: {
      'string': '-3.1415',
      'type': 'float'
    },
    output: -3.1415
  },

  {
    assertion: 'should convert a true boolean string into a boolean true',
    input: {
      'string': 'true',
      'type': 'boolean'
    },
    output: true
  },

  {
    assertion: 'should convert a false boolean string into a boolean false',
    input: {
      'string': 'false',
      'type': 'boolean'
    },
    output: false
  },

  {
    assertion: 'should convert a string into a string',
    input: {
      'string': 'test message',
      'type': 'string'
    },
    output: 'test message'
  },

  {
    assertion: 'should convert an empty string into an empty string',
    input: {
      'string': '',
      'type': 'string'
    },
    output: ''
  },

  {
    assertion: 'should convert a byte into a string',
    input: {
      'string': 'x',
      'type': 'byte'
    },
    output: 'x'
  },

  {
    assertion: 'should convert type empty into a string',
    input: {
      'string': '???',
      'type': 'empty'
    },
    output: '???'
  },

  {
    assertion: 'should convert type any into a string',
    input: {
      'string': 'no idea what this is about',
      'type': 'any'
    },
    output: 'no idea what this is about'
  },

  {
    assertion: 'should handle "undefined" string',
    input: {
      'string': 'undefined',
      'type': 'int'
    },
    output: undefined
  },

  {
    assertion: 'should handle bad type',
    input: {
      'string': 'infinity',
      'type': 'bold'
    },
    output: 'infinity'
  },

  {
    assertion: 'should handle bad boolean',
    input: {
      'string': 'falsy',
      'type': 'boolean'
    },
    output: 'falsy'
  },

  /* node can't do Blobs
  {
    assertion: 'blob',
    input: {
      'string': '<a id="a"><b id="b">hey!</b></a>',
      'type': 'blob'
    },
    output: '???'
  },
  */

];

describe('TypeMapper', function () {
  var typeMapper;

  var toJSON = function(string) {
  };

  beforeEach(function (done) {
    System.import('TypeMapper').then(function (TypeMapper) {
      typeMapper = TypeMapper;
      done();
    });
  });

  var runTest = function (index) {
    var input = tests[index].input;
    var expected = tests[index].output;

    var actual = typeMapper.convertType(input.string, input.type);
    expect(actual).to.eql(expected);
  };

  tests.forEach(function (test, i) {
    it(test.assertion, function () {
      runTest(i);
    });
  });

});

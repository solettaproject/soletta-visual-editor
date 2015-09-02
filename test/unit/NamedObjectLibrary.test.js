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

describe('NamedObjectLibrary', function () {

  var library;

  var obj1 = {
    name: 'clarence',
    age: 21
  };

  var obj2 = {
    name: 'bert',
    age: 25
  };

  var obj3 = {
    name: 'alfie',
    age: 1
  };

  var obj4 = {
    name: 'delilah',
    age: 2
  };

  beforeEach(function (done) {
    System.import('NamedObjectLibrary').then(function (NamedObjectLibrary) {
      library = NamedObjectLibrary();
      done();
    });
  });

  it('should enable objects to be added while maintaining order', function () {
    library.add(obj1);
    library.add(obj2);

    library.content.should.eql([obj2, obj1]);

    library.add([obj3, obj4]);

    library.content.should.eql([obj3, obj2, obj1, obj4]);
  });

  it('should enable objects to be removed while maintaining order', function () {
    library.add(obj1);
    library.add(obj2);
    library.add(obj3);

    library.remove(obj1);

    library.content.should.eql([obj3, obj2]);

    // obj4 has not been added
    library.remove(obj4);

    library.content.should.eql([obj3, obj2]);

    library.add(obj4);

    library.remove([obj3, obj4]);

    library.content.should.eql([obj2]);
  });

  it('should enable objects to be retrieved by name', function () {
    library.add(obj1);
    library.add(obj2);
    library.get(obj1.name).should.equal(obj1);
  });

  it('should return undefined if asked to retrieve a non-existent name', function () {
    expect(library.get(obj3.name)).to.be.undefined;
  });

});

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

// use requirejs to load modules from the app
var System = require('../systemjs-with-paths');

// class under test
describe('FactoryDecorator', function () {
  var FactoryDecorator;
  var factoryDecorator;

  // stub to wrap with the FactoryDecorator
  var stubTheGraph = {
    factories: {
      node: {
        createNodePort: function () {}
      },

      port: {
        createPortInnerCircle: function () {}
      },

      menu: {
        createMenuSlice: function () {}
      }
    }
  };

  var stubLibrary = {
    'boolean-and': {
      name: 'boolean/and',
      inports: [
        {name: 'bain1', required: true},
        {name: 'bain2', required: false}
      ],
      outports: []
    },

    'boolean-or': {
      name: 'boolean/or',
      inports: [
        {name: 'boin1', required: false},
        {name: 'boin2', required: false}
      ],
      outports: []
    }
  };

  beforeEach(function (done) {
    System.import('FactoryDecorator').then(function (FD) {
      FactoryDecorator = FD;

      // ensure decorator is reset before each test
      factoryDecorator = null;

      done();
    });
  });

  it('should throw an error if setLibrary() is passed a falsy value', function () {
    factoryDecorator = FactoryDecorator({TheGraph: {}, graphQuery: {}});
    var fn = function () { factoryDecorator.setLibrary(); };
    fn.should.throw(/must not be falsy/);
    fn = function () { factoryDecorator.setLibrary(null); };
    fn.should.throw(/must not be falsy/);
    fn = function () { factoryDecorator.setLibrary(undefined); };
    fn.should.throw(/must not be falsy/);
  });

  it('should set library object if passed a valid value', function () {
    factoryDecorator = FactoryDecorator({TheGraph: {}, graphQuery: {}});
    factoryDecorator.setLibrary(stubLibrary);
    factoryDecorator.library.should.equal(stubLibrary);
  });

  it('should not decorate functions on TheGraph multiple times', function () {
    factoryDecorator = FactoryDecorator({
      TheGraph: stubTheGraph,
      graphQuery: {},
      library: stubLibrary
    });

    factoryDecorator.decorate();

    var wrappedNodePortOriginal = stubTheGraph.factories.node.createNodePort;
    var wrappedCreatePortInnerCircle = stubTheGraph.factories.port.createPortInnerCircle;

    factoryDecorator.decorate();

    stubTheGraph.factories.node.createNodePort.should.equal(wrappedNodePortOriginal);
    stubTheGraph.factories.port.createPortInnerCircle.should.equal(wrappedCreatePortInnerCircle);

  });

  it('should throw an error if decorating TheGraph with no library set', function () {
    factoryDecorator = FactoryDecorator({TheGraph: {}, graphQuery: {}});
    var fn = function () { factoryDecorator.decorate(); };
    fn.should.throw();
  });

  it('should wrap createPortInnerCircle() function on TheGraph', function () {
    var createPortInnerCircle = sinon.spy();
    stubTheGraph.factories.port.createPortInnerCircle = createPortInnerCircle;

    factoryDecorator = FactoryDecorator({
      TheGraph: stubTheGraph,
      graphQuery: {},
      library: stubLibrary
    });

    factoryDecorator.decorate();

    var thisObj = {
      props: {}
    };

    var options = { className: 'foo' };
    stubTheGraph.factories.port.createPortInnerCircle.call(thisObj, options);
    expect(createPortInnerCircle.calledWithExactly(options)).to.be.true;
    options.className.should.equal('foo');
  });
});

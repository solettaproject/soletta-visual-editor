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

var System = require('../systemjs-with-paths');

// tests
describe('Component', function () {

  var Component;

  beforeEach(function (done) {
    // class under test
    System.import('Component').then(function (C) {
      Component = C;
      done();
    });
  });

  it('should throw an error if options.name is not set', function () {
    var fn = function () {
      return Component.create();
    };

    expect(fn).to.throw('must be instantiated with options.name [string]');

    fn = function () {
      return Component.create({name: ''});
    };

    expect(fn).to.throw('must be instantiated with options.name [string]');
  });

  it('should not throw an error if options.inports is falsy', function () {
    var expected = Component.create({
      name: 'foo',
      description: '',
      category: 'bar',
      inports: [],
      outports: []
    });

    var actual = Component.create({name: 'foo', category: 'bar', description: '', inports: false});
    actual.should.eql(expected);

    actual = Component.create({name: 'foo', category: 'bar', description: ''});
    actual.should.eql(expected);

    actual = Component.create({name: 'foo', category: 'bar', description: '', inports: null});
    actual.should.eql(expected);
  });

  it('should not throw an error if options.outports is falsy', function () {
    var expected = Component.create({
      name: 'foo',
      category: 'bar',
      description: '',
      inports: [],
      outports: []
    });

    var actual = Component.create({name: 'foo', category: 'bar', description: '', outports: false});
    actual.should.eql(expected);

    actual = Component.create({name: 'foo', category: 'bar', description: '' });
    actual.should.eql(expected);

    actual = Component.create({name: 'foo', category: 'bar', description: '', outports: null});
    actual.should.eql(expected);
  });

  it('should throw an error if options.inports is not an array', function () {
    var fn = function () {
      return Component.create({name: 'foo', category: 'bar', description: '', inports: 'hello'});
    };

    expect(fn).to.throw('must be instantiated with options.inports [array]');
  });

  it('should throw an error if options.outports is not an array', function () {
    var fn = function () {
      return Component.create({name: 'foo', category: 'bar', description: '', outports: {}});
    };

    expect(fn).to.throw('must be instantiated with options.outports [array]');
  });

  it('should convert Soletta components', function () {
    var solComponent = {
      name: 'booleydooley',
      category: 'bar',
      description: 'foo',

      options: {
        members: [
          {
            name: 'namedMember1',
            default: null,
            data_type: 'string',
            required: true
          }
        ]
      },

      in_ports: [
        {
          name: 'namedIn1',
          data_type: 'int'
        },

        {
          name: null,
          data_type: 'boolean',
          description: 'foo'
        }
      ],

      out_ports: [
        {
          name: 'namedOut1',
          data_type: 'int'
        },

        {
          name: null,
          data_type: 'boolean',
          description: 'bar'
        }
      ]
    };

    var expected = {
      name: 'booleydooley',
      category: 'bar',
      description: 'foo',

      inports: [
        {
          name: 'namedIn1',
          type: 'int',
          required: false,
          description: '',
          array_size: 0
        },

        {
          name: 'in1',
          type: 'boolean',
          required: false,
          description: 'foo',
          array_size: 0
        }
      ],

      outports: [
        {
          name: 'namedOut1',
          type: 'int',
          description: '',
          required: false,
          array_size: 0
        },

        {
          name: 'out1',
          type: 'boolean',
          description: 'bar',
          required: false,
          array_size: 0
        }
      ],

      members: [
        {
          name: 'namedMember1',
          type: 'string',
          description: '',
          required: true,
          'default': null
        }
      ]
    };

    var actual = Component.convertSolComponent(solComponent);
    actual.name.should.eql(expected.name);
    actual.category.should.eql(expected.category);
    actual.inports.should.eql(expected.inports);
    actual.outports.should.eql(expected.outports);
    actual.members.should.eql(expected.members);
    _.keys(actual).sort().should.eql(_.keys(expected).sort());
  });

  it('should generate port names which don\'t overlap existing ones', function () {
    var solComponent = {
      name: 'booleydooley',
      category: 'bar',
      description: 'foo',

      in_ports: [
        {
          name: 'in14',
          data_type: 'int'
        },

        {
          name: 'in11',
          data_type: 'boolean'
        },

        {
          name: 'in3',
          data_type: 'boolean'
        },

        {
          data_type: 'int'
        }
      ],

      out_ports: []
    };

    var expected = {
      name: 'booleydooley',
      category: 'bar',
      description: 'foo',
      members: [],

      inports: [
        {
          name: 'in14',
          type: 'int',
          description: '',
          required: false,
          array_size: 0
        },

        {
          name: 'in11',
          type: 'boolean',
          description: '',
          required: false,
          array_size: 0
        },

        {
          name: 'in3',
          type: 'boolean',
          description: '',
          required: false,
          array_size: 0
        },

        {
          name: 'in15',
          type: 'int',
          description: '',
          required: false,
          array_size: 0
        }
      ],

      outports: []
    };

    var actual = Component.convertSolComponent(solComponent);
    actual.name.should.eql(expected.name);
    actual.category.should.eql(expected.category);
    actual.inports.should.eql(expected.inports);
    actual.outports.should.eql(expected.outports);
    _.keys(actual).sort().should.eql(_.keys(expected).sort());
  });

  it('should add a required property to ports', function () {
    var solComponent = {
      name: 'requiredports',
      category: 'bar',

      in_ports: [
        {
          name: 'in1',
          data_type: 'int',
          required: true
        },

        // should default to false
        {
          name: 'in2',
          data_type: 'boolean'
        },

        {
          name: 'in3',
          data_type: 'boolean',
          required: false
        }
      ],

      out_ports: [
        {
          name: 'out1',
          data_type: 'int',
          required: true
        },

        // should default to false
        {
          name: 'out2',
          data_type: 'boolean'
        },

        {
          name: 'out3',
          data_type: 'boolean',
          required: false
        }
      ]
    };

    var expected = {
      name: 'requiredports',
      category: 'bar',
      description: '',
      members: [],

      inports: [
        {
          name: 'in1',
          type: 'int',
          description: '',
          required: true,
          array_size: 0
        },

        {
          name: 'in2',
          type: 'boolean',
          description: '',
          required: false,
          array_size: 0
        },

        {
          name: 'in3',
          type: 'boolean',
          description: '',
          required: false,
          array_size: 0
        }
      ],

      outports: [
        {
          name: 'out1',
          type: 'int',
          description: '',
          required: true,
          array_size: 0
        },

        {
          name: 'out2',
          type: 'boolean',
          description: '',
          required: false,
          array_size: 0
        },

        {
          name: 'out3',
          type: 'boolean',
          description: '',
          required: false,
          array_size: 0
        }
      ]
    };

    var actual = Component.convertSolComponent(solComponent);
    actual.name.should.eql(expected.name);
    actual.category.should.eql(expected.category);
    actual.inports.should.eql(expected.inports);
    actual.outports.should.eql(expected.outports);
    _.keys(actual).sort().should.eql(_.keys(expected).sort());
  });

  it('should respect array_size property on ports, defaulting to 0', function () {
    var solComponent = {
      name: 'arrysz',
      category: 'bar',
      description: 'goo',

      in_ports: [
        {
          name: 'in1',
          data_type: 'int',
          required: true,
          array_size: 1
        },

        {
          name: 'in2',
          data_type: 'boolean',
          required: false
          // array_size should be 0
        }
      ],

      out_ports: [
        {
          name: 'out1',
          data_type: 'int',
          required: true,
          array_size: 2
        },

        {
          name: 'out2',
          data_type: 'boolean',
          required: false,
          // array_size should be 0
        }
      ]
    };

    var expected = {
      name: 'arrysz',
      category: 'bar',
      description: 'goo',
      members: [],

      inports: [
        {
          name: 'in1',
          type: 'int',
          description: '',
          required: true,
          array_size: 1
        },

        {
          name: 'in2',
          type: 'boolean',
          description: '',
          required: false,
          array_size: 0
        }
      ],

      outports: [
        {
          name: 'out1',
          type: 'int',
          description: '',
          required: true,
          array_size: 2
        },

        {
          name: 'out2',
          type: 'boolean',
          description: '',
          required: false,
          array_size: 0
        }
      ]
    };

    var actual = Component.convertSolComponent(solComponent);
    actual.name.should.eql(expected.name);
    actual.category.should.eql(expected.category);
    actual.inports.should.eql(expected.inports);
    actual.outports.should.eql(expected.outports);
    _.keys(actual).sort().should.eql(_.keys(expected).sort());
  });

});

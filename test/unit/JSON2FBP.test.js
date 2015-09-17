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
var parser = require('fbp');

var tests = [

  {
    assertion: 'should convert empty graph',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{},
      'connections':[]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [],
      'nodes': []
    },
    output: ''
  },

  {
    assertion: 'should convert single connection between two nodes',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'node1':{
          'component':'Irange Max',
          'metadata':{
            'label': 'node1'
          }
        },
        'node2':{
          'component':'console',
          'metadata':{
            'label': 'node2'
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'node1',
            'port':'out1'
          },
          'tgt':{
            'process':'node2',
            'port':'in1'
          },
          'metadata':{}
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'node1',
            'port': 'out1'
          },
          'to': {
            'process': 'node2',
            'port': 'in1'
          }
        }
      ],
      'nodes': [
        {
          'id': 'node1',
          'component': 'Irange Max',
          'metadata': {
            'label': 'node1',
            'x': 36,
            'y': 36,
            'width': 72,
            'height': 72
          }
        },
        {
          'id': 'node2',
          'component': 'console',
          'metadata': {
            'label': 'node2',
            'x': 36,
            'y': 36,
            'width': 72,
            'height': 72
          }
        }
      ]
    },
    output: 'node1(Irange_Max) OUT1 -> IN1 node2(console)'
  },

  {
    assertion: 'should convert graph with three nodes',
    json: {
    'properties': {},
    'inports': {},
    'outports': {},
    'groups': [],
    'processes': {
      'node5': {
        'component': 'wallclock/hour',
        'metadata': {
          'label': 'node5',
          'x': 36,
          'y': 36,
          'width': 72,
          'height': 72
        }
      },
      'node3_1': {
        'component': 'converter/empty-to-boolean',
        'metadata': {
          'label': 'node3',
          'output_value': {},
          'x': 144,
          'y': 36,
          'width': 72,
          'height': 72
        }
      },
      'node6': {
        'component': 'drange/equal',
        'metadata': {
          'label': 'node6',
          'x': 288,
          'y': 36,
          'width': 72,
          'height': 72
        }
      }
    },
    'connections': [
      {
        'src': {
          'process': 'node5',
          'port': 'OUT'
        },
        'tgt': {
          'process': 'node3_1',
          'port': 'IN'
        }
      },
      {
        'src': {
          'process': 'node3_1',
          'port': 'OUT'
        },
        'tgt': {
          'process': 'node6',
          'port': 'IN1'
        }
      }
    ]
  },
  input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'node5',
            'port': 'OUT'
          },
          'to': {
            'process': 'node3_1',
            'port': 'IN'
          }
        },
        {
          'from': {
            'process': 'node3_1',
            'port': 'OUT'
          },
          'to': {
            'process': 'node6',
            'port': 'IN1'
          }
        }
      ],
      'nodes': [
        {
          'id': 'node5',
          'component': 'wallclock/hour',
          'metadata': {
            'label': 'node5',
            'x': 36,
            'y': 36,
            'width': 72,
            'height': 72
          }
        },
        {
          'id': 'node3_1',
          'component': 'converter/empty-to-boolean',
          'metadata': {
            'label': 'node3',
            'output_value': {},
            'x': 144,
            'y': 36,
            'width': 72,
            'height': 72
          }
        },
        {
          'id': 'node6',
          'component': 'drange/equal',
          'metadata': {
            'label': 'node6',
            'x': 288,
            'y': 36,
            'width': 72,
            'height': 72
          }
        }
      ]
    },
    output: 'node5(wallclock/hour) OUT -> IN node3_1(converter/empty-to-boolean)\n'+
      'node3_1 OUT -> IN1 node6(drange/equal)'
  },

  {
    assertion: 'should convert graph with four nodes',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'node1':{
          'component':'wallclock/second',
          'metadata':{
            'label':'node1',
            'x':36,
            'y':180,
            'width':72,
            'height':72
          }
        },
        'node3':{
          'component':'Irange Max',
          'metadata':{
            'label':'node3',
            'x':144,
            'y':144,
            'width':72,
            'height':72
          }
        },
        'node4':{
          'component':'wallclock/minute',
          'metadata':{
            'label':'node4',
            'x':36,
            'y':36,
            'width':72,
            'height':72
          }
        },
        'node5':{
          'component':'console',
          'metadata':{
            'label':'node5',
            'x':288,
            'y':144,
            'width':72,
            'height':72
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'node3',
            'port':'out1'
          },
          'tgt':{
            'process':'node5',
            'port':'in1'
          },
          'metadata':{}
        },
        {
          'src':{
            'process':'node4',
            'port':'out1'
          },
          'tgt':{
            'process':'node3',
            'port':'in1'
          },
          'metadata':{}
        },
        {
          'src':{
            'process':'node1',
            'port':'out1'
          },
          'tgt':{
            'process':'node3',
            'port':'IN2'
          },
          'metadata':{}
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'node3',
            'port': 'out1'
          },
          'to': {
            'process': 'node5',
            'port': 'in1'
          }
        },
        {
          'from': {
            'process': 'node4',
            'port': 'out1'
          },
          'to': {
            'process': 'node3',
            'port': 'in1'
          }
        },
        {
          'from': {
            'process': 'node1',
            'port': 'out1'
          },
          'to': {
            'process': 'node3',
            'port': 'in2'
          }
        }
      ],
      'nodes': [
        {
          'id': 'node1',
          'component': 'wallclock/secon',
          'metadata': {
            'label': 'node1',
            'x': 36,
            'y': 36,
            'width': 72,
            'height': 72
          }
        },
        {
          'id': 'node3',
          'component': 'Irange Max',
          'metadata': {
            'label': 'node3',
            'x': 36,
            'y': 36,
            'width': 72,
            'height': 72
          }
        },
        {
          'id': 'node4',
          'component': 'wallclock/minute',
          'metadata': {
            'label': 'node4',
            'x': 144,
            'y': 36,
            'width': 72,
            'height': 72
          }
        },
        {
          'id': 'node5',
          'component': 'console',
          'metadata': {
            'label': 'node5',
            'x': 288,
            'y': 36,
            'width': 72,
            'height': 72
          }
        }
      ]
    },
    output:
      'node3(Irange_Max) OUT1 -> IN1 node5(console)\n' +
      'node4(wallclock/minute) OUT1 -> IN1 node3\n' +
      'node1(wallclock/second) OUT1 -> IN2 node3'
  },

  {
    assertion: 'should exclude member variables with undefined or empty string member variables',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'node1':{
          'component':'converter/boolean-to-byte',
          'metadata':{
            'false_value':undefined, // values not set by user
            'true_value':undefined
          }
        },
        'node2':{
          'component':'converter/boolean-to-byte',
          'metadata':{
            'false_value':'', // user doesn't enter anything, just 'save's them
            'true_value':''
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'node1',
            'port':'OUT'
          },
          'tgt':{
            'process':'node2',
            'port':'FALSE_VALUE'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'node1',
            'port': 'OUT'
          },
          'to': {
            'process': 'node2',
            'port': 'FALSE_VALUE'
          }
        }
      ],
      'nodes': [
        {
          'id': 'node1',
          'component': 'converter/boolean-to-byte',
          'metadata': {
            'false_value': undefined,
            'true_value': undefined
          }
        },
        {
          'id': 'node2',
          'component': 'converter/boolean-to-byte',
          'metadata': {
            'false_value': '',
            'true_value': ''
          }
        }
      ]
    },
    fbpInvalid: true, // don't check fbp because it's not valid fbp - quotes aren't valid fbp
    output:
      'node1(converter/boolean-to-byte) OUT -> FALSE_VALUE node2(converter/boolean-to-byte:false_value=,true_value=)'
  },

  {
    assertion: 'should exclude member variables with null metadata',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'node1':{
          'component':'converter/boolean-to-byte',
          'metadata':{
            'null_value':null
          }
        },
        'node2':{
          'component':'converter/boolean-to-byte',
          'metadata':{
            'false_value':null
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'node1',
            'port':'OUT'
          },
          'tgt':{
            'process':'node2',
            'port':'FALSE_VALUE'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'node1',
            'port': 'OUT'
          },
          'to': {
            'process': 'node2',
            'port': 'FALSE_VALUE'
          }
        }
      ],
      'nodes': [
        {
          'id': 'node1',
          'component': 'converter/boolean-to-byte',
          'metadata': {
            'false_value': null
          }
        },
        {
          'id': 'node2',
          'component': 'converter/boolean-to-byte',
          'metadata': {
            'false_value': null
          }
        }
      ]
    },
    output:
      'node1(converter/boolean-to-byte) OUT -> FALSE_VALUE node2(converter/boolean-to-byte)'
  },

  {
    assertion: 'should exclude member variables with null sub-metadata',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'node1':{
          'component':'converter/boolean-to-byte',
          'metadata':{
            // this is the bit being tested - null inside a metadata object
            // complete_value should not make it through to the output
            'complex_value': {
              'submeta': null
            }
          }
        },
        'node2':{
          'component':'converter/boolean-to-byte',
          'metadata':{
            'false_value':null
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'node1',
            'port':'OUT'
          },
          'tgt':{
            'process':'node2',
            'port':'FALSE_VALUE'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'node1',
            'port': 'OUT'
          },
          'to': {
            'process': 'node2',
            'port': 'FALSE_VALUE'
          }
        }
      ],
      'nodes': [
        {
          'id': 'node1',
          'component': 'converter/boolean-to-byte',
          'metadata': {
            'complex_value': {
              'submeta': null
            }
          }
        },
        {
          'id': 'node2',
          'component': 'converter/boolean-to-byte',
          'metadata': {
            'false_value': null
          }
        }
      ]
    },
    output:
      'node1(converter/boolean-to-byte) OUT -> FALSE_VALUE node2(converter/boolean-to-byte)'
  },

  {
    assertion: 'should convert member variables with integer, non-string metadata',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'node1':{
          'component':'constant/int',
          'metadata':{
            'label':'node1',
            'value':{
              'max':0,
              'min':0,
              'step':0,
              'val':0
            }
          }
        },
        'node3':{
          'component':'console',
          'metadata':{
            'label': 'node3',
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'node1',
            'port':'OUT'
          },
          'tgt':{
            'process':'node3',
            'port':'IN'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'node1',
            'port': 'OUT'
          },
          'to': {
            'process': 'node3',
            'port': 'IN'
          }
        }
      ],
      'nodes': [
        {
          'id': 'node1',
          'component': 'constant/int',
          'metadata': {
            'label':'node1',
            'value':{
              'max':0,
              'min':0,
              'step':0,
              'val':0
            }
          }
        },
        {
          'id': 'node3',
          'component': 'console',
          'metadata': {
            'label': 'node3',
          }
        }
      ]
    },
    fbpInvalid: true, // don't check fbp because it's not valid fbp - '|' is not valid fbp
    output:
      'node1(constant/int:value=max:0|min:0|step:0|val:0) OUT -> IN node3(console)'
  },

  {
    assertion: 'should convert member variables with string metadata',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'node1':{
          'component':'constant/string',
          'metadata':{
            'label':'node1'
          }
        },
        'node3':{
          'component':'console',
          'metadata':{
            'label': 'node3',
            'prefix': 'prefix',
            'suffix': '',
            'output_on_stdout': true,
            'flush': true
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'node1',
            'port':'OUT'
          },
          'tgt':{
            'process':'node3',
            'port':'IN'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'node1',
            'port': 'OUT'
          },
          'to': {
            'process': 'node3',
            'port': 'IN'
          }
        }
      ],
      'nodes': [
        {
          'id': 'node1',
          'component': 'constant/string',
          'metadata': {
            'label':'node1',
            'value':{
              'max':'was here'
            }
          }
        },
        {
          'id': 'node3',
          'component': 'console',
          'metadata': {
            'label': 'node3',
            'prefix': 'prefix',
            'suffix': '',
            'output_on_stdout': true,
            'flush': true
          }
        }
      ]
    },
    fbpInvalid: true, // don't check fbp because it's not valid fbp - quotes aren't valid fbp
    output:
      'node1(constant/string:value=max:"was here") OUT -> IN node3(console:prefix="prefix",suffix="",output_on_stdout=true,flush=true)'
  },

  {
    assertion: 'should convert member variables with string metadata with embedded quote',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'node1':{
          'component':'constant/string',
          'metadata':{
            'value': 'quote -> " <- quote -> "'
          }
        },
        'node3':{
          'component':'console',
          'metadata':{
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'node1',
            'port':'OUT'
          },
          'tgt':{
            'process':'node3',
            'port':'IN'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'node1',
            'port': 'OUT'
          },
          'to': {
            'process': 'node3',
            'port': 'IN'
          }
        }
      ],
      'nodes': [
        {
          'id': 'node1',
          'component': 'constant/string',
          'metadata': {
            'value': 'quote -> " <- quote ->"'
          }
        },
        {
          'id': 'node3',
          'component': 'console',
          'metadata': {
          }
        }
      ]
    },
    fbpInvalid: true, // don't check fbp because it's not valid fbp - quotes aren't valid fbp
    output:
      'node1(constant/string:value="quote -> \\" <- quote ->\\"") OUT -> IN node3(console)'
  },

  {
    assertion: 'should convert member variables with int metadata with constants',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'node1':{
          'component':'an/int',
          'metadata':{
            'value': 'INT32_MAX'
          }
        },
        'node3':{
          'component':'console',
          'metadata':{
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'node1',
            'port':'OUT'
          },
          'tgt':{
            'process':'node3',
            'port':'IN'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'node1',
            'port': 'OUT'
          },
          'to': {
            'process': 'node3',
            'port': 'IN'
          }
        }
      ],
      'nodes': [
        {
          'id': 'node1',
          'component': 'an/int',
          'metadata': {
            'value': 'INT32_MAX'
          }
        },
        {
          'id': 'node3',
          'component': 'console',
          'metadata': {
          }
        }
      ]
    },
    output:
      'node1(an/int:value=INT32_MAX) OUT -> IN node3(console)'
  },

  {
    assertion: 'should convert nodes with ids containing invalid characters',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'some/component':{
          'component':'an/int',
          'metadata':{
            'value': 'INT32_MAX'
          }
        },
        'another/component':{
          'component':'console',
          'metadata':{
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'some/component',
            'port':'OUT'
          },
          'tgt':{
            'process':'another/component',
            'port':'IN'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'some/component',
            'port': 'OUT'
          },
          'to': {
            'process': 'another/component',
            'port': 'IN'
          }
        }
      ],
      'nodes': [
        {
          'id': 'some/component',
          'component': 'an/int',
          'metadata': {
            'value': 'INT32_MAX'
          }
        },
        {
          'id': 'another/component',
          'component': 'console',
          'metadata': {
          }
        }
      ]
    },
    output:
      'some_component(an/int:value=INT32_MAX) OUT -> IN another_component(console)'
  },
  
  {
    assertion: 'should convert nodes with multiple connections per port',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'adder':{
          'component':'int/addition'
        },
        'const1':{
          'component':'constant/int',
          'metadata':{
            'value': 1
          }
        },
        'const2':{
          'component':'constant/int',
          'metadata':{
            'value': 2
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'const1',
            'port':'OUT'
          },
          'tgt':{
            'process':'adder',
            'port':'IN'
          }
        },
        {
          'src':{
            'process':'const2',
            'port':'OUT'
          },
          'tgt':{
            'process':'adder',
            'port':'IN'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'const1',
            'port': 'OUT'
          },
          'to': {
            'process': 'adder',
            'port': 'IN'
          }
        },
        {
          'from': {
            'process': 'const2',
            'port': 'OUT'
          },
          'to': {
            'process': 'adder',
            'port': 'IN'
          }
        }
      ],
      'nodes': [
        {
          'id': 'const1',
          'component': 'constant/int',
          'metadata': {
            'value': 1
          }
        },
        {
          'id': 'const2',
          'component': 'constant/int',
          'metadata': {
            'value': 2
          }
        },
        {
          'id': 'adder',
          'component': 'int/addition'
        }
      ]
    },
    output:
      'const1(constant/int:value=1) OUT -> IN[0] adder(int/addition)\n' +
      'const2(constant/int:value=2) OUT -> IN[1] adder'
  },
  
  {
    assertion: 'should convert multiple instances of components with array ports each starting from 0',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'adder1':{
          'component':'int/addition'
        },
        'adder2':{
          'component':'int/addition'
        },
        'const1':{
          'component':'constant/int',
          'metadata':{
            'value': 1
          }
        },
        'const2':{
          'component':'constant/int',
          'metadata':{
            'value': 2
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'const1',
            'port':'OUT'
          },
          'tgt':{
            'process':'adder1',
            'port':'IN'
          }
        },
        {
          'src':{
            'process':'const2',
            'port':'OUT'
          },
          'tgt':{
            'process':'adder2',
            'port':'IN'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'const1',
            'port': 'OUT'
          },
          'to': {
            'process': 'adder1',
            'port': 'IN'
          }
        },
        {
          'from': {
            'process': 'const2',
            'port': 'OUT'
          },
          'to': {
            'process': 'adder2',
            'port': 'IN'
          }
        }
      ],
      'nodes': [
        {
          'id': 'const1',
          'component': 'constant/int',
          'metadata': {
            'value': 1
          }
        },
        {
          'id': 'const2',
          'component': 'constant/int',
          'metadata': {
            'value': 2
          }
        },
        {
          'id': 'adder1',
          'component': 'int/addition'
        },
        {
          'id': 'adder2',
          'component': 'int/addition'
        }
      ]
    },
    output:
      'const1(constant/int:value=1) OUT -> IN[0] adder1(int/addition)\n' +
      'const2(constant/int:value=2) OUT -> IN[0] adder2(int/addition)'
  },
  /**
   * some compoments might have input ports and output ports with the same name;
   * this is to test that the indices are incremented independently
   **/
  {
    assertion: 'should convert multiple instances of components with array ports each with nodes having input and output ports with same name, starting from 0',
    json: {
      'properties':{},
      'inports':{},
      'outports':{},
      'groups':[],
      'processes':{
        'console':{
          'component':'console'
        },
        'adder1':{
          'component':'int/addition2'
        },
        'adder2':{
          'component':'int/addition2'
        },
        'const1':{
          'component':'constant/int',
          'metadata':{
            'value': 1
          }
        },
        'const2':{
          'component':'constant/int',
          'metadata':{
            'value': 2
          }
        }
      },
      'connections':[
        {
          'src':{
            'process':'adder1',
            'port':'SAME'
          },
          'tgt':{
            'process':'console',
            'port':'IN'
          }
        },
        {
          'src':{
            'process':'adder2',
            'port':'SAME'
          },
          'tgt':{
            'process':'console',
            'port':'IN'
          }
        },
        {
          'src':{
            'process':'const1',
            'port':'OUT'
          },
          'tgt':{
            'process':'adder1',
            'port':'SAME'
          }
        },
        {
          'src':{
            'process':'const2',
            'port':'OUT'
          },
          'tgt':{
            'process':'adder2',
            'port':'SAME'
          }
        }
      ]
    },
    input: {
      'name': '',
      'properties': {},
      'edges': [
        {
          'from': {
            'process': 'adder1',
            'port': 'SAME'
          },
          'to': {
            'process': 'console',
            'port': 'IN'
          }
        },
        {
          'from': {
            'process': 'adder2',
            'port': 'SAME'
          },
          'to': {
            'process': 'console',
            'port': 'IN'
          }
        },
        {
          'from': {
            'process': 'const1',
            'port': 'OUT'
          },
          'to': {
            'process': 'adder1',
            'port': 'SAME'
          }
        },
        {
          'from': {
            'process': 'const2',
            'port': 'OUT'
          },
          'to': {
            'process': 'adder2',
            'port': 'SAME'
          }
        }
      ],
      'nodes': [
        {
          'id': 'console',
          'component': 'console'
        },
        {
          'id': 'const1',
          'component': 'constant/int',
          'metadata': {
            'value': 1
          }
        },
        {
          'id': 'const2',
          'component': 'constant/int',
          'metadata': {
            'value': 2
          }
        },
        {
          'id': 'adder1',
          'component': 'int/addition'
        },
        {
          'id': 'adder2',
          'component': 'int/addition'
        }
      ]
    },
    output:
      'adder1(int/addition2) SAME[0] -> IN console(console)\n' +
      'adder2(int/addition2) SAME[0] -> IN console\n' +
      'const1(constant/int:value=1) OUT -> SAME[0] adder1\n' +
      'const2(constant/int:value=2) OUT -> SAME[0] adder2'
  },

];

describe('JSON2FBP', function () {
  var json2fbp;

  var library = {
    map: {

      'Irange_Max': {
        members: []
      },
      'wallclock/second': {
        members: []
      },
      'wallclock/minute': {
        members: []
      },
      'wallclock/hour': {
        members: []
      },
      'drange/equal': {
        members: []
      },
      'console': {
        "in_ports": [
         {
          "array_size": 0,
          "data_type": "any",
          "description": "Prints the packet to console",
          "name": "IN",
          "required": false
         }
        ],
        members: [
          { name: 'prefix', type: 'string' },
          { name: 'suffix', type: 'string' },
          { name: 'output_on_stdout', type: 'boolean' },
          { name: 'flush', type: 'boolean' },
        ]
      },
      'converter/empty-to-boolean': {
        members: []
      },
      'converter/boolean-to-byte': {
        members: [
          { name: 'false_value', type: 'boolean' },
          { name: 'true_value', type: 'boolean' }
        ]
      },
      'constant/int': {
        inports: [],
        outports: [
          {
            'name': 'OUT',
            'array_size': 0
          },
        ],
        members: [
          { name: 'value', type: 'int' }
        ]
      },
      'constant/string': {
        members: []
      },
      'an/int': {
        members: [
          { name: 'value', type: 'int' }
        ]
      },

      'int/addition': {
        outports: [
          {
            name: 'OUT'
          }
        ],
        inports: [
          {
            name: 'IN',
            array_size: 32
          }
        ],
        members: []
      },

      'int/addition2': {
        outports: [
          {
            name: 'SAME',
            array_size: 32
          }
        ],
        inports: [
          {
            name: 'SAME',
            array_size: 32
          }
        ],
        members: []
      }

    }
  };

  var toJSON = function(string) {
  };

  beforeEach(function (done) {
    System.import('JSON2FBP').then(function (j2f) {
      json2fbp = j2f;
      json2fbp.setLibrary(library);
      done();
    });
  });

  var runTest = function (index) {
    var input = tests[index].input;
    var output = tests[index].output;

    input.toJSON = function() {
      return tests[index].json;
    };

    var fbpData = json2fbp.convert(input);
    fbpData.should.eql(output);

    var fn = function () {
      parser.parse(fbpData);
    };
    
    // some fbp output is not valid output thanks to soletta extending fbp
    if (!tests[index].fbpInvalid) {
      fn.should.not.throw();
    }
  };

  tests.forEach(function (test, i) {
    it(test.assertion, function () {
      runTest(i);
    });
  });

});

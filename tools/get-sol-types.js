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
// read the Soletta JSON files in app/data and show a list
// of all the data_type values from the in_ports and out_ports
// properties, and from the "member" variables
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var shelljs = require('shelljs');

var dir = path.join(__dirname, '..', 'app', 'data');
var files = shelljs.ls(dir);

var file;
var str;
var content;
var types = [];
var memberTypes = {};

for (var i = 0; i < files.length; i++) {
  file = path.join(dir, files[i]);
  console.log('parsing ' + file + ' for types');

  str = fs.readFileSync(file, 'utf8');
  content = JSON.parse(str);

  _.each(content, function (components) {
    _.each(components, function (component) {
      // inport types
      _.each(component.in_ports, function (port) {
        types.push(port.data_type);
      });

      // outport types
      _.each(component.out_ports, function (port) {
        types.push(port.data_type);
      });

      // member variable types
      if (component.options && component.options.members) {
        _.each(component.options.members, function (member) {
          if (!memberTypes[member.data_type]) {
            memberTypes[member.data_type] = [];
          }

          memberTypes[member.data_type].push(member);
        });
      }
    });
  });
}

console.log('PORT TYPES');
console.log(_.uniq(types.sort()));
console.log();
console.log('MEMBER VARIABLE TYPES');
console.log(_.keys(memberTypes));

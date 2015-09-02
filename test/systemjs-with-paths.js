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
// get the path configuration for System from the app/js/amd.js
// file; then configure System using this and export it
//
// this can be used in a test to configure System with paths to
// third party libraries so AMD modules can be loaded correctly
// by System in a node context, without needing paths to be
// defined in the test itself
var System = require('../bower_components/systemjs/dist/system');

var fs = require('fs');
var path = require('path');

// this gets System to use the same paths and shims
// set up for the browser; oh the massive hackery...
var amdConfigFile = path.resolve(__dirname, '../app/js/amd.js');
var config = fs.readFileSync(amdConfigFile, 'utf8');

var configJSON = config.match(/System\.config\((\{[\w\W]+?\})\);/m)[1];

// now we set a variable containing that object
eval('var config = ' + configJSON);

// and butcher the paths
config.baseURL = 'app/js';

// apply configuration
System.config(config);

module.exports = System;


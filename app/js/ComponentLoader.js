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
define(
['HTTPClient', 'Component', 'js-signals', 'lodash'],
function (HTTPClient, Component, signals, _) {
  'use strict';

  // PRIVATE

  // returns an array of JSON components which can
  // be added to a noflo graph
  var generateComponents = function (solComponents) {
    var generated = [];

    for (var i = 0; i < solComponents.length; i++) {
      var solComponent = solComponents[i];
      var component = Component.convertSolComponent(solComponent);
      generated.push(component);
    }
    return generated;
  };

  // PUBLIC

  /**
   * Loader for component definition files, which converts those files
   * into arrays of components suitable for adding as nodes
   * to a NoFlo graph instance. See the loadJSON() method for details.
   *
   * @param {object} options   Configuration for the component loader.
   * @param {object} [options.httpClient = HTTPClient instance]    HTTP
   * client instance
   * @param {object} [options.fileReader = new FileReader()]    FileReader
   * instance
   */
  var ComponentLoader = function (options) {
    options = options || {};
    this.httpClient = options.httpClient || HTTPClient();
    this.fileReader = options.fileReader || new FileReader();

    this.signals = {
      error: new signals.Signal(),
      newComponents: new signals.Signal()
    };
  };

  /**
   * Parse an object of component definitions, upgrading them into Components
   *
   * @returns array of Components
   */
  ComponentLoader.prototype.parseComponentDefinitions = function (libraryObj) {
    var library = Object.keys(libraryObj).map(function (key) {
      return Component.create(libraryObj[key]);
    });

    return library;
  };

  /**
   * Parse the Soletta components JSON format;
   * for the format, see test/unit/data/da-components.json.
   *
   * @returns {Component[]} array of Components
   */
  ComponentLoader.prototype.parseSolettaJSON = function (json) {
    var solComponentsObj = JSON.parse(json);
    var generated = [];

    _.each(solComponentsObj, function (solComponents) {
      generated = generated.concat(generateComponents(solComponents));
    });

    return generated;
  };

  /**
   * Load JSON from URL <url> and parse it into an array of NoFlo
   * compatible component definitions.
   *
   * @param {string} url    URL to load file from
   * The file at URL specifies the components in a Soletta system.
   *
   * @dispatches newComponents signal with array of Component instances
   * (see Component.js) on success, or an error signal with an Error
   * object on failure.
   */
  ComponentLoader.prototype.loadJSONFromURL = function (url) {
    var self = this;

    var handleError = function (err) {
      self.signals.error.dispatch(err);
    };

    this.httpClient.get(url)
    .then(
      function (response) {
        var generated = self.parseSolettaJSON(response.body);
        self.signals.newComponents.dispatch(generated);
      },

      handleError
    )
    .catch(handleError);
  };

  /**
   * Load JSON from a File object.
   *
   * @param {File} file    File object to load JSON from.
   *
   * @dispatches newComponents signal with array of Component instances
   * (see Component.js) on success, or an error signal with an Error
   * object on failure.
   */
  ComponentLoader.prototype.loadJSONFromFile = function (file) {
    var self = this;

    this.fileReader.onerror = function (err) {
      self.signals.error.dispatch(err);
    };

    this.fileReader.onload = function (e) {
      var json = e.target.result;
      var generated = self.parseSolettaJSON(json);
      self.signals.newComponents.dispatch(generated);
    };

    this.fileReader.readAsText(file);
  };

  /**
   * Load JSON from a URL string or a File
   * (https://developer.mozilla.org/en/docs/Web/API/File).
   */
  ComponentLoader.prototype.loadJSON = function (urlOrFile) {
    try {
      if (_.isString(urlOrFile)) {
        this.loadJSONFromURL(urlOrFile);
      }
      else {
        this.loadJSONFromFile(urlOrFile);
      }
    }
    catch (err) {
      this.signals.error.dispatch(err);
    }
  };

  // return a factory function
  return function (options) {
    return new ComponentLoader(options);
  };
});

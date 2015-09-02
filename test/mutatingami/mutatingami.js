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
(function () {

  var impls = {
    RAF: 'requestAnimationFrame',
    MUTATION_OBSERVER: 'MutationObserver'
  };

  var raf = (
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );

  /**
   * Watcher which reports when nodes matching a selector are found
   * in the DOM.
   *
   * The MutationObserver implementation is more efficient as it
   * only checks for matching nodes when the DOM changes; the
   * requestAnimationFrame implementation polls the DOM.
   *
   * @param {object} options
   * @param {boolean} [options.forceRaf=false]    Set to true to
   * force the requestAnimationFrame implementation.
   */
  var MutatingAmIWatcher = function (options) {
    options = options || {};

    if (options.forceRaf || !window.MutationObserver) {
      this.impl = impls.RAF;
    }
    else {
      this.impl = impls.MUTATION_OBSERVER;
    }
  };

  var TimeoutError = function (selector, timeout) {
    return new Error('watch timed out; no elements returned for selector "' +
                     selector + '" within ' + timeout + 'ms');
  };

  /**
   * Watch for the nodes selected by <selector> under the DOMNode <root>.
   * When successful, the watch ends and invokes a callback with the
   * matching nodes. The watch can also be made to timeout if required.
   *
   * @param {DOMElement} root    Parent node to select under
   * @param {string} selector    Passed to root.querySelectorAll() to
   * detect matching nodes
   * @param {number} timeout    Timeout (ms) to wait for before invoking
   * callback with an error; if not set, the watch never times out
   * @param {function} cb    Callback function with signature
   * cb(error, elements), where error is an Error caused by a timeout
   * and elements is a NodeList retrieved by <selector> (if watch
   * completes successfully)
   */
  MutatingAmIWatcher.prototype.watch = function (root, selector, timeout, cb) {
    var start = (new Date()).getTime();
    var elapsed = 0;

    if (this.impl === impls.RAF) {
      var watchFn = function () {
        // if no selector given use root
        var elts = selector ? root.querySelectorAll(selector) : [root];
        if (elts.length) {
          cb(null, elts);
        }
        else if (timeout) {
          var now = (new Date()).getTime();
          elapsed = (now - start);

          if (elapsed >= timeout) {
            cb(TimeoutError(selector, timeout));
          }
          else {
            raf(watchFn);
          }
        }
        else {
          raf(watchFn);
        }
      };

      watchFn();
    }
    else if (this.impl === impls.MUTATION_OBSERVER) {
      var observerCb = function (records, observer) {
        var elts = root.querySelectorAll(selector);
        if (elts.length) {
          observer.disconnect();
          cb(null, elts);
        }
        else if (timeout) {
          var now = (new Date()).getTime();
          elapsed = (now - start);

          if (elapsed >= timeout) {
            observer.disconnect();
            cb(TimeoutError(selector, timeout));
          }
        }
      };

      var observer = new MutationObserver(observerCb);
      observer.observe(root, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
      });
    }
  };

  var exports = {
    Watcher: function (options) {
      return new MutatingAmIWatcher(options);
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  }
  else if (typeof define !== 'undefined' && define.amd) {
    define(function () {
      return exports;
    });
  }
  else {
    window.MutatingAmI = exports;
  }

})();

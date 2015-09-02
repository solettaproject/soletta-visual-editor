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
[
  'NamedObjectLibrary',
  'TypeMapper',
  'lodash'
],
function (
  NamedObjectLibrary,
  TypeMapper,
  _
) {
  'use strict';

  /**
   * "Subclass" of NamedObjectLibrary specialised for SLV
   * Component objects.
   *
   * Although this is a subclass of NamedObjectLibrary, the objects
   * added to it should have the following properties for this
   * to be useful:
   *   - inports
   *   - outports
   *   - category
   */
  var ComponentLibrary = function () {
    if (!(this instanceof ComponentLibrary)) {
      return new ComponentLibrary();
    }

    NamedObjectLibrary.call(this);
  };

  ComponentLibrary.prototype = _.create(NamedObjectLibrary.prototype);

  // add a mapping from port.name to a port name in one of the
  // ports in candidatePorts which has a matching type;
  // if there is no exact type match, a second pass is made to
  // find a port with type 'any' in candidatePorts and that's used
  // instead;
  // NB this modifies map and portsMapped in place
  //
  // e.g. addPortMapping(
  //   {name: 'IN1', type: 'boolean'},
  //   {}, // map
  //   [], // portsMapped
  //   [{name: 'IN0', type: 'string'}, {name: 'INPUT', type: 'boolean'}]
  // )
  //
  // will change map to:
  //   {'IN1': 'INPUT'}
  // as ports 'IN1' port has the same type as the 'INPUT' port of
  // the second candidate port
  //
  // and portsMapped will be changed to:
  //   ['INPUT']
  // to show that 'INPUT' has been used for a mapping
  var addPortMapping = function (port, map, portsMapped, candidatePorts) {
    var candidatePort;

    for (var j = 0; j < candidatePorts.length; j++) {
      candidatePort = candidatePorts[j];

      if (port.type === candidatePort.type &&
          portsMapped.indexOf(candidatePort.name) === -1) {
        map[port.name] = candidatePort.name;
        portsMapped.push(candidatePort.name);
        break;
      }
    }

    // if the port wasn't mapped, looked for a port in ports2 with
    // type "any" or "all"
    if (!map[port.name]) {
      for (j = 0; j < candidatePorts.length; j++) {
        candidatePort = candidatePorts[j];

        if ((candidatePort.type === TypeMapper.SOL_TYPES.any ||
             port.type === TypeMapper.SOL_TYPES.any) &&
            portsMapped.indexOf(candidatePort.name) === -1) {
          map[port.name] = candidatePort.name;
          portsMapped.push(candidatePort.name);
          break;
        }
      }
    }
  };

  // ports1 and ports2 are arrays of port objects; each port
  // object has a "type" property; this is a mapping from
  // the names of ports in ports1 to the names of ports in ports2;
  // note that if the type of a port in ports2 is any, it will match
  // any port in ports1 (though exact matches are preferred)
  var makePortMap = function (ports1, ports2) {
    var map = {};
    var portsMapped = [];

    for (var i = 0; i < ports1.length; i++) {
      addPortMapping(ports1[i], map, portsMapped, ports2);
    }

    return map;
  };

  // get port <portName> of type <portsType> on component with
  // name <componentName>
  // portsType: 'inports' or 'outports'
  var getPort = function (component, portName, portsType) {
    var found = _.find(component[portsType], function (port) {
      return port.name === portName;
    });

    return found;
  };

  /**
   * Return Component objects from whose inports and outports match
   * those of <component>.
   *
   * @param {Component} component   Component object to match (see
   * Component.js for format)
   *
   * @returns Component[] array of matching Components
   */
  ComponentLibrary.prototype.findMatchingComponents = function (component) {
    var self = this;

    var fn = function (candidate) {
      return component.name !== candidate.name &&
             self.mapPorts(component, candidate) !== null;
    };

    return this.getMatching(fn);
  };

  /**
   * Map the port names on <component1> to the port names on <component2>,
   * matching by type.
   *
   * @param {Component} component1
   * @param {Component} component2
   *
   * @returns {object} port map in format
   * {
   *   inports: { "<component1 port name>" : "<component2 port name>", ...},
   *   outports: { "<component1 port name>" : "<component2 port name>", ...}
   * }
   * or null if the mapping is incomplete
   */
  ComponentLibrary.prototype.mapPorts = function (component1, component2) {
    if (!((component1.inports.length === component2.inports.length) &&
          (component1.outports.length === component2.outports.length))) {
      return null;
    }

    var inportsMap = makePortMap(component1.inports, component2.inports);

    if (_.keys(inportsMap).length !== component1.inports.length) {
      return null;
    }

    var outportsMap = makePortMap(component1.outports, component2.outports);

    if (_.keys(outportsMap).length !== component1.outports.length) {
      return null;
    }

    return {
      inports: inportsMap,
      outports: outportsMap
    };
  };

  /**
   * Check whether component has an inport with the specified
   * <portName>.
   *
   * @param {Component} component    Component to check
   * @param {string} portName    Name of inport to check
   *
   * @returns {boolean} true if component has an inport
   * with name <portName>, false otherwise
   */
  ComponentLibrary.prototype.hasInport = function (component, portName) {
    return !!getPort(component, portName, 'inports');
  };

  /**
   * Check whether component has an outport with the specified
   * <portName>.
   *
   * @param {Component} component    Component to check
   * @param {string} portName    Name of outport to check
   *
   * @returns {boolean} true if component has an outport
   * with name <portName>, false otherwise
   */
  ComponentLibrary.prototype.hasOutport = function (component, portName) {
    return !!getPort(component, portName, 'outports');
  };

  /**
   * Get the object for the inport with name <portName> on
   * Component <component>.
   *
   * @returns {object} port object, e.g.
   * { name: 'IN1', type: 'boolean', ... }
   */
  ComponentLibrary.prototype.getInport = function (component, portName) {
    return getPort(component, portName, 'inports');
  };

  /**
   * Get the object for the outport with name <portName> on
   * Component <component>.
   *
   * @returns {object} port object, e.g.
   * { name: 'IN1', type: 'boolean', ... }
   */
  ComponentLibrary.prototype.getOutport = function (component, portName) {
    return getPort(component, portName, 'outports');
  };

  /**
   * Check whether an edge can connect a source port to a target port.
   *
   * @param {string} sourceComponentName    Name of the component
   * of the source node for the edge
   * @param {string} sourcePortName   Name of the port on the source
   * node (the origin of the edge)
   * @param {string} targetComponentName    Name of the component
   * of the target node for the edge
   * @param {string} targetPortName    Name of the port on the target
   * node (the destination for the edge)
   *
   * @returns true if the source port is an outport, the target port
   * is an inport, and the ports have the same type or the
   * inport accepts 'any' type; otherwise, false
   */
  ComponentLibrary.prototype.canConnect = function (sourceComponentName,
      sourcePortName, targetComponentName, targetPortName) {
    var sourceComponent = this.get(sourceComponentName);
    var targetComponent = this.get(targetComponentName);

    if (!sourceComponent || !targetComponent) {
      return false;
    }

    // check whether we have an inport and an outport
    var sourceIsInport = this.hasInport(sourceComponent, sourcePortName);
    var targetIsOutport = this.hasOutport(targetComponent, targetPortName);

    if (sourceIsInport && !targetIsOutport) {
      return false;
    }
    else if (!sourceIsInport && targetIsOutport) {
      return false;
    }
    else if (!(sourceIsInport && targetIsOutport)) {
      var sourceIsOutport = this.hasOutport(sourceComponent, sourcePortName);
      var targetIsInport = this.hasInport(targetComponent, targetPortName);

      if (!(sourceIsOutport && targetIsInport)) {
        return false;
      }
    }

    // we have an inport and an outport now; get the ports themselves
    // to check their types
    var sourcePort;
    var targetPort;

    if (sourceIsInport) {
      sourcePort = this.getInport(sourceComponent, sourcePortName);
      targetPort = this.getOutport(targetComponent, targetPortName);
    }
    else {
      sourcePort = this.getOutport(sourceComponent, sourcePortName);
      targetPort = this.getInport(targetComponent, targetPortName);
    }

    // does the data type of the target port match the data type of
    // the source outport? alternatively, does the target port accept
    // any kind of input?
    if (sourcePort.type === targetPort.type ||
        targetPort.type === TypeMapper.SOL_TYPES.any) {
      return true;
    }
    else {
      return false;
    }
  };

  return ComponentLibrary;
});

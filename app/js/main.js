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
Promise.all([
  System.import('JSON2FBP'),
  System.import('KeyboardShortcuts'),
  System.import('ComponentLoader'),
  System.import('ComponentLibrary'),
  System.import('ComponentCategoryGrouper'),
  System.import('VersionedGraphBuilder')
])
.then(function (imports) {
  'use strict';
  var JSON2FBP = imports.shift();
  var KeyboardShortcuts = imports.shift();
  var ComponentLoader = imports.shift();
  var ComponentLibrary = imports.shift();
  var ComponentCategoryGrouper = imports.shift();
  var VersionedGraphBuilder = imports.shift();

  // location of the component JSON files
  var COMPONENTS_JSON = [
    'data/builtins.json'
    /*'data/calamari.json',
    'data/keyboard.json',
    'data/network.json',
    'data/udev.json'*/
  ];

  // loader for components
  var componentLoader = ComponentLoader();

  // component library
  var library = ComponentLibrary();

  // JSON2FBP
  JSON2FBP.setLibrary(library);

  // the graph editor
  var editor = document.getElementById('editor');
  editor.setTheGraph(TheGraph);
  editor.setLibrary(library);
  editor.resetGraph();

  // synchronise the editor's size with the size of the layout
  var layout = document.getElementById('layout');
  layout.signals.resize.add(function (size) {
    editor.setSize(size);
  });

  editor.setSize(layout.getSize());

  // graph builder
  var versionedGraphBuilder = VersionedGraphBuilder({
    library: library
  });

  // members editor
  var membersEditor = document.getElementById('membersEditor');
  membersEditor.setLibrary(library);

  // save member data
  membersEditor.signals.membersUpdated.add(function (nodeId, nodeLabel, members) {
    versionedGraphBuilder.setMetadata(nodeId, nodeLabel, members);
  });

  // change the component associated with a node
  editor.signals.componentSelected.add(function (nodeId, componentName) {
    var component = editor.getLibrary().get(componentName);
    versionedGraphBuilder.changeComponent(nodeId, component);
  });

  // remove a node
  editor.signals.removeNode.add(function (nodeId) {
    versionedGraphBuilder.removeNode(nodeId);
  });

  // remove an edge
  editor.signals.removeEdge.add(function (fromId, fromPort, toId, toPort) {
    versionedGraphBuilder.removeEdge(fromId, fromPort, toId, toPort);
  });

  // if an edge is started in the-graph-editor, tell the graph builder
  // to listen to edge events; this enables them to be undone/redone
  editor.signals.edgeStarted.add(function () {
    versionedGraphBuilder.listeningToGraphEvents = !versionedGraphBuilder.listeningToGraphEvents;
  });

  // if edge is dropped without connecting, stop listening to events
  editor.signals.edgeEnded.add(function () {
    versionedGraphBuilder.listeningToGraphEvents = false;
  });

  // paste the content of the editor clipboard into the graph
  editor.signals.paste.add(function (clipboard, options) {
    versionedGraphBuilder.paste(clipboard, options);
  });

  // open the properties editor (in the layout) for a selected node
  var propertiesMenu = document.getElementById('properties');
  propertiesMenu.setLibrary(library);

  propertiesMenu.signals.nodeSelected.add(function (node) {
    membersEditor.setNode(node);
  });

  propertiesMenu.signals.nodeNotEditable.add(function () {
    membersEditor.setInvalidNodeHasNoComponent();
  });

  propertiesMenu.signals.multipleNodesNotEditable.add(function () {
    membersEditor.setInvalidMultipleNodesSelected();
  });

  propertiesMenu.signals.noNodeNotEditable.add(function () {
    membersEditor.setInvalidNoNodeSelected();
  });

  propertiesMenu.signals.open.add(function () {
    layout.slideOutPanel();
  });

  propertiesMenu.signals.close.add(function () {
    layout.slideInPanel();
  });

  // nodes/edges selected affect keyboard shortcuts and properties menu
  editor.signals.nodesSelected.add(function (nodes) {
    propertiesMenu.setSelectedNodes(nodes);
    KeyboardShortcuts.setSelectedNodes(nodes);
  });

  editor.signals.edgesSelected.add(function (edges) {
    KeyboardShortcuts.setSelectedEdges(edges);
  });

  // when a node has its component changed, and that node was
  // already selected, make the new node the focus in the editor
  versionedGraphBuilder.signals.componentChanged.add(function (nodeId, newNodeId, newNode) {
    if (editor.nodeIsSelected(nodeId)) {
      editor.setSelectedNodes([newNode]);
    }
  });

  // if a node changes in the graph, and that node is active in the properties
  // menu, update its properties in the members editor
  versionedGraphBuilder.signals.nodeChanged.add(function (node, oldMeta) {
    propertiesMenu.updateNode(node, oldMeta);
  });

  // node was removed
  versionedGraphBuilder.signals.nodeRemoved.add(function (nodeId) {
    editor.deselectNode(nodeId);
  });

  // edge was removed
  versionedGraphBuilder.signals.edgeRemoved.add(function (edge) {
    editor.deselectEdge(edge);
  });

  // if nodes are pasted, select them
  versionedGraphBuilder.signals.pasted.add(function (nodes, edges) {
    editor.setSelectedNodes(nodes);
    editor.setSelectedEdges(edges);
  });

  // graph nav
  var nav = document.getElementById('nav');
  nav.editor = editor.getWrappedEditor();

  // import, export and save buttons
  // fbpimport disabled until v1
  // var fbpimportButton = document.getElementById('fbpimport');
  // fbpimportButton.setEditor(editor);

  var fbpexportButton = document.getElementById('fbpexport');

  var projectsaveButton = document.getElementById('projectsave');
  projectsaveButton.setLibrary(library);

  var projectopenButton = document.getElementById('projectopen');
  projectopenButton.setEditor(editor);
  projectopenButton.setProjectSave(projectsaveButton);
  projectopenButton.setLibrary(library);

  projectopenButton.signals.newGraph.add(function (graph, options) {
    editor.setGraph(graph, options);
  });

  projectopenButton.signals.newComponentDefinitions.add(function (definitions) {
    var values = componentLoader.parseComponentDefinitions(definitions);
    library.reset();
    library.add(values);
    editor.setLibrary(library);
  });

  // add handlers for component loader signals
  componentLoader.signals.newComponents.add(function (components) {
    editor.getLibrary().add(components);
  });

  // load components from filesystem
  for (var i = 0; i < COMPONENTS_JSON.length; i++) {
    componentLoader.loadJSON(COMPONENTS_JSON[i]);
  }

  // chooser to enable component definition file upload
  var fileupload = document.getElementById('fileupload');
  fileupload.signals.newFile.add(function (file) {
    componentLoader.loadJSON(file);
  });

  // object to group component library by category
  var categoryGrouper = ComponentCategoryGrouper({library: library});

  // component select popup (triggered by toolbar button)
  var componentSelectPopup = document.getElementById('componentselectpopup');
  componentSelectPopup.setComponentGrouper(categoryGrouper);

  // respond to signals from the slv-component-dropdown element to
  // add new nodes to the graph; name is a Component name
  componentSelectPopup.signals.selected.add(function (componentName) {
    var position = editor.getNodePosition(componentName);
    versionedGraphBuilder.addNode(componentName, position);
  });

  KeyboardShortcuts.signals.redo.add(function () {
    document.querySelector('paper-button#redo').click();
  });

  KeyboardShortcuts.signals.undo.add(function () {
    document.querySelector('paper-button#undo').click();
  });

  KeyboardShortcuts.signals.open.add(function () {
    document.getElementById('projectopen').onClick();
  });

  KeyboardShortcuts.signals.save.add(function () {
    document.getElementById('projectsave').click();
  });

  KeyboardShortcuts.signals.del.add(function (nodes, edges) {
    versionedGraphBuilder.del(nodes, edges);
  });

  KeyboardShortcuts.signals.copy.add(function (nodes) {
    versionedGraphBuilder.copy(TheGraph.Clipboard, nodes);
  });

  KeyboardShortcuts.signals.paste.add(function () {
    versionedGraphBuilder.paste(TheGraph.Clipboard, {autoposition: true});
  });

  KeyboardShortcuts.signals.keyboardInput.add(function (key, selectedNodes) {
    if (componentSelectPopup.isOpen()) {
      // manipulate component select menu
      componentSelectPopup.$.select.handleKeyboardInput(key);
    }
    else {
      if (key === '+') {
        componentSelectPopup.open();
      }
      else if (['up', 'down', 'left', 'right'].indexOf(key) !== -1) {
        if (selectedNodes.length > 0) {
          versionedGraphBuilder.moveNodes(selectedNodes, key);
        }
      }
    }
  });

  // add component button (opens the component select dialog)
  var addComponentButton = document.getElementById('addcomponent');
  addComponentButton.addEventListener('click', function () {
    componentSelectPopup.open();
  });

  // rearrange button
  document.querySelector('paper-button#rearrange').addEventListener('click', function () {
    editor.layout();
  });

  // clear button
  document.querySelector('paper-button#clear').addEventListener('click', function () {
    document.getElementById('projectsave').setSaved(true); // blank graph doesn't need saving
    editor.resetGraph();
  });

  // copy button
  document.querySelector('paper-button#copy').addEventListener('click', function () {
    var selectedNodeIds = KeyboardShortcuts.getSelectedNodeIds();
    versionedGraphBuilder.copy(TheGraph.Clipboard, selectedNodeIds);
  });

  // paste button
  document.querySelector('paper-button#paste').addEventListener('click', function () {
    versionedGraphBuilder.paste(TheGraph.Clipboard, {autoposition: true});
  });

  // undo button
  document.querySelector('paper-button#undo').addEventListener('click', function () {
    versionedGraphBuilder.undo();
  });

  // redo button
  document.querySelector('paper-button#redo').addEventListener('click', function () {
    versionedGraphBuilder.redo();
  });

  // let other objects know when the NoFlo graph is ready
  editor.signals.graphInitialised.add(function (graph) {
    versionedGraphBuilder.setGraph(graph);
    versionedGraphBuilder.setEditor(editor);
    // fbpimport disabled until v1
    // fbpimportButton.setGraphBuilder(versionedGraphBuilder);
    fbpexportButton.setGraph(graph);
    projectsaveButton.setGraph(graph);
    KeyboardShortcuts.setGraph(graph);
    KeyboardShortcuts.setEditor(editor);
    projectsaveButton.setLibrary(library);
  });
});

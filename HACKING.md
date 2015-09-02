This document is intended for people who want to understand
SLV (both the project and the application).

# What's in the repo?

* `app`: all the code and assets for the application (except
for 3rd party code).
* `bower_components`, `node_modules`: 3rd party code; these are populated
during the build.
* `test/elements`: tests for Polymer elements.
* `test/manual`: manual tests (open them in a browser to try out
custom Polymer elements).
* `test/mutatingami`: test library which can poll or observe the DOM
for elements and invoke a callback when they are accessible (used by
the browser tests).
* `test/unit`: unit tests.
* `tools`: utility scripts used during development.

# Terminology

Here are definitions of some of the terms you may come across in this
project.

**Graph:** The object you're editing in SLV; the bit of the viewport with
dots on it.

**Action:** A small piece of functionality which a Soletta program can perform;
examples might be defining the value of a variable, adding two numbers
together, converting the type of a value from boolean to integer, or
lighting an LED on a device.

**Component:** A type of action you can add to the graph. For example,
"boolean/not" is an action which takes a boolean input, inverts it,
then outputs it.

**Node:** Instances of components which you add to the graph; these represent
actions in the application.

**Edge:** Connections between nodes; these define the data flow
between actions in the application.

**Port:** An input going into a node, or an output coming out of it. The
ports available on a node depend on which type of component it is an
instance of. A component may have input ports (inports) and/or output ports
(outports). A component without ports is possible but a bit useless.

**Component definition file (JSON):** a file which contains definitions of
components; these can be loaded into SLV to populate the list of
components which can be added to the graph as nodes.

**Flow-based programming format (used for Import/Export)**: This is
basically the FBP format, but some of the metadata on a node are treated as
representing special *member variables* (see below).

**The FBP format is the one you export from SLV to get a file which
can be run on Soletta.**

**Member variables:** Member variables are internal to the node, i.e.
they cannot be affected directly by setting initial information packets
on the node's inports. However, they can be modified by setting a
metadata property on the node. They are typically used as configuration
data for the node.

Note that NoFlo has several metadata properties which are *reserved*
and should not be edited. These are:

* `x`
* `y`
* `label`

You should not use these reserved names for member variables, as this
could cause conflicts and undesirable behaviour. Bear this in mind if
you're creating your own components.

**SLV project format (Save/Open):** SLV has its own JSON format for
project files. However, that format is really a combination of two
other formats: the NoFlo graph format, and the component definition
file format. The NoFlo graph format is a JSON representation of the
nodes and edges in the graph; the component definition is a JSON
representation of the components used to build those nodes. We
store both so that you can open a project in SLV even if it uses
components which are not in the main SLV builtin component set.

# Core technologies

In the application:

* [Polymer](http://polymer-project.org/): used to define custom UI elements.
For example, the drop-down properties editor and the component selector
popup are custom Polymer elements. We are currently using the 0.5*
releases of Polymer.
* [the-graph](https://github.com/the-grid/the-graph): this provides
the core graph editing UI elements; an instance of `the-graph-editor` is
embedded inside the `slv-editor`.
* [NoFlo](http://noflo.org): this provides the graph object (not its UI)
which you manipulate with SLV.
* [SystemJS](https://github.com/systemjs/systemjs): we use this for
AMD module loading; it's not a 100% brilliant solution (we have to do
some tricks with Promises to get it to work inside Polymer elements),
but it does the job.
* [js-signals](https://millermedeiros.github.io/js-signals/): rather
than using event handling to pass messages between parts of the
application, we use explicit signals. The following section explains why.

For the build:

* [grunt](http://gruntjs.com/)
* [wct-tester](https://github.com/Polymer/web-component-tester) - browser
testing for Polymer elements
* [mocha](http://mochajs.org/) / [sinon](http://sinonjs.org/) /
[chai](http://chaijs.com/) - unit testing

See `bower.json` and `package.json` for more details about 3rd party
dependencies.

## Signals vs. events

To compare event-based to signal-based communication between parts
of an application, here's an example of how the two approaches would
manage communication between two objects, `a` and `b`:

```
// traditional JS events
a.addEventListener('animationend', function (e) {
  // deal with event e's data here
  b.doSomething(e.detail);
});

a.fire('animationend', detail);

// signals (using js-signals library)
a.signals.animationend = new signals.Signal();

a.signals.animationend.add(function (detail) {
  // deal with payload of signal e here
  b.doSomething(detail);
});

a.animationend.dispatch(detail);
```

There are two main differences:

1.  In the case of the event approach, if we change the name of the event
fired by `a` (e.g. to 'animationEnd'), the event listener will no longer
catch those events: the communication between `a` and `b` is
effectively lost, but there's no obvious error showing why. This is
because the listener is generic and identifies the event of interest
by its name, as a string. If the event name changes in the emitter,
the listener will just wait indefinitely for an event which will
never occur.

    By contrast, in the signals case, if we
change the signal's name, the code which adds the handler will break:
`a.signals.animationend` will no longer refer to an object, so we
won't be able to call its `add()` method. This error makes it easier
to spot places where communication has broken down.

2.  In the event approach, the listener actually receives an event
object; the payload of the event is in the `detail` property of that
event object. This results in some indirection which can cause subtle
errors and makes the channel of communication less intuitive. By
contrast, in the signals approach, the object received by the listener
is the payload of the signal.

## SystemJS + Polymer

SLV uses Polymer for custom HTML elements, but also has quite a lot
of "back end" JavaScript code. The latter is organised into AMD modules
to give the benefits of modularity and explicit dependency marking.

In some cases, however, those AMD modules have to be used within
Polymer elements. On top of this, some Polymer elements also depend on
other Polymer elements.

To ensure that all the pre-requisites of a custom element are loaded
before that element is defined, Promises are used to track the load
state of AMD modules and Polymer elements. For example, in
`app/elements/slv-component-select.html`:

```
window.slvComponentSelectReady = Promise.all([
  System.import('lodash'),
  System.import('js-signals'),
  window.slvComponentTooltipReady
])
.then(function (imports) {
  var _ = imports.shift();
  var signals = imports.shift();

  ...
});
```

A Promise called `slvComponentSelectReady` is defined here, which will
resolve when the chain of Promises assigned to it resolves. The
`slvComponentSelectReady` promise is globally-visible, so that
other Polymer elements can depend on it (e.g. if they need to
have a `slv-component-select` element in their template).

The array of Promises to resolve before `slvComponentSelectReady`
resolves contains three elements:

1. A Promise which resolves when the lodash AMD module has loaded (via
SystemJS).
2. A Promise which resolves when the js-signals AMD module has loaded (via
SystemJS).
3. The Promise for the `slv-component-tooltip` custom element, which
resolves when `app/elements/slv-component-tooltip.html` has loaded
and its element is defined.

## A quick note on icons and images

Any images which are actually part of the application are in the
`app/assets/` directory; and any images which are to be used as icons
are in the `app/elements/slv-icons-svg.html` file, which defines
a custom icon set for SLV.

We convert icons into Polymer's icon set format for several reasons:

1. It makes them easier to use with Polymer: it's trivial to add an
icon to a button if the icons are in a Polymer icon set.
2. It makes styling simpler: we can do it with CSS.
3. It's easier to insert the SVG into the app via Polymer icon sets: the
alternative is to insert SVG into the DOM ourselves, which is more
difficult.

SVG is used for all images where it is practical, as it scales nicely.

# Q&A

## Which platforms are supported?

Testing is done on Linux, using Chrome and Firefox browsers.

We also attempt to support Safari (on Mac), but we don't test this regularly,
leaving it to the design team to do this for us.

We don't support IE, though SLV might work in that environment.

## How do I change styling of nodes/edges on the graph?

All changes to how the graph is displayed should be done by overriding
the CSS defined by `the-graph-editor` element. One instance of
`the-graph-editor` is embedded in `slv-editor`, the main editing
element of SLV. So any changes you want to make to the CSS for
`the-graph-editor` should be put at the top of `slv-editor`.

Note that because we want to support Firefox, you need to be wary of
using CSS rules which need Polymer-specific extensions (e.g. any
selector with `/deep/` in it).

## How do I add my own components?

SLV can load any component definition file in the correct format.
Several are included with SLV in the `app/data` directory. You should be able
to adapt these to create your own.

Note that Soletta requires that you use a pre-defined set of types for
your components. You can get a list of these types by running the
script in `tools/get-sol-types.js`:

    $ node tools/get-sol-types.js

Most of the types are self-explanatory. In the case of `any`, this is
used to mark an inport which can receive any kind of input.

## Can I host SLV on a web server?

SLV can be easily run from a web server by copying the *app/* and
*bower_components/* directories into the webroot of your server.

Alternatively, you can run a build with `grunt dist`, then copy the
contents of the `dist/` directory to a web server.

# Introduction

The [Soletta project](https://github.com/solettaproject/) was initiated
by Intel, inside the Open Source Technology Centre. The aim of the
project is to make development of embedded applications and devices
simpler, by providing a consistent abstraction which works across many
hardware layers.

Soletta consists of a runtime, installed on a device, which
can load a program defined as a *graph*: a set of nodes representing
data operations, and connections between those nodes describing
the flow of data between them. The underlying syntax for these graphs
is (broadly-speaking) [FBP](http://noflojs.org/documentation/fbp/), as
used by [NoFlo](http://noflojs.org/).

The Soletta Visual Editor (SLV) helps developers create these graph
structures in a browser-based application. One output from SLV
is an FBP-like file which can be loaded into the Soletta runtime.

# Build

You'll need bower and npm first.

From the root of the project:

    npm install
    grunt build

This will install all the dependencies and build the-graph (one
of the bower dependencies).

Then you can either:

*  Open app/index.html in Chrome. For this to work, you
should be using the `--allow-file-access-from-files` flag
for Chrome (see http://peter.sh/experiments/chromium-command-line-switches/).

OR

*   Serve the root directory from a web server, e.g.

    ```
    grunt server
    ```

    Then navigate to http://localhost:8282/app/index.html in your
browser. (You have to use this approach if you want to run SLV
in Firefox, as Firefox security policies won't allow file:// URIs
to be loaded via Ajax.)

    Note that SLV has only been tested on the following browsers:

    *   Chrome (version 45)
    *   Firefox (version 35)

    It is known to have bugs on Internet Explorer, and has not been
    tested extensively on Safari.

## Building with a proxy

Note that the build uses npm, so if you are behind a web proxy,
you will need to configure npm to use that proxy, e.g.

    npm config set proxy http://proxy.company.com:8080
    npm config set https-proxy http://proxy.company.com:8080

(The host and port settings are dependent on your proxy.)

However, even with the proxy set, the installation of the
web-component-tester package may fail
(see [this bug](https://github.com/Polymer/wct-sauce/issues/5)).
You can try the workarounds in that bug; or if you just want to use
the application and don't need to run the tests, you can remove the
`web-component-tester` line from the `package.json` file. Then run
`git clean -fxd` to clean any cached files before running the
build again (`npm install; grunt build` etc.).

# Dist

To produce a self-contained version of the app for distribution :

    grunt dist

This will run vulcanize on the built app and copy all files required
by the app to the `dist/` directory. That directory can then be copied
to a web server.

# Development

Please ensure code is linted before it is submitted by running:

    grunt lint

# Test

Run the unit tests with:

    grunt unit

The unit tests exercise the "back end" code in SLV.

Run all the tests (unit and browser-based):

    grunt test

The browser-based (Selenium) tests exercise the
[Polymer](http://polymer-project.org/) elements in SLV.

If you've already done a build (e.g. by running ```grunt build```),
you can skip the build step and run the tests with:

    grunt _unit

and

    grunt _test

If you need to debug the browser-based tests (e.g. they are failing
but you need to use the console to find out why), you can run them
in persistent mode. This keeps the browser open after the tests
complete:

    SLV_PAUSE=true grunt _test

You can also choose which browsers to use for testing ("chrome" and/or
"firefox"; default is "chrome,firefox"). This can be useful for
speeding up debugging, as the tests will only run in the chosen browser.
For example:

    SLV_BROWSERS=chrome SLV_PAUSE=true grunt _test

NB If you have problems with the Selenium tests in
Firefox, make sure ```ping localhost``` resolves to
127.0.0.1. If it doesn't the Firefox driver won't work - see
[here](https://code.google.com/p/selenium/issues/detail?id=3280) for
more info.

# Using SLV with Soletta

As stated above, SLV produces FBP output files for use with
Soletta.

However, it is also possible to import Soletta FBP files into SLV
for editing (though support for this is still tentative). One caveat,
though, is that, by default, SLV doesn't have definitions for all of
the node types used by Soletta.

To add definitions for more Soletta node types, you can upload
additional data files. Sample files for the Soletta node types can
be found in the `app/data` directory; they can be loaded via
SLV's *Upload to library* menu option.

# Contributors

The contributors from Intel who worked directly on SLV are:

* [Elliot Smith](https://github.com/townxelliot) (engineering)
* [Max Waterman](https://github.com/davidmaxwaterman) (engineering)
* [Fabricio Novak](https://github.com/fabricionovak) (design)
* [Sandro Fogaccio](https://github.com/Fogaccio) (design)
* [Daniel Chaves](https://github.com/DaniCSantos) (design)
* [David Esparza](https://github.com/dborquez) (QA)

# Licence

SLV uses one of the jQuery easing functions for animation
(see app/elements/slv-component-select.html). jQuery is released
under an MIT licence
(see https://github.com/jquery/jquery/blob/master/LICENSE.txt)

SLV itself is released under an MIT licence.

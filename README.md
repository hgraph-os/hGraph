hGraph (canvas branch)
========


###About this branch###

This version is an attempt to use the html5 canvas technology to replace SVG for performance reasons. 

###Readying the repo###

Before cloning this branch, make sure you have the [node package manager](https://npmjs.org/) and [grunt task runner](http://gruntjs.com/getting-started) on your machine. Dependencies (grunt, jasmine, benchmark, etc...) for the repo can then be installed by running:
	
	$ npm install
	
*This command looks into the `package.json` file for packages in the `devDependencies` property and installs them into the `/node_modules` directory*

###Building the src###

Once all npm dependencies have been installed, we can build the source code by running:
	
	$ grunt package
	
This will take care of the following tasks:

* clean the `/build` directory
* compile `src/hgraph.js` into `/build/hgraph.js` using [smash](https://github.com/mbostock/smash)
* create the [jsDoc](https://github.com/jsdoc3/jsdoc) documentation in `/docs`
* minify the script using [yuicompressor](https://github.com/mathiasbynens/grunt-yui-compressor) into `/build/hgraph.min.js`
* move the files into appropriate places in `/examples`
* run [grunt-karma](https://npmjs.org/package/grunt-karma) unit tests

###About the REPO###

An open source javascript-based web application for visualizing health data.

Website: [hgraph.org](http://hgraph.org/)

hGraph Canvas Demo: http://exploratory.hgraph.org/canvas/
hGraph Demo: http://demo.hgraph.org/

hMixer Demo: http://www.hscoremixer.org/
hMixer Repo: https://github.com/goinvo/hMixer

The hGraph is an open source project that is being developed and designed to provide an industry standard of presenting health care information to professionals and average citizens alike.


###Core Contributors###
Founders/Designers: [Involution Studios](http://www.goinvo.com/)

Architects/Engineers: [iMedia Solutions](http://www.myimedia.com/)

###License###

hGraph and hMixer are licensed under the Apache-2.0 open source license. You can find more information on the Apache-2.0 license at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)


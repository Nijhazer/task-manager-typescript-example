# Task Manager - An Example TypeScript Application #

The Task Manager application is intended to provide an example of how to develop front-end and API functionality using
[TypeScript](http://www.typescriptlang.org/).

## Usage ##

To run the application,

1. Download all required dependencies
2. Create a configuration file
3. Start the API
4. Start the application

### Dependencies ###

Install [Node.js](https://nodejs.org/) if you haven't already.

Then, install a few global dependencies that you'll need:

1. The [Gulp](http://gulpjs.com/) build system
2. The [TypeScript definition manager](https://github.com/DefinitelyTyped/tsd)
3. [Bower](http://bower.io/), for managing libraries used by the UI

`npm install -g gulp tsd bower`

If you want to work with the code, it's recommended that you also install the [Karma](http://karma-runner.github.io/0.13/index.html) test runner
so that you can run the unit tests.

`npm install -g karma`

Install local dependencies specified in package.json:

`npm install`

Finally, install the TypeScript type definitions needed for third-party libraries that we're using:

`tsd reinstall`

### Configuration ###

The configuration file is `.env`, at the root of the source tree. The actual `.env` file is not versioned, but you can use
`env.example` as a base.

The configuration file is used for both the API and the UI. Within this file, only configuration properties beginning with
'UI_' are made available to the UI. The main property you'll need to change is `DB_CONNECTION_URL`. Any tasks
that you create with this application are sent to the API, which then attempts to store them in a database. Right now,
the only supported database is [MongoDB](https://www.mongodb.org/), and connections to Mongo are made using
a connection URL. If you don't want to set up a Mongo instance locally, you can use the free tier at [MongoLab](https://mongolab.com/)
to get started.

The other configuration property is `UI_API_BASE_URL`, which is the URL prefix for any API calls that the UI makes. You can
leave this set as-is.

### Starting the API ###

Run this command: `gulp serve:api`

Gulp will build the API and start running the server on port 9000. Press `Ctrl+C` to stop the server.

### Starting the application ###

While the API is running, open another terminal window and run this command: `gulp serve:www`

Gulp will build the UI and serve it up on port 3000. If you modify any TypeScript files, they will be automatically recompiled.

## Source Tree Overview ##

`tslint.json` - Configuration for the TypeScript linter. See [tslint on GitHub](https://github.com/palantir/tslint) for an overview of all supported configuration options.

`tsd.json` - Configuration for `tsd`, the TypeScript definition manager. This will be updated whenever you use tsd to download a new type definition.

`tsconfig.json` - The [TypeScript project file](https://github.com/Microsoft/typescript/wiki/tsconfig.json). Provides options
your IDE of choice will use when editing TypeScript. The TypeScript compiler also uses this when building API and UI code,
but Gulp overrides some of the options on a per-target basis-- most notably, UI classes are compiled as AMD modules,
whereas API classes are compiled as CommonJS modules.

`package.json` - Configuration for the [Node package manager](https://www.npmjs.com/).

`karma.conf.js` - Configuration for the Karma test runner. Used when executing unit tests.

`gulpfile.js` - Configuration for Gulp. All Gulp tasks (e.g., `gulp serve:www`) are configured here.

`bower.json` and `.bowerrc` - Configuration for the Bower package manager.

`.env.example` - Template configuration file for this application.

`tools/typings` - The TypeScript definition manager will download definitions into this directory.

`src/core` - TypeScript code shared by the UI and the API.

`src/api` - TypeScript code used by the API.

`src/ui` - TypeScript code used by the UI.

`src/www` - Static assets for the UI (HTML, CSS, third-party JavaScript libraries).

`src/www/views` - [Handlebars templates](http://handlebarsjs.com/) used by the UI.
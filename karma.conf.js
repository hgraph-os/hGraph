// Karma configuration
// Generated on Wed Jun 19 2013 11:58:20 GMT-0400 (EDT)

// base path, that will be used to resolve files and exclude
basePath = '';

// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'build/*.js',
  'tests/**/*.spec.js'
];


// list of files to exclude
exclude = [ ];

// test results reporter to use
reporters = ['dots'];

// web server port
port = 9876;

// cli runner port
runnerPort = 9100;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
logLevel = LOG_DISABLE;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;

// Start these browsers
browsers = ['Firefox','Chrome'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;

// Continuous Integration mode
singleRun = true;

var baseUrl = '/base';
var config = {
    baseUrl: baseUrl,
    baseUILib: baseUrl + '/src/www/js/lib',
    baseAPILib: baseUrl + '/node_modules',
    fileInclusionTest: /spec\..+\.js$/i
};

var allTestFiles = [];

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
  if (config.fileInclusionTest.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
    allTestFiles.push(normalizedTestModule);
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: config.baseUrl,
  
  paths: {
      'chai': config.baseAPILib + '/chai/chai',
      'lodash': config.baseUILib + '/lodash/lodash.min',
      'jquery': config.baseUILib + '/jquery/dist/jquery.min',
      'promise': config.baseUILib + '/es6-promise/promise.min',
      'handlebars': config.baseUILib + 'handlebars/handlebars.amd.min'
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});

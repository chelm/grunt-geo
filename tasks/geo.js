/*
 * grunt-geo
 * https://github.com/chelm/grunt-geo
 *
 * Copyright (c) 2013 chelm
 * Licensed under the MIT license.
 */

'use strict';


module.exports = function(grunt) {

  var async = require('async'),
    request = require('request');

  grunt.registerMultiTask('geo', 'This task will create a geojson file from the contribotr locations of a git repo', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      file: 'contributors.json'
    });

    console.log('OPTIONS', options);
    //grunt.log.writeln('File created.');

    //if (!this.options.repo){
    //  grunt.file.exists(filepath)
    //}

    var pkg = grunt.file.readJSON('package.json');
    console.log(pkg.homepage.replace('\/\/', '\/\/api.'));

    request.get('https://api.github.com/repos/d3/d3-parsets/collaborators', function( res ){
      console.log( res );
    });

    // Iterate over all specified file groups.
    /*this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      // Handle options.
      src += options.punctuation;

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });*/
  });

};

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
    mq = require('mapquest'),
    request = require('request');

  grunt.registerMultiTask('geo', 'Creates a geojson file from the contributor locations in a repo', function() {
    var done = this.async();    
    var options, reqs = 0, processed = 0, points = [];

    var geocode = function( loc, user, callback ){
      mq.geocode( loc, function(err, result) { 
        result.latLng.user = user;
        points.push( result.latLng );
        callback();      
      });
    };

    var process = function(){
      processed++;
      if ( processed === reqs ){
        grunt.file.write( options.file, createGeoJson(points) );
        done();
      }
    };

    var createGeoJson = function( pnts ){
      var geojson = { type: 'FeatureCollection', features: []};
      pnts.forEach(function(p){
        geojson.features.push({
          type: 'Feature',
          properties: {user: p.user },
          geometry: {
            type: 'Point',
            coordinates: [p.lng, p.lat]
          }
        });
      });

      return JSON.stringify( geojson );
    };

    if ( !this.options.file ){ 
      options = this.options({
        file: 'collaborators.geojson'
      });
    }

    var pkg = grunt.file.readJSON('package.json');
    options.repo = pkg.homepage.replace('\/\/github.com', '\/\/api.github.com/repos');

    request.get( options.repo + '/collaborators?access_token=cc5a0b92bb9a728644306468a67312f3840a19c0', function( err, res, body ){
      var contribs = JSON.parse( body );
      contribs.forEach(function( c ){
        request.get( c.url, function(e, r, b){
          var loc = JSON.parse( b ).location;
          if (loc) {
            reqs++;
            geocode( loc, c.login, process);
          }
        });
      });
    });

  });

};

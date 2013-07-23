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
        file: 'contributors.json'
      });
    }

    var pkg = grunt.file.readJSON('package.json');
    if ( !options.repo ){
      options.repo = pkg.homepage.replace('\/\/github.com', '\/\/api.github.com/repos');
    }

    console.log('OPTIONS', options);

    request.get( options.repo, function( err, res, body ){
      var repoJson = JSON.parse( body );
      request.get( repoJson.owner.url, function(e, r, b){
        var loc = JSON.parse( b ).location;
        if (loc) {
          reqs++;
          geocode( loc, repoJson.owner.login, function(){
            processed++;
            if ( processed === reqs ){
              grunt.file.write( options.file, createGeoJson(points) );
              done();
            }
          });
        }
      });
    });

  });

};

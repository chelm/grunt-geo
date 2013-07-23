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
    
    var pkg = grunt.file.readJSON('package.json');
    options = this.options({
      file: 'collaborators.geojson',
      repo: pkg.homepage.replace('\/\/github.com', '\/\/api.github.com/repos')
    });


    var geocode = function( loc, user, callback ){
      mq.geocode( loc, function(err, result) { 
        if ( result && result.latLng ){ 
          result.latLng.user = user;
          points.push( result.latLng );
          callback();      
        } else {
          reqs--;
        }
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

    request.get( options.repo + '/collaborators'+ (( options.token ) ? '?access_token='+options.token : ''), function( err, res, body ){
      var contribs = JSON.parse( body );
      contribs.forEach(function( c ){
        request.get( c.url + (( options.token ) ? '?access_token='+options.token : ''), function(e, r, b){
          var user = JSON.parse( b );
          if (user.location) {
            console.log('\t', user.location);
            reqs++;
            geocode( user.location, c.login, process);
          }
        });
      });
    });

  });

};

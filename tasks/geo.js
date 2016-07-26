/*
 * grunt-geo
 * https://github.com/chelm/grunt-geo
 *
 * Copyright (c) 2013 chelm
 * Licensed under the MIT license.
 */

'use strict';


module.exports = function(grunt) {

  var mq = require('mapquest'),
    arc = require('arc'),
    request = require('request');

  grunt.registerMultiTask('geo', 'Creates a geojson file from the contributor locations in a repo', function() {
    var done = this.async();    
    var options, 
      centerPoint, 
      reqs = 0, 
      processed = 0, 
      points = [], 
      lines = [];
    
    var pkg = grunt.file.readJSON('package.json');

    options = this.options({
      file: 'collaborators.geojson',
      type: 'collaborators'
      //repo: pkg.homepage.replace('\/\/github.com', '\/\/api.github.com/repos')
    });


    var geocode = function( loc, user, callback ){
      reqs++;
      mq.geocode( loc, function(err, result) { 
        if ( result && result.latLng ){ 
          result.latLng.user = user;
          points.push( result.latLng );
          callback();      
        } else {
          callback();      
        }
      });
    };

    // computes the center of the points 
    var center = function( callback ){
      if ( points.length > 1) { 
        var lat1 = points[0].lat, 
          lng1 = points[0].lng;
        var minx = lng1, 
          miny = lat1, 
          maxx = lng1, 
          maxy = lat1; 
        points.forEach(function( p ){
          if (p.lat < miny) miny = p.lat;
          if (p.lng < minx) minx = p.lng;
          if (p.lat > maxy) maxy = p.lat;
          if (p.lng> maxx) maxx = p.lng;
        });
        var x = minx - ((minx - maxx) / 2); 
        var y = miny - ((miny - maxy) / 2);
        centerPoint = { lat: y, lng: x };
        points.push({lat: y, lng: x, center: 'Approximate Geographic Center'}); 
        callback();
      } else {
        callback();
      }
    };

    var createLines = function( callback ){
      points.forEach(function( p ){
        if ( !p.center ){
          var start = new arc.Coord( p.lng, p.lat );
          var end = new arc.Coord( centerPoint.lng, centerPoint.lat );
          var gc = new arc.GreatCircle( start, end, { 'marker-color': '#555555'} );
          var line = gc.Arc(20);
          lines.push(line.json());
        }
      });
      callback();
    };

    var process = function(){
      processed++;
      if ( processed === reqs ){
        center(function(){
          if (centerPoint){
            createLines(function(){
              console.log('\t Saving file: ', options.file); 
              grunt.file.write( options.file, createGeoJson(points) );
              done();
            });
          } else {
            console.log('\t Saving file: ', options.file); 
            grunt.file.write( options.file, createGeoJson(points) );
            done();
        }
        });
      }
    };

    var createGeoJson = function( pnts ){
      var geojson = { type: 'FeatureCollection', features: []};
      pnts.forEach(function(p){
        var props = {};
        if (p.user) { 
          props.user = p.user;
          props['marker-size'] = 'small';
        }
        if (p.center) { 
          props.center = p.center;
          props['marker-size'] = 'large';
          props['marker-color'] = '#ff0055';
        }
        geojson.features.push({
          type: 'Feature',
          properties: props,
          geometry: {
            type: 'Point',
            coordinates: [p.lng, p.lat]
          }
        });
      });
      lines.forEach(function( l ){
        geojson.features.push( l );
      });
      return JSON.stringify( geojson );
    };

    if ( !options.repo ){ 
      console.log('\t Can\'t find a repo to use. Please a repo to the task options.');
    } else {
      console.log('\t Using repo:',  options.repo + '/' + options.type);

      request.get({
        url:  options.repo + '/' + options.type + (( options.token ) ? '?access_token='+options.token : ''),
        headers: {
          'User-Agent': 'grunt-geo'
        }
      }, function( err, res, body ){
        var contribs = JSON.parse( body );
        contribs.forEach(function( c ){
          var url = ( options.type === "forks" ) ? c.owner.url : c.url;
          request.get({
            url:c.url + (( options.token ) ? '?access_token='+options.token : ''),
            headers: {
              'User-Agent': 'grunt-geo'
            }
          }, function(e, r, b){
            var user = JSON.parse( b );
            if (user.location) {
              geocode( user.location, c.login, process);
            }
          });
        });
      });
    }

  });

};

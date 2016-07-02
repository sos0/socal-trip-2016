/* global io,L */

$(function() {

  'use strict';
  var socket = io();
  socket.emit('onlineUsers', 1);

  var MARKER_TYPES = [
    'wtf', 'hangout', 'cop', 'cool', 'club', 'music', 'study', 'event'
  ];

  var $frame = $('#forcecentered');
  var $wrap  = $frame.parent();

  // Call Sly on frame
  $frame.sly({
    horizontal: 1,
    itemNav: 'forceCentered',
    smart: 1,
    activateMiddle: 1,
    activateOn: 'click',
    mouseDragging: 1,
    touchDragging: 1,
    releaseSwing: 1,
    startAt: 3,
    speed: 300,
    elasticBounds: 1,
    easing: 'easeOutExpo',

    // Buttons
    prev: $wrap.find('.prev'),
    next: $wrap.find('.next')
  });

  var isAddingMarker = false;
  var latlng;
  /*
  $('.wrap').click(function() {
    var selected = $('.active').attr('name');
    // $('.marker-name').html(selected);
  });
*/
  $('#live-btn').click(function() {
    $('#add-marker-diag').toggleClass('visible');

    isAddingMarker = !isAddingMarker;
    //$('#add-marker').toggleClass('visible');
  });

  $('#add-marker .close').click(function() {
    $('#add-marker').toggleClass('visible');
  });

  $('#error .close').click(function() {
    $('#error').toggleClass('visible');
  });


  $('#add-marker .add-marker-btn').click(function() {
    $('#add-marker').toggleClass('visible');
  });

  $('#marker-info .close').click(function() {
    $('#marker-info').toggleClass('visible');
  });

  $('.leaflet-marker-icon').click(function() {
    $('#marker-info').toggleClass('visible');
  });

  $('#add-marker-form').submit(function() {
    var data = $('#add-marker-form').serialize() + '&lat=' + latlng.lat +
    '&lon=' + latlng.lng + '&ttl=86400000' +
    '&type=' + (Math.floor(Math.random() * MARKER_TYPES.length) + 1);
    $.ajax({
      url : $('#add-marker-form').attr('action'),
      type: $('#add-marker-form').attr('method'),
      data: data,
      error: function(res) {
        var message = res.responseText || 'Something went wrong with the server.';
        $('.error-text').text(message);
        $('#error').toggleClass('visible');
      },
      success: function(res) {
        //window.location.replace('/home');
        //$('#add-marker').toggleClass('visible');
      }
    });

    // Return false so we don't submit twice
    return false;
  });

  /*
    mapbox-related code
  */
  // Provide your access token
  L.mapbox.accessToken=
  'pk.eyJ1Ijoic29zMCIsImEiOiJ3aTZKTVlFIn0.I9-1qEB9QZfY_FZPoEzHzQ';

  // Create a map in the div #map
  var southWest = L.latLng(37.315764, -122.049419),
    northEast = L.latLng(37.322795, -122.041566),
      bounds = L.latLngBounds(southWest, northEast);


  var map = L.mapbox.map('map', 'sos0.m3557bk6', {
      // set that bounding box as maxBounds to restrict moving the map
      // see full maxBounds documentation:
      // http://leafletjs.com/reference.html#map-maxbounds
      maxBounds: bounds,
      maxZoom: 20,
      minZoom: 16
  });

  // zoom the map to that bounding box
  map.fitBounds(bounds);

  var myLayer = L.mapbox.featureLayer().addTo(map);

  myLayer.on('layeradd', function(e) {
    var marker = e.layer,
      feature = marker.feature;
    marker.setIcon(L.divIcon(feature.properties.icon));
  });

  myLayer.on('click', function(e) {
    var marker = e.layer,
      feature = marker.feature;
    $('#info-title').text(feature.properties._title);
    $('#info-description').text(feature.properties._description);
    $('#info-location').text(feature.properties.location);
    // Open Modal
    $('#marker-info').toggleClass('visible');
  });

  map.on('click', function(e) {
    if (isAddingMarker) {

      latlng = e.latlng;
      $('#add-marker-diag').toggleClass('visible');

      isAddingMarker = !isAddingMarker;

      $('#add-marker').toggleClass('visible');
    }

  });
  /*
    UI-related code
  */
  $('#feed-menu').sidebar('setting', 'transition', 'overlay');
  $('#add-menu').sidebar('setting', 'transition', 'overlay');
  $('#feed-menu').sidebar('attach events', '#feed-btn', 'toggle');
  $('#add-menu').sidebar('attach events', '#add-btn', 'toggle');
  $('.coupled.modal').modal({
    allowMultiple: true
  });
  // open second modal on button click
  $('.second.modal').modal('attach events', '.first.modal .button');
  // show first immediately
  $('.first.modal').modal('attach events', '#login-btn', 'show');

  var color = '#' + [
        (~~(Math.random() * 16)).toString(16),
        (~~(Math.random() * 16)).toString(16),
        (~~(Math.random() * 16)).toString(16)].join('');

  /*
  $('#live-btn').click(function() {

    var marker = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.04450, 37.31850]
      },
      properties: {
        id: 'dssd',
        title: 'lol',
        description: 'lol2',
        location: 'lollocation',
        icon: {
          iconSize: [50, 50], // size of the icon

          className: 'daze-tag event'
        }
      }
    };

    var geoJsonArr = myLayer.getGeoJSON() || [];

    geoJsonArr.push(marker);

    myLayer.setGeoJSON(geoJsonArr);

    //marker.addTo(map);
    //socket.emit('marker', 'marker');
  });

  */
  $('#signup').modal('attach events', '#signup-btn', 'show');
  $('#login').modal('attach events', '#login-btn', 'show');
  $('#splash').modal('show');

  var MarkersList = [];
  // Initialize the map for the user
  socket.on('initialize', function(markers) {
    for (var i in markers) {

      var marker = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [markers[i].lon, markers[i].lat]
        },
        properties: {
          id: markers[i].id,
          _title: markers[i].title,
          _description: markers[i].description,
          location: markers[i].location,
          icon: {
            iconSize: [50, 50], // size of the icon

            className: 'daze-tag ' + MARKER_TYPES[markers[i].type]
          }
        }
      };

      var geoJsonArr = [];

      if (myLayer.getGeoJSON()) {

        if (Array.isArray(myLayer.getGeoJSON())) {
          geoJsonArr = myLayer.getGeoJSON();
        } else {
          geoJsonArr.push(myLayer.getGeoJSON());
        }
      }
      geoJsonArr.push(marker);

      myLayer.setGeoJSON(geoJsonArr);

    }

  });

  socket.on('new marker', function(marker) {
    var newMarker = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [marker.lon, marker.lat]
      },
      properties: {
        id: marker.id,
        _title: marker.title,
        _description: marker.description,
        location: marker.location,
        icon: {
          iconSize: [50, 50], // size of the icon

          className: 'daze-tag ' + MARKER_TYPES[marker.type]
        }
      }
    };

    var geoJsonArr = [];

    if (myLayer.getGeoJSON()) {

      if (Array.isArray(myLayer.getGeoJSON())) {
        geoJsonArr = myLayer.getGeoJSON();
      } else {
        geoJsonArr.push(myLayer.getGeoJSON());
      }
    }
    geoJsonArr.push(newMarker);

    myLayer.setGeoJSON(geoJsonArr);
  });




});


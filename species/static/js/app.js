'use strict';


angular.module('mol.controllers',[]);

angular.module('mol', [
  'ngSanitize',
  'ngCookies',
  'ngAnimate',
  'mol.api',
  'mol.filters',
  'mol.services',
  'mol.directives',
  'mol.species-search',
  'mol.species-description',
  'mol.location-search',
  'mol.species-images',
  'mol.point-filters',
  'mol.controllers',
  'mol.loading-indicator',
  'ui.bootstrap',
  'ui.router',
  'ui.checkbox',
  'uiGmapgoogle-maps',
  //'nvd3',
  'ui-rangeSlider',
  'percentage',
  'km2',
  'angular-loading-bar',
])
.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
})
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;
    //cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.latencyThreshold = 500;
  }])
.config(function($sceDelegateProvider,$stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

  var speciesParams = ""+
    "{scientificname}?" +
    "regiontype&region&" +
    "dsid&type&" +
    "embed&noimage&noname&nodesc&noregionselect&nospeciesselect";
  $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http*://localhost**',
      'http*://*mol.org/**',
      'http*://api.mol.org/**'
    ]);
  $httpProvider.defaults.useXDomain = true;
  //send cookies
  $httpProvider.defaults.withCredentials = true;
  $urlRouterProvider.otherwise("species/");

  $stateProvider
    .state(
      'species', //this view contains the bones of the Species Info pages (name, pic, & search bar)
      {
        abstract: true,
        templateUrl: 'static/layouts/base.html',
        controller: 'molSpeciesCtrl'
      }
    )
    .state(
      'species.species-in-reserves',
      {
        title: "Species in Reserves",
        templateUrl: 'static/views/species-in-reserves/main.html',
        controller: 'molAssessmentCtrl',
        url: '/pa'
      }
    )
    .state(
      'species.overview', //the description page adds wiki text, ed charts, and a map
      {
        title: "Species Information",
        views: {
          "" : {templateUrl: 'static/layouts/basic.html'},
          "content@species.overview" : {templateUrl: 'static/views/overview/content.html',
          controller: 'molOverviewCtrl'},
        },
        url: '/{0}'.format(speciesParams)
      }
    )
    /*.state(
      'species.habitat-distribution', //the refine page adds the refine controls, metrics, and a map
      {
        title: "Range Maps",
        views: {
          "" : {templateUrl: 'static/layouts/species-grid.html',},
          "left_top_1@species.habitat-distribution" : {templateUrl:'static/views/species_search.html'},
          "right_top_1@species.habitat-distribution": {templateUrl: 'static/views/region_search.html'},
          "left_top_2@species.habitat-distribution" : {templateUrl:'static/partials/name.html'},
          "right_top_2@species.habitat-distribution": {templateUrl: 'static/partials/map.html'},
          "left_top_3@species.habitat-distribution" : {templateUrl: 'static/partials/refine_controls.html'},
          "left_bottom_1@species.habitat-distribution" : {templateUrl: 'static/partials/range_metrics.html',
          controller: 'molRefineCtrl'}
        },
        url: '/range/{0}'.format(speciesParams)
      }
    )
    .state(
      'species.habitat-change', //the change page adds the refine controls, metrics, and change charts
      {
        title: "Habitat Change Analysis",
        views: {
          "" : {
            "templateUrl":
            "static/layouts/species-grid.html"},
          "left_top_1@species.habitat-change" : {
            "templateUrl": "static/partials/name.html"},
          "left_top_2@species.habitat-change" : {
            "templateUrl": "static/partials/refine_controls.html"},
          "right_top_1@species.habitat-change":  {
            "templateUrl" : "static/partials/change_charts.html",
            "controller" : "molChangeCtrl"
          },
          "left_top_3@species.habitat-change" : {
            "templateUrl": 'static/partials/habitat_metrics.html'}
        },
        url: '/habitat/{0}'.format(speciesParams)
      }
    )
    .state(
      'species.reserve-coverage', //the change page adds the refine controls, metrics, and change charts
      {

        title: "Protection Status",
        views: {
          "" : {templateUrl: "static/layouts/species-grid.html"},
          "left_top_1@species.reserve-coverage" : {templateUrl:'static/partials/name.html'},
          "left_top_2@species.reserve-coverage" : { templateUrl : 'static/partials/refine_controls.html'},
          "left_bottom_1@species.reserve-coverage" : {templateUrl: 'static/partials/range_metrics.html'},
          "right_bottom_1@species.reserve-coverage": {
              "templateUrl": 'static/partials/protect_metrics.html',
              "controller" : 'molProtectCtrl'},
          "right_top_1@species.reserve-coverage": {templateUrl: 'static/partials/map.html'}
        },
        url: '/protect/{0}'.format(speciesParams)

      }
    )*/
    .state(
      'species.detailed-map',
      {
        views: {
          "": {
            templateUrl: 'static/layouts/map-left-sidebar.html',
            controller: 'molDetailMapCtrl'
          },
          "sidebar@species.detailed-map" :{
            templateUrl: "static/views/detailed-map/sidebar.html"
          },
          "map@species.detailed-map" : {
            templateUrl: "static/views/detailed-map/map.html"
          }
        },
        url: '/map/{0}'.format(speciesParams)
      }
    );

    //Gets rid of the # in the querystring. Wont work on IE
    $locationProvider.html5Mode(true);


});

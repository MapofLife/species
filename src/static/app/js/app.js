'use strict';


angular.module('mol.controllers',[]);

angular.module('mol', [
  'ngSanitize',
  'ngCookies',
  'ngAnimate',
  'ngTouch',
  'mol.api',
  'mol.filters',
  'mol.services',
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
    cfpLoadingBarProvider.latencyThreshold = 100;
  }])
.config(function($sceDelegateProvider,$stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

  var speciesParams = ""+
    "{scientificname}?" + //taxon
    "regiontype&region&" + //region constraint
    "dsid&type&" + //selected data options
    "embed&noimage&noname&nodesc&noregionselect&nospeciesselect&nosidebar&" + //embed options
    "noheader&nosubnav&nofooter&norandom&nofilters";
  $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http*://localhost**',
      'http*://*mol.org/**',
      'http*://api.mol.org/**',
      'http*://mapoflife.github.io/**'
    ]);
  $httpProvider.defaults.useXDomain = true;
  //send cookies
  $httpProvider.defaults.withCredentials = false;
  $urlRouterProvider.otherwise("/overview/");

  $stateProvider
    .state(
      'species', //this view contains the bones of the Species Info pages (name, pic, & search bar)
      {
        abstract: true,
        views: {
          "": {
            templateUrl: 'static/app/layouts/base-static.html',
            controller: 'molSpeciesCtrl'},
          "@species" : {
            templateUrl: 'static/app/layouts/map-with-sidebars.html'
          }
        }

      }
    )
    .state(
      'pa',
      {
        views: {
          "@" :{templateUrl: "static/app/layouts/base-scrolling.html"},
          "@pa" : {templateUrl: "static/app/views/species-in-reserves/main.html"}
        },
        url: '/pa'
      }
    )
    .state(
      'species.overview',
      {
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/overview/sidebar.html",
            controller: 'molOverviewCtrl'
          }
        },
        url: '/{0}'.format(speciesParams)
      }
    )
    .state(
      'species.detailed-map',
      {
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/detailed-map/sidebar.html",
            controller: 'molDetailMapCtrl'
          }
        },
        url: '/map/{0}'.format(speciesParams)
      }
    )
    .state(
      'species.habitat-distribution',
      {
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/habitat-distribution/sidebar.html",
            controller: 'molHabitatDistributionCtrl'
          }
        },
        url: '/range/{0}'.format(speciesParams)
      }
    )
    .state(
      'species.habitat-distribution.reserve-coverage',
      {
        views: {
          "protect-metrics@species.habitat-distribution" :{
            templateUrl: "static/app/views/reserve-coverage/reserve-coverage.html",
            controller: 'molReserveCoverageCtrl'
          }
        },
        url: '^/protect/{0}'.format(speciesParams)
      }
    );
    //Gets rid of the # in the querystring. Wont work on IE
    $locationProvider.html5Mode(true);

});

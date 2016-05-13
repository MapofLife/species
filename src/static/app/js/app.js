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
      'http*://api.mol.org/**'
    ]);
  $httpProvider.defaults.useXDomain = true;
  //send cookies
  $httpProvider.defaults.withCredentials = true;
  $urlRouterProvider.otherwise("/overview");

  $stateProvider
    .state(
      'species', //this view contains the bones of the Species Info pages (name, pic, & search bar)
      {
        abstract: true,
        views: {"": {
            templateUrl: 'static/app/layouts/base.html',
            controller: 'molSpeciesCtrl'}}
      }
    )
    .state(
      'species.overview',
      {
        views: {
        /*  "": {
            templateUrl: 'static/app/layouts/map-left-sidebar.html',
            controller: 'molOverviewCtrl'
          },*/
          "sidebar@species" :{
            templateUrl: "static/app/views/overview/sidebar.html",
            controller: 'molOverviewCtrl'
          },
          /*"map@species" : {
            templateUrl: "static/app/partials/map.html"
          }*/
        },
        url: '/overview/{0}'.format(speciesParams)
      }
    )
    .state(
      'species.detailed-map',
      {
        views: {
          /*"": {
            templateUrl: 'static/app/layouts/map-left-sidebar.html',
            controller: 'molDetailMapCtrl'
          },*/
          "sidebar@species" :{
            templateUrl: "static/app/views/detailed-map/sidebar.html",
            controller: 'molDetailMapCtrl'
          },
        /*  "map@species.detailed-map" : {
            templateUrl: "static/app/partials/map.html"
          }*/
        },
        url: '/detail/{0}'.format(speciesParams)
      }
    );

    //Gets rid of the # in the querystring. Wont work on IE
    $locationProvider.html5Mode(true);


});

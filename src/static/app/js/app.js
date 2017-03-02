'use strict';


angular.module('mol.controllers',[]);

angular.module('mol', [
  //base angular
  'ngSanitize', 'ngCookies', 'ngAnimate', 'ngTouch', 'pascalprecht.translate',
  'angular.filter',

  //3rd party ui
  'ui.bootstrap', 'ui.router', 'ui.select','ui.checkbox','ui-rangeSlider',
  'uiGmapgoogle-maps','suEndlessScroll', 'ngError',

  //'mol.meta',
  'mol.api', 'mol.ui-map', 'mol.i18n','mol.filters', 'mol.services', 'mol.species-search',
  'mol.species-description', 'mol.location-search', 'mol.species-images',
  'mol.point-filters', 'mol.controllers', 'mol.loading-indicator',

  'percentage', 'km2', 'imageHelpers'
])
.constant('molConfig',{
    "module" : "species-dev", //module name (used in routing)
    "api" : "0.x",
    "protocol" : "http",
    "base" : angular.element('#mol-asset-base').attr('content'), //static assets base
    "url" :  angular.element('#mol-url').attr('content'),
    "lang" : angular.element('#mol-lang').attr('content'),
    "region" : angular.element('#mol-region').attr('content'),
    "prod": (window.location.hostname!=='localhost') //boolean for MOL production mode
})
//move this to i8n
.config(['$translateProvider','molConfig', function($translateProvider,molConfig) {
  if(molConfig.lang) {
    $translateProvider.preferredLanguage(molConfig.lang)
  } else {
    $translateProvider.determinePreferredLanguage()
  }
  $translateProvider.registerAvailableLanguageKeys([
      'en','fr','es','pt','de','zh' ///should move to meta-tag config or api call
  ]);
}])
.config(['uiGmapGoogleMapApiProvider','$translateProvider',
	function(uiGmapGoogleMapApiProvider,$translateProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyABlkTTWW1KD6TrmFF_X6pjWrFMGgmpp9g',
        version: '3.x', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization',
        language: $translateProvider.preferredLanguage()

    });
}])
.factory('molBaseIntercept', ['$log', 'molConfig', function($log, molConfig) {
    return {
      request: function(r) {
        r.url = (r.url.indexOf('static')===0) ? molConfig.base + r.url : r.url;
        return(r)
      }
    };
}]).config(['$urlRouterProvider', function($urlRouterProvider){
  $urlRouterProvider.rule(function ($injector, $location) {
    var path = $location.path(),
       normalized = path.toLowerCase();

      if(path.contains('detail')) {
        $location.path(path.replace('detail','map'));
      }
      if(path.contains('overview/')) {
        $location.path(path.replace('overview/',''));
      }
    });

}]).config(['molConfig','$sceDelegateProvider','$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
  function(molConfig,$sceDelegateProvider,$stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

  $httpProvider.interceptors.push('molBaseIntercept');

  var params = ""+
    "{scientificname}?" + //taxon
    ((!molConfig.url.includes('{region}')) ?"regiontype&region&":'') + //region constraint
    "dsid&type&beta&" + //selected data options
    "embed&sidebar&header&subnav&footer&speciessearch&regionsearch";

  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://spi-metrics.api-0-x.map-of-life.appspot.com/',
    'http*://localhost**',
    'http*://127.0.0.1:9001/**',
    'http*://*mol.org/**',
    'http*://api.mol.org/**',
    'http*://mapoflife.github.io/**'
  ]);

  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.withCredentials = false;
  $urlRouterProvider.otherwise(molConfig.url);

  $stateProvider
    .state(
      'species', //this view contains the bones of the Species Info pages (name, pic, & search bar)
      {
        abstract: true,
        data: {title : 'Species Pages'},
        views: {
          "": {
            templateUrl: 'static/app/layouts/base-static.html',
            controller: 'molSpeciesCtrl'},
          "@species" : {
            templateUrl: 'static/app/layouts/map-with-sidebars.html'
          }
        },
        url: molConfig.url
      }
    )
    .state(
      'species.home',
      {
        data: {title : 'Species Intro'},
        views: {
          "@" :{templateUrl: "static/app/layouts/base-scrolling.html"},
          "@species.home" : {
            templateUrl: "static/app/views/home/main.html",
            controller: 'molHomeCtrl'
          }
        },
        url: ''
      }
    )
    .state(
      'species.pa',
      {
        data: {title : 'Species In Reserves'},
        views: {
          "@" :{templateUrl: "static/app/layouts/base-scrolling.html"},
          "@species.pa" : {templateUrl: "static/app/views/species-in-reserves/main.html"}
        },
        url: 'pa'
      }
    )
    .state(
      'species.overview',
      {
        data: {title : 'Species Overview'},
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/overview/sidebar.html",
            controller: 'molOverviewCtrl'
          }
        },
        url: '{0}'.format(params)
      }
    )
    .state(
      'species.detailed-map',
      {
        data: {title : 'Species Detail Map'},
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/detailed-map/sidebar.html",
            controller: 'molDetailMapCtrl'
          }
        },
        url: 'map/{0}'.format(params)
      }
    )
    .state(
      'species.habitat-distribution',
      {
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/habitat-distribution/sidebar.html",
            controller: 'molHabitatDistributionCtrl'
          },
          "habitat-controls@species.habitat-distribution" : {
            templateUrl: "static/app/views/habitat-controls/template.html",
            controller: "molHabitatControlsCtrl"
          }
        },
        url: 'habitat-distribution/{0}'.format(params)
      }
    )
    .state(
      'species.habitat-trend',
      {
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/habitat-trend/sidebar.html",
            controller: 'molHabitatTrendCtrl'
          },
          "habitat-controls@species.habitat-trend" : {
            templateUrl: "static/app/views/habitat-controls/template.html",
            controller: "molHabitatControlsCtrl"
          },
          "charts@species" :{
            templateUrl: "static/app/views/habitat-trend/trend-charts.html",
            controller: 'molHabitatTrendCtrl'
          }
        },
        url: 'habitat-trend/{0}'.format(params)
      }
    )
    .state(
      'species.reserve-coverage',
      { views:{
        "left-sidebar@species" : {
        templateUrl: "static/app/views/reserve-coverage/sidebar.html",
        controller: 'molReserveCoverageCtrl'
      },
      "habitat-controls@species.reserve-coverage" : {
        templateUrl: "static/app/views/habitat-controls/template.html",
        controller: "molHabitatControlsCtrl"
      }},
        url: 'reserve-coverage/{0}'.format(params)
      }
    );


     $locationProvider.html5Mode({
       enabled: true,
       requireBase: false,
       rewriteLinks:  true
     });


}]).run([ '$rootScope', '$state', '$stateParams','molConfig',
function ($rootScope, $state, $stateParams,molConfig) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.molConfig = molConfig;
}]);

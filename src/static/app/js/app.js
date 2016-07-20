'use strict';


angular.module('mol.controllers',[]);

angular.module('mol', [
  //base angular
  'ngSanitize', 'ngCookies', 'ngAnimate', 'ngTouch', 'pascalprecht.translate',
  'angular.filter', 'ngError',

  //3rd party ui
  'ui.bootstrap', 'ui.router', 'ui.select','ui.checkbox','ui-rangeSlider','uiGmapgoogle-maps',

  //'mol.meta',
  'mol.api', 'mol.ui-map', 'mol.i18n','mol.filters', 'mol.services', 'mol.species-search',
  'mol.species-description', 'mol.location-search', 'mol.species-images',
  'mol.point-filters', 'mol.controllers', 'mol.loading-indicator',

  'percentage', 'km2',
])
.constant('molConfig',{
    "module" : "species", //module name (used in routing)
    "api" : "0.x",
    "base" : angular.element('#mol-asset-base').attr('content'), //static assets base
    "url" :  angular.element('#mol-url').attr('content'),
    "lang" : angular.element('#mol-lang').attr('content'),
    "region" : angular.element('#mol-region').attr('content'),
    "prod":(window.location.hostname!=='localhost') //boolean for MOL production mode
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
        v: '3.24', //defaults to latest 3.X anyhow
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
}])
.config(['molConfig','$sceDelegateProvider','$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
  function(molConfig,$sceDelegateProvider,$stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {


  //angular.element('base').href="/"


  $httpProvider.interceptors.push('molBaseIntercept');

  var params = ""+
    "{scientificname}?" + //taxon
    ((!molConfig.url.includes('{region}'))?"region&":'') + //region constraint
    "dsid&type&" + //selected data options
    "embed&sidebar&header&subnav&footer&speciessearch&regionsearch";



  $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http*://localhost**',
      'http*://127.0.0.1:9001/**',
      'http*://*mol.org/**',
      'http*://api.mol.org/**',
      'http*://mapoflife.github.io/**'
    ]);
  $httpProvider.defaults.useXDomain = true;
  //send cookies
  $httpProvider.defaults.withCredentials = false;
  $urlRouterProvider.otherwise(molConfig.url);

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
          },
          "right-sidebar@species" : {
            templateUrl: 'static/app/views/species-list/list.html',
          }

        },
        url: molConfig.url
      }
    )
    .state(
      'pa',
      {
        views: {
          "@" :{templateUrl: "static/app/layouts/base-scrolling.html"},
          "@pa" : {templateUrl: "static/app/views/species-in-reserves/main.html"}
        },
        url: 'pa'
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
        url: '{0}'.format(params)
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
          }
        },
        url: 'range/{0}'.format(params)
      }
    )


    $locationProvider.html5Mode(true);


}]);

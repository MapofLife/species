'use strict';


angular.module('mol.controllers',[]);

angular.module('mol', [
  'ngSanitize', 'ngCookies', 'ngAnimate', 'ngTouch', 'pascalprecht.translate',
  //'mol.meta',
  'mol.api', 'mol.i18n','mol.filters', 'mol.services', 'mol.species-search',
  'mol.species-description', 'mol.location-search', 'mol.species-images',
  'mol.point-filters', 'mol.controllers', 'mol.loading-indicator',
  'ui.bootstrap', 'ui.router', 'ui.checkbox', 'uiGmapgoogle-maps',
  'ui-rangeSlider',
  'percentage', 'km2', 'angular-loading-bar',
])
.constant('molConfig',{
    "module" : "species",
    "base" : angular.element('base').attr('href'), //module name (used in routing)
    "prod":(window.location.hostname!=='localhost') //boolean for MOL production mode
})
.config(function ($translateProvider) {
  $translateProvider
    .determinePreferredLanguage()
    .registerAvailableLanguageKeys([
      'en','fr','es','pt','de','zh'
    ]);
})
.run(['$rootScope','molConfig',function($rootScope,molConfig) {
  $rootScope.molConfig = molConfig;
})
.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyABlkTTWW1KD6TrmFF_X6pjWrFMGgmpp9g',
        v: '3.30', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
})
.run(
  /*
   *  Handles nesting the app at alternate bases to support i18n
   */
  function($timeout,$rootScope,molConfig) {
      var base = angular.element('#mol-base').attr('content');
      if (base) {
        angular.element('base').attr('href', base);
        $rootScope.$on('$viewContentLoading',
          function() {
            console.log(molConfig);
              angular.element('base').attr('href',molConfig.base);
          }
        );
      }
  }
)
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;
    //cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.latencyThreshold = 100;
  }])
.config(function( $sceDelegateProvider,$stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {


  //angular.element('base').href="/en/species/"


  var params = ""+
    "{scientificname}?" + //taxon
    "regiontype&region&" + //region constraint
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
  //$urlRouterProvider.otherwise("/");

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
        url: '/{0}'.format(params)
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
        url: '/map/{0}'.format(params)
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
        url: '/range/{0}'.format(params)
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
        url: '^/protect/{0}'.format(params)
      }
    );
    //Gets rid of the # in the querystring. Wont work on IE
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

})
console.log(angular.module('mol'))

'use strict';


angular.module('mol.controllers',[]);

angular.module('mol', [
  //base angular
  'ngSanitize', 'ngCookies', 'ngAnimate', 'ngTouch', 'pascalprecht.translate',
  'angular.filter',

  //3rd party ui
  'ui.bootstrap', 'ui.router', 'ui.select','ui.checkbox','ui-rangeSlider',
  'uiGmapgoogle-maps','ngError',

  //'mol.meta', 'mol.point-filters', 
  'mol.api', 'mol.ui-map', 'mol.i18n','mol.filters', 'mol.services', 'mol.species-search',
  'mol.species-description', 'mol.location-search', 'mol.species-images',
  'mol.controllers', 'mol.loading-indicator',

  'percentage', 'km2', 'imageHelpers'
])
.constant('molConfig',{
    "module" : "species-classic", //module name (used in routing)
    "api" : "1.x",
    "protocol" : "https",
    //"api_host" : "localhost:8080",
    "base" : angular.element('#mol-asset-base').attr('content'), //static assets base
    "url" :  angular.element('#mol-url').attr('content'),
    "lang" : angular.element('#mol-lang').attr('content'),
    "region" : angular.element('#mol-region').attr('content'),
    "prod": (window.location.hostname!=='localhost') //boolean for MOL production mode
})
//move this to i8n
.config(['$translateProvider','molConfig', function($translateProvider,molConfig) {

  // Grab the static files from the CDN
  $translateProvider.useStaticFilesLoader({
    prefix: 'https://cdn.mol.org/translations/locale-',
    suffix: '.json?201806041403'
  });
  
  if(molConfig.lang) {
    $translateProvider.preferredLanguage(molConfig.lang)
  } else {
    $translateProvider.determinePreferredLanguage()
  }
  $translateProvider.useSanitizeValueStrategy('escapeParameters');
  $translateProvider.fallbackLanguage('en');
  // TODO: should move to meta-tag config or api call
  // 'en','fr','es','pt','de','zh'
  $translateProvider.registerAvailableLanguageKeys(['en', 'de', 'es', 'fr', 'zh'], {
    'en_*': 'en',
    'de_*': 'de',
    'es_*': 'es',
    'fr_*': 'fr',
    'zh_*': 'zh'
  });
}])
.config(['uiGmapGoogleMapApiProvider','$translateProvider',
	function(uiGmapGoogleMapApiProvider,$translateProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCOnD2Wo8hKmE52uuMJn6ZKcS6WfrNSo9w',
        version: '3.33', //defaults to latest 3.X anyhow
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

}]).config(['molConfig','$sceDelegateProvider','$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$urlMatcherFactoryProvider',
  function(molConfig,$sceDelegateProvider,$stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $urlMatcherFactoryProvider) {

  $httpProvider.interceptors.push('molBaseIntercept');

  var urlparams = ""+
    "{scientificname}",
    queryparams = "" + //taxon
    ((!molConfig.url.includes('{region}')) ?"regiontype&region&":'') + //region constraint
    "dsid&type&beta&" + //selected data options
    "embed&sidebar&header&subnav&footer&speciessearch&regionsearch";

  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http*://localhost**',
    'http*://127.0.0.1:9001/**',
    'http*://*mol.org/**',
    'http*://api.mol.org/**',
    'http*://mapoflife.github.io/**',
    'http*://*api-2-x-dot-map-of-life.appspot.com/**',
    'http*://127.0.0.1:8000/**',
  ]);

  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.withCredentials = false;
  $urlMatcherFactoryProvider.strictMode(false);
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
          },
          'map@species' : {
            templateUrl:"static/app/partials/map.html"
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
        url: '?{0}'.format(queryparams)
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
        url: 'pa?{0}'.format(queryparams)
      }
    )
    .state(
      'species.projection',
      {
        data: {title : 'Species Habitat Projection'},
        views: {
          "@" :{templateUrl: "static/app/layouts/base-scrolling.html"},
          "@species.projection" : {
            templateUrl: "static/app/views/projection/landuse/main.html",
            controller: 'molProjectionCtrl'
          }
        },
        url: 'projection?{0}'.format(queryparams)
      }
    )
    .state(
      'species.projection.landuse',
      {
        data: {title : 'Species Habitat Projection: Landuse'},
        views: {
          "@" :{
            templateUrl: "static/app/layouts/base-scrolling.html", 
            controller: 'molSpeciesCtrl'
          },
          "@species.projection.landuse" : {
            templateUrl: "static/app/views/projection/landuse/main.html",
            controller: 'molProjectionCtrl'
          }
        },
        url: '/landuse?{0}'.format(queryparams)
      }
    )
    .state(
      'species.projection.climate',
      {
        data: {title : 'Species Habitat Projection: Climate Change'},
        views: {
          "@" :{templateUrl: "static/app/layouts/base-scrolling.html"},
          "@species.projection.climate" : {
            templateUrl: "static/app/views/projection/climate/main.html",
            controller: 'molProjectionCtrl'
          }
        },
        url: '/climate?{0}'.format(queryparams)
      }
    )
    .state(
      'species.projection-landuse',
      {
        data: {title : 'Species Habitat Projection: Landuse'},
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/habitat-projection/sidebar.html",
            controller: 'molHabitatProjectionCtrl'
          }
        },
        url: 'projection/landuse/{0}?{1}'.format(urlparams,queryparams)
      }
    )
    .state(
      'species.projection-climate',
      {
        data: {title : 'Species Habitat Projection: Climate Change'},
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/climatehabitat/sidebar.html",
            controller: 'molClimateHabitatProjectionCtrl'
          }
        },
        url: 'projection/climate/{0}?{1}'.format(urlparams,queryparams)
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
        url: '{0}?{1}'.format(urlparams,queryparams)
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
        url: 'map/{0}?{1}'.format(urlparams,queryparams)
      }
    )
    .state(
      'species.habitat-trend',
      {
        data: {title : 'Species Habitat Trend'},
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/habitat-trend/sidebar.html",
            controller: 'molHabitatTrendCtrl'
          }
        },
        url: 'habitat-trend/{0}?{1}'.format(urlparams,queryparams)
      }
    );
    /*.state(
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
        url: 'habitat-distribution/{0}?{1}'.format(urlparams,queryparams)
      }
    )
    .state(
      'species.habitat-trend',
      {
        views: {
          "left-sidebar@species" :{
            templateUrl: "static/app/views/habitat-trend/sidebar.html",
            controller: 'molHabitatDistributionCtrl'
          },
          "habitat-controls@species.habitat-trend" : {
            templateUrl: "static/app/views/habitat-controls/template.html",
            controller: "molHabitatControlsCtrl"
          },

          "map@species" :{
            templateUrl: "static/app/views/habitat-trend/trend-charts.html",
            controller: 'molHabitatTrendCtrl'
          }
        },
        url: 'habitat-trend/{0}?{1}'.format(urlparams,queryparams)
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
        url: 'reserve-coverage/{0}?{1}'.format(urlparams,queryparams)
      }
    );*/


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

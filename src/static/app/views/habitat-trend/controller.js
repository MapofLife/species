'use strict';
angular.module('mol.controllers')
.controller('molHabitatTrendCtrl',
    ['$scope', '$state','$filter', 'molHabitatTrendSvc',
      'molHabitatTrendChartOptions', 'molFormatSuitabilityPrefs',

    function($scope, $state, $filter, molHabitatTrendSvc, molHabitatTrendChartOptions, molFormatSuitabilityPrefs) {


      //nvd3 charts
      $scope.region_id = 'global';
      //$scope.species.habitat_trend={"global":{"title":"Global"}};
      $scope.modis_options = molHabitatTrendChartOptions;
      $scope.modis_options.chart.yAxis.axisLabel = 'Suitable Habitat MODIS + Landsat (km²)';
      $scope.landsat_options = molHabitatTrendChartOptions;
      $scope.landsat_options.chart.yAxis.axisLabel = 'Suitable Habitat Landsat (km²)';
      //$scope.pop_options = molHabitatTrendChartOptions;
      //$scope.pop_options.chart.yAxis.axisLabel = 'Human Population';


      $scope.$watch("model.prefs",
        function(n,o) {
          if(n) {
            molHabitatTrendSvc(molFormatSuitabilityPrefs(n), $scope.model.canceller).then(
              function(value) {
                $scope.species.habitat_trend = value;
                
              }
            )
        }});


    }])
.factory('molHabitatTrendSvc',
  ['molApi','regression',function(molApi,regression) {
        return function(prefs, canceller) {
          function generateData(indata, slope, intercept) {
              var trendline = [], data =[], config = {
                  values: [],
                  slope: null,
                  intercept: null
              };

              angular.forEach(
                indata,
                function(area,year) {
                  data.push([parseInt(year),area]);
                  config.values.push({
                      key: year,
                      x: year,
                      y: area,
                      size: 400,
                      shape: 'circle'
                  });
              });

              trendline = regression('linear',data);
              config.slope = trendline.equation[0];
              config.intercept = trendline.equation[1];

              return [config];
          }
          return molApi({
           "service" : "species/indicators/habitat-trend/stats",
           "version": "0.x",
           "params" : prefs,
           "canceller": canceller,
           "loading":true
         }).then(
         function(result) {
          var trends = {};
          var global_modis = {};
          var global_landsat = {};
             angular.forEach(
            result.data,
            function(country) { 
             angular.forEach(
               country.MODIS,
               function(value,year) {
                 global_modis[year]=((global_modis[year])? global_modis[year]:0)+value;
               });
             angular.forEach(
               country.LANDSAT,
               function(value,year) {
                  global_landsat[year]=((global_landsat[year])?global_landsat[year]:0)+value;
               });
             trends[country.ISO3] = {
                title: country.ISO3,
                landsat: generateData(country.LANDSAT, 0 , 2001),
                modis: generateData(country.MODIS, 0 , 2001)
             }
            });
            trends.global = {
               title: "Global",
               landsat: generateData(global_landsat, 0 , 2001),
                modis: generateData(global_modis, 0 , 2001)
            }

            return trends
        });

    }
}])
.factory('molHabitatTrendChartOptions',['$filter',
 function($filter) {
   return {
         chart: {
             type: 'scatterChart',
             height: 250,
             color: d3.scale.category10().range(),
             scatter: {
                 onlyCircles: true
             },
             margins: {top: 30, right: 20, bottom: 50, left: 60},
             showLegend: false,
             tooltips: false,
             transitionDuration: 1000,
             xAxis: {
                 axisLabel: 'Year'
             },
             yAxis: {
                 axisLabel: '',
                 tickFormat: function(d){
                     if(d>1000000) {
                       var sups = "⁰¹²³⁴⁵⁶⁷⁸⁹",
                           s = d.toPrecision(3),
                           e = s.substr(6).split().map(
                             function (en){
                               return sups[en]
                             }
                           ).toString(),
                           f ="{0}x10{1}".format(
                               s.substr(0,4),
                               e
                             );
                           return f;
                     } else {
                       return $filter('number')(d,0);
                     }
                 },
                 axisLabelDistance: 10
             }
         }
     };
 }]
);

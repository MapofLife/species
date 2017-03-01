'use strict';
angular.module('mol.controllers')
.controller('molHabitatTrendCtrl',
    ['$scope', '$state','$filter', 'molHabitatTrendSvc',
      'molHabitatTrendChartOptions',

    function($scope, $state, $filter, molHabitatTrendSvc, molHabitatTrendChartOptions) {


      //nvd3 charts
      $scope.area_options = molHabitatTrendChartOptions;
      $scope.area_options.chart.yAxis.axisLabel = 'Suitable Habitat (km²)';
      $scope.tree_options = molHabitatTrendChartOptions;
      $scope.tree_options.chart.yAxis.axisLabel = 'Suitable Habitat Landsat (km²)';
      $scope.pop_options = molHabitatTrendChartOptions;
      $scope.pop_options.chart.yAxis.axisLabel = 'Human Population';

        $scope.$watch("species.prefs",
          function(n,o) {
            if(n) {
              $scope.species.habitat_trend = molHabitatTrendSvc(n, $scope.canceller)
          }});


    }])
.factory('molHabitatTrendSvc',
  ['molApi',function(molApi) {
        return function(prefs, canceller) {
          function generateData(indata, slope, intercept) {
              var data = [];
                  //indata = JSON.parse(strdata);

              data.push({
                  values: [],
                  slope: slope,
                  intercept: intercept
              });

              angular.forEach(
                indata,
                function(year,area) {
                  data[0].values.push({
                      key: year,
                      x: year,
                      y: area,
                      size: 100,
                      shape: 'circle'
                  });
              });

              return data;
          }
          return molApi({
           "service" : "species/indicators/habitat-trend/stats",
           "version": "0.x",
           "params" : prefs,
           "canceller": canceller,
           "loading":true
         }).then(
           function(result) {
             return generateData(result.data, 0 , 2001)
        });

    }
}])
.factory('molHabitatTrendChartOptions',
 function() {
   return {
         chart: {
             type: 'scatterChart',
             height: 597,
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
 }
);

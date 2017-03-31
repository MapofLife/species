'use strict';
angular.module('mol.controllers')
.controller('molHabitatTrendCtrl',
    ['$scope', '$state','$filter', 'molHabitatTrendSvc',
      'molHabitatTrendChartOptions', 'molFormatSuitabilityPrefs',

    function($scope, $state, $filter, molHabitatTrendSvc, molHabitatTrendChartOptions, molFormatSuitabilityPrefs) {


      //nvd3 charts
      $scope.region_id = 'global';
      //$scope.species.habitat_trend={"global":{"title":"Global"}};

      $scope.chart_options = {}
      $scope.chartOptions = function(dataset) {

        var options = angular.copy(molHabitatTrendChartOptions);
        options.chart.yAxis.axisLabel = dataset;
        return options
      }
      //$scope.pop_options = molHabitatTrendChartOptions;
      //$scope.pop_options.chart.yAxis.axisLabel = 'Human Population';


      $scope.$watch("model.prefs",
        function(n,o) {
          if(n) {
            molHabitatTrendSvc(molFormatSuitabilityPrefs(n), $scope.model.canceller).then(
              function(trends) {
                $scope.species.habitat_trend = trends;
                
              }
            )
        }});


    }])
.factory('molHabitatTrendSvc',
  ['molApi','regression',function(molApi,regression) {
        return function(prefs, canceller) {
          function generateData(indata) {
              var trendline = [], data =[], config = {
                  values: [],
                  slope: null,
                  intercept: null
              };

              angular.forEach(
                indata,
                function(a,y) {
                  a = Math.round(a*10)/10;
                  data.push([parseInt(y),a]);
                  config.values.push({
                      key: y,
                      x: y,
                      y: a,
                      size: 400,
                      shape: 'circle'
                  });
              });

              trendline = regression('linear',data);
              config.slope = trendline.equation[0];
              config.intercept = trendline.equation[1];

              return [angular.copy(config)];
          }
          return molApi({
           "service" : "species/indicators/habitat-trend/stats",
           "version": "0.x",
           "params" : prefs,
           "canceller": canceller,
           "loading":true
         }).then(
         function(result) {
          var trends = {"global":{}};
          var global = {};
          angular.forEach(
            result.data,
            function(country) { 
             if(!trends[country.ISO3]) { trends[country.ISO3] = {};}
             angular.forEach(
               country.trends,
               function(trend, dataset) {
                 if(!trends[country.ISO3][dataset]) { trends[country.ISO3][dataset] = {};}
                 if(!global[dataset]) { global[dataset] = {};}
                 trends[country.ISO3][dataset] = generateData(trend);
                 angular.forEach(
                   trend,
                  function(value, year) {
                   global[dataset][year]=((global[dataset][year])? global[dataset][year]:0)+value;
                });
            });
          });
          angular.forEach(
            global,
            function(trend, dataset) { 
              trends["global"][dataset] = generateData(trend);
          });
            
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
             padData: true,
             transitionDuration: 1000,
             xDomain: [1995,2015],
             xAxis: {
                 axisLabel: 'Year',
             },
        
             yAxis: {
                 axisLabel: '',
                 padData: true,
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
             },
             
                    useNiceScale: true,
                    
         }
     };
 }]
);

'use strict';

/* Controllers */

/* Info page controller */
angular.module('mol.controllers')
  .controller('molChangeCtrl',
    ['$scope', '$state','$filter', 'GetHabitatChange', function($scope, $state, $filter, GetHabitatChange) {

      $scope.call_ver = 0;
      $scope.err_ct = 0;

       //Default NVD3 chart Options
      var chartOptions = {
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

      //nvd3 charts
      $scope.area_options = angular.copy(chartOptions);
      $scope.area_options.chart.yAxis.axisLabel = 'Suitable Habitat (km²)';
      $scope.tree_options = angular.copy(chartOptions);
      $scope.tree_options.chart.yAxis.axisLabel = 'Suitable Habitat Landsat (km²)';
      $scope.pop_options = angular.copy(chartOptions);
      $scope.pop_options.chart.yAxis.axisLabel = 'Human Population';

      function generateData(indata, slope, intercept) {
          var data = [];
              //indata = JSON.parse(strdata);


          data.push({
              values: [],
              slope: slope,
              intercept: intercept
          });

          for (var j = 0; j < indata.length; j++) {
              data[0].values.push({
                  key: indata[j][1],
                  x: indata[j][0],
                  y: indata[j][1],
                  size: 100,
                  shape: 'circle'
              });
          }

          return data;
      }

      function updateCharts(chart_data) {
        $scope.species.habitat = chart_data;
        $scope.err_ct =0;

      }

      $scope.updateChangeModel = function() {
        $scope.cancelAll();

        $scope.promises.push(GetHabitatChange($scope.prefs.refined).query(
          updateCharts,
          function(err) {

             $scope.err_ct++;
             //$timeout($scope.updateChangeModel,1000*$scope.err_ct);
             console.log(err);
          }).$promise);
        $scope.runAll();
      }

        $scope.$watch(
          "prefs",
          function(newValue, oldValue) {
            if(newValue){
              //if( $scope.species.analysis.trends) {
                $scope.updateChangeModel();
            //} else {
            //  $state.transitionTo('info.range',{scientificname: $scope.species.scientificname});
            //}
            }

          });
        $scope.$watch(
          "species.habitat",
          function(newValue, oldValue) {
            if(newValue){
              /*$scope.area_data = generateData(
                $scope.species.habitat.area,
                $scope.species.habitat.stats.area_b1,
                $scope.species.habitat.stats.area_b0);*/
              $scope.tree_data = generateData(
                $scope.species.habitat.trend,
                $scope.species.habitat.b1,
                $scope.species.habitat.b0);
              /*$scope.pop_data = generateData(
                $scope.species.habitat.pop,
                $scope.species.habitat.stats.pop_b1,
                $scope.species.habitat.stats.pop_b0);
              $scope.$broadcast('refreshSlider');*/
            }
          });


    }]);

'use strict';
angular.module('mol.controllers')
.controller('molHabitatTrendCtrl',
    ['$scope', '$state', '$timeout', '$http', '$filter', 'molApi', 
    function($scope, $state, $timeout, $http, $filter, molApi) {

      $scope.loadingData = true;
      $scope.isChartReady = false;
      $scope.habtrends = undefined;
      $scope.selected = {
        trend: {}
      };

      $scope.getHabitatTrend = function() {
        $scope.habtrends = undefined;
        // molApi({
        //   "service": "species/indicators/habitat-trends/map",
        //   "params": { scientificname: $state.params.scientificname.replace('_', ' ') },
        //   "canceller": $scope.model.canceller,
        //   "loading": true
        // }).then(function (results) {
        //     console.log("got results: ", results);
        //     if (results && results.trends) {
        //       $scope.habtrends = results;
        //     }
        // });


        var spturl = "https://api.mol.org/1.x/species/indicators/habitat-trends/map?scientificname="+$state.params.scientificname.replace('_', ' ');
        return $http({
          "withCredentials": false,
          "method": "GET",
          "url": spturl
        }).then(function(result, status, headers, config) {
          if (result && result.data) {
            $scope.habtrends = result.data;
            
            // Remove 'expert_esa_only' and 'expert_treecover_only' trend maps
            $scope.habtrends.trends = $filter('omit')(result.data.trends, "id.indexOf('_only') > -1");
            
            // Update the landcover values for display
            var lcvals = $scope.habtrends.metadata.properties.esa_landcover.split(',').map(function(c) {
              return [c.split(':')[0], c.split(':')[1]];
            });
            $scope.habtrends.landCoverClasses = [];
            angular.forEach(lcvals, function(v, i) {
              $scope.habtrends.landCoverClasses.push({
                classValue: parseInt(v[0]),
                className: ESA_CLASS_NAMES[v[0]],
                pctSuitable: parseFloat(v[1])*100
              });
            });

            // TODO: Figure out why we need to add a delay to display the chart.
            // Without the delay, the chart options don't seem to get applied properly
            // loadTrendChart();


            // Select the first trend
            $timeout(function() {
              $scope.selected.trend = result.data.trends[0];
              loadTrendChart();
            }, 500);

          }

          $scope.loadingData = false;
        }, function(err) {
          $scope.loadingData = false;
          
          if (err.status == 401) {
            $scope.messages = "You need to be authenticated to do that";
          } else {
            $scope.messages = 'There was a problem with your request. Please try again or <a href="https://mol.org/contact-us">contact us</a>.';
          }
        });

      };

      var habTrendChart = undefined;
      var chartData = undefined;
      function loadTrendChart() {
        habTrendChart = undefined;
        chartData = undefined;
        if ($scope.isChartReady && $scope.habtrends.data.length > 1) {
          // var data = google.visualization.arrayToDataTable($scope.habtrends.data);  
          var data = new google.visualization.DataTable();
          data.addColumn('date', 'year');
          data.addColumn('number', 'estcntryrs');
          data.addColumn({id:'estcntryrs_l95', type:'number', role:'interval'});
          data.addColumn({id:'estcntryrs_u95', type:'number', role:'interval'});

          var options = getChartOption(450, 300);

          angular.forEach($scope.habtrends.data, function(vals, idx) {
            if (idx > 0) {
              // data.addRow(vals);
              data.addRow([new Date(vals[0], 1, 1), vals[1], vals[2], vals[3]]);
            }
          });

          habTrendChart = new google.visualization.LineChart(document.getElementById('habitat-trend-chart'));
          habTrendChart.draw(data, options);
          chartData = data;
        } else {
          console.log('Chart is not ready yet. We should reload!');
        }
      }
      function chartReady() {
        $scope.isChartReady = true;
      }
      function getChartOption(width, height) {
        var options = {
          // title: 'Habitat suitable range km²', 
          width: width,
          height: height,
          curveType: 'function', // uncomment for a curve line
          series: [{lineWidth: 0, enableInteractivity: false}],
          intervals: { 'style':'area'},
          legend: 'none',
          vAxis: { title: 'Habitat suitable range km²\n\n\n\n' },  // A newline hack to make sure the label doesn't overlap with the values
          hAxis: { title: 'Year', format: 'Y' }
        };

        // // Add a bit of a buffer to the y-axis which sometimes seems to happen
        // // Right now, it might be when the difference is under 1000km2
        // var startValue = $scope.habtrends.data[1][1];
        // var endValue = $scope.habtrends.data[16][1];
        // var valueDiff = (endValue - startValue);
        // // Sometimes the max/final value is lower than the min
        // valueDiff = (valueDiff < 0) ? valueDiff * -1 : valueDiff; 
        // var minYPadding = (valueDiff > 1e3) ? startValue : ( startValue - (startValue * .06) );
        // if (valueDiff < 1e3) {
        //   options.vAxis['viewWindow'] = {min: minYPadding};
        // }
        
        return options;
      }
      $scope.viewHabitatTrendChart = function() {
        habTrendChart.draw(chartData, getChartOption(650, 500));
        window.open(habTrendChart.getImageURI());
        habTrendChart.draw(chartData, getChartOption(450, 300));
      }
      $scope.downloadHabitatTrendChart = function() {
        // window.open(habTrendChart.getImageURI());
        habTrendChart.draw(chartData, getChartOption(650, 500));
        var chartURI = habTrendChart.getImageURI();
        habTrendChart.draw(chartData, getChartOption(450, 300));
        var filename = 'Suitable_habitat_trend_' + $state.params.scientificname.replace(' ', '_') + '.png';
        var link = document.createElement("a");
        link.setAttribute("href", chartURI);
        if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          link.setAttribute("download", filename);
        } else {
          link.setAttribute("target", "_blank");
        }
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      }

      $scope.$watch("selected.trend", function(n,o) {
        if(n) {
          if ($scope.mapUpdater) {
            try {
              $timeout.cancel($scope.mapUpdater);
            } catch (e) { }
          }
          $scope.mapUpdater = $timeout(function () {
            $scope.map.removeOverlay(0);
            $scope.tilesloaded = false;
            $scope.map.setOverlay({
              tile_url: $scope.selected.trend.tile_url,
              key: $scope.selected.trend.id,
              attr: '©2018 Map of Life',
              name: 'habitat-trend',
              index: 1,
              opacity: 1.0,
              type: 'habitat-trend'
            }, 0);

            // Trigger a map resize event since sometimes
            // the map is cut off
            // TODO: Figure out if there is a better way
            $scope.map.resize();
          }, 500);
        }
      }, true);

      var ESA_CLASS_NAMES = {
        '10':'Cropland, rainfed',
        '11': 'Herbaceous cover',
        '12':	'Tree or shrub cover',
        '20':	'Cropland, irrigated or post-flooding',
        '30':	'Mosaic cropland (>50%) / natural vegetation (tree, shrub, herbaceous cover) (<50%)',
        '40':	'Mosaic natural vegetation (tree, shrub, herbaceous cover) (>50%) / cropland (<50%)',
        '50':	'Tree cover, broadleaved, evergreen, closed to open (>15%)',
        '60':	'Tree cover, broadleaved, deciduous, closed to open (>15%)',
        '61':	'Tree cover, broadleaved, deciduous, closed (>40%)',
        '62':	'Tree cover, broadleaved, deciduous, open (15-40%)',
        '70':	'Tree cover, needleleaved, evergreen, closed to open (>15%)',
        '71':	'Tree cover, needleleaved, evergreen, closed (>40%)',
        '72':	'Tree cover, needleleaved, evergreen, open (15-40%)',
        '80':	'Tree cover, needleleaved, deciduous, closed to open (>15%)',
        '81':	'Tree cover, needleleaved, deciduous, closed (>40%)',
        '82':	'Tree cover, needleleaved, deciduous, open (15-40%)',
        '90': 'Tree cover, mixed leaf type (broadleaved and needleleaved)',
        '100': 'Mosaic tree and shrub (>50%) / herbaceous cover (<50%)',
        '110': 'Mosaic herbaceous cover (>50%) / tree and shrub (<50%)',
        '120': 'Shrubland',
        '121': 'Shrubland evergreen',
        '122': 'Shrubland deciduous',
        '130': 'Grassland',
        '140': 'Lichens and mosses',
        '150': 'Sparse vegetation (tree, shrub, herbaceous cover) (<15%)',
        '152': 'Sparse shrub (<15%)',
        '153': 'Sparse herbaceous cover (<15%)',
        '160': 'Tree cover, flooded, fresh or brakish water',
        '170': 'Tree cover, flooded, saline water',
        '180': 'Shrub or herbaceous cover, flooded, fresh/saline/brakish water',
        '190': 'Urban areas',
        '200': 'Bare areas',
        '201': 'Consolidated bare areas',
        '202': 'Unconsolidated bare areas',
        '210': 'Water bodies',
        '220': 'Permanent snow and ice'
      };

      $scope.getHabitatTrend();

      google.charts.load('current', { 'packages': ['corechart'] });
      google.charts.setOnLoadCallback(chartReady);



    }])
.controller('molHabitatTrendCtrlOld',
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

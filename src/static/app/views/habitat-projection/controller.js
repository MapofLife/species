angular.module('mol.controllers')
  .controller('molHabitatProjectionCtrl',
  	[  '$compile',
      '$window','$http','$uibModal','$scope','$state', '$filter',
      '$timeout','$q','$sce','molApi','molConfig',
   		function(
         $compile, $window, $http, $modal, $scope, $state, $filter,
          $timeout, $q, $sce, molApi, molConfig) {

        
        $scope.loadingData = false;
        var tooltipText = "Powers &amp; Jetz (2019): Global habitat loss and extinction risk ";
        tooltipText += "of terrestrial vertebrates under future land- use change scenarios. ";
        tooltipText += "<br /> ";
        tooltipText += "Nature Climate Change.";
        tooltipText += "<br /> ";
        tooltipText += "Click <a href='https://mol.org" + molConfig.url + "projection/landuse'>here</a> for more info.";
        tooltipText = tooltipText.replace("{lang}", molConfig.lang);
        $scope.habProjTooltip = $sce.trustAsHtml(tooltipText);
        // $scope.decades = [2010, 2020, 2030, 2040, 2050];
        $scope.decades = {
          globio: [2010, 2020, 2030, 2040, 2050],
          luh: [2015, 2020, 2030, 2040, 2050, 2060, 2070]
        };
        $scope.luopts = [{
          id: 'luh2_025d',
          name: 'LUH2 - 0.25deg',
          landuse: 'luh',
          scale: '025deg',
          decades: [2015, 2020, 2030, 2040, 2050, 2060, 2070],
          methods: ['AIM', 'IMAGE', 'MAGPIE', 'MESSAGE']
        }];
        var luh_methods = {
          'image': 'SSP 1',
          'message': 'SSP 2',
          'aim': 'SSP 3',
          'magpie': 'SSP 5',
        };

        $scope.projectionAvailable = false;
        /* 
        {
          id: 'globio_1km',
          name: 'GLOBIO - 1km',
          landuse: 'globio',
          scale: '1km',
          decades: [2010, 2020, 2030, 2040, 2050],
          methods: undefined
        }, {
          id: 'globio_025d',
          name: 'GLOBIO - 0.25deg',
          landuse: 'globio',
          scale: '025deg',
          decades: [2010, 2020, 2030, 2040, 2050],
          methods: undefined
        }, 
        */

        $scope.landuse_categories = [{
          "code": 5, "name": "Forest"
        }, {
          "code": 15, "name": "Non-Forest"
        }, {
          "code": 14, "name": "Managed Land"
        }, {
          "code": 13, "name": "Urban"
        }, {
          "code": 12, "name": "Crop"
        }];
        $scope.scenarios = [{
          code: 'scenario1',
          name: 'No-regain'
        }, {
          code: 'scenario3',
          name: 'Regain'
        }];
        $scope.model.projectionOpts = {
          scientificname: $state.params.scientificname.replace('_', ' '),
          landuse: 'luh',
          luscale: '025deg',
          lumethod: 'message',
          decade: 2015,
          scenario: 'scenario1',
          metadata: undefined
        };
        $scope.mapUpdater = undefined;
        $scope.isChartReady = false;
        $scope.mapAvailable = false;

        $scope.getHabitatProjection = function() {

          // if ($scope.$parent.species.taxa != 'birds' && $scope.$parent.species.taxa != 'mammals' && $scope.$parent.species.taxa != 'amphibians') {
          //   $scope.projectionAvailable = false;
          //   return;
          // }

          $scope.projectionAvailable = true;

          if ($scope.model.projectionOpts.decade && $scope.model.projectionOpts.scenario) {
            $scope.mapAvailable = false; 
            $scope.loadingData = true;
            $scope.model.projectionOpts.metadata = undefined;
            
            molApi({
              "url": "dev-dot-api-2-x-dot-map-of-life.appspot.com",
              "version": "2.x",
              "service": "species/indicators/habitat-projection/map",
              "params": $scope.model.projectionOpts,
              "canceller": $scope.model.canceller,
              "loading": true
            }).then(function (results) {
                if (results && results.data) {
                  
                  if (results.data.length > 0 && results.data[0].error) {
                    $scope.projectionAvailable = false;
                    return
                  }

                  loadProjectionMap(results.data.map);
                  
                  // TODO: Figure out why we need to add a delay to display the chart.
                  // Without the delay, the chart options don't seem to get applied properly
                  // loadProjectionChart(results.data.chart)
                  $timeout(function() {
                    loadProjectionChart(results.data.chart);
                  }, 500);
      
                  $scope.model.projectionOpts.metadata = results.data.metadata;
                }
                $scope.loadingData = false;
            });
          }
        };

        function loadProjectionMap(mapObject) {
          if ($scope.mapUpdater) {
            try {
              $timeout.cancel($scope.mapUpdater);
            } catch (e) { }
          }
          $scope.mapUpdater = $timeout(function () {
            $scope.map.removeOverlay(0);
            $scope.tilesloaded = false;
            $scope.map.setOverlay({
              tile_url: mapObject.tile_url,
              key: mapObject.mapid,
              attr: '©2017 Map of Life',
              name: 'habitat-projection',
              index: 1,
              opacity: 1.0,
              type: 'habitat-projection'
            }, 0);

            // Trigger a map resize event since sometimes
            // the map is cut off
            // TODO: Figure out if there is a better way
            $scope.map.resize();

            $scope.mapAvailable = true;
          }, 500);
        }

        var projChart = undefined;
        var chartData = undefined;
        function loadProjectionChart(chartObject) {
          projChart = undefined;
          chartData = undefined;
          if ($scope.isChartReady) {
            var data = new google.visualization.DataTable();
            data.addColumn('date', 'Year');
            data.addColumn('number', 'Regain');
            data.addColumn('number', 'No-regain');

            var options = getChartOption(450, 300);
            
            angular.forEach($scope.decades[$scope.model.projectionOpts.landuse], function(decade) {
              data.addRow([new Date(decade, 1, 1), chartObject.features[0].properties[decade], chartObject.features[1].properties[decade]]);
            });

            projChart = new google.visualization.LineChart(document.getElementById('habitat-projection-chart'));
            projChart.draw(data, options);
            chartData = data;
          } else {
            console.log('Chart is not ready yet. We should reload!');
          }
        }

        $scope.viewChart = function() {
          var opts = getChartOption(650, 500);
          projChart.draw(chartData, opts);
          var x = window.open();
          x.document.open();
          x.document.title = "Map of Life: " + opts.title;
          x.document.write("<title>Map of Life: " + opts.title + "</title>");
          x.document.write("<iframe width='650' height='500' src='" + projChart.getImageURI() + "'></iframe>");
          x.document.close();
          projChart.draw(chartData, getChartOption(450, 300));
        }

        function chartReady() {
          $scope.isChartReady = true;
        }
        function getChartOption(width, height) {
          var title = $scope.model.projectionOpts.scientificname + ' projection under ' + luh_methods[$scope.model.projectionOpts.lumethod];
          var options = {
            title: title,
            width: width,
            height: height,
            // curveType: 'function', // uncomment for a curve line
            legend: { position: 'bottom' },
            hAxis: { title: 'Year', format: 'Y' },
            vAxis: { title: 'Habitat-suitable range (km²)' }
          };
  
          return options;
        }

        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(chartReady);

        $scope.$watch("$parent.species",function(n,o) {
          if(n){
            $scope.model.projectionOpts.scientificname = n.scientificname;
            $scope.getHabitatProjection();
          }
        });

  }]);

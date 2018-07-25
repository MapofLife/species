angular.module('mol.controllers')
  .controller('molHabitatProjectionCtrl',
  	[  '$compile',
      '$window','$http','$uibModal','$scope','$state', '$filter',
      '$timeout','$q','$sce','molApi',
   		function(
         $compile, $window, $http, $modal, $scope, $state, $filter,
          $timeout, $q, $sce, molApi) {

        
        $scope.loadingData = false;
        var tooltipText = "Projections of suitable habitat within current range for different ";
        tooltipText += "shared socioeconomic pathways and habitat regain assumptions ";
        tooltipText += "<br /> ";
        tooltipText += "(for details see Powers &amp; Jetz in review)";
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
          if ($scope.model.projectionOpts.decade && $scope.model.projectionOpts.scenario) {
            $scope.mapAvailable = false; 
            $scope.loadingData = true;
            $scope.model.projectionOpts.metadata = undefined;
            
            molApi({
              "service": "species/indicators/habitat-projection/map",
              "params": $scope.model.projectionOpts,
              "canceller": $scope.model.canceller,
              "loading": true
            }).then(function (results) {
                if (results && results.data) {
                  loadProjectionMap(results.data.map);
                  loadProjectionChart(results.data.chart)
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

        function loadProjectionChart(chartObject) {
          if ($scope.isChartReady) {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Year');
            data.addColumn('number', 'Regain');
            data.addColumn('number', 'No-regain');

            var options = {
              title: 'Suitable Habitat Trend',
              // curveType: 'function', // uncomment for a curve line
              legend: { position: 'bottom' },
              hAxis: { title: 'Year' },
              vAxis: { title: 'Sum Area (km²)' }
            };
            
            angular.forEach($scope.decades[$scope.model.projectionOpts.landuse], function(decade) {
              data.addRow([decade.toString(), chartObject.features[0].properties[decade], chartObject.features[1].properties[decade]]);
            });

            var chart = new google.visualization.LineChart(document.getElementById('habitat-projection-chart'));
            chart.draw(data, options);

          } else {
            console.log('Chart is not ready yet. We should reload!');
          }
        }

        function chartReady() {
          $scope.isChartReady = true;
        }

        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(chartReady);

  }]);

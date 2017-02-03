angular.module('mol.controllers')
 .controller('molHabitatDistributionCtrl',
    ['$scope', '$q', '$timeout','$http','$filter', 'molApi','$stateParams',
    function($scope, $q, $timeout, $http, $filter, molApi, $stateParams) {

      $scope.$watch('species.scientificname',function(n,o){
      if($scope.species) {
        $scope.map.clearOverlays();
        molApi({
         "url": "spi-metrics.api-0-x.map-of-life.appspot.com",
         "service" : "species/indicators/habitat-distribution/map",
         "version": "0.x",
         "params" : {
           "scientificname": $scope.species.scientificname,
           "dsid":  $stateParams.dsid,
           "show_points": true
         },
         "canceller" :$scope.canceller,
         "loading":true,
         "protocol" : "http"
       }).then(
         function(result) {
           $scope.tilesloaded=false;
           $scope.map.setOverlay({
               tile_url: result.data.tileurl,
               key: result.data.tileurl,
               attr: '©2014 Map of Life',
               name: 'spi',
               index:0,
               opacity: 0.8,
               type: 'detail'
           },0);
      });
        molApi({
         "url": "spi-metrics.api-0-x.map-of-life.appspot.com",
         "service" : "species/indicators/habitat-distribution/stats",
         "version": "0.x",
         "params" : {
           "scientificname": $scope.species.scientificname,
           "dsid":  $stateParams.dsid,
           "show_points": true
         },
         "canceller" :$scope.canceller,
         "loading":true
       }).then(
         function(result) {
            $scope.species.habitat_distribution = result.data;
         })

        $scope.changeInMapPerformance = function(species) {

          
        }

    }});

  }]);

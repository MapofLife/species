angular.module('mol.controllers')
 .controller('molHabitatDistributionCtrl',
    ['$scope', '$q', '$timeout','$http','$filter', 'molApi',
    function($scope, $q, $timeout, $http, $filter, molApi) {

      $scope.$watch('species.scientificname',function(n,o){
      if($scope.species) {
        molApi({
         "service" : "species/indicators/spi-map",
         "version": "0.x",
         "params" : {
           "scientificname": $scope.species.scientificname
         },
         "canceller" :$scope.canceller,
         "loading":true
       }).then(
         function(result) {
           $scope.tilesloaded=false;
           $scope.map.setOverlay({
               tile_url: result.tileurl,
               key: result.layergroupid,
               attr: '©2014 Map of Life',
               name: 'spi',
               index:0,
               opacity: 0.8,
               type: 'detail'
           },0);
      })
    }});

  }]);

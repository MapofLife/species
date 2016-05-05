angular.module('mol.controllers')
  .controller('molOverviewCtrl',
  	[ '$compile',
      '$window','$http','$uibModal','$scope', '$state', '$filter',
      '$timeout','$location','$anchorScroll','$q','MOLApi','uiGmapGoogleMapApi',
   		function(
         $compile, $window, $http, $modal, $scope, $state, $filter,
          $timeout, $location, $anchorScroll, $q,  MOLApi,uiGmapGoogleMapApi) {
            $scope.mapUpdater  = undefined;
            $scope.canceller = $q.defer()
            $scope.map.options.scrollwheel = false;

              $scope.$watch(
                'species.scientificname',
                function(name) {
                  if(name) {
                      $scope.map.overlayMapTypes = [];
                      if($scope.mapUpdater) {
                        try{
                          $timeout.cancel($scope.mapUpdater);
                        } catch(e){}};
                      $scope.mapUpdater = $timeout(function(){$http({
                      "withCredentials":false,
                      "method":"POST",
                      "timeout":$scope.canceller,
                      "url":"https://mol.cartodb.com/api/v1/map/named/consensus_map",
                      "data": {
                         "scientificname": name,
                      }}).success(function(result, status, headers, config) {
                            if($scope.species && result.layergroupid) {

                              $scope.tilesloaded=false;
                              $scope.addOverlay({
                                  tile_url: ""+
                                    "https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
                                      .format(result.cdn_url.https,

                                        result.layergroupid),
                                  grid_url: ""+
                                    "http://{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json"
                                      .format(
                                        result.cdn_url.https,
                                        result.layergroupid),
                                  key: result.layergroupid,
                                  attr: '©2014 Map of Life',
                                  name: 'overview',
                                  opacity: 0.8,
                                  type: 'overview'
                              },'overview');

                            }});},500);
                    }
                  }
                );

  }]);
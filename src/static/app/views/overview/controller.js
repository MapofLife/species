angular.module('mol.controllers')
  .controller('molOverviewCtrl',
  	[ '$compile',
      '$window','$http','$uibModal','$scope', '$state', '$filter',
      '$timeout','$location','$anchorScroll','$q','molApi','uiGmapGoogleMapApi',
   		function(
         $compile, $window, $http, $modal, $scope, $state, $filter,
          $timeout, $location, $anchorScroll, $q,  molApi,uiGmapGoogleMapApi) {




            $scope.mapUpdater  = undefined;
            $scope.canceller = $q.defer()
            //$scope.map.options.scrollwheel = false;
            $scope.map.removeOverlay(0);

            $scope.map.getInfoWindowModel = function(map, eventName, latLng, data) {}

              $scope.$watch(
                'species.scientificname',
                function(name) {
                  if(name) {

                      if($scope.mapUpdater) {
                        try{
                          $timeout.cancel($scope.mapUpdater);
                        } catch(e){}};
                      $scope.mapUpdater = $timeout(function(){$http({
                      "withCredentials":false,
                      "method":"POST",
                      "timeout":$scope.canceller,
                      "url":"https://mol.carto.com/api/v1/map/named/consensus_map",
                      "data": {
                         "scientificname": name,
                      }}).success(function(result, status, headers, config) {
                            if($scope.species && result.layergroupid) {

                              $scope.map.setOverlay({
                                  tile_url: ""+
                                    "https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
                                      .format(result.cdn_url.https,

                                        result.layergroupid),
                                  grid_url: ""+
                                    "https://{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json"
                                      .format(
                                        result.cdn_url.https,
                                        result.layergroupid),
                                  key: result.layergroupid,
                                  attr: '©2014 Map of Life',
                                  name: 'overview',
                                  opacity: 0.8,
                                  index:0,
                                  type: 'overview'
                              },0);

                            }});},500);
                    }
                  }
                );

  }]);

angular.module('mol.controllers')
  .controller('molOverviewCtrl',
  	[ '$compile',
      '$window', '$http', '$uibModal', '$scope', '$state', '$filter',
      '$timeout','$location','$anchorScroll','$q','molApi','uiGmapGoogleMapApi',
   		function(
          $compile, $window, $http, $modal, $scope, $state, $filter,
          $timeout, $location, $anchorScroll, $q,  molApi,uiGmapGoogleMapApi) {


            $scope.selectedFamily = undefined;
            $scope.mapUpdater  = undefined;

            $scope.map.getInfoWindowModel = function(map, eventName, latLng, data) {}

            $scope.$watch(
                'species.scientificname',
                function(name) {
                  if(name) {
                      $scope.map.setOverlay({index: 0}, 0);
                      $scope.model.canceller.resolve();
                      $scope.model.canceller = $q.defer();
                      if($scope.mapUpdater) {
                        try{
                          $timeout.cancel($scope.mapUpdater);
                        } catch(e){}};
                      $scope.mapUpdater = $timeout(function(){
                        $http({
                      "withCredentials":false,
                      "method":"POST",
                      "timeout": $scope.canceller,
                      "url":"https://carto.mol.org/user/mol/api/v1/map/named/consensus-map",
                      "data": {
                         "scientificname": name,
                      }}).success(function(result, status, headers, config) {
                            if($scope.species && result.layergroupid) {

                              $scope.map.setOverlay({
                                  tile_url: ""+
                                    "https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
                                      .format('carto.mol.org', result.layergroupid),
                                  grid_url: ""+
                                    "https://{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json"
                                      .format('carto.mol.org', result.layergroupid),
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

  }])
  .filter('iucnStatus', function() {
    return function(code) {
      var description = {
        'CR' : 'Critically Endangered',
        'EN' : 'Endangered',
        'EX' : 'Extinct',
        'EW' : 'Extinct (Wild)',
        'LC' : 'Least Concern',
        'NT' : 'Near Threatened',
        'VU' : 'Vulnerable'
      }
      return (code)?description[code]:undefined
    }
  });

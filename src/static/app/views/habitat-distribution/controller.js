angular.module('mol.controllers')
 .controller('molHabitatDistributionCtrl',
    ['$scope', '$q', '$timeout','$http','$filter',
    function($scope, $q, $timeout, $http, $filter) {


     $scope.$watch("species.prefs", function(n,o) {
        if(!angular.equals(n,o)) {
          $scope.updateRefineModel();
        }
     },true);

     $scope.$watch("toggles.refine", function(newValue, oldValue) {
        if(newValue != undefined) {
          $scope.updateHabitatMap();
        }
     });

     $scope.toggles = {
       refine : true
     }

     $scope.$on("$viewContentLoaded", function(){
       $scope.map.clearOverlays();
       if($scope.species&&!$scope.species.refine.maps) {
         $scope.updateRefineModel();
       } else {
         $scope.updateHabitatMap();
       }
     });


     $scope.refineUpdater = null;

     $scope.refineCanceller = $q.defer();

     $scope.map.getFeatures = function(lat,lng,zoom,scientificname) {}

     ///for habitat refinement
     $scope.updateRefineModel = function () {

        if($scope.species.prefs) {
          $scope.species.refine = {};
          $scope.refineCanceller.resolve();
          $scope.refineCanceller = $q.defer();
          if($scope.refineUpdater) {
            try{
              $timeout.cancel($scope.refineUpdater);
            } catch(e){}};

          $scope.refineUpdater = $timeout(function(){$http({
            method: 'GET',
            url: '//species.mol.org/api/refine',
            withCredentials: false,
            params: $filter('molHabitatPrefs')($scope.species.prefs),
            timeout: $scope.refineCanceller}).success(
              function(response) {
                if(response) {

                  $scope.addSpeciesURL(response.maps);
                  $scope.species.refine = response;
                  $scope.updateHabitatMap();
                }
              }
            );},1000);
       }
    }


    $scope.updateHabitatMap = function() {

        //add a reserve map
        if($scope.species&&$scope.species.refine&&$scope.species.refine.maps) {

        $scope.map.setOverlay(
          ($scope.toggles.refine) ?
            $scope.species.refine.maps.refined:
              $scope.species.refine.maps.expert,
          0
        );}
    }
    $scope.addSpeciesURL = function(maps) {
      angular.forEach(
      maps,
        function(map) {
          map.tile_url = '//species.mol.org{0}'.format(map.tile_url);
          if(map.grid_url) {
            map.grid_url = '//species.mol.org{0}'.format(map.grid_url);
          }
        }
      );

    }
    $scope.map.getInfoWindowModel = function(map, eventName, coords,data) {
       var deferred = $q.defer();
        deferred.resolve({show:false});
       return deferred.promise;
    }

    }])
    .filter('molHabitatPrefs', function ($sce) {
        return function(prefs) {
          var p = angular.copy(prefs);
          p.habitats[2] = p.habitats[3] = p.habitats[4] = p.habitats[5] = p.habitats[1];
          return angular.extend(
            p, {
              habitats: p.habitats.map(function(h, i) {if(h) return i}).filter(function(i){return i}).join(',')});
        };
      })
      ;
;

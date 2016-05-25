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

     $scope.map.events.click = function(map, eventName, coords) {
       $scope.map.infowindow = {}

         if(!$scope.$$phase) {
              $scope.$apply();
            }
         $scope.getFeatures(coords[0].latLng.lat(),coords[0].latLng.lng(),map.getZoom(),$scope.species.scientificname);
     }

     $scope.refineUpdater = null;

     $scope.refineCanceller = $q.defer();

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
        $scope.setOverlay(
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

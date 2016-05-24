angular.module('mol.controllers')
 .controller('molHabitatDistributionCtrl',
    ['$scope', '$q', '$timeout','$http','$filter',
    function($scope, $q, $timeout, $http, $filter) {

     $scope.$watch("species.prefs", function(newValue, oldValue) {
        if(newValue != undefined) {
          $scope.updateRefineModel();
        }
     });

     $scope.toggles = {
       refine : true
     }

     $scope.refineCanceller = $q.defer();

     ///for habitat refinement
     $scope.updateRefineModel = function () {
        if($scope.species.prefs) {
          $scope.species.refine = {};
          $scope.refineCanceller.resolve();
          $scope.refineCanceller = $q.defer();
          $http({
            method: 'GET',
            url: '//species.mol.org/api/refine',
            withCredentials: false,
            params: $filter('molHabitatPrefs')($scope.species.prefs),
            timeout: $scope.refineCanceller}).success(
              function(response) {
                if(response) {
                  $scope.species.refine = response;
                }
              }
            );
       }
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
      });;
;

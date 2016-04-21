angular.module('mol.controllers')
 .controller('molRefineCtrl',
    ['$scope', '$q', '$timeout','GetRefinedRange', function($scope, $q, $timeout, GetRefinedRange) {
      $scope.call_ver = 0;

    var canceller = $q.defer();
     $scope.err_ct = 0;
     $scope.$watch("prefs", function(newValue, oldValue) {
        if(newValue != undefined) {
          $scope.updateRefineModel();
        }
     });

     $scope.updateRefineModel = function () {
        if($scope.prefs) {
        $scope.species.refine = {};
        $scope.cancelAll();
        

        $scope.promises.push(GetRefinedRange($scope.prefs.refined, canceller).query(
            function(response) {
              if(response) {
                $scope.species.refine = response;
              }
            },
            function(err) {
               /*if ($scope.checkParams(err)) {
                   $scope.err_ct++;
                   $timeout($scope.updateRefineModel, 1000 * Math.pow(2, $scope.err_ct));
                   console.log(err);
               }*/
            }).$promise);
        $scope.runAll();
      }
    }

    }]);

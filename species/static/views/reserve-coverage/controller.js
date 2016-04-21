angular.module('mol.controllers')
 .controller('molProtectCtrl',
    ['$scope', '$rootScope','$window','$q', '$timeout', '$filter','GetProtectedAreas', 'GetRefinedRange',
      function($scope, $rootScope, $window, $q, $timeout, $filter, GetProtectedAreas, GetRefinedRange) {



      $scope.call_ver = 0;
      $scope.threshold = {min:10,max:50000};

      //$scope.refined = true;

      $scope.downloadCSV = function() {
        var params = $scope.prefs.refined,
          params_arr = [];
        params.format = 'csv';
         angular.forEach(params,function(v,k){
          params_arr.push('{0}={1}'.format(k,v));
         })

       $window.open('/api/protect?{0}'.format(params_arr.join('&')));

      }
      $scope.updateThresholds = function () {
        var unrefined_params = angular.copy($scope.prefs.unrefined),
            refined_params = angular.copy($scope.prefs.refined);

        unrefined_params["threshold"]=angular.copy($scope.threshold.min);
        refined_params["threshold"]=angular.copy($scope.threshold.min);
      
        $scope.promises.push(
          GetProtectedAreas(refined_params).query(
            function(response) {
                if(response) {
                  $scope.species.protect.refined.totals_t = response.totals;
                  if(response.maps) {
                    $scope.species.protect.refined.maps = response.maps;
                  }
                }
              }).$promise);

        $scope.promises.push(
          GetProtectedAreas(unrefined_params).query(
            function(response) {
              if(response) {
                $scope.species.protect.unrefined.totals_t = response.totals;
                if(response.maps) {
                  $scope.species.protect.unrefined.maps = response.maps;
                }
              }
            }).$promise);

         $scope.runAll()
      }


      $scope.getTargetArea = function(rs) {
            if( rs <= 1000) {
                return rs;
            } else if (rs >= 250000) {
                return 0.1*rs;
            } else {
                return rs*(212.6 - 37.542*Math.log10(rs))/100;
            }
      }


      $scope.getTargetRealizedClass = function(value) {
          if (value >= 120) {
              return 'protection_status_green';
          } else if (value >= 75 && value < 120) {
              return 'protection_status_yellow';
          } else if (value >= 25 && value < 75) {
              return 'protection_status_orange';
          } else {
              return 'protection_status_red';
          }
      };

      $scope.getProtectedAreas = function () {
        if($scope.prefs) {
          var promises = [],
          unrefined_params = angular.copy($scope.prefs.unrefined),
          refined_params = angular.copy($scope.prefs.refined);

        $scope.cancelAll();

        unrefined_params["mode"]='unrefined';
        refined_params["mode"]='refined';

        $scope.species.protect.refined = {totals: {}, maps:[], totals_t:{}};
        $scope.species.protect.unrefined = {totals: {}, maps:[], totals_t:{}};


        $scope.status = {};

        if ($scope.species != undefined) {
            $scope.species.refine = null;
            $scope.species.protect = null;

          $scope.species.protect = {"refined":{}, "unrefined":{}};
          $scope.species.refine = {};
        }



        $scope.promises.push(
          GetProtectedAreas($scope.prefs.refined).query(
            function(response) {
                if(response) {
                  $scope.species.protect.refined.totals = response.totals;
                }
              }).$promise);

        $scope.promises.push(
          GetProtectedAreas($scope.prefs.unrefined).query(
            function(response) {
              if(response) {
                $scope.species.protect.unrefined.totals = response.totals;

              }
            }).$promise);

        $scope.promises.push(
          GetRefinedRange($scope.prefs.refined).query(
            function(response) {
              if(response) {
                $scope.species.refine = response;

              }
            }).$promise);

        $scope.updateThresholds();
        }
      }

        $scope.$watch(
          "prefs",
          function(newValue, oldValue) {
            if(newValue){
              $scope.getProtectedAreas();
            }
          });
    }]);

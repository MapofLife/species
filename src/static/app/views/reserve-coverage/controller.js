angular.module('mol.controllers')
 .controller('molReserveCoverageCtrl',
    ['$scope', '$rootScope','$window','$q', '$timeout', '$filter','$http',
      function($scope, $rootScope, $window, $q, $timeout, $filter, $http) {


      $scope.reserveCanceller = $q.defer();

      $scope.threshold = {min:10,max:50000};

      //$scope.refined = true;


      $scope.$watch(
        "species.prefs",
        function(newValue, oldValue) {
          if(newValue){
            $scope.updateReserveModel();
          }
    });

    $scope.getReserveStats = function(prefs) {
      return $http({
        method: 'GET',
        url: '//species.mol.org/api/protect',
        withCredentials: false,
        params: prefs,
        timeout: $scope.reserveCanceller})
     }

    $scope.updateReserveModel = function() {
      $scope.getReserveStats(angular.extend(
        $filter('molHabitatPrefs')($scope.species.prefs),
        {threshold:0})).then(
          function(response) {
            $scope.species.protect.refined.totals = response.totals;
            $scope.species.protect.refined.maps = response.maps;
          }
        );
      $scope.getReserveStats(angular.extend(
        $filter('molHabitatPrefs')($scope.species.prefs),
        {threshold:0, use_f:false,use_e:false,use_h:false})).then(
          function(response) {
            $scope.species.protect.unrefined.totals = response.totals;
            $scope.species.protect.unrefined.maps = response.maps;
          }
        );
    }
  


      $scope.downloadCSV = function() {
        var params = $scope.prefs.refined,
          params_arr = [];
        params.format = 'csv';
         angular.forEach(params,function(v,k){
          params_arr.push('{0}={1}'.format(k,v));
         })

       $window.open('https://species.mol.org/api/protect?{0}'.format(params_arr.join('&')));

      }

      $scope.updateThresholds = function () {

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


    }]);

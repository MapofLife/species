angular.module('mol.controllers')

 .controller('molReserveCoverageCtrl',
    ['$scope', '$rootScope','$window','$q', '$timeout', '$filter','$http',
      function($scope, $rootScope, $window, $q, $timeout, $filter, $http) {


      $scope.$watch(
        "species.prefs",
        function(n, o) {
          if(!angular.equals(n,o)){
            $scope.updateReserveModel();
          }
      },true);


      $scope.$watch(
        "toggles.refine",
        function(n,o) {
          if(n!=o) {
            $scope.updateReserveMaps();
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

      //Get metdata for features on the map
      $scope.map.getInfoWindowModel = function(map, eventName, coords,data) {
         var deferred = $q.defer();
          if(data&&data.cartodb_id) {
          deferred.resolve({

                    show: true,
                    options:{animation:0, disableAutoPan:false},

                  model: data,
                  templateUrl: 'static/app/views/reserve-coverage/infowindow.html'
                });
          } else {deferred.resolve({show:false});}
          return deferred.promise;
        }
        $scope.updateReserveModel();
    }]);

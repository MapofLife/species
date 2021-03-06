angular.module('mol.controllers')

 .controller('molReserveCoverageCtrl',
    ['$scope', '$rootScope','$window','$q', '$timeout', '$filter','$http',
      function($scope, $rootScope, $window, $q, $timeout, $filter, $http) {

      $scope.reserveCanceller = $q.defer();

      $scope.threshold = {min:10,max:50000};



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
      $scope.$on("$destroy", function(){
        $scope.map.overlayMapTypes.splice(1);
      });
     $scope.$on("$viewContentLoaded", function(){
          if($scope.species&&!$scope.species.protect) {
            $scope.updateReserveModel();
          } else {
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




     $scope.reserveUpdater = null;

     $scope.reserveCanceller = $q.defer();


      $scope.updateReserveModel = function() {
        if($scope.protectUpdater) {
          try{
            $timeout.cancel($scope.protectUpdater);
          } catch(e){}};

          $scope.reserveCanceller.resolve();
          $scope.reserveCanceller = $q.defer();
          $scope.protectUpdater = $timeout(function() {
          $scope.species.protect = {refined:{}, unrefined:{}}
          $scope.getReserveStats(angular.extend(
            $filter('molHabitatPrefs')($scope.species.prefs),
            {threshold:0})).then(
              function(response) {
                $scope.species.protect.refined.totals = response.data.totals;
                $scope.addSpeciesURL(response.data.maps);
                $scope.species.protect.refined.maps = response.data.maps;
              }
            );
          $scope.getReserveStats(angular.extend(
            $filter('molHabitatPrefs')($scope.species.prefs),
            {threshold:0, use_f:false,use_e:false,use_h:false})).then(
              function(response) {
                $scope.species.protect.unrefined.totals = response.data.totals;
                $scope.addSpeciesURL(response.data.maps);
                $scope.species.protect.unrefined.maps = response.data.maps;
              }
            );
          $scope.updateThresholds();
        },1000);
      }

      $scope.updateReserveMaps = function() {
        //add a reserve map
        if($scope.species&&$scope.species.protect&&$scope.species.protect.refined) {
        $scope.map.setOverlay(
          ($scope.toggles.refine) ?
            $scope.species.protect.refined.maps[0]:
              $scope.species.protect.unrefined.maps[0],
          1
        );}
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
        $scope.getReserveStats(angular.extend(
          $filter('molHabitatPrefs')($scope.species.prefs),
          {threshold:$scope.threshold.min})).then(
            function(response) {
              $scope.species.protect.refined.totals_t = response.data.totals;
              $scope.addSpeciesURL(response.data.maps);
              $scope.species.protect.refined.maps = response.data.maps;
              $scope.getReserveStats(angular.extend(
                $filter('molHabitatPrefs')($scope.species.prefs),
                {threshold:$scope.threshold.min, use_f:false,use_e:false,use_h:false})).then(
                  function(response) {
                    $scope.species.protect.unrefined.totals_t = response.data.totals;
                    $scope.addSpeciesURL(response.data.maps);
                    $scope.species.protect.unrefined.maps = response.data.maps;
                    $scope.updateReserveMaps();
                  }
                );
            }
          );

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

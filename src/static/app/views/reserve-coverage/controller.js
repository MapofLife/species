angular.module('mol.controllers')

 .controller('molReserveCoverageCtrl',
    ['molFormatSuitabilityPrefs','$scope', '$rootScope','$window','$q', '$timeout', '$filter','molApi','$stateParams',
      function(molFormatSuitabilityPrefs, $scope, $rootScope, $window, $q, $timeout, $filter, molApi, $stateParams) {


        $scope.threshold= {min: 10, max: 1e18};

        $scope.$watch('species.prefs',function(n,o){
        if($scope.species) {
          $scope.map.clearOverlays();
          $scope.canceller.resolve();
          $scope.canceller = $q.defer();
          molApi({
           "url": "api.mol.org",
           "service" : "species/indicators/reserve-coverage/map",
           "version": "0.x",
           "params" : molFormatSuitabilityPrefs($scope.species.prefs),
           "canceller" :$scope.canceller,
           "loading":true,
           "protocol" : "http"
         }).then(
           function(result) {
             $scope.tilesloaded=false;
             $scope.map.setOverlay({
                 tile_url: result.data.tileurl,
                 key: result.data.tileurl,
                 attr: '©2014 Map of Life',
                 name: 'reserve-coverage',
                 index:1,
                 opacity: 0.8,
                 type: 'reserve-coverage'
             },0);
        });
          molApi({
           "url": "api.mol.org",
           "service" : "species/indicators/reserve-coverage/global-stats",
           "version": "0.x",
           "params" : molFormatSuitabilityPrefs($scope.species.prefs),
           "canceller" :$scope.canceller,
           "loading":true,
           "protocol": "https"
         }).then(
           function(result) {
             $scope.species.reserve_coverage = result.data;

           })


      }},true);

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

    }])
.filter(
  "reserveFilter", function() {
      return function(reserves, iucn_cats, threshold) {

        return (reserves)? reserves.filter(function(reserve) {
            return (iucn_cats.indexOf(reserve.IUCN_CAT) >= 0 && reserve.sum > threshold)
          }
        ) : undefined;
      }
  }

).filter(
  "reserveArea", function() {
      return function(reserves) {
        return (reserves) ? reserves.reduce(function(p, c) { return p + c.sum; },0) : undefined;
      }
  }

).filter(
  "reserveCount", function() {
    return function(reserves) {
      return (reserves)? reserves.length : undefined;
    }
  }

);

angular.module('mol.controllers').controller('molReserveCoverageCtrl',
    ['molFormatSuitabilityPrefs','molReserveCoverageMaps','molReserveCoverageStats','molHabitatDistributionStatsSvc',
      '$scope', '$rootScope','$window','$q', '$timeout', '$filter','molApi','$stateParams',
      function(molFormatSuitabilityPrefs, molReserveCoverageMaps, molReserveCoverageStats,
        molHabitatDistributionStatsSvc,
        $scope, $rootScope, $window, $q, $timeout, $filter, molApi, $stateParams) {


        $scope.threshold= {min: 10, max: 1e18};

        $scope.$watch('model.prefs',function(n,o){
          if(n) {
            var prefs = molFormatSuitabilityPrefs(n);
            $scope.map.clearOverlays();
            $scope.species.reserve_coverage = undefined;
            $scope.species.habitat_distribution = undefined;

            molReserveCoverageMaps(prefs,$scope.model.canceller).then(
              function(result){$scope.map.setOverlay(result,0)});
            molHabitatDistributionStatsSvc(prefs,$scope.model.canceller).then(
              function(result){$scope.species.habitat_distribution = result;})
            molReserveCoverageStats(prefs,$scope.model.canceller).then(
              function(result) {$scope.species.reserve_coverage = result;});
        }},true);


        //Get metdata for features on the map
        $scope.map.getInfoWindowModel = function(map, eventName, latLng, data) {
          var deferred = $q.defer();
          switch(eventName) {
            case 'click':
               molApi({
                "canceller": $scope.model.canceller,
                "loading": true,
                "service" : "species/indicators/reserve-coverage/query",
                "creds" : true,
                "params" : {"lat": latLng.lat(),"lng": latLng.lng()}
              }).then(
                function(results) {
                  if(angular.isDefined(results.data)){
                        deferred.resolve( {
                          model:{
                            "searching":false,
                            "result" : $scope.species.reserve_coverage.find(function(r){return (r.WDPAID === this.WDPAID)}, results.data)
                          },
                          show: true,
                          templateUrl: 'static/app/views/reserve-coverage/infowindow.html'
                        });
                  } else {
                      deferred.resolve();
                  }
                }
              );
              break;
            default:
              deferred.resolve();
          }
          return deferred.promise;
        };

}])
.filter('targetRealizedClass', function() {
  return function(value) {
        if (value >= 120) {
            return 'protection_status_green';
        } else if (value >= 75 && value < 120) {
            return 'protection_status_yellow';
        } else if (value >= 25 && value < 75) {
            return 'protection_status_orange';
        } else {
            return 'protection_status_red';
        }
    }
})
.filter(
  'targetProtectedArea',
  function() {
    return function(rs) {
          if( rs <= 1000) {
              return rs;
          } else if (rs >= 250000) {
              return 0.1*rs;
          } else {
              return rs*(212.6 - 37.542*Math.log10(rs))/100;
          }
      }
  }
)
.filter(
  "reserveFilter", function() {
      return function(reserves, iucn_cats, threshold) {

        return (typeof reserves === "object")? reserves.filter(function(reserve) {
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

).factory(
  'molReserveCoverageMaps',['molApi', function(molApi) {
      return function(prefs,canceller) {
        return molApi({
         "service" : "species/indicators/reserve-coverage/map",
         "version": "0.x",
         "params" : prefs,
         "canceller": canceller,
         "loading":true,
       }).then(
         function(result) {
           return {
               tile_url: result.data.tileurl,
               key: result.data.tileurl,
               attr: '©2014 Map of Life',
               name: 'reserve-coverage',
               index:1,
               opacity: 0.8,
               type: 'reserve-coverage'
           };
      });
    }
}]).factory('molReserveCoverageStats',['molApi', function(molApi) {
    return function(prefs,canceller) {

        return molApi({
         "service" : "species/indicators/reserve-coverage/stats",
         "version": "0.x",
         "params" : prefs,
         "canceller": canceller,
         "loading":true
       }).then(
         function(result) {
           return result.data;

         })

      }
}]);

angular.module('mol.controllers')
  .controller('molSpeciesCtrl',
  	['$http','$scope', '$rootScope', '$state', '$stateParams','$uibModal',  '$filter','$timeout',
     '$location','$anchorScroll','$q','molUiMap','$window', 'molSpeciesTooltips',
   		function( $http, $scope, $rootScope, $state, $stateParams, $modal, $filter, $timeout,
         $location, $anchorScroll, $q,molUiMap,$window, molSpeciesTooltips) {

      $rootScope = $scope; //important for map

      //for view specific css targeting
      $rootScope.$state = $state;




      angular.extend($scope, {"tt": molSpeciesTooltips});

      $scope.$watch('rc',
        function(n,v) {
          if(n) {
            $scope.map.resize();}
        });
      $scope.$watch('lc', function(n,v) {
          if(n!=v) {$scope.map.resize()};
      });

      //Map utilities --> maybe put in a service?

      /* wait until gmaps is ready */



      $scope.region = {};


      $scope.map = new molUiMap();


      $scope.cleanURLName = function (name) {
        if(name) {return name.replace(/ /g, '_');}
      }



      $scope.getBounds = function(bnds) {
        var nbnds = {southwest: {
                latitude: bnds.southWest.lat,
                longitude: bnds.southWest.lng
                },
                northeast: {
                    latitude: bnds.northEast.lat,
                    longitude: bnds.northEast.lng
                }
            };
        return nbnds;
      }

      $scope.fitBounds = function(bnds) {
        try {
           var newbnds = angular.copy($scope.getBounds(bnds));
           //pin to region bounds if possible

           if(Object.keys($scope.region).length&&$scope.region.type!=='global') {
             newbnds.southwest.longitude = Math.max($scope.region.bnds[0]);
             newbnds.southwest.latitude = Math.max($scope.region.bnds[1]);
             newbnds.northeast.longitude = Math.min($scope.region.bnds[2]);
             newbnds.northeast.latitude = Math.min($scope.region.bnds[3]);
           }
           $scope.map.bounds = newbnds;
        } catch(e) {}

      }

      $scope.unionBounds = function(b1,b2) {
        var b = b1;
        try {
          b.southWest.lat = Math.min(b1.southWest.lat,b2.southWest.lat);
          b.southWest.lng = Math.min(b1.southWest.lng,b2.southWest.lng);
          b.northEast.lat = Math.max(b1.northEast.lat,b2.northEast.lat);
          b.northEast.lng = Math.max(b1.northEast.lng,b2.northEast.lng);
          return b;
        } catch (e) {return b1;}
      }

      $scope.$watch("species.scientificname", function(newValue, oldValue) {
          if(newValue != undefined) {
            $window.parent.postMessage({"scientificname": newValue},'*');
            $state.transitionTo(
              $state.current.name,
              {"scientificname":$scope.cleanURLName(newValue)},
              {inherit: true, notify:false}
            )
          }
      });

      $scope.$watch("species.bounds", function(newValue, oldValue) {
          if(newValue != undefined) {
            $timeout(function () {
              $scope.fitBounds(newValue);
            }, 500);
          }
      },true);

      $scope.$watch("region.bnds", function(newValue, oldValue) {
          if(newValue != undefined) {
            var bnds = {southWest:{lat:newValue[1],lng:newValue[0]},
              northEast: {lat:newValue[3],lng:newValue[2]}}
            if($scope.region.type==='global'&&$scope.species&&$scope.species.bounds) {
              $scope.fitBounds($scope.species.bounds)
            } else {
              $scope.fitBounds(bnds);
            }
          }
      });


  }])

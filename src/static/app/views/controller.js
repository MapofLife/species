angular.module('mol.controllers')
  .controller('molSpeciesCtrl',
  	['$http','$scope', '$rootScope', '$state', '$stateParams','$uibModal',  '$filter','$timeout',
     '$location','$anchorScroll','$q','molUiMap','$window', 'molSpeciesTooltips','molRegionOverlay','molConfig',
   		function( $http, $scope, $rootScope, $state, $stateParams, $modal, $filter, $timeout,
         $location, $anchorScroll, $q,molUiMap,$window, molSpeciesTooltips, molRegionOverlay,molConfig) {





      angular.extend($scope, {
        toggles: {
          sidebars: {
            right: true,
            left: true
          }
        },

        model: {
         tt: molSpeciesTooltips,
         //rc: ($state.params.scientificname && ),
         lc: ($state.params.region && !$state.params.scientificname)
      }});

      $scope.$watch('rc', function(n,v){
        if(n!=v){
          $scope.$parent.map.resize();}});
      $scope.$watch('lc', function(n,v){
        if(n!=v){
          $scope.$parent.map.resize()};});


      //Map utilities --> maybe put in a service?
      /* wait until gmaps is ready */

      $scope.region = {};

      $scope.map = new molUiMap();

      $rootScope = $scope; //important for map
      $rootScope.molConfig = molConfig;
      //for view specific css targeting
      $rootScope.$state = $state;

      $scope.cleanURLName = function (name) {
        if(name) {return name.replace(/ /g, '_');}
      }

      $scope.selectSpecies = function (name) {
        $scope.species = undefined;
        //$scope.types = undefined;
        $state.go($state.current,{
          scientificname: $scope.cleanURLName(name)})
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

      $scope.$watch("species.scientificname", function(n,o) {
          if(n != undefined) {
            $window.parent.postMessage({"scientificname": n},'*');
            $state.transitionTo(
              $state.current.name,
              {"scientificname":$scope.cleanURLName(n)},
              {inherit: true, notify:false}
            );
              $scope.toggles.sidebars.left = true;
          } else {
            $scope.toggles.sidebars.left = false;
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
            var bnds = {
              southWest: {
                lat: newValue[1],
                lng: newValue[0]
              },
              northEast: {
                lat: newValue[3],
                lng: newValue[2]
              }
            }
            if(!$scope.region.region_id
                  && $scope.species
                  && $scope.species.bounds) {
              $scope.fitBounds($scope.species.bounds)
            } else {
              $scope.fitBounds(bnds);
            }
          }
      });

    /*()  $scope.$watch("groups",
        function(n,o) {
          if(n) {
            try{
              $scope.toggles.sidebars.right = (n.available[n.selectedIndex].species.length>0 || $scope.region !== undefined);
            } catch(e) {
              $scope.toggles.sidebars.right = false;
            }
          }
      },true); */

      $scope.infowindowPromise = $q.defer();

      $scope.$watch("region", function(n,o) {
          console.log(n);
          if(n) {
            $state.transitionTo(
              $state.current.name,
              {"regoin":n.name},
              {inherit: true, notify:false}
            );
          molRegionOverlay(n).then(
            function(overlay){
              if(overlay)
                $scope.map.setOverlay(angular.extend(overlay,{index:0}),0)}
              );
            } else {
              $scope.map.setOverlay({index:0},0);
            }
            //Get metdata for features on the map
            $scope.map.getInfoWindowModel = function(map, eventName, latLng, data) {

                if(data) {
                  switch(eventName) {
                    case 'click':
                      data.bnds = data.bnds.split(',')
                        .map(function(n){return parseFloat(n);});
                      $scope.region = data;
                      $scope.infowindowPromise.resolve({show:false});
                      $scope.infowindowPromise = $q.defer();
                      break;
                    case 'mousemove':
                        $timeout(200).then(function() {
                            $scope.infowindowPromise.resolve( {
                            model: data,
                            show: true,
                            templateUrl: 'static/app/views/region-map/infowindow.html'
                          });
                          $scope.infowindowPromise = $q.defer();
                        });
                    break;
                    default:
                      $scope.infowindowPromise.resolve({show:false});
                      $scope.infowindowPromise = $q.defer()
                    }
                } else {
                  $scope.infowindowPromise.resolve({show: false});
                  $scope.infowindowPromise = $q.defer() ;
                }
                return $scope.infowindowPromise.promise;

            };

      },true);






  }])

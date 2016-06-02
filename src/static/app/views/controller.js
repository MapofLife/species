angular.module('mol.controllers')
  .controller('molSpeciesCtrl',
  	['$http','$scope', '$rootScope', '$state', '$stateParams','$uibModal',  '$filter','$timeout',
     '$location','$anchorScroll','$q','uiGmapGoogleMapApi','$window', 'molSpeciesTooltips',
   		function($http, $scope, $rootScope, $state, $stateParams, $modal, $filter, $timeout,
         $location, $anchorScroll, $q,uiGmapGoogleMapApi,$window, molSpeciesTooltips) {

      $rootScope = $scope; //important for map

      //for view specific css targeting
      $rootScope.$state = $state;


      angular.extend($scope, {"tt": molSpeciesTooltips});

      $scope.$watch('rc',
        function(n,v) {
          if(n) {
            $timeout(function() {
              var map = $scope.$parent.map.control.getGMap();
              google.maps.event.trigger(map,'resize');

            },700)}
        });
        $scope.$watch('lc',
          function(n,v) {
            if(n!=v) {
              //uiGmapGoogleMapApi.then(
              //  function(maps) {
                  var map = $scope.$parent.map.control.getGMap(),
                      center = map.getCenter();
                    for(var i=0;i<=700;i+=4) {
                    $timeout(function() {
                        google.maps.event.trigger(map,'resize');
                        map.panTo(center);

                    },i)}
                //})
            }
          });
          uiGmapGoogleMapApi.then(
            function(maps) {
          google.maps.event.addDomListener($window, "resize", function() {
              var map = $scope.map.control.getGMap(),
                center = map.getCenter();
                //$timeout(function() {
                    google.maps.event.trigger(map,'resize');
                    map.setCenter(center);

                //},10);
          });})

       //Map utilities
       function getTileUrl(c,z,p) {
           var u = null,
             x = c.x, y = c.y;
           if (p && c.y < Math.pow(2,z) && c.y >= 0) {
             u = p;
             while(x < 0) {x += Math.pow(2,z);}
             while(x>= Math.pow(2,z)) {x-=Math.pow(2,z);}
             u = p.replace('{z}',z).replace('{x}',x).replace('{y}',c.y);
           }
           return u;
         }

      function getTile (c,z,d) {
            var img = document.createElement('img'),
              tile_url = getTileUrl(c,z,this.overlay.tile_url),
              grid_url,
              grid = $scope.map.utfGrid;//s[type];

              try{
                if('{0}'.format(this.overlay.grid_url) !== 'null') {
                  grid_url = getTileUrl(c,z,this.overlay.grid_url);
                  if(grid_url) {
                    if(!grid) {grid = {}}
                    if(!grid[z]) {grid[z]={}};
                    if(!grid[z][c.x]) {grid[z][c.x]={}};
                    if(!grid[z][c.x][c.y]) {
                      $http.jsonp('{0}?callback=JSON_CALLBACK'.format(grid_url))
                        .success(
                          function(data, status, headers, config) {
                            grid[z][c.x][c.y] = data;
                          }
                        ).error(function(err) {});
                      }
                    }
                }
              } catch (e){}


            img.style.opacity = this.opacity;
            img.width=this.tileSize.width;
            img.height=this.tileSize.height;

            img.onload = function(e) {
              delete $scope.map.tiles[tile_url];
              if (Object.keys($scope.map.tiles).length<5) {

                $scope.$emit('cfpLoadingBar:completed');
              }
            }
            img.onerror = function(e) {
              delete $scope.map.tiles[tile_url];
              img.src = 'static/app/img/blank_tile.png';
              if (Object.keys($scope.map.tiles).length<5) {

                $scope.$emit('cfpLoadingBar:completed');
              }
            }

            $scope.$emit('cfpLoadingBar:started');
            $scope.map.tiles[tile_url] = "loading";

            img.src = tile_url;
            return img;

      }
      //Map utilities --> maybe put in a service?

      /* wait until gmaps is ready */



      $scope.region = {};

      $scope.map = {
            tiles : {},
            bounds :  undefined,
            center: {latitude:0,longitude:0},
            zoom: 0,
            control: {},
            options: {
                fullscreenControl: true,
                fullscreenControlOptions: {position: 3},
                streetViewControl: false,
                panControl: false,
                maxZoom: 10,
                minZoom: 1,
                styles: styles,
                mapTypeControlOptions: {position: 5}
            },
            utfGrid: {},
            overlayMapTypes: [],
            getFeatures: undefined,
            events: {
              click : function(map, eventName, coords) {
                $scope.map.infowindow = {}

                  if(!$scope.$$phase) {
                       $scope.$apply();
                     }
                  $scope.map.getFeatures(coords[0].latLng.lat(),coords[0].latLng.lng(),map.getZoom(),$scope.species.scientificname);
              },

              mousemove: function(map, eventName, event) {
               var i, key, grid  = $scope.map.utfGrid,
                   value, zoom = map.getZoom(),
                   numTiles = 1 << zoom,
                   projection = new MercatorProjection(),
                   worldCoordinate = projection.fromLatLngToPoint(event[0].latLng),
                   pixelCoordinate = new google.maps.Point(
                   worldCoordinate.x * numTiles,
                   worldCoordinate.y * numTiles),
                   tileCoordinate = new google.maps.Point(
                       Math.floor(pixelCoordinate.x / 256),
                       Math.floor(pixelCoordinate.y / 256)),
                   gridCoordinate = new google.maps.Point(
                       Math.floor((pixelCoordinate.x - tileCoordinate.x*256)/4),
                       Math.floor((pixelCoordinate.y - tileCoordinate.y*256)/4));



                try {
                  i = grid[zoom][tileCoordinate.x][tileCoordinate.y]
                        .grid[gridCoordinate.y].charCodeAt(gridCoordinate.x);
                  //decode the UTF code per UTF-grid spec
                  //https://github.com/mapbox/mbtiles-spec/blob/master/1.1/utfgrid.md
                  if(i>=93) {i--};
                  if(i>=35) {i--};
                  i-=32;
                  key = grid[zoom][tileCoordinate.x][tileCoordinate.y].keys[i]

                  value = grid
                      [zoom][tileCoordinate.x][tileCoordinate.y]
                        .data[String(key)];
                  if (value) {
                    map.setOptions({ draggableCursor: 'pointer' });
                  } else {
                    map.setOptions({ draggableCursor: 'default' });

                  }
                } catch(e) {}
              }
            }
      }


      $scope.cleanURLName = function (name) {
        if(name) {return name.replace(/ /g, '_');}
      }


      $scope.clearOverlays = function() {
          $scope.map.utfgrid={};
          $scope.map.overlayMapTypes = [];
      }

      $scope.setOverlay = function(overlay,index) {
          if($scope.map) {
            $scope.map.overlayMapTypes[index]= {
                show:true,
                getTile : getTile,
                tileSize: new google.maps.Size(256, 256),
                name: overlay.type,
                overlay: overlay,
                index: Math.round(Math.random()*1000),
                refresh: true,
                opacity: overlay.opacity,
                maxZoom: 10
            }
          }
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
           if(Object.keys($scope.region).length) {
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
            $scope.fitBounds(bnds);
          }
      });

  }])

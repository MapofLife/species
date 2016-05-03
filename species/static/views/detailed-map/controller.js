angular.module('mol.controllers')
  .controller('molDetailMapCtrl',
  	[ '$compile',
      '$window','$http','$uibModal','$scope', '$state', '$filter',
      '$timeout','$location','$anchorScroll','$q','MOLApi','uiGmapGoogleMapApi',
   		function(
         $compile, $window, $http, $modal, $scope, $state, $filter,
          $timeout, $location, $anchorScroll, $q,  MOLApi,uiGmapGoogleMapApi) {
            /* set up defatul scop*/
            $scope.uncertainty = {
              min:0,
              max:32000,
              def:8000};
            $scope.year = {min:1970,max:2015, nulls:false};
            $scope.filters = {
              uncertainty: true,
              years: true,
              limit: true,
              points: 5000
            };
            $scope.toggles = {sidebarVisible: true, featuresActive:false, looking: false}
            $scope.mapUpdater  = undefined;
            $scope.canceller = $q.defer()

            $scope.visibleDatasets = undefined;


            $scope.$watch('uncertainty',function(newValue,oldValue){
              if(newValue){
                $scope.updateMap();}
            },true);

            $scope.$watch('year',function(newValue,oldValue){
              if(newValue){
                $scope.updateMap();}
            },true);

            $scope.$watch('filters',function(newValue,oldValue){
              if(newValue){
                $scope.updateMap();}
            },true);

            $scope.updateMap = function() {
              $scope.stale = false;
              $scope.canceller.resolve();
              $scope.canceller = $q.defer();

              $scope.map.utfGrid={};
              $scope.map.overlayMapTypes = [];
              if($scope.species) {
                  if($scope.mapUpdater) {
                    try{
                      $timeout.cancel($scope.mapUpdater);
                    } catch(e){}};
                  $scope.mapUpdater = $timeout(function(){$http({
                  "withCredentials":false,
                  "method":"POST",
                  "timeout":$scope.canceller,
                  "url":"https://mol.cartodb.com/api/v1/map/named/detail_map",
                  "data": {
                     "min_year" : ($scope.filters.years)?$scope.year.min:-5555555,
                     "max_year" : ($scope.filters.years)?$scope.year.max:5555555,
                     "min_uncertainty": ($scope.filters.uncertainty)?$scope.uncertainty.min:-5555555,
                     "max_uncertainty": ($scope.filters.uncertainty)?$scope.uncertainty.max:5555555,
                     "scientificname": $scope.species.scientificname,
                     "datasets": $scope.visibleDatasets,
                     "null_years":($scope.filters.years)?$scope.year.nulls.toString():true.toString(),
                     "default_uncertainty":20000,
                     "point_limit": ($scope.filters.limit&&$scope.filters.limit!=undefined)?$scope.filters.points:0,
                   }}).success(function(result, status, headers, config) {
                        if($scope.species && result.layergroupid) {

                          $scope.tilesloaded=false;
                          $scope.addOverlay({
                              tile_url: ""+
                                "https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
                                  .format(result.cdn_url.https,

                                    result.layergroupid),
                              grid_url: ""+
                                "http://{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json"
                                  .format(
                                    result.cdn_url.https,
                                    result.layergroupid),
                              key: result.layergroupid,
                              attr: '©2014 Map of Life',
                              name: 'detail',
                              opacity: 0.8,
                              type: 'detail'
                          },'detail');

                        }});},500);}

          }

          $scope.datasetMetadata = function(dataset) {

             MOLApi({
              "service" : "datasets/metadata",
              "params" : {
                "id": dataset.id
              },
              "canceller" :$scope.canceller,
              "loading":true
            }).then(
              function(results) {
                var modalInstance, metadata = results.data;
                modalInstance = $modal.open({
                  templateUrl: 'static/views/detailed-map/dataset_metadata_modal.html',
                  controller: function($scope, $uibModalInstance) {

                      var items =[{"collapsed":false,"items":metadata}];
                      $scope.modal = {
                        "title": dataset.title,
                        "items": items
                      };
                      $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                      };
                    },
                  size: 'lg'
                });

              }
            );

          };


          $scope.typeMetadata = function(type) {

             MOLApi({
              "service" : "datasets/type",
              "params" : {
                "id": type.id
               },
               "canceller": $scope.canceller,
               "loading": true
            }).then(
              function(results) {
                var modalInstance, metadata = results.data;
                modalInstance = $modal.open({
                  templateUrl: 'static/partials/metadata_modal.html',
                  controller: function($scope, $uibModalInstance) {

                      var items =[{"collapsed":false,"items":metadata}];
                      $scope.modal = {
                        "title": type.title,
                        "items":items
                      };
                      $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                      };
                    },
                  size: 'lg'
                });

              }
            );

          };

          $scope.featureMetadataModal = function(dataset) {
            var modalInstance;

            modalInstance = $modal.open({
              templateUrl: 'static/partials/metadata_modal.html',
              controller: function($scope, $uibModalInstance) {

                  var items = [],ct=1;
                  angular.forEach(
                    dataset.features,
                    function(feature) {

                      var item = {
                        "title":"{0} record at {1}, {2}".format(
                          dataset.dataset_meta.dataset_title,
                          $filter('lat')(feature.lat),
                          $filter('lon')(feature.lng)
                        ),
                        "collapsed": (ct==1) ? false : true,
                        "items":[]
                      };

                      ct++;
                      angular.forEach(
                        feature.metadata,
                        function(v,k) {
                          item.items.push({"label":k,"value":v});
                        }
                      );
                      items.push(item);
                    }
                  );

                  $scope.modal = {
                    "title": dataset.title,
                    "items": items
                  };
                  $scope.close = function () {
                    $uibModalInstance.dismiss('cancel');
                  };
                },
              size: 'lg'
            });
          }

          //Get metdata for features on the map
          $scope.getFeatures = function(lat,lng,zoom,scientificname) {



            $scope.addFeatureMarker(lat,lng);

              return MOLServices(
                'featuremetadata',
                {
                  "scientificname": scientificname,
                  "lat": lat,
                  "lng": lng,
                  "zoom": zoom,
                  "datasets":$scope.visibleDatasets,
                  "min_year" : ($scope.filters.years)?$scope.year.min:-5555555,
                  "max_year" : ($scope.filters.years)?$scope.year.max:5555555,
                  "min_uncertainty": ($scope.filters.uncertainty)?$scope.uncertainty.min:-5555555,
                  "max_uncertainty": ($scope.filters.uncertainty)?$scope.uncertainty.max:5555555,
                  "scientificname": $scope.species.scientificname,
                  "datasets": $scope.visibleDatasets,
                  "null_years":($scope.filters.years)?$scope.year.nulls.toString():true.toString(),
                  "default_uncertainty":20000,
                  "point_limit": ($scope.filters.limit)?$scope.filters.points:0,
                }
              ).then(
                function(results) {


                  return results.data;

                }
              );
            };


    /*    $scope.$on('leafletDirectiveMap.popupopen', function(event, leafletEvent){

          // Create the popup view when is opened
          var feature = leafletEvent.leafletEvent.popup.options.feature;

          var newScope = $scope.$new();
          newScope.stream = feature;

          $compile(leafletEvent.leafletEvent.popup._contentNode)(newScope);
      })  ;*/

      $scope.addFeatureMarker = function(lat, lng) {
        $scope.leafletmap.markers = {
           f: {
               lat: lat,
               lng: lng,
               focus: true,
               compileMessage: true,
               icon: {
                type: 'awesomeMarker',
                prefix:'fa',
                icon: 'refresh',
                spin: true
                }
              }
        };

       };




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

      $scope.getLayers = function(scientificname) {

       MOLApi({
          "canceller": $scope.canceller,
          "loading": true,
          "service" : "species/layermetadata",
          "version" : "0.x",
          "creds" : true,
          "params" :   {"scientificname" : scientificname}
       }).success(

           function(layers) {

            if(layers == undefined) return;
            $scope.layers = layers;
            $scope.types = {};
            $scope.datasets = {};
            $scope.selectedFeatures = {}
            //$scope.species.bounds = null;

            angular.forEach(
              layers,
              function(layer) {
                $scope.datasets[layer.dataset_id] = layer;

                if($scope.types[layer.product_type]===undefined) {
                  $scope.types[layer.product_type]={
                    "id": layer.product_type,
                    "title":layer.type_title,
                    "bounds": layer.bounds,
                    "visible": (layer.product_type!='regionalchecklist'),
                    "feature_ct":0,
                    "datasets":{}};
                } else {
                  $scope.types[layer.product_type].bounds =
                    $scope.unionBounds(
                      angular.copy($scope.types[layer.product_type].bounds),
                      angular.copy(layer.bounds));
                }

                if(layer.product_type!='regionalchecklist') {

                  $scope.species.bounds = $scope.unionBounds(
                    angular.copy(layer.bounds),
                    angular.copy($scope.species.bounds));

                }



                $scope.types[layer.product_type].datasets[layer.dataset_id] = {
                  "visible":layer.visible,
                  "id" : layer.dataset_id,
                  "title": layer.dataset_title,
                  "bounds": layer.bounds,
                  "metadata": undefined,
                  "feature_ct": layer.feature_count,
                  "features":[]
                }

                if (layer.product_type != 'range') {
                  $scope.types[layer.product_type].feature_ct+=layer.feature_count;
                } else {
                  $scope.types[layer.product_type].feature_ct++;
                }

                $scope.datasets[layer.dataset_id] = layer;
                $scope.updateMap();
              }

            );

          $scope.newSpecies = true;
          $scope.updateLayers();


          });
      }


      $scope.$watch(
        "types",
        function(newValue,oldValue) {
          if(newValue) {
            $scope.updateLayers();
            $scope.updateMap();
          }
        },
        true
      );

      $scope.toggleType = function(type, bool) {
        angular.forEach(
          $scope.types[type].datasets,
          function(dataset) {
            dataset.visible = bool;
          }
        );
      }

      $scope.toggleDataset = function(type) {
        var visible = 0;
        angular.forEach(
          type.datasets,
          function(dataset) {
            if(dataset.visible) {visible++;}
          }
        );
        type.visibleDatasets = visible;
        if (visible == 0) {type.visible = false;}
        else  {type.visible = true;}

        type.partial = (visible < Object.keys(type.datasets).length && visible > 0) ? true : false;

      }

      $scope.selectedLayers = [];
      $scope.updateLayers = function() {
        var datasets = []

        angular.forEach(
          $scope.types,
          function(type) {
            if(type.visible) {
              angular.forEach(
                type.datasets,
                function(dataset) {
                  if(dataset.visible) {
                    datasets.push(dataset.id);
                  }
                }
              );
            }
          }
        );
        $scope.visibleDatasets = datasets.join(',')

      }

      $scope.$watch("species.scientificname", function(newValue, oldValue) {
            $scope.toggles.featuresActive = false;
            $scope.toggles.looking = false;
            if(newValue != undefined) {
              $scope.types = undefined;
              $scope.getLayers(newValue);
            }
      });



      $scope.toggleSidebar = function(state) {
        $scope.toggles.sidebarVisible=state;
      }

      $scope.featureMetadata = function(result, lat, lng) {
        var hasFeatures = false;
        $scope.toggles.sidebarVisible = true;
        $scope.toggles.featuresActive = true;
        $scope.toggles.looking = false;
        $scope.featuresByType = {};

        angular.forEach(
          result[0].datasets,
          function( features,dataset_id) {
            hasFeatures = true;
            if(!$scope.featuresByType[$scope.datasets[dataset_id].product_type]) {
              $scope.featuresByType[$scope.datasets[dataset_id].product_type] = {
                "feature_ct": 0,
                "datasets": {},
                "title": $scope.types[$scope.datasets[dataset_id].product_type].title
              }
            }
            $scope.featuresByType[$scope.datasets[dataset_id].product_type].feature_ct += features.length;
            $scope.featuresByType[$scope.datasets[dataset_id].product_type].datasets[dataset_id] = {
              title: $scope.datasets[dataset_id].dataset_title,
              latitude: lat,
              longitude: lng,
              features : features,
              feature_ct : features.length,
              dataset_meta: $scope.datasets[dataset_id]
            }
          }
          );

          if(hasFeatures) {
            $scope.toggles.sidebarVisible = true;
            $scope.toggles.featuresVisible = true;
            $scope.toggles.featuresActive = true;
            //$scope.featureLocation = {lat }
          } else {
            $scope.toggles.featuresVisible = false;
            $scope.toggles.featuresActive = false;
            $scope.parameter = undefined;
            $scope.featureLocation = undefined;
          }

          $http({
            "method":"GET",
            "url":'app/views/detailed-map/feature_metadata.html'}).success(
            function(tmpl) {
                $scope.infowindow.setOptions = {content:$compile(tmpl)};
            }
          );

        }
  }]);

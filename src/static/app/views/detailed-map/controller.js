angular.module('mol.controllers')
  .controller('molDetailWindowCtrl',
  [ '$scope',
    function($scope){

    }])
  .controller('molDetailMapCtrl',
  	[  '$compile',
      '$window','$http','$uibModal','$scope','$state', '$filter',
      '$timeout','$location','$anchorScroll','$q','MOLApi','molApiVersion','uiGmapGoogleMapApi',
   		function(
         $compile, $window, $http, $modal, $scope, $state, $filter,
          $timeout, $location, $anchorScroll, $q,  MOLApi,molApiVersion,uiGmapGoogleMapApi) {
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
                $scope.updateDetailMap();}
            },true);

            $scope.$watch('year',function(newValue,oldValue){
              if(newValue){
                $scope.updateDetailMap();}
            },true);

            $scope.$watch('filters',function(newValue,oldValue){
              if(newValue){
                $scope.updateDetailMap();}
            },true);

            $scope.updateDetailMap = function() {
              $scope.stale = false;
              $scope.canceller.resolve();
              $scope.canceller = $q.defer();

              $scope.clearOverlays();
              if($scope.species) {
                  if($scope.mapUpdater) {
                    try{
                      $timeout.cancel($scope.mapUpdater);
                    } catch(e){}};
                  $scope.mapUpdater = $timeout(function(){$http({
                  "withCredentials":false,
                  "method":"POST",
                  "timeout":$scope.canceller,
                  "url":"https://mol.cartodb.com/api/v1/map/named/detailed-map",
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
                          $scope.setOverlay({
                              tile_url: ""+
                                "//{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
                                  .format(result.cdn_url.https,

                                    result.layergroupid),
                              grid_url: ""+
                                "//{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json"
                                  .format(
                                    result.cdn_url.https,
                                    result.layergroupid),
                              key: result.layergroupid,
                              attr: '©2014 Map of Life',
                              name: 'detail',
                              opacity: 0.8,
                              type: 'detail'
                          },0);

                        }});},500);}

          }

          $scope.datasetMetadata = function(dataset) {

             MOLApi({
              "service" : "datasets/metadata",
              "params" : {
                "id": dataset.id
              },
              "canceller" :$scope.canceller,
              "loading":true,
              "version": molApiVersion
            }).then(
              function(results) {
                var modalInstance, metadata = results.data;
                modalInstance = $modal.open({
                  templateUrl: 'static/app/views/detailed-map/dataset_metadata_modal.html',
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
               "loading": true,

               "version": molApiVersion
            }).then(
              function(results) {
                var modalInstance, metadata = results.data;
                modalInstance = $modal.open({
                  templateUrl: 'static/app/partials/metadata_modal.html',
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
        $scope.map.getFeatures = function(lat,lng,zoom,scientificname) {

            MOLApi({
              "canceller": $scope.canceller,
              "loading": true,
              "service" : "species/featuremetadata",
              "version" : molApiVersion,
              "creds" : true,
              "params" : {
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
            }).then(
              function(results) {
                if(angular.isDefined(results.data[0].datasets)&&results.data[0].datasets){
                      $scope.map.infowindow = {
                        id: lat+'-'+lng,
                        show: true,
                        options:{animation:0, disableAutoPan:false},
                        coords: {
                          latitude: lat,
                          longitude:  lng
                      },
                      model: {
                        "searching":false,
                        "featureResult" :results.data[0],
                        "datasets" : $scope.datasets},
                      templateUrl: 'static/app/views/detailed-map/infowindow.html'
                    }
                } else {
                      $scope.map.infowindow = {};
                }
                if(!$scope.$$phase) {
                   $scope.$apply();
                 }

              }
            );
          };


      $scope.getLayers = function(scientificname) {

       MOLApi({
          "canceller": $scope.canceller,
          "loading": true,
          "service" : "species/datasets",
          "version" : molApiVersion,
          "creds" : true,
          "params" :   {"scientificname" : scientificname}
       }).success(

           function(layers) {

            if(layers == undefined) return;
            $scope.layers = layers;
            $scope.types = {};
            $scope.datasets = {};
            $scope.selectedFeatures = {}

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
                $scope.updateDetailMap();
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
            $scope.updateDetailMap();
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

  }]);
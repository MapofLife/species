angular.module('mol.controllers')
  .controller('molDetailWindowCtrl',
  [ '$scope',
    function($scope){

    }])
  .controller('molDetailMapCtrl',
  	[  '$compile',
      '$window','$http','$uibModal','$scope','$state', '$filter',
      '$timeout','$q','molApi','molHummingbirdsList',
   		function(
         $compile, $window, $http, $modal, $scope, $state, $filter,
          $timeout, $q,  molApi, molHummingbirdsList) {



            $scope.uncertainty = {
              min:0,
              max:32000,
              def:8000};
            $scope.year = {min:1970,max:2015, nulls:false};
            $scope.filters = {
              uncertainty: true,
              years: true,
              limit: true,
              points: 5000,
              threshold: 9999
            };
            $scope.toggles = {sidebarVisible: true, featuresActive:false, looking: false}
            $scope.mapUpdater  = undefined;


            $scope.visibleDatasets = undefined;

            $scope.sdmLayer = undefined;

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
              $scope.model.canceller.resolve();
              $scope.model.canceller = $q.defer();


              if($scope.species && $scope.visibleDatasets !== undefined) {
                  if($scope.mapUpdater) {
                    try{
                      $timeout.cancel($scope.mapUpdater);
                    } catch(e){}};
                  $scope.mapUpdater = $timeout(function(){$http({
                  "withCredentials":false,
                  "method":"POST",
                  "timeout":$scope.model.canceller,
                  "url":"https://carto.mol.org/user/mol/api/v1/map/named/detailed-map-snapped-dev",
                  "data": {
                     "min_year" : ($scope.filters.years)?$scope.year.min:-5555555,
                     "max_year" : ($scope.filters.years)?$scope.year.max:5555555,
                     "min_uncertainty": ($scope.filters.uncertainty)?$scope.uncertainty.min:-5555555,
                     "max_uncertainty": ($scope.filters.uncertainty)?$scope.uncertainty.max:5555555,
                     "scientificname": $scope.species.scientificname,
                     "datasets": ($scope.visibleDatasets.indexOf("sdm") > -1)?$scope.visibleDatasets.replace(",sdm","").replace("sdm",""):$scope.visibleDatasets,
                     "null_years":($scope.filters.years)?$scope.year.nulls.toString():true.toString(),
                     "default_uncertainty":20000,
                     "point_limit": ($scope.filters.limit&&$scope.filters.limit!=undefined)?$scope.filters.points:5000,
                   }}).success(function(result, status, headers, config) {
                        $scope.map.removeOverlay(1);
                        // $scope.map.clearOverlays();
                        if($scope.species && result.layergroupid) {

                          $scope.tilesloaded=false;
                          // Adding a timeout since there seems to be a race issue
                          // with removing and setting overlays
                          // TODO: Figure out if there is a better way without timeout. Add Promises.
                          $timeout(function(){
                            $scope.map.setOverlay({
                                tile_url: ""+
                                  "https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
                                    .format('carto.mol.org',
  
                                      result.layergroupid),
                                grid_url: ""+
                                  "https://{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json"
                                    .format(
                                      'carto.mol.org',
                                      result.layergroupid),
                                key: result.layergroupid,
                                attr: '©2018 Map of Life',
                                name: 'detail',
                                index: 1,
                                opacity: 0.8,
                                type: 'detail'
                            },1);
                            }, 500);

                          $scope.toggleSDM(($scope.visibleDatasets.indexOf("sdm") > -1));

                          // Trigger a map resize event since sometimes
                          // the map is cut off
                          // TODO: Figure out if there is a better way
                          $scope.map.resize();
                          
                        }});},500);
                    }

          }

          $scope.datasetMetadata = function(dataset) {

             molApi({
              "service" : "datasets/metadata",
              "params" : {
                "id": dataset.id
              },
              "canceller" :$scope.model.canceller,
              "loading":true
            }).then(
              function(results) {
                // No metadata available
                if (results.data[0].metadata == undefined) return;

                var modalInstance, metadata = results.data;
                // if (dataset.id == "704898e7-b945-4721-b201-9286bd00c0a9" || dataset.id == "a7d5a735-22f9-4260-aa31-a4a4e7bf3029") {
                var dsIdx = (metadata[0]['metadata'][0]['section'] == 'General') ? 0 : 1;
                var dsTitle = metadata[0]['metadata'][dsIdx]['children'][0]["value"];
                if (dsTitle.startsWith("IUCN") || dsTitle.startsWith("BirdLife")) {
                  // Add the IUCN/BirdLife link for detailed species info
                  var smurl = $scope.species.redlist_link;
                  if (!smurl || smurl.length == 0) {
                    smurl = 'http://www.iucnredlist.org/search/external?text='+$scope.species.scientificname.replace(' ','+');
                  }

                  var smtext = "For original, detailed IUCN map see - " + smurl ;
                  if (dsTitle.startsWith("BirdLife")) {
                    smtext = "For original, detailed BirdLife map see http://datazone.birdlife.org/species/results?kw=";
                    smtext += $scope.species.scientificname.replace(' ','+');
                    smtext += ", or use http://datazone.birdlife.org/species/search to find species with name changes";
                  }

                  metadata[0]['metadata'].splice(0, dsIdx, {
                    "section": "Detailed",
                    "children": [{
                      "type": "text",
                      "id": "iucn_link",
                      "label": "",
                      "value": smtext
                    }]
                  });

                  // Add the 'geometry processing' info
                  angular.forEach(
                    metadata[0]['metadata'],
                    function (mobj) {
                      if (mobj['section'] == "Geospatial") {
                        var gpIsPresent = false;
                        for (var i=0; i < mobj['children'].length; i++) {
                          if (mobj['children'][i]["id"] == "geometry_processing") {
                            gpIsPresent = true;
                            break;
                          }
                        }
                        if (!gpIsPresent) {
                          mobj['children'].push({
                            "type": "text",
                            "id": "geometry_processing",
                            "label": "Grid analysis and representation",
                            "value": "The source information (maps drawn by individual experts) was reanalyzed and for visual purposes modelled as a hierarchical presence grid. Grid cells vary in size depending on the amount of detail required to characterize a distribution. with a smallest cell size of ca. 765 km2 near the equator. For this type of source information, this minimum grid cell size is smaller than appropriate for quantitative analysis and intended for visualization only (Hurlbert & Jetz  2007. Species richness, hotspots, and the scale dependence of range maps in ecology and conservation. PNAS 104:13384-13389)."
                          });
                        }
                      }
                    }
                  );
                }
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

             molApi({
              "service" : "datasets/type",
              "params" : {
                "id": type.id
               },
               "canceller": $scope.model.canceller,
               "loading": true

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
        /*$scope.map.getInfoWindowModel = function(map, eventName, latLng, data) {
          var deferred = $q.defer();
          switch(eventName) {
            case 'click':
               molApi({
                "canceller": $scope.canceller,
                "loading": true,
                "service" : "species/featuremetadata2",
                "creds" : true,
                "params" : {
                  "scientificname": $scope.species.scientificname,
                  "lat": latLng.lat(),
                  "lng": latLng.lng(),
                  "zoom": map.getZoom(),
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
                  if(angular.isDefined(results.data[0].datasets) && results.data[0].datasets){
                        deferred.resolve( {
                          model:{
                            "searching":false,
                            "featureResult" :results.data[0],
                            "datasets" : $scope.datasets
                          },
                          show: true,
                          templateUrl: 'static/app/views/detailed-map/infowindow.html'
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

        };*/

        //Get metdata for features on the map
        $scope.map.getInfoWindowModel = function(map, eventName, latLng, data) {
          var deferred = $q.defer();
          switch(eventName) {
            case 'click':
               molApi({
                "canceller": $scope.canceller,
                "loading": true,
                "service" : "species/featuremetadata",
                "creds" : true,
                "params" : data
                
              }).then(
                function(results) {
                  if (angular.isDefined(results.data) && results.data.length > 0 && !results.data[0].error) {
                        deferred.resolve( {
                          model: {
                            feature: results.data,
                            dataset: $scope.datasets[data.dataset_id]
                          },
                          show: true,
                          templateUrl: 'static/app/views/detailed-map/featurewindow.html'
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


      $scope.getLayers = function(scientificname) {

       molApi({
          "canceller": $scope.canceller,
          "loading": true,
          "service" : "species/datasets",
          "creds" : true,
          "params" :   {"scientificname" : scientificname}
       }).success(

           function(layers) {

            if(layers == undefined) return;

            $scope.sdmLayer = addSpeciesSDMLayer();
            if ($scope.sdmLayer !== undefined) {
              // find the range layer and add it's bounds to the SDM layer
              var rl = layers.filter(function(l) {
                return l.product_type == 'range' && l.visible == true && l.user_dataset == false && l.public == true;
              });
              rl = (rl && rl.length > 0) ? rl[0] : undefined;
              if (rl) {
                $scope.sdmLayer.bounds = rl.bounds;
              }

              // add the initial threshold filter
              $scope.filters.threshold = $scope.sdmLayer.filters.threshold[0];
              layers.push($scope.sdmLayer);
            }

            $scope.layers = layers;
            $scope.types = {};
            $scope.datasets = {};
            $scope.selectedFeatures = {};
            $scope.user_datasets = [];

            angular.forEach(
              layers,
              function(layer) {
                $scope.datasets[layer.dataset_id] = layer;

                if($scope.types[layer.product_type]===undefined) {
                  $scope.types[layer.product_type]={
                    "id": layer.product_type,
                    "title":layer.type_title,
                    "bounds": layer.bounds,
                    "visible": (layer.product_type!='regionalchecklist' && layer.product_type!='alienchecklist' && layer.product_type!='sdm'),
                    "feature_ct": 0,
                    "datasets":{}};
                } else {
                  $scope.types[layer.product_type].bounds =
                    $scope.unionBounds(
                      angular.copy($scope.types[layer.product_type].bounds),
                      angular.copy(layer.bounds));
                }

                var dsTitle = layer.dataset_title;
                if (dsTitle.startsWith('IUCN ')) {
                  dsTitle = 'MOL grid of IUCN';
                } else if (dsTitle.startsWith('BirdLife')) {
                  dsTitle = 'MOL grid of BirdLife'
                }

                $scope.types[layer.product_type].datasets[layer.dataset_id] = {
                  "visible":layer.visible,
                  "user_dataset":layer.user_dataset,
                  "id" : layer.dataset_id,
                  "title": dsTitle,
                  "bounds": layer.bounds,
                  "metadata": undefined,
                  "feature_ct": layer.no_rows,
                  "features":[]
                }

                if (layer.product_type != 'range') {
                  $scope.types[layer.product_type].feature_ct+=layer.no_rows;
                } else {
                  $scope.types[layer.product_type].feature_ct++;
                }

                if (layer.dataset_id == '704898e7-b945-4721-b201-9286bd00c0a9') {
                  $scope.types[layer.product_type].datasets[layer.dataset_id].visible = false;
                  $scope.types[layer.product_type].partial = true;
                }

                $scope.datasets[layer.dataset_id] = layer;
                if (layer.user_dataset) {
                  $scope.user_datasets.push(layer);
                }
                $scope.updateDetailMap();
              }

            );

          $scope.updateLayers();


          });
      }

      function addSpeciesSDMLayer() {
        var spinfo = molHummingbirdsList($scope.species.scientificname);

        // molHummingbirdsList($scope.species.scientificname).then(function(data) {
        //   console.log("Did we get a species: ", data);
        // });

        if (spinfo) { // ($scope.species.scientificname == 'Abeillia abeillei')
          return {
            "user_dataset": false,
            "product_type": "sdm",
            "type_title": "SDM",
            "bounds": undefined,
            "no_rows": 1,
            "visible": false,
            "dataset_id": "sdm",
            "public": true,
            "dataset_title": "Best predicted SDM",
            "filters": {
              "threshold": [spinfo.th05, spinfo.th10]
            }
          };
        }
        return undefined;
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

      $scope.sdm_datasets = false;
      $scope.toggleSDM = function(show) {
        $scope.sdm_datasets = show;
        if (show) {

          molApi({
              "canceller": $scope.canceller,
              "loading": true,
              "service": "species/indicators/rasters/map",
              "creds": true,
              "params":   {
                "scientificname": $scope.species.scientificname,
                "threshold": $scope.filters.threshold  // 2.27004065559037e-07
              }
          }).success(function(data) {
            var sdm_tile_url = data.map.tile_url;
            if (sdm_tile_url.length > 0) {
              $scope.map.setOverlay({
                tile_url: sdm_tile_url,
                grid_url: "",
                key: '832bbf7e822d8ad024271105a0e92450',
                attr: '©2018 Map of Life',
                name: 'SDM',
                index: 0,
                opacity: 0.6,
                type: 'sdm'
              }, 0);
            }
          }); 
        } else {
          $scope.map.removeOverlay(0);
        }
      }



      $scope.regiondatasets = [];
      $scope.$watch("region", function(n,o) {
        if(n && n.type !== 'global') {
          if (n.region_id) {
            $scope.regiondatasets = [];
            molApi({
              "canceller": $scope.canceller,
              "loading": true,
              "service": "spatial/regions/datasets",
              "creds": true,
              "params":   {
                "region_id": n.region_id, 
                "scientificname": $scope.species.scientificname,
                "product_type": "griddedrangeatlas,localinv,points,range,regionalchecklist"
              }
           }).success(function(rds) {
             angular.forEach(rds, function(ds) {
              $scope.regiondatasets.push(ds.dataset_id);
             });
           });  
          }
          
        } 
      },true);

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

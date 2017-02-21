angular.module('mol.controllers')
  .controller('molOverviewCtrl',
  	[ '$compile',
      '$window', '$http', '$uibModal', '$scope', '$state', '$filter', '$translate', 
      '$timeout','$location','$anchorScroll','$q','molApi','uiGmapGoogleMapApi',
   		function(
          $compile, $window, $http, $modal, $scope, $state, $filter, $translate, 
          $timeout, $location, $anchorScroll, $q,  molApi,uiGmapGoogleMapApi) {


            $scope.selectedFamily = undefined;
            $scope.iucnStatus = undefined;
            $scope.mapUpdater  = undefined;

            //$scope.map.options.scrollwheel = false;
            $scope.map.removeOverlay(0);

            $scope.map.getInfoWindowModel = function(map, eventName, latLng, data) {}

            function updateSpeciesDetails() {
              
              // Get the group
              var selectedGroup = $scope.groups.find(function (group) {
                return group.taxa === $scope.species.taxa
              }) || '';
              
              // Get the family
              var family = $scope.species.family;

              if ($scope.species.taxonomy) {
                var langKey = $translate.use() + "_family";
                if ($scope.species.taxonomy[langKey]) {
                  family = $scope.species.taxonomy[langKey];
                }
              }

              // Set up the family display
              $scope.selectedFamily = selectedGroup.title;
              if (family) {
                $scope.selectedFamily += ' > ' + family
              }

              // Set up the IUCN status
              var iucn_status = undefined;
              if ($scope.species.taxonomy) {
                if ($scope.species.taxonomy.iucn_red_list_status) {
                  var status = $scope.species.taxonomy.iucn_red_list_status;
                  if (status == 'CR') {
                    $scope.iucnStatus = 'Critically Endangered';
                  } else if (status == 'EN') {
                    $scope.iucnStatus = 'Endangered';
                  } else if (status == 'EW') {
                    $scope.iucnStatus = 'Extinct (Wild)';
                  } else if (status == 'EX') {
                    $scope.iucnStatus = 'Extinct';
                  } else if (status == 'LC') {
                    $scope.iucnStatus = 'Least Concern';
                  } else if (status == 'NT') {
                    $scope.iucnStatus = 'Near Threatened';
                  } else if (status == 'VU') {
                    $scope.iucnStatus = 'Vulnerable';
                  } 
                }
              }
            };

              $scope.$watch(
                'species.scientificname',
                function(name) {
                  if(name) {
                      $scope.canceller.resolve();
                      $scope.canceller = $q.defer();
                      if($scope.mapUpdater) {
                        try{
                          $timeout.cancel($scope.mapUpdater);
                        } catch(e){}};
                      $scope.mapUpdater = $timeout(function(){$http({
                      "withCredentials":false,
                      "method":"POST",
                      "timeout": $scope.canceller,
                      "url":"https://mol.carto.com/api/v1/map/named/consensus_map",
                      "data": {
                         "scientificname": name,
                      }}).success(function(result, status, headers, config) {
                            if($scope.species && result.layergroupid) {

                              $scope.map.setOverlay({
                                  tile_url: ""+
                                    "https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
                                      .format(result.cdn_url.https,

                                        result.layergroupid),
                                  grid_url: ""+
                                    "https://{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json"
                                      .format(
                                        result.cdn_url.https,
                                        result.layergroupid),
                                  key: result.layergroupid,
                                  attr: '©2014 Map of Life',
                                  name: 'overview',
                                  opacity: 0.8,
                                  index:0,
                                  type: 'overview'
                              },0);

                            }});},500);


                      $timeout(500).then(function() {
                        updateSpeciesDetails();
                      });


                    }
                  }
                );

  }]);

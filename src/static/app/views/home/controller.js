angular.module("mol.controllers").controller("molHomeCtrl", ["$scope", "$state", "$http", "$translate", "molApi", "molSpeciesList", function ($scope, $state, $http, $translate, molApi, molSpeciesList) {

  $scope.region = {};
  $scope.speciesList = molSpeciesList;


  $scope.searchSpecies = function (term) {
    //$scope.canceller.resolve();

    if (!$scope.groups) {
      $scope.groups = { selected: undefined };
    }
    
    // return molApi({
    //   "service": "species/groupsearch",
    //   "params": {
    //     "query": term,
    //     "group": ($scope.groups.selected !== 'any') ? $scope.groups.selected : undefined,
    //     "regionid": $scope.region.region_id,
    //     "lang": $translate.use()
    //   },
    //   "canceller": $scope.canceller,
    //   "loading": true
    // }).then(function (results) {
    //   return results.data;
    // });

    return $scope.molApiCall('https://api.mol.org/1.0/species/groupsearch', {
      query: term,
      group: ($scope.groups.selected !== 'any') ? $scope.groups.selected : undefined,
      regionid: $scope.region.region_id,
      lang: $translate.use()
    }).then(function (results) {
      return results.data;
    });
  };

  $scope.randomSpecies = function () {
    var group = null;
    try { group = $scope.groups.selected.taxa }
    catch (e) { }

    // molApi({
    //   "service": "species/random",
    //   "params": {
    //     "taxogroup": (group !== 'any') ? group : undefined,
    //     "region_id": $scope.region.region_id,
    //     "lang": $translate.use(),
    //     "rand": Math.random() * 1000000
    //   },
    //   "canceller": $scope.canceller,
    //   "loading": true
    // }).success(
    //   function (species) {
    //     //$scope.groups.selected = species.taxa;
    //     $scope.loadSpeciesPage(species.scientificname);
    // });

    $scope.molApiCall('https://api.mol.org/1.0/species/random', {
      taxogroup: (group !== 'any') ? group : undefined,
      region_id: $scope.region.region_id,
      lang: $translate.use(),
      rand: Math.random() * 1000000
    }).then(function(response) {
      $scope.loadSpeciesPage(response.data.scientificname);
    });

  };

  /* 
    Hack to get the molApi to work when using the browser BACK button
    For some odd reason, the dynamic JSON_CALLBACK functions aren't 
    being registered when going back to the HOME page.
    TODO: Fix this, Ajay 
  */
  $scope.molApiCall = function(url, params) {
    params: angular.extend(params || {}, { callback: 'JSON_CALLBACK' })
    var config = {
      method: 'JSONP',
      url: url,
      params: params,
      withCredentials: false,
      cache: true,
      timeout: $scope.canceller,
      ignoreLoadingBar: false
    };
    return $http(config); 
  }

  // Navigate to the species pages
  $scope.loadSpeciesPage = function (scientificname) {
    $state.transitionTo(
      "species.overview",
      { scientificname: scientificname.replace(/ /g, '_') },
      { inherit: true, notify: true }
    );
  };

}]);
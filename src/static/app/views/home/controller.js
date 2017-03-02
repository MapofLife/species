angular.module("mol.controllers").controller("molHomeCtrl", ["$scope", "$state", "$http", "$translate", "molApi", "molSpeciesList", function ($scope, $state, $http, $translate, molApi, molSpeciesList) {

  $scope.region = {};
  $scope.speciesList = molSpeciesList;


  $scope.searchSpecies = function (term) {
  
    var group = null;
    try { group = $scope.groups.selected.taxa }
    catch (e) { }

    return $scope.molApiCall('https://api.mol.org/1.0/species/groupsearch', {
      query: term,
      group: (group !== 'any') ? group : undefined,
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

    $scope.molApiCall('https://api.mol.org/1.0/species/random', {
      taxogroup: (group !== 'any') ? group : undefined,
      region_id: $scope.region.region_id,
      lang: $translate.use(),
      rand: Math.random() * 1000000
    }).then(function(response) {
      $state.transitionTo(
        "species.overview",
        { scientificname: scientificname.replace(/ /g, '_') },
        { inherit: true, notify: true }
      );
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

}]);

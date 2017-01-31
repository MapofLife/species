angular.module("mol.controllers").controller("molHomeCtrl", ["$scope", "$state", "$translate", "molApi", "molSpeciesList", function ($scope, $state, $translate, molApi, molSpeciesList) {

  $scope.region = {};
  $scope.speciesList = molSpeciesList;


  $scope.searchSpecies = function (term) {
    //$scope.canceller.resolve();

    if (!$scope.groups) {
      $scope.groups = { selected: undefined };
    }

    return molApi({
      "service": "species/groupsearch",
      "params": {
        "query": term,
        "group": ($scope.groups.selected !== 'any') ? $scope.groups.selected : undefined,
        "regionid": $scope.region.region_id,
        "lang": $translate.use()
      },
      "canceller": $scope.canceller,
      "loading": true
    }).then(function (results) {
      return results.data;
    });
  };

  $scope.randomSpecies = function () {
    var group = null;
    try { group = $scope.groups.selected.taxa }
    catch (e) { }
    
    molApi({
      "service": "species/random",
      "params": {
        "taxogroup": (group !== 'any') ? group : undefined,
        "region_id": $scope.region.region_id,
        "lang": $translate.use(),
        "rand": Math.random() * 1000000
      },
      "canceller": $scope.canceller,
      "loading": true
    }).success(
      function (species) {
        //$scope.groups.selected = species.taxa;
        $scope.loadSpeciesPage(species.scientificname);
      });
  };

  // Navigate to the species pages
  $scope.loadSpeciesPage = function (scientificname) {
    $state.transitionTo(
      "species.overview",
      { scientificname: scientificname.replace(/ /g, '_') },
      { inherit: true, notify: true }
    );
  };

}]);
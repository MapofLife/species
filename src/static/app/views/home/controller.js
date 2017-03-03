angular.module("mol.controllers").controller("molHomeCtrl", [
  "$scope", "$state", "$http", "$translate", "molApi", "molSpeciesList",
  function ($scope, $state, $http, $translate, molApi, molSpeciesList) {

  $scope.region = {};
  $scope.speciesList = molSpeciesList;


  $scope.searchSpecies = function (term) {

    var group = null;
    try { group = $scope.groups.selected.taxa }
    catch (e) { }

    return molApi({
      "service": "species/groupsearch",
      "params" : {
        "query": term,
        "group": (group !== 'any') ? group : undefined,
        "regionid": $scope.region.region_id,
        "lang": $translate.use()
    }}).then(function (results) {
      return results.data;
    });
  };

  $scope.randomSpecies = function () {
    var group = null;
    try { group = $scope.groups.selected.taxa }
    catch (e) { }
    molApi({
      "service": "species/random",
      "timeout": $scope.canceller,
      "params" : {
        taxogroup: (group !== 'any') ? group : undefined,
        region_id: $scope.region.region_id,
        lang: $translate.use(),
        rand: Math.random() * 1000000
      }}).then(function(response) {
         $scope.loadSpeciesPage(response.data.scientificname)
       });
  };

  $scope.loadSpeciesPage = function(scientificname){
    $state.transitionTo(
      "species.overview",
      { "scientificname": scientificname.replace(/ /g, '_') },
      { inherit: true, notify: true }
    );
  }
}]);

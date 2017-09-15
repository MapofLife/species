angular.module("mol.controllers").controller("molHomeCtrl", [
  "$rootScope", "$scope", "$state", "$http", "$translate", "molApi", "molSpeciesList",
  function ($rootScope, $scope, $state, $http, $translate, molApi, molSpeciesList) {

  $scope.region = {};
  $scope.speciesList = {};

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
      //"timeout": $scope.model.canceller,
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
      { "scientificname": scientificname.replace(/ /g, '_') }
    );
  }

  $scope.setupHeroSpecies = function() {
    var lang = $translate.use();
    var splist = [];
    angular.forEach(molSpeciesList, function (sp, idx){
      this.push({ i: sp.i, s: sp.s, c: sp.c[lang] });
    }, splist);
    $scope.speciesList = splist;
  }

  $scope.setupHeroSpecies();
  $rootScope.$on('$translateChangeSuccess', function (e) { $scope.setupHeroSpecies(); });
}]);

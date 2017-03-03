angular.module('mol.controllers')
 .controller('molHabitatControlsCtrl',
    ['$scope','$q','$rootScope','molFormatSuitabilityPrefs',
      function($scope, $q, $rootScope, molFormatSuitabilityPrefs) {
        $scope.update = false;
        $scope.$watch('species.prefs',function(n,o){
          if(n) { $scope.stale = true}},true);

        $scope.applyUpdates = function() {
           $scope.stale = false
           $scope.model.canceller.resolve();
           $scope.model.canceller = $q.defer();
           $scope.model.prefs = molFormatSuitabilityPrefs($scope.species.prefs)
        }
        var unbind = $scope.$watch('species.prefs',function(n,o){
          if(n) { $scope.applyUpdates(); unbind()}});

}]);

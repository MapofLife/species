angular.module('mol.controllers')
 .controller('molHabitatControlsCtrl',
    ['$scope','molFormatSuitabilityPrefs',
      function($scope, molFormatSuitabilityPrefs) {
        $scope.update = false;
        $scope.$watch('species.prefs',function(n,o){
          if(n) { $scope.stale = true}});

        $scope.applyUpdates = function() {
           $scope.stale = false
           $scope.model.prefs = molFormatSuitabilityPrefs($scope.species.prefs)
        }
        var unbind = $scope.$watch('species.prefs',function(n,o){
          if(n) { $scope.applyUpdates(); unbind()}});

}]);

angular.module('mol.controllers')
.controller('molProjectionCtrl', 
    ['$scope', '$state',
    function($scope, $state) {

      $scope.speciesList = {};

      var projectionSpeciesList = [{
        s: "Limnornis_curvirostris",
        c: {
          en: "Curve-Billed Reedhaunter",
          de: "",
          es: "",
          fr: "",
          zh: ""
        },
        i: "https://lh3.googleusercontent.com/i_Czl7FZ3E-a2a6ECsMiVS3mJ2WsC9Mit30UqUxgUn7JFUiRFI-6mFVqK5T9azb7xRIQxuKQ2y493mZLSY8Viy4-=s512-c"
      }, {
        s: "Oreophryne_monticola",
        c: {
          en: "Lombok Cross Frog",
          de: "",
          es: "",
          fr: "",
          zh: ""
        },
        i: "https://lh3.googleusercontent.com/iwdEY5ht0EMMylwjOy9UGg1AtUR6zoeMOvcI9F7zear21GPUTWyRpO1WWUacPm9Fo7dO8fBFeU8tb_R-_b_yTJE=s512-c"
      }, {
        s: "Cichlocolaptes_leucophrus",
        c: {
          en: "Pale-Browed Treehunter",
          de: "",
          es: "",
          fr: "",
          zh: ""
        },
        i: "https://lh3.googleusercontent.com/V-nKhiE6tSJA3LpBv9rc8Nch5jgC5KjB4mY_eOxoS3DNIRslyQpA2r31sHdBl_WKK2tyuHgnuVpUa59WozddFw=s512-c"
      }, {
        s: "Kobus_megaceros",
        c: {
          en: "Nile Lechwe",
          de: "",
          es: "",
          fr: "",
          zh: ""
        },
        i: "https://lh3.googleusercontent.com/8gNXTCEgTbSpRLOPB0oDzcvI4U7GXyB5ZaF7qHfLLIBPjFx7xvkk-3R1abFELQ-F_ljlrRnWmrGPHLcJoestqCQ=s512-c"
      }];

      $scope.setupHeroSpecies = function() {
        var lang = 'en';
        var splist = [];
        angular.forEach(projectionSpeciesList, function (sp, idx){
          this.push({ i: sp.i, s: sp.s, c: sp.c[lang] });
        }, splist);
        $scope.speciesList = splist;
      }
    
      $scope.setupHeroSpecies();

      $scope.$watch("$parent.species", function(n, o) {
        if(n != undefined) {
          $state.transitionTo( 
            'species.projection-landuse', 
            {"scientificname": n.scientificname.replace(/ /g, '_')}
          );
        }
    });
}]);
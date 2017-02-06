angular.module('mol.controllers')
 .controller('molHabitatDistributionCtrl',
    ['$scope', '$q', '$timeout','$http','$filter', 'molApi','$stateParams',
  'refinedMapPerformance','changeInMapPerformance','getFScore','getSensConf','getSensitivity',
    function($scope, $q, $timeout, $http, $filter, molApi, $stateParams,
      refinedMapPerformance, changeInMapPerformance,getFScore,getSensConf, getSensitivity ) {

      $scope.$watch('species.scientificname',function(n,o){
      if($scope.species) {
        $scope.map.clearOverlays();
        $scope.canceller.resolve();
        $scope.canceller = $q.defer();
        molApi({
         "url": "spi-metrics.api-0-x.map-of-life.appspot.com",
         "service" : "species/indicators/habitat-distribution/map",
         "version": "0.x",
         "params" : {
           "scientificname": $scope.species.scientificname,
           "dsid":  $stateParams.dsid,
           "show_points": true
         },
         "canceller" :$scope.canceller,
         "loading":true,
         "protocol" : "http"
       }).then(
         function(result) {
           $scope.tilesloaded=false;
           $scope.map.setOverlay({
               tile_url: result.data.tileurl,
               key: result.data.tileurl,
               attr: '©2014 Map of Life',
               name: 'habitat-distribution',
               index:0,
               opacity: 0.8,
               type: 'habitat-distribution'
           },0);
      });
        molApi({
         "url": "spi-metrics.api-0-x.map-of-life.appspot.com",
         "service" : "species/indicators/habitat-distribution/stats",
         "version": "0.x",
         "params" : {
           "scientificname": $scope.species.scientificname,
           "dsid":  $stateParams.dsid,
           "show_points": true
         },
         "canceller" :$scope.canceller,
         "loading":true,
         "protocol": "http"
       }).then(
         function(result) {
           var habitat_distribution = result.data,
               refined_precision = 1,
               expert_precision = result.data.refined_range_size /
                  result.data.expert_range_size,
               expert_sensitivity = 1,
               num_points =  result.data.points_in_expert_range + result.data.points_in_refined_range,
               expert_f = Math.round(100*getFScore(expert_precision,expert_sensitivity)),
               refined_sensitivity = result.data.points_in_refined_range / (result.data.points_in_refined_range  +result.data.points_in_expert_range ),
               refined_f = Math.round(100*getFScore(refined_precision,refined_sensitivity));


            habitat_distribution.f_change =
              changeInMapPerformance(
                result.data.refined_range_size,
                result.data.expert_range_size,
                result.data.points_in_expert_range,
                result.data.points_in_refined_range
              );
            habitat_distribution.f_score =
                refinedMapPerformance(
                  result.data.refined_range_size,
                  result.data.expert_range_size,
                  result.data.points_in_expert_range,
                  result.data.points_in_refined_range
                )
            var sens_conf = getSensConf(getSensitivity(
              result.data.points_in_refined_range,
              result.data.points_in_expert_range),
              (result.data.points_in_refined_range +
                result.data.points_in_expert_range));

            var refined_f_low =
              Math.round(100*getFScore(refined_precision,sens_conf[0]));
            var refined_f_high =
                Math.round(100*getFScore(refined_precision,sens_conf[1]));

            habitat_distribution.f_change_high = refined_f_high - expert_f;
            habitat_distribution.f_change_low = (num_points == 0)? -1: refined_f_low-expert_f;
            habitat_distribution.num_points = num_points;
            $scope.species.habitat_distribution = habitat_distribution;

         })


    }});

  }])
  .factory('getFScore', [
      function() {
        return function(precision,sensitivity) {
            return 2 * (precision * sensitivity) / (precision + sensitivity)
          }
        }])
  .factory('refinedMapPerformance',	[
    	function() {
        return function(habitat_area, range_area, range_pts_ct, habitat_pts_ct) {
      var getFScore = function(precision,sensitivity) {
        return 2 * (precision * sensitivity) / (precision + sensitivity)
      }
      var range_change = Math.round(100*(habitat_area - range_area) / range_area); // % change in range
      var expert_precision = habitat_area/range_area;
      var expert_sensitivity = 1;
      var expert_f = Math.round(100*getFScore(expert_precision,expert_sensitivity));
      var refined_precision = 1;
      var refined_sensitivity = habitat_pts_ct / (range_pts_ct + habitat_pts_ct);
      var refined_f = Math.round(100*getFScore(refined_precision,refined_sensitivity));
      return refined_f;
    }}])
  .factory('getSensitivity',[
    function() {
      return function(habitat_pts_ct, range_pts_ct) {
        return habitat_pts_ct / (range_pts_ct + habitat_pts_ct)
    }
  }])
  .factory('changeInMapPerformance',	[
      function() {
        return function(habitat_area, range_area, range_pts_ct, habitat_pts_ct) {
        var getFScore = function(precision,sensitivity) {
          return 2 * (precision * sensitivity) / (precision + sensitivity)
        }
      var range_change = Math.round(100*(habitat_area - range_area) / range_area); // % change in range
      var expert_precision = habitat_area/range_area;
      var expert_sensitivity = 1;
      var expert_f = Math.round(100*getFScore(expert_precision,expert_sensitivity));
      var refined_precision = 1;
      var refined_sensitivity = habitat_pts_ct / (range_pts_ct + habitat_pts_ct);
      var refined_f = Math.round(100*getFScore(refined_precision,refined_sensitivity));
      var precision_change = Math.round(100*(refined_precision - expert_precision))
      var sensitivity_change = Math.round(100*(refined_sensitivity - expert_sensitivity))
      var f_change = refined_f - expert_f;
      return f_change;
    }}])
    .factory('getSensConf',[
      function() {
        return function(sens,n) {
         var z = 1.96, //one-sided 95% z-score for normal distribution
             t = 2*n*sens+z^2,
             p = z*Math.sqrt(z^2+4*n*sens*(1-sens)),
             q = 2*(n+z^2);

        return [(t-p)/q, (t+p)/q]
      }



    }])

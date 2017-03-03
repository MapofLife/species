angular.module('mol.controllers')
 .controller('molHabitatDistributionCtrl',
    ['$scope', '$q', '$timeout', 'molHabitatDistributionStatsSvc',
    'molHabitatDistributionMapsSvc',
    function($scope, $q, $timeout, molHabitatDistributionStatsSvc,
      molHabitatDistributionMapsSvc ) {

      $scope.$watch('model.prefs',function(n,o){
      if(n) {

        $scope.map.clearOverlays();
        $scope.species.habitat_distribution = undefined;


      molHabitatDistributionStatsSvc(n,$scope.model.canceller)
        .then(function(result){
          $scope.species.habitat_distribution = result
        })
      molHabitatDistributionMapsSvc(n,$scope.model.canceller)
        .then(function(result) {
          $scope.map.setOverlay(result,0);
        });

    }},true);

  }])
  .factory('molHabitatDistributionMapsSvc', ['molApi',function(molApi) {
    return function(prefs,canceller) {
      return molApi({
       "service" : "species/indicators/habitat-distribution/map",
       "version": "0.x",
       "params" : prefs,
       "canceller" :canceller,
       "loading":true
     }).then(
       function(result) {
         return {
             tile_url: result.data.tileurl,
             key: result.data.tileurl,
             attr: '©2014 Map of Life',
             name: 'habitat-distribution',
             index:0,
             opacity: 0.8,
             type: 'habitat-distribution'
         };
    });
    }
  }])
  .factory(
      'molHabitatDistributionStatsSvc', ['molApi',function(molApi){
        return function(prefs,canceller) {
          //data transformation functions

          function getFScore(precision,sensitivity) {
              return 2 * (precision * sensitivity) / (precision + sensitivity)
          }
          function refinedMapPerformance(habitat_area, range_area, range_pts_ct, habitat_pts_ct) {
              var range_change = Math.round(100*(habitat_area - range_area) / range_area); // % change in range
              var expert_precision = habitat_area/range_area;
              var expert_sensitivity = 1;
              var expert_f = Math.round(100*getFScore(expert_precision,expert_sensitivity));
              var refined_precision = 1;
              var refined_sensitivity = habitat_pts_ct / (range_pts_ct + habitat_pts_ct);
              var refined_f = Math.round(100*getFScore(refined_precision,refined_sensitivity));
              return refined_f;
          }
          function getSensitivity(habitat_pts_ct, range_pts_ct) {
              return habitat_pts_ct / (range_pts_ct + habitat_pts_ct)
          }
          function changeInMapPerformance(habitat_area, range_area, range_pts_ct, habitat_pts_ct) {
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
          }
          function getSensConf(sens,n) {
              var z = 1.96, //one-sided 95% z-score for normal distribution
                   t = 2*n*sens+z^2,
                   p = z*Math.sqrt(z^2+4*n*sens*(1-sens)),
                   q = 2*(n+z^2);

              return [(t-p)/q, (t+p)/q]
          }

          return molApi({
           "service" : "species/indicators/habitat-distribution/stats",
           "version": "0.x",
            "params" :prefs,
           "canceller" :canceller,
           "loading":true
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

              return (habitat_distribution);

           })
        }
      }]
  )

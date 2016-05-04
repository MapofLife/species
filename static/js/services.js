'use strict';

/* Services */


// Service to get Species Info from CartoDB
var molServices = angular.module('mol.services', ['ngResource']);
molServices.factory(
	'GetProtectedAreas',
	[
		'$resource','$q',
		function($resource, $q) {
			var abort = $q.defer();

			return function(refineParams) {
				var url = 'https://' +document.location.host + '/species/api/protect?' + $.param(refineParams);
				$('#debug').html('<a target="debug" href="{0}">{0}</a>'.format(url));
				return $resource(
					'api/protect',
					{},
					{
						query: {
							method:'GET',
							ignoreLoadingBar:false,
							params: refineParams,
							timeout: abort,
							isArray: false
						}
					}
				);
			}
		}
	]
);

molServices.factory(
	'GetRefinedRange',
	[
		'$resource','$q',
		function($resource,$q) {
			var abort = $q.defer();
			return function(refineParams) {

				var url = 'https://' +document.location.host + '/species/api/refine?' + $.param(refineParams);
				$('#debug').html('<a target="debug" href="{0}">{0}</a>'.format(url));
				return $resource(
					'api/suitability/maps',
					{},
					{
						query: {
							method:'GET',
							ignoreLoadingBar: false,
							params: refineParams,
							timeout: abort,
							isArray: false
						}
					}
				);
			}
		}
	]
);

molServices.factory(
	'GetHabitatChange',
	[
		'$resource','$q',
		function($resource,$q) {
			var abort = $q.defer();
			return function(changeParams) {
				var url = 'https://' +document.location.host + '/species/api/change?' + $.param(changeParams);
				$('#debug').html('<a target="debug" href="{0}">{0}</a>'.format(url));
				return $resource(
					'api/suitability/stats',
					{},
					{
						query: {
							method:'GET',
							ignoreLoadingBar:false,
							params: changeParams,
							timeout: abort,
							isArray: false
						}
					}
				);
			}
		}
	]
);

'use strict';

/* Services */


// Service to get Species Info from CartoDB
angular.module('mol.services',[])
.factory(
	'molRegionOverlay',
	[ '$http','$q',
		function($http,$q) {
			return function(region) {
					if(region.region_id) {
						return $http({
								"withCredentials":false,
								"method":"POST",
								"url":"https://carto.mol.org/user/mol/api/v1/map/named/region-map",
								"data": {
								 "region_id": region.region_id,
							 }}).then(function(result, status, headers, config) {
											return {
													tile_url: ""+
														"https://carto.mol.org/mol/api/v1/map/{0}/{z}/{x}/{y}.png"
															.format(result.data.layergroupid),
													key: result.data.layergroupid,
													attr: '©2014 Map of Life',
													name: 'region',
													opacity: 1,
													type: 'region'
											};
										});
						} else {
							return $q.when(null)
						}


					}
				}

	])
  .factory(
    'molAuth', ['$http',function($http) {
      return function() {
        this.rollCheck = function() {
          return $http('https://auth.mol.org/api/me?role_check=MOL_MANAGER')
        }
      }
    }]
 )
.factory(
	'molSpeciesTooltips',
	[function() {
	 return {        /** start of tooltips **/

        /* refine */
        hab_asst_short : 'Select suitable habitat conditions for this species. ' +
        'Default is current expert opinion',
        hab_asst_long : 'Your selections for suitable habitats are combined with ' +
        'high-resolution remotely sensed information on local habitat conditions that is summarized ' +
        'at 1km spatial resolution. Elevation is based on the GTOPO30 product, originally in ca. 1km ' +
        'resolution. Tree Cover information is derived from an originally 30m resolution Landsat product ' +
        '(Hansen et al., Science 342: 850-853) and land cover from the MODIS MCD12Q1 product ' +
        '(Friedl et al. 2010; RSE 114:168-182), and both are aggregated over 2000/2001-2012. Expert ' +
        'opinion from the literature or IUCN Red List assessments is used to inform default selections ' +
        'for suitable habitat conditions.',

        rerun_button : 'Apply your changes',

        elevation : 'Mean elevation of 1km pixel',

        tree_cover : 'Average percent of 1km pixel with vegetation taller than 5m (Landsat, 30m)',

        land_cover : 'Dominant land cover type in at least a quarter of a 1 km ' +
        'pixel (MODIS 2001-2012, 500m)',

        woodlands : "Canopy cover of trees (>2m) is >60% ('Forest') or >30% ('Woody Savannas')",

        shrublands : "Woody vegetation <2m, including shrubby crops, " +
        "covering most ('Closed') or some ('Open') land",

        herbaceous : "Herbaceous vegetation with very few ('Grasslands') or some ('Savannas') trees",

        cultivated : "Temporary crops that cover most or part of the area ('Mosaics')",

        barren : 'Exposed soil, sand, rocks, snow; always < 10% vegetated',

        urban : 'Land covered by buildings and other man-made structures',

        water : "Mixture of water and vegetation ('Wetlands') or oceans, seas, " +
        "lakes, rivers ('Water bodies').",

        /* Geographic distribution */
        geo_dist : 'Range size characteristics and improvements in distribution estimate ' +
        'from currently selected habitat associations.',
        range_size : 'Area covered by total (suitable + unsuitable) or suitable range ' +
        'given habitat selection.',

        /* protect */
        pac_short : 'Provides the maximum number and area of reserves ' +
        'that overlap with the species’ potential total or suitable distribution, ' +
        'as selected in Habitat Associations, and progress toward a conservation ' +
        'target. <br /><b>Note</b>: Species typically occur in much fewer areas than these ' +
        'distributions suggest and observed coverage may be much smaller.',

        pac_long : 'An intersection with the World Protected Area Database (version x) ' +
        'is performed in 1km resolution. Only reserves designated at the national level are included (total xxx).',

        strict_parks : 'Parks with IUCN category Ia, Ib, II, III',

        all_parks : 'All parks  designated at the national level',

        all_parks_area : 'Total non-overlapping area covered by All parks',

        target_area : 'For species <1,000km2 equals range size, for those >250,000km2 equals ' +
        '10% of range size. For species with range sizes in between the target is a log-linear ' +
        'interpolation of these two area values.',

        target_realized : 'All parks area in relation to Target area. Note that the observed ' +
        'species ‘All parks area’ is likely much smaller than the estimated maximum value, so percent ' +
        'of target realize may be much lower.',

        min_reserve_size : 'Select the minimum park size.',

        learnmore_button : 'Learn how to use this tool.'
}


	}
])
.factory('molFormatSuitabilityPrefs',[function(){
	return function(prefs) {
		var new_prefs = angular.copy(prefs);
		if(new_prefs.habitats) {
			new_prefs.habitats_arr=new_prefs.habitats.map(
        function(v,i){
          return (v)?i:undefined}).filter(
            function(v){return (v !== undefined && v !== '')}).join(",")
			delete new_prefs.habitats;
		}
		return new_prefs;
	}
}])

.factory('molSpeciesList', [function() {
  return [{
    s: "Tockus_deckeni",
    c: {
      en: "Von der decken's hornbill",
      de: "Jackson-Toko",
      es: "Toco Keniata",
      fr: "Calao De Decken",
      zh: ""
    },
    i: "Tockus_deckeni.jpg"
  }, {
    s: "Grus_japonensis",
    c: {
      en: "Red-crowned crane",
      de: "Mandschurenkranich",
      es: "Grulla Manchú",
      fr: "Grue Du Japon",
      zh: "丹顶鹤"
    },
    i: "Grus_japonensis.jpg"
  }, {
    s: "Atelopus_spumarius",
    c: {
      en: "Pebas stubfoot toad",
      de: "",
      es: "",
      fr: "",
      zh: ""
    },
    i: "Atelopus_spumarius.jpg"
  }, {
    s: "Phyllomedusa_tomopterna",
    c: {
      en: "Tiger-striped leaf frog",
      de: "",
      es: "Rana Lemur Naranja",
      fr: "",
      zh: ""
    },
    i: "Phyllomedusa_tomopterna.jpg"
  }, {
    s: "Danaus_plexippus",
    c: {
      en: "Monarch",
      de: "Monarch",
      es: "Mariposa Monarca",
      fr: "Monarque",
      zh: "帝王斑蝶"
    },
    i: "Danaus_plexippus.jpg"
  }, {
    s: "Varanus_albigularis",
    c: {
      en: "White-throated monitor",
      de: "Kapwaran",
      es: "",
      fr: "",
      zh: ""
    },
    i: "Varanus_albigularis.jpg"
  }, {
    s: "Macaca_fascicularis",
    c: {
      en: "Crab eating macaque",
      de: "Javaneraffe",
      es: "Macaca Cangrejera",
      fr: "Macaque Crabier",
      zh: "食蟹獼猴"
    },
    i: "Macaca_fascicularis.jpg"
  }, {
    s: "Chelonoidis_carbonaria",
    c: {
      en: "Red-footed tortoise",
      de: "Köhlerschildkröte",
      es: "",
      fr: "Tortue Charbonnière",
      zh: ""
    },
    i: "Chelonoidis_carbonaria.jpg"
  }];
}]);

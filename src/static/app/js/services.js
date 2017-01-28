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
								"url":"https://mol.cartodb.com/api/v1/map/named/region-map",
								"data": {
								 "region_id": region.region_id,
							 }}).then(function(result, status, headers, config) {
											return {
													tile_url: ""+
														"https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
															.format(result.data.cdn_url.https,

																result.data.layergroupid),
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
.factory('molSpeciesList', [function() {
  return [{
    s: "Megalaima_corvina",
    c: "Brown-Throated Barbet",
    i: "BrownThroatedBarbet.png"
  }, {
    s: "Amblyornis_subalaris",
    c: "Streaked Bowerbird",
    i: "StreakedBowerbird.png",
  }, {
    s: "Coracina_ostenta",
    c: "White-Winged Cuckooshrike",
    i: "WhiteWingedCuckooshrike.jpg",
  }, {
    s: "Doliornis_sclateri",
    c: "Bay-vented Cotinga",
    i: "BayVentedCotinga.png",
  }, {
    s: "Calicalicus_rufocarpalis",
    c: "Red shouldered Vanga",
    i: "RedShoulderedVanga.png",
  }, {
    s: "Glaucidium_sanchezi",
    c: "Tamaulipas Pygmy Owl",
    i: "TamaulipasPygmyOwl.jpg",
  }, {
    s: "Urosphena_whiteheadi",
    c: "Bornean Stubtail",
    i: "BorneanStubtail.png",
  }, {
    s: "Tinamus_solitarius",
    c: "Solitary Tinamou",
    i: "SolitaryTinamou.png",
  }, {
    s: "Crocidura_fumosa",
    c: "Smoky white-toothed Shrew",
    i: "SmokywhitetoothedShrew.jpg",
  }, {
    s: "Taphozous_hildegardeae",
    c: "Hildegarde's tomb bat",
    i: "HildegardesTombBat.png",
  }, {
    s: "Antechinus_stuartii",
    c: "Brown Antechinus",
    i: "BrownAntechinus.png",
  }, {
    s: "Beamys_hindei",
    c: "Long-Tailed Pouched Rat",
    i: "LongTailedPouchedRat.jpg",
  }, {
    s: "Hybomys_planifrons",
    c: "Liberian Forest Hybomys",
    i: "LiberianForestHybomys.jpg",
  }, {
    s: "Reithrodontomys_sumichrasti",
    c: "Sumachrasti's Harvest Mouse",
    i: "SumachrastisHarvestMouse.png",
  }, {
    s: "Litoria_freycineti",
    c: "Freycinet's frog",
    i: "FreycinetsFrog.png",
  }]; 
}]);

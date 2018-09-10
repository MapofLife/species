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
                          index: 2,
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
}])
.factory('molHummingbirdsList', ['$http',function($http) {
  return function(sciname) {
    sciname = sciname.replace(" ", "_");
    // return $http.get('https://cdn.mol.org/data/hummingbirds_thresholds.json').then(function(result, status, headers, config) {
    //   var hl = undefined;
    //   if (result && result.data) {
    //     hl = result.data.filter(function(s) { return s.scientificname === sciname; });
    //     if (hl && hl.length > 0) {
    //       return hl[0];
    //     }
    //   }
    //   return undefined;
    // });

    var humblist = [{"scientificname":"Abeillia_abeillei","auc":0.858,"pauc":0.828,"th05":0.000000227,"th10":0.0000004869},{"scientificname":"Adelomyia_melanogenys","auc":0.926,"pauc":0.917,"th05":0.0000001327,"th10":0.0000002441},{"scientificname":"Aglaeactis_castelnaudii","auc":0.972,"pauc":0.96,"th05":0.0000034288,"th10":0.0000061282},{"scientificname":"Aglaeactis_cupripennis","auc":0.936,"pauc":0.929,"th05":0.0000003823,"th10":0.0000005432},{"scientificname":"Aglaeactis_pamela","auc":0.978,"pauc":0.978,"th05":0.0000062554,"th10":0.0000067845},{"scientificname":"Aglaiocercus_coelestis","auc":0.942,"pauc":0.936,"th05":0.0000001233,"th10":0.0000008834},{"scientificname":"Amazilia_amabilis","auc":0.851,"pauc":0.83,"th05":0.0000001919,"th10":0.0000003093},{"scientificname":"Amazilia_amazilia","auc":0.917,"pauc":0.914,"th05":0.0000005769,"th10":0.0000008161},{"scientificname":"Amazilia_beryllina","auc":0.878,"pauc":0.863,"th05":0.0000001189,"th10":0.0000002136},{"scientificname":"Amazilia_boucardi","auc":0.964,"pauc":0.95,"th05":0.0000184992,"th10":0.0000221654},{"scientificname":"Amazilia_brevirostris","auc":0.863,"pauc":0.832,"th05":0.0000001216,"th10":0.0000001764},{"scientificname":"Amazilia_candida","auc":0.762,"pauc":0.776,"th05":0.0000002468,"th10":0.0000003962},{"scientificname":"Amazilia_chionogaster","auc":0.944,"pauc":0.934,"th05":0.0000001354,"th10":0.0000002795},{"scientificname":"Amazilia_cyanifrons","auc":0.94,"pauc":0.897,"th05":0.0000008187,"th10":0.0000010347},{"scientificname":"Amazilia_cyanocephala","auc":0.864,"pauc":0.817,"th05":0.0000001168,"th10":0.0000002247},{"scientificname":"Amazilia_cyanura","auc":0.868,"pauc":0.826,"th05":0.0000013573,"th10":0.0000016097},{"scientificname":"Amazilia_decora","auc":0.855,"pauc":0.808,"th05":0.000001906,"th10":0.0000026074},{"scientificname":"Amazilia_edward","auc":0.899,"pauc":0.901,"th05":0.000001499,"th10":0.0000023624},{"scientificname":"Amazilia_fimbriata","auc":0.672,"pauc":0.593,"th05":0.0000000133,"th10":0.0000000199},{"scientificname":"Amazilia_franciae","auc":0.882,"pauc":0.828,"th05":0.0000000652,"th10":0.0000001665},{"scientificname":"Amazilia_lactea","auc":0.898,"pauc":0.879,"th05":0.0000000255,"th10":0.000000053},{"scientificname":"Amazilia_leucogaster","auc":0.779,"pauc":0.695,"th05":0.000000008,"th10":0.0000000174},{"scientificname":"Amazilia_luciae","auc":0.917,"pauc":0.873,"th05":0.000001211,"th10":0.0000017034},{"scientificname":"Amazilia_rosenbergi","auc":0.904,"pauc":0.858,"th05":0.0000012996,"th10":0.0000018338},{"scientificname":"Amazilia_rutila","auc":0.856,"pauc":0.836,"th05":0.0000002503,"th10":0.0000005532},{"scientificname":"Amazilia_saucerrottei","auc":0.868,"pauc":0.817,"th05":0.0000002191,"th10":0.0000003737},{"scientificname":"Amazilia_tobaci","auc":0.907,"pauc":0.873,"th05":0.0000002109,"th10":0.0000003753},{"scientificname":"Amazilia_tzacatl","auc":0.823,"pauc":0.799,"th05":0.0000001246,"th10":0.0000002111},{"scientificname":"Amazilia_versicolor","auc":0.791,"pauc":0.711,"th05":0.0000000075,"th10":0.0000000166},{"scientificname":"Amazilia_violiceps","auc":0.867,"pauc":0.853,"th05":0.0000000758,"th10":0.0000001796},{"scientificname":"Amazilia_viridigaster","auc":0.858,"pauc":0.798,"th05":0.0000002763,"th10":0.0000004253},{"scientificname":"Amazilia_yucatanensis","auc":0.87,"pauc":0.882,"th05":0.0000000609,"th10":0.0000001352},{"scientificname":"Androdon_aequatorialis","auc":0.883,"pauc":0.878,"th05":0.0000005626,"th10":0.0000008314},{"scientificname":"Anopetia_gounellei","auc":0.663,"pauc":0.679,"th05":0.0000000524,"th10":0.0000000607},{"scientificname":"Anthracothorax_dominicus","auc":0.733,"pauc":0.652,"th05":0.0000008284,"th10":0.0000013871},{"scientificname":"Anthracothorax_mango","auc":0.931,"pauc":0.916,"th05":0.0000078496,"th10":0.0000126969},{"scientificname":"Anthracothorax_nigricollis","auc":0.72,"pauc":0.697,"th05":0.0000000003,"th10":0.0000000004},{"scientificname":"Anthracothorax_prevostii","auc":0.9,"pauc":0.887,"th05":0.0000000612,"th10":0.0000001377},{"scientificname":"Anthracothorax_veraguensis","auc":0.899,"pauc":0.896,"th05":0.0000015587,"th10":0.000002435},{"scientificname":"Anthracothorax_viridigula","auc":0.91,"pauc":0.87,"th05":0.0000002791,"th10":0.0000003631},{"scientificname":"Anthracothorax_viridis","auc":0.889,"pauc":0.894,"th05":0.0000322239,"th10":0.0000358564},{"scientificname":"Aphantochroa_cirrochloris","auc":0.851,"pauc":0.807,"th05":0.0000001077,"th10":0.0000002346},{"scientificname":"Archilochus_alexandri","auc":0.691,"pauc":0.673,"th05":0.0000000226,"th10":0.0000000366},{"scientificname":"Archilochus_colubris","auc":0.746,"pauc":0.718,"th05":0.0000000214,"th10":0.0000000293},{"scientificname":"Atthis_ellioti","auc":0.911,"pauc":0.875,"th05":0.0000004166,"th10":0.0000008778},{"scientificname":"Atthis_heloisa","auc":0.877,"pauc":0.847,"th05":0.0000000762,"th10":0.0000001441},{"scientificname":"Augastes_lumachella","auc":0.833,"pauc":0.976,"th05":0.00000582,"th10":0.0000059277},{"scientificname":"Augastes_scutatus","auc":0.882,"pauc":0.829,"th05":0.0000016912,"th10":0.0000017982},{"scientificname":"Avocettula_recurvirostris","auc":0.596,"pauc":0.746,"th05":0.000000111,"th10":0.000000114},{"scientificname":"Boissonneaua_flavescens","auc":0.909,"pauc":0.898,"th05":0.0000003687,"th10":0.0000007242},{"scientificname":"Boissonneaua_jardini","auc":0.905,"pauc":0.892,"th05":0.0000007352,"th10":0.0000011331},{"scientificname":"Boissonneaua_matthewsii","auc":0.931,"pauc":0.921,"th05":0.0000003752,"th10":0.0000012018},{"scientificname":"Calliphlox_bryantae","auc":0.933,"pauc":0.912,"th05":0.0000079449,"th10":0.0000106041},{"scientificname":"Calliphlox_evelynae","auc":0.963,"pauc":0.967,"th05":0.0000128432,"th10":0.0000157691},{"scientificname":"Calliphlox_mitchellii","auc":0.932,"pauc":0.908,"th05":0.0000002726,"th10":0.0000006463},{"scientificname":"Calothorax_lucifer","auc":0.79,"pauc":0.776,"th05":0.0000001031,"th10":0.0000002735},{"scientificname":"Calothorax_pulcher","auc":0.856,"pauc":0.816,"th05":0.0000003903,"th10":0.0000004658},{"scientificname":"Calypte_anna","auc":0.923,"pauc":0.912,"th05":0.0000002011,"th10":0.0000003067},{"scientificname":"Calypte_costae","auc":0.885,"pauc":0.88,"th05":0.0000000126,"th10":0.0000000363},{"scientificname":"Campylopterus_curvipennis","auc":0.87,"pauc":0.86,"th05":0.0000001463,"th10":0.0000003285},{"scientificname":"Campylopterus_excellens","auc":0.946,"pauc":0.92,"th05":0.0000008215,"th10":0.0000012784},{"scientificname":"Campylopterus_falcatus","auc":0.86,"pauc":0.782,"th05":0.0000000983,"th10":0.0000003113},{"scientificname":"Campylopterus_hemileucurus","auc":0.902,"pauc":0.861,"th05":0.0000006186,"th10":0.000000917},{"scientificname":"Campylopterus_largipennis","auc":0.685,"pauc":0.638,"th05":0.0000000181,"th10":0.00000003},{"scientificname":"Campylopterus_rufus","auc":0.914,"pauc":0.87,"th05":0.0000003507,"th10":0.0000008618},{"scientificname":"Campylopterus_villaviscensio","auc":0.941,"pauc":0.927,"th05":0.0000010955,"th10":0.0000014651},{"scientificname":"Chaetocercus_bombus","auc":0.854,"pauc":0.832,"th05":0.0000006643,"th10":0.0000008867},{"scientificname":"Chaetocercus_heliodor","auc":0.903,"pauc":0.884,"th05":0.0000001483,"th10":0.0000004365},{"scientificname":"Chaetocercus_jourdanii","auc":0.934,"pauc":0.882,"th05":0.0000003354,"th10":0.0000005321},{"scientificname":"Chaetocercus_mulsant","auc":0.924,"pauc":0.909,"th05":0.000000081,"th10":0.0000001967},{"scientificname":"Chalcostigma_herrani","auc":0.952,"pauc":0.943,"th05":0.0000008725,"th10":0.0000014473},{"scientificname":"Chalcostigma_heteropogon","auc":0.973,"pauc":0.96,"th05":0.0000032714,"th10":0.0000057884},{"scientificname":"Chalcostigma_olivaceum","auc":0.895,"pauc":0.832,"th05":0.0000006463,"th10":0.0000008684},{"scientificname":"Chalcostigma_ruficeps","auc":0.944,"pauc":0.925,"th05":0.000000788,"th10":0.0000010156},{"scientificname":"Chalcostigma_stanleyi","auc":0.951,"pauc":0.934,"th05":0.0000006609,"th10":0.0000010019},{"scientificname":"Chalybura_buffonii","auc":0.855,"pauc":0.836,"th05":0.00000004,"th10":0.0000000965},{"scientificname":"Chalybura_urochrysia","auc":0.843,"pauc":0.829,"th05":0.000000349,"th10":0.0000005288},{"scientificname":"Chlorestes_notata","auc":0.712,"pauc":0.686,"th05":0.0000000121,"th10":0.0000000168},{"scientificname":"Chlorostilbon_alice","auc":0.97,"pauc":0.948,"th05":0.0000045528,"th10":0.0000056454},{"scientificname":"Chlorostilbon_assimilis","auc":0.905,"pauc":0.886,"th05":0.0000011564,"th10":0.0000018116},{"scientificname":"Chlorostilbon_auriceps","auc":0.881,"pauc":0.875,"th05":0.0000005168,"th10":0.0000009767},{"scientificname":"Chlorostilbon_canivetii","auc":0.785,"pauc":0.757,"th05":0.0000001829,"th10":0.000000252},{"scientificname":"Chlorostilbon_gibsoni","auc":0.816,"pauc":0.795,"th05":0.000000143,"th10":0.0000001877},{"scientificname":"Chlorostilbon_lucidus","auc":0.72,"pauc":0.695,"th05":0.0000000327,"th10":0.0000000414},{"scientificname":"Chlorostilbon_maugaeus","auc":0.891,"pauc":0.882,"th05":0.0000369899,"th10":0.000043354},{"scientificname":"Chlorostilbon_melanorhynchus","auc":0.91,"pauc":0.882,"th05":0.0000002348,"th10":0.0000006674},{"scientificname":"Chlorostilbon_mellisugus","auc":0.548,"pauc":0.607,"th05":0.0000000535,"th10":0.0000000574},{"scientificname":"Chlorostilbon_poortmani","auc":0.943,"pauc":0.912,"th05":0.0000008975,"th10":0.0000013568},{"scientificname":"Chlorostilbon_ricordii","auc":0.8,"pauc":0.817,"th05":0.0000007099,"th10":0.0000009854},{"scientificname":"Chlorostilbon_russatus","auc":0.946,"pauc":0.926,"th05":0.0000068754,"th10":0.0000090673},{"scientificname":"Chlorostilbon_swainsonii","auc":0.671,"pauc":0.676,"th05":0.0000015352,"th10":0.0000021085},{"scientificname":"Chrysuronia_oenone","auc":0.858,"pauc":0.827,"th05":0.0000000715,"th10":0.0000001016},{"scientificname":"Clytolaema_rubricauda","auc":0.918,"pauc":0.897,"th05":0.0000002118,"th10":0.0000003712},{"scientificname":"Coeligena_bonapartei","auc":0.94,"pauc":0.904,"th05":0.0000018378,"th10":0.0000023804},{"scientificname":"Coeligena_coeligena","auc":0.925,"pauc":0.922,"th05":0.0000000848,"th10":0.0000002406},{"scientificname":"Coeligena_helianthea","auc":0.95,"pauc":0.927,"th05":0.0000008929,"th10":0.0000011964},{"scientificname":"Coeligena_iris","auc":0.936,"pauc":0.921,"th05":0.0000006813,"th10":0.0000016285},{"scientificname":"Coeligena_lutetiae","auc":0.924,"pauc":0.892,"th05":0.0000005157,"th10":0.0000008586},{"scientificname":"Coeligena_prunellei","auc":0.98,"pauc":0.977,"th05":0.0000096755,"th10":0.0000110195},{"scientificname":"Coeligena_torquata","auc":0.92,"pauc":0.918,"th05":0.0000001119,"th10":0.0000002524},{"scientificname":"Coeligena_violifer","auc":0.95,"pauc":0.939,"th05":0.0000004568,"th10":0.0000008623},{"scientificname":"Coeligena_wilsoni","auc":0.942,"pauc":0.922,"th05":0.0000006409,"th10":0.0000011912},{"scientificname":"Colibri_coruscans","auc":0.927,"pauc":0.91,"th05":0.0000000673,"th10":0.0000001313},{"scientificname":"Colibri_delphinae","auc":0.898,"pauc":0.853,"th05":0.0000000498,"th10":0.0000000914},{"scientificname":"Colibri_serrirostris","auc":0.86,"pauc":0.8,"th05":0.0000000095,"th10":0.0000000318},{"scientificname":"Colibri_thalassinus","auc":0.888,"pauc":0.812,"th05":0.0000000128,"th10":0.0000000399},{"scientificname":"Cynanthus_latirostris","auc":0.875,"pauc":0.852,"th05":0.0000000405,"th10":0.0000000649},{"scientificname":"Cynanthus_sordidus","auc":0.896,"pauc":0.88,"th05":0.0000003763,"th10":0.0000010296},{"scientificname":"Damophila_julie","auc":0.875,"pauc":0.859,"th05":0.0000001343,"th10":0.0000002829},{"scientificname":"Discosura_conversii","auc":0.875,"pauc":0.848,"th05":0.0000002935,"th10":0.0000004755},{"scientificname":"Discosura_langsdorffi","auc":0.701,"pauc":0.708,"th05":0.0000000536,"th10":0.0000000742},{"scientificname":"Discosura_longicaudus","auc":0.769,"pauc":0.769,"th05":0.0000000773,"th10":0.0000000939},{"scientificname":"Discosura_popelairii","auc":0.889,"pauc":0.833,"th05":0.0000003837,"th10":0.0000005331},{"scientificname":"Doricha_eliza","auc":0.964,"pauc":0.952,"th05":0.0000018329,"th10":0.0000027213},{"scientificname":"Doricha_enicura","auc":0.891,"pauc":0.851,"th05":0.0000004674,"th10":0.0000005751},{"scientificname":"Doryfera_johannae","auc":0.932,"pauc":0.919,"th05":0.0000001817,"th10":0.0000003316},{"scientificname":"Doryfera_ludovicae","auc":0.911,"pauc":0.893,"th05":0.0000002341,"th10":0.0000003501},{"scientificname":"Elvira_chionura","auc":0.938,"pauc":0.921,"th05":0.000002388,"th10":0.0000029689},{"scientificname":"Elvira_cupreiceps","auc":0.933,"pauc":0.918,"th05":0.0000006256,"th10":0.0000010576},{"scientificname":"Ensifera_ensifera","auc":0.912,"pauc":0.901,"th05":0.000000144,"th10":0.000000281},{"scientificname":"Eriocnemis_cupreoventris","auc":0.961,"pauc":0.955,"th05":0.0000018638,"th10":0.0000025884},{"scientificname":"Eriocnemis_derbyi","auc":0.903,"pauc":0.852,"th05":0.0000004545,"th10":0.0000007649},{"scientificname":"Eriocnemis_glaucopoides","auc":0.965,"pauc":0.963,"th05":0.0000017963,"th10":0.000002215},{"scientificname":"Eriocnemis_luciani","auc":0.874,"pauc":0.833,"th05":0.0000000871,"th10":0.000000274},{"scientificname":"Eriocnemis_mosquera","auc":0.935,"pauc":0.904,"th05":0.0000003663,"th10":0.0000004663},{"scientificname":"Eriocnemis_vestita","auc":0.946,"pauc":0.935,"th05":0.0000000756,"th10":0.0000002161},{"scientificname":"Eugenes_fulgens","auc":0.862,"pauc":0.801,"th05":0.0000000157,"th10":0.0000000342},{"scientificname":"Eulampis_holosericeus","auc":0.963,"pauc":0.965,"th05":0.0000167996,"th10":0.0000207101},{"scientificname":"Eulampis_jugularis","auc":0.974,"pauc":0.973,"th05":0.0000259214,"th10":0.0000323085},{"scientificname":"Eupetomena_macroura","auc":0.816,"pauc":0.713,"th05":0.0000000154,"th10":0.0000000285},{"scientificname":"Eupherusa_cyanophrys","auc":0.934,"pauc":0.919,"th05":0.0000065885,"th10":0.0000077998},{"scientificname":"Eupherusa_eximia","auc":0.895,"pauc":0.861,"th05":0.000000262,"th10":0.000000589},{"scientificname":"Eupherusa_nigriventris","auc":0.911,"pauc":0.881,"th05":0.0000006612,"th10":0.0000009479},{"scientificname":"Eupherusa_poliocerca","auc":0.874,"pauc":0.872,"th05":0.0000029969,"th10":0.0000034359},{"scientificname":"Eutoxeres_aquila","auc":0.878,"pauc":0.859,"th05":0.0000002775,"th10":0.000000376},{"scientificname":"Eutoxeres_condamini","auc":0.875,"pauc":0.867,"th05":0.0000002106,"th10":0.0000003347},{"scientificname":"Florisuga_fusca","auc":0.889,"pauc":0.836,"th05":0.0000001634,"th10":0.0000002468},{"scientificname":"Florisuga_mellivora","auc":0.756,"pauc":0.658,"th05":0.000000023,"th10":0.0000000307},{"scientificname":"Glaucis_aeneus","auc":0.918,"pauc":0.891,"th05":0.000000425,"th10":0.0000007509},{"scientificname":"Glaucis_hirsutus","auc":0.778,"pauc":0.721,"th05":0.0000000223,"th10":0.0000000344},{"scientificname":"Haplophaedia_assimilis","auc":0.968,"pauc":0.961,"th05":0.0000047193,"th10":0.0000049225},{"scientificname":"Haplophaedia_aureliae","auc":0.921,"pauc":0.904,"th05":0.0000000238,"th10":0.0000000689},{"scientificname":"Haplophaedia_lugens","auc":0.908,"pauc":0.854,"th05":0.0000028205,"th10":0.0000049267},{"scientificname":"Heliactin_bilophus","auc":0.667,"pauc":0.656,"th05":0.0000000201,"th10":0.0000000396},{"scientificname":"Heliangelus_amethysticollis","auc":0.926,"pauc":0.907,"th05":0.0000002639,"th10":0.0000005584},{"scientificname":"Heliangelus_exortis","auc":0.934,"pauc":0.917,"th05":0.0000000639,"th10":0.0000001863},{"scientificname":"Heliangelus_mavors","auc":0.917,"pauc":0.841,"th05":0.0000006669,"th10":0.0000012178},{"scientificname":"Heliangelus_micraster","auc":0.974,"pauc":0.948,"th05":0.0000070908,"th10":0.0000094368},{"scientificname":"Heliangelus_strophianus","auc":0.958,"pauc":0.91,"th05":0.0000067813,"th10":0.0000101562},{"scientificname":"Heliangelus_viola","auc":0.952,"pauc":0.94,"th05":0.0000018061,"th10":0.0000025779},{"scientificname":"Heliodoxa_aurescens","auc":0.734,"pauc":0.661,"th05":0.0000000391,"th10":0.0000000537},{"scientificname":"Heliodoxa_imperatrix","auc":0.954,"pauc":0.934,"th05":0.0000008363,"th10":0.0000014903},{"scientificname":"Heliodoxa_jacula","auc":0.931,"pauc":0.893,"th05":0.0000000983,"th10":0.000000359},{"scientificname":"Heliodoxa_rubinoides","auc":0.918,"pauc":0.904,"th05":0.0000002563,"th10":0.0000003795},{"scientificname":"Heliodoxa_schreibersii","auc":0.878,"pauc":0.835,"th05":0.0000001092,"th10":0.0000002046},{"scientificname":"Heliomaster_constantii","auc":0.866,"pauc":0.844,"th05":0.0000001198,"th10":0.0000002489},{"scientificname":"Heliomaster_furcifer","auc":0.722,"pauc":0.719,"th05":0.0000000057,"th10":0.0000000101},{"scientificname":"Heliomaster_longirostris","auc":0.738,"pauc":0.611,"th05":0.0000000131,"th10":0.0000000198},{"scientificname":"Heliomaster_squamosus","auc":0.752,"pauc":0.706,"th05":0.0000000543,"th10":0.0000000738},{"scientificname":"Heliothryx_auritus","auc":0.688,"pauc":0.655,"th05":0.0000000171,"th10":0.0000000281},{"scientificname":"Heliothryx_barroti","auc":0.86,"pauc":0.831,"th05":0.0000001106,"th10":0.0000001665},{"scientificname":"Hylocharis_chrysura","auc":0.713,"pauc":0.692,"th05":0.000000008,"th10":0.000000019},{"scientificname":"Hylocharis_cyanus","auc":0.732,"pauc":0.65,"th05":0.0000000105,"th10":0.0000000209},{"scientificname":"Hylocharis_eliciae","auc":0.846,"pauc":0.76,"th05":0.0000001569,"th10":0.0000002382},{"scientificname":"Hylocharis_grayi","auc":0.914,"pauc":0.892,"th05":0.0000012044,"th10":0.0000018072},{"scientificname":"Hylocharis_leucotis","auc":0.917,"pauc":0.89,"th05":0.0000000233,"th10":0.0000000519},{"scientificname":"Hylocharis_sapphirina","auc":0.706,"pauc":0.637,"th05":0.0000000053,"th10":0.0000000076},{"scientificname":"Hylocharis_xantusii","auc":0.941,"pauc":0.903,"th05":0.0000062971,"th10":0.0000076522},{"scientificname":"Klais_guimeti","auc":0.923,"pauc":0.895,"th05":0.0000000504,"th10":0.0000001492},{"scientificname":"Lafresnaya_lafresnayi","auc":0.919,"pauc":0.911,"th05":0.0000001988,"th10":0.0000003566},{"scientificname":"Lampornis_amethystinus","auc":0.903,"pauc":0.867,"th05":0.0000000018,"th10":0.0000000062},{"scientificname":"Lampornis_calolaemus","auc":0.904,"pauc":0.863,"th05":0.0000003924,"th10":0.0000007308},{"scientificname":"Lampornis_castaneoventris","auc":0.876,"pauc":0.813,"th05":0.0000000001,"th10":0.0000000038},{"scientificname":"Lampornis_clemenciae","auc":0.892,"pauc":0.835,"th05":0.0000001186,"th10":0.0000003142},{"scientificname":"Lampornis_hemileucus","auc":0.898,"pauc":0.877,"th05":0.0000029443,"th10":0.000004604},{"scientificname":"Lampornis_sybillae","auc":0.964,"pauc":0.954,"th05":0.0000024724,"th10":0.0000036239},{"scientificname":"Lampornis_viridipallens","auc":0.908,"pauc":0.871,"th05":0.0000012424,"th10":0.0000018626},{"scientificname":"Lamprolaima_rhami","auc":0.876,"pauc":0.814,"th05":0.0000000002,"th10":0.0000000004},{"scientificname":"Lepidopyga_coeruleogularis","auc":0.936,"pauc":0.921,"th05":0.0000012324,"th10":0.0000017931},{"scientificname":"Lepidopyga_goudoti","auc":0.851,"pauc":0.829,"th05":0.000000173,"th10":0.0000004384},{"scientificname":"Lesbia_nuna","auc":0.928,"pauc":0.895,"th05":0.0000001457,"th10":0.000000336},{"scientificname":"Lesbia_victoriae","auc":0.942,"pauc":0.932,"th05":0.0000001779,"th10":0.0000003757},{"scientificname":"Leucippus_baeri","auc":0.933,"pauc":0.915,"th05":0.0000013808,"th10":0.0000019257},{"scientificname":"Leucippus_chlorocercus","auc":0.888,"pauc":0.829,"th05":0.0000001542,"th10":0.0000003226},{"scientificname":"Leucippus_fallax","auc":0.849,"pauc":0.853,"th05":0.0000001635,"th10":0.0000002801},{"scientificname":"Leucippus_taczanowskii","auc":0.923,"pauc":0.885,"th05":0.0000010278,"th10":0.0000015122},{"scientificname":"Leucochloris_albicollis","auc":0.848,"pauc":0.79,"th05":0.0000000316,"th10":0.0000000584},{"scientificname":"Lophornis_adorabilis","auc":0.849,"pauc":0.801,"th05":0.0000016957,"th10":0.000002439},{"scientificname":"Lophornis_chalybeus","auc":0.846,"pauc":0.766,"th05":0.0000000247,"th10":0.0000000407},{"scientificname":"Lophornis_delattrei","auc":0.885,"pauc":0.847,"th05":0.0000002255,"th10":0.0000002947},{"scientificname":"Lophornis_gouldii","auc":0.695,"pauc":0.74,"th05":0.0000003303,"th10":0.0000003529},{"scientificname":"Lophornis_helenae","auc":0.799,"pauc":0.755,"th05":0.0000000803,"th10":0.0000003451},{"scientificname":"Lophornis_magnificus","auc":0.816,"pauc":0.714,"th05":0.000000035,"th10":0.0000000649},{"scientificname":"Lophornis_ornatus","auc":0.835,"pauc":0.761,"th05":0.0000000888,"th10":0.0000001536},{"scientificname":"Lophornis_stictolophus","auc":0.853,"pauc":0.825,"th05":0.0000002238,"th10":0.0000002821},{"scientificname":"Mellisuga_helenae","auc":0.862,"pauc":0.861,"th05":0.0000029636,"th10":0.000003955},{"scientificname":"Mellisuga_minima","auc":0.762,"pauc":0.714,"th05":0.0000014636,"th10":0.0000021464},{"scientificname":"Metallura_aeneocauda","auc":0.96,"pauc":0.926,"th05":0.0000020184,"th10":0.0000028552},{"scientificname":"Metallura_phoebe","auc":0.912,"pauc":0.906,"th05":0.00000058,"th10":0.0000007914},{"scientificname":"Metallura_theresiae","auc":0.935,"pauc":0.927,"th05":0.000003215,"th10":0.0000039071},{"scientificname":"Metallura_tyrianthina","auc":0.93,"pauc":0.921,"th05":0.0000001346,"th10":0.0000002236},{"scientificname":"Metallura_williami","auc":0.919,"pauc":0.9,"th05":0.0000000423,"th10":0.0000001469},{"scientificname":"Microchera_albocoronata","auc":0.817,"pauc":0.76,"th05":0.0000003127,"th10":0.0000004413},{"scientificname":"Microstilbon_burmeisteri","auc":0.919,"pauc":0.874,"th05":0.0000001896,"th10":0.0000003383},{"scientificname":"Myrmia_micrura","auc":0.886,"pauc":0.879,"th05":0.0000001451,"th10":0.0000001727},{"scientificname":"Myrtis_fanny","auc":0.826,"pauc":0.785,"th05":0.0000000782,"th10":0.0000001442},{"scientificname":"Ocreatus_underwoodii","auc":0.935,"pauc":0.923,"th05":0.0000001667,"th10":0.0000003298},{"scientificname":"Opisthoprora_euryptera","auc":0.914,"pauc":0.85,"th05":0.0000008011,"th10":0.0000011343},{"scientificname":"Oreonympha_nobilis","auc":0.916,"pauc":0.869,"th05":0.0000052473,"th10":0.0000069578},{"scientificname":"Oreotrochilus_adela","auc":0.873,"pauc":0.878,"th05":0.00000144,"th10":0.0000017283},{"scientificname":"Oreotrochilus_chimborazo","auc":0.967,"pauc":0.954,"th05":0.0000060395,"th10":0.0000072583},{"scientificname":"Oreotrochilus_estella","auc":0.869,"pauc":0.845,"th05":0.0000001976,"th10":0.0000002791},{"scientificname":"Oreotrochilus_leucopleurus","auc":0.854,"pauc":0.807,"th05":0.000000025,"th10":0.0000000418},{"scientificname":"Oreotrochilus_melanogaster","auc":0.906,"pauc":0.855,"th05":0.0000015651,"th10":0.0000017386},{"scientificname":"Orthorhyncus_cristatus","auc":0.966,"pauc":0.969,"th05":0.0000213959,"th10":0.0000276649},{"scientificname":"Oxypogon_guerinii","auc":0.924,"pauc":0.886,"th05":0.0000000113,"th10":0.0000000204},{"scientificname":"Panterpe_insignis","auc":0.943,"pauc":0.924,"th05":0.0000003423,"th10":0.0000006847},{"scientificname":"Patagona_gigas","auc":0.869,"pauc":0.865,"th05":0.0000001174,"th10":0.0000001713},{"scientificname":"Phaeochroa_cuvierii","auc":0.845,"pauc":0.824,"th05":0.0000001583,"th10":0.000000313},{"scientificname":"Phaethornis_anthophilus","auc":0.801,"pauc":0.797,"th05":0.0000001407,"th10":0.000000202},{"scientificname":"Phaethornis_augusti","auc":0.854,"pauc":0.804,"th05":0.000000127,"th10":0.0000001778},{"scientificname":"Phaethornis_bourcieri","auc":0.75,"pauc":0.691,"th05":0.0000000135,"th10":0.000000035},{"scientificname":"Phaethornis_eurynome","auc":0.888,"pauc":0.864,"th05":0.0000003252,"th10":0.0000004739},{"scientificname":"Phaethornis_griseogularis","auc":0.878,"pauc":0.83,"th05":0.0000000596,"th10":0.00000013},{"scientificname":"Phaethornis_guy","auc":0.935,"pauc":0.902,"th05":0.000000106,"th10":0.0000001574},{"scientificname":"Phaethornis_hispidus","auc":0.771,"pauc":0.724,"th05":0.0000000218,"th10":0.0000000347},{"scientificname":"Phaethornis_idaliae","auc":0.907,"pauc":0.881,"th05":0.0000026392,"th10":0.0000027083},{"scientificname":"Phaethornis_koepckeae","auc":0.948,"pauc":0.944,"th05":0.0000016414,"th10":0.0000021921},{"scientificname":"Phaethornis_longirostris","auc":0.865,"pauc":0.829,"th05":0.0000001337,"th10":0.0000002216},{"scientificname":"Phaethornis_longuemareus","auc":0.621,"pauc":0.589,"th05":0.0000000036,"th10":0.0000000058},{"scientificname":"Phaethornis_malaris","auc":0.784,"pauc":0.749,"th05":0.0000000272,"th10":0.0000000401},{"scientificname":"Phaethornis_nattereri","auc":0.736,"pauc":0.676,"th05":0.0000000921,"th10":0.0000001619},{"scientificname":"Phaethornis_philippii","auc":0.752,"pauc":0.709,"th05":0.0000000214,"th10":0.0000000397},{"scientificname":"Phaethornis_pretrei","auc":0.76,"pauc":0.664,"th05":0.0000000079,"th10":0.0000000277},{"scientificname":"Phaethornis_ruber","auc":0.648,"pauc":0.624,"th05":0.0000000121,"th10":0.0000000267},{"scientificname":"Phaethornis_rupurumii","auc":0.775,"pauc":0.757,"th05":0.0000001068,"th10":0.0000001541},{"scientificname":"Phaethornis_squalidus","auc":0.922,"pauc":0.898,"th05":0.0000003257,"th10":0.0000007134},{"scientificname":"Phaethornis_striigularis","auc":0.752,"pauc":0.7,"th05":0.0000000704,"th10":0.0000001112},{"scientificname":"Phaethornis_stuarti","auc":0.923,"pauc":0.923,"th05":0.0000009766,"th10":0.0000011347},{"scientificname":"Phaethornis_subochraceus","auc":0.848,"pauc":0.847,"th05":0.0000002722,"th10":0.0000004009},{"scientificname":"Phaethornis_superciliosus","auc":0.634,"pauc":0.588,"th05":0.0000000155,"th10":0.0000000244},{"scientificname":"Phaethornis_syrmatophorus","auc":0.914,"pauc":0.893,"th05":0.0000000475,"th10":0.0000006961},{"scientificname":"Phaethornis_yaruqui","auc":0.881,"pauc":0.89,"th05":0.000000235,"th10":0.0000005116},{"scientificname":"Phlogophilus_hemileucurus","auc":0.936,"pauc":0.916,"th05":0.0000013876,"th10":0.0000018811},{"scientificname":"Polyonymus_caroli","auc":0.897,"pauc":0.837,"th05":0.0000008087,"th10":0.0000012373},{"scientificname":"Polytmus_guainumbi","auc":0.673,"pauc":0.68,"th05":0.0000000085,"th10":0.0000000137},{"scientificname":"Polytmus_theresiae","auc":0.664,"pauc":0.65,"th05":0.0000000181,"th10":0.0000000292},{"scientificname":"Pterophanes_cyanopterus","auc":0.935,"pauc":0.923,"th05":0.0000001578,"th10":0.0000003013},{"scientificname":"Ramphodon_naevius","auc":0.939,"pauc":0.937,"th05":0.0000011515,"th10":0.0000014215},{"scientificname":"Ramphomicron_microrhynchum","auc":0.934,"pauc":0.919,"th05":0.000000196,"th10":0.0000002972},{"scientificname":"Rhodopis_vesper","auc":0.895,"pauc":0.855,"th05":0.0000000549,"th10":0.0000001342},{"scientificname":"Sappho_sparganura","auc":0.902,"pauc":0.894,"th05":0.0000001678,"th10":0.0000002499},{"scientificname":"Schistes_geoffroyi","auc":0.898,"pauc":0.86,"th05":0.0000000567,"th10":0.000000129},{"scientificname":"Selasphorus_flammula","auc":0.913,"pauc":0.84,"th05":0.0000000016,"th10":0.0000000031},{"scientificname":"Selasphorus_rufus","auc":0.725,"pauc":0.654,"th05":0.0000000162,"th10":0.0000000281},{"scientificname":"Selasphorus_sasin","auc":0.927,"pauc":0.897,"th05":0.0000000904,"th10":0.0000001672},{"scientificname":"Selasphorus_scintilla","auc":0.929,"pauc":0.911,"th05":0.0000023514,"th10":0.0000052643},{"scientificname":"Sephanoides_sephaniodes","auc":0.898,"pauc":0.876,"th05":0.000000266,"th10":0.000000318},{"scientificname":"Stellula_calliope","auc":0.722,"pauc":0.68,"th05":0.0000000209,"th10":0.0000000353},{"scientificname":"Stephanoxis_lalandi","auc":0.888,"pauc":0.822,"th05":0.0000000933,"th10":0.0000001429},{"scientificname":"Sternoclyta_cyanopectus","auc":0.941,"pauc":0.939,"th05":0.0000022779,"th10":0.000003332},{"scientificname":"Taphrospilus_hypostictus","auc":0.902,"pauc":0.867,"th05":0.0000001803,"th10":0.0000003902},{"scientificname":"Thalurania_colombica","auc":0.835,"pauc":0.8,"th05":0.0000001203,"th10":0.0000002622},{"scientificname":"Thalurania_furcata","auc":0.603,"pauc":0.592,"th05":0.0000000176,"th10":0.0000000246},{"scientificname":"Thalurania_glaucopis","auc":0.897,"pauc":0.866,"th05":0.0000001428,"th10":0.0000001942},{"scientificname":"Thalurania_ridgwayi","auc":0.955,"pauc":0.944,"th05":0.0000037335,"th10":0.0000051204},{"scientificname":"Thaumastura_cora","auc":0.926,"pauc":0.905,"th05":0.0000005052,"th10":0.000000609},{"scientificname":"Threnetes_leucurus","auc":0.783,"pauc":0.683,"th05":0.0000000255,"th10":0.0000000394},{"scientificname":"Threnetes_ruckeri","auc":0.885,"pauc":0.87,"th05":0.0000002793,"th10":0.000000437},{"scientificname":"Tilmatura_dupontii","auc":0.846,"pauc":0.8,"th05":0.0000003175,"th10":0.0000005623},{"scientificname":"Topaza_pella","auc":0.751,"pauc":0.668,"th05":0.0000000125,"th10":0.0000000355},{"scientificname":"Topaza_pyra","auc":0.684,"pauc":0.591,"th05":0.0000000116,"th10":0.0000000158},{"scientificname":"Trochilus_polytmus","auc":0.928,"pauc":0.92,"th05":0.000007598,"th10":0.0000117898},{"scientificname":"Urochroa_bougueri","auc":0.937,"pauc":0.924,"th05":0.0000004298,"th10":0.0000006214},{"scientificname":"Urosticte_benjamini","auc":0.86,"pauc":0.799,"th05":0.0000007502,"th10":0.0000009373},{"scientificname":"Urosticte_ruficrissa","auc":0.938,"pauc":0.906,"th05":0.0000022208,"th10":0.000003549}];
    var hl = humblist.filter(function(s) { return s.scientificname === sciname; });
    if (hl && hl.length > 0) {
      return hl[0];
    }
    return undefined
  }
}]);

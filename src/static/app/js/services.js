'use strict';

/* Services */


// Service to get Species Info from CartoDB
var molServices = angular.module('mol.services', []);
molServices.factory(
	'molApiVersion', [
		function() {
	     return "0.x"
 	  }
  ]
);

molServices.factory(
	'molUiMap',
	[ 'uiGmapGoogleMapApi','$http','$q','$rootScope',
		function(uiGmapGoogleMapApi,$http,$q,$rootScope) {


				var molUiMap = function() {
						var self = this;
						this.tiles = {};
						this.map = {};
						this.bounds = {};
						this.center = {latitude:0,longitude:0};
						this.zoom = 0;

						this.options = {
										//fullscreenControl: true,
										//fullscreenControlOptions: {position: 3},
										streetViewControl: false,
										panControl: false,
										maxZoom: 10,
										minZoom: 3,
										styles: styles,
										mapTypeControlOptions: {position: 5}
						};
						this.utfGrid = {};
						this.infowindow = {};
						this.overlayMapTypes=  [];
						this.events = {
								click : interactivity,
								mousemove: interactivity
						};

						this.clearOverlays = function() {
				        self.utfGrid={};
				        self.overlayMapTypes = [];
						}

						this.setOverlay = function(overlay,index) {
							var self = this;
						  this.overlayMapTypes[index]= {
								show:true,
							  tiles : {},
								getTile : getTile,
								tileSize: new google.maps.Size(256, 256),
								name: overlay.type,
								overlay: overlay,
								index: Math.round(Math.random()*1000),
								refresh: true,
								opacity: overlay.opacity,
								maxZoom: 10
							}

							function getTileUrl(c,z,p) {
									 var u = null,
										 x = c.x, y = c.y;
									 if (p && c.y < Math.pow(2,z) && c.y >= 0) {
										 u = p;
										 while(x < 0) {x += Math.pow(2,z);}
										 while(x>= Math.pow(2,z)) {x-=Math.pow(2,z);}
										 u = p.replace('{z}',z).replace('{x}',x).replace('{y}',c.y);
									 }
									 return u;
								 }

						function getTile  (c,z,d) {

									var img = document.createElement('img'),
										tile_url = getTileUrl(c,z,this.overlay.tile_url),
										grid_url,
										grid = self.utfGrid;//s[type];

										try{
											if('{0}'.format(this.overlay.grid_url) !== 'null') {
												grid_url = getTileUrl(c,z,this.overlay.grid_url);
												if(grid_url) {
													if(!grid) {grid = {}}
													if(!grid[z]) {grid[z]={}};
													if(!grid[z][c.x]) {grid[z][c.x]={}};
													if(!grid[z][c.x][c.y]) {
														$http.jsonp('{0}?callback=JSON_CALLBACK'.format(grid_url))
															.success(
																function(data, status, headers, config) {
																	grid[z][c.x][c.y] = data;
																}
															).error(function(err) {});
														}
													}
											}
										} catch (e){}


									img.style.opacity = this.opacity;
									img.width=this.tileSize.width;
									img.height=this.tileSize.height;

									img.onload = function(e) {
										delete self.tiles[tile_url];
										if (Object.keys(self.tiles).length<5) {

											$rootScope.$emit('cfpLoadingBar:completed');
										}
									}
									img.onerror = function(e) {
										delete this.tiles[tile_url];
										img.src = 'static/app/img/blank_tile.png';
										if (Object.keys(this.tiles).length<5) {

											$rootScope.$emit('cfpLoadingBar:completed');
										}
									}

									$rootScope.$emit('cfpLoadingBar:started');
									this.tiles[tile_url] = "loading";

									img.src = tile_url;
									return img;

						}


						}


						function interactivity (map, eventName, coords) {
		 						var data = self.getGridData(map, coords);
		 						if (data) {
		 							map.setOptions({ draggableCursor: 'pointer' });
		 						} else {
		 							map.setOptions({ draggableCursor: 'default' });
		 						}

		 						self.getInfoWindowModel(map, eventName,coords[0].latLng,data).then(
		 							function(result) {
		 								if(result) {
		 								self.infowindow = angular.extend({
		 										coords: {
		 											latitude: coords[0].latLng.lat(),
		 											longitude:  coords[0].latLng.lng()
		 										}
		 									},
		 									result
		 								);
		 							}
		 					 });
		 			};
			 }

			 molUiMap.prototype.getInfoWindowModel = function(map,event,coords,data) {return $q.defer().promise},

			molUiMap.prototype.getGridData = function(map,coords) {
						var i, key, grid  = this.utfGrid,
								value, zoom = map.getZoom(),
								numTiles = 1 << zoom,
								projection = new MercatorProjection(),
								worldCoordinate = projection.fromLatLngToPoint(coords[0].latLng),
								pixelCoordinate = new google.maps.Point(
								worldCoordinate.x * numTiles,
								worldCoordinate.y * numTiles),
								tileCoordinate = new google.maps.Point(
										Math.floor(pixelCoordinate.x / 256),
										Math.floor(pixelCoordinate.y / 256)),
								gridCoordinate = new google.maps.Point(
										Math.floor((pixelCoordinate.x - tileCoordinate.x*256)/4),
										Math.floor((pixelCoordinate.y - tileCoordinate.y*256)/4));



						 try {
							 i = grid[zoom][tileCoordinate.x][tileCoordinate.y]
										 .grid[gridCoordinate.y].charCodeAt(gridCoordinate.x);
							 //decode the UTF code per UTF-grid spec
							 //https://github.com/mapbox/mbtiles-spec/blob/master/1.1/utfgrid.md
							 if(i>=93) {i--};
							 if(i>=35) {i--};
							 i-=32;
							 key = grid[zoom][tileCoordinate.x][tileCoordinate.y].keys[i]

							 value = grid
									 [zoom][tileCoordinate.x][tileCoordinate.y]
										 .data[String(key)];
							} catch(e) {

							}
							return value;
			     };


						molUiMap.prototype.resize = function () {
							var self = this;
							uiGmapGoogleMapApi.then(
                function(maps) {
                  try {
                    var center = self.map.getCenter();
                    for(var i=0;i<=700;i+=4) {
                        $timeout(function() {
                            google.maps.event.trigger(map,'resize');
                            this.map.panTo(center);
                        },i);
                    }
                  } catch (e) {}
                });
						};






						return molUiMap;

					}




	]
);

	molServices.factory(
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
]);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

  	var reportBaseUrl = extractBaseUrl(request.url);
  	var world = extractWorld(request.url);
    var report = $.parseHTML(request.table)[1];

    var reportObj = {};

    reportObj.id = getId(request.url);
    reportObj.playerId = $(report).find('#attack_info_def .village_anchor').attr('data-player');
    reportObj.villageId = $(report).find('#attack_info_def .village_anchor').attr('data-id');
    reportObj.links = getLinks(reportBaseUrl, reportObj.playerId, reportObj.villageId, world);

    reportObj.combatTime = getDate($(report).find('tr:eq(1)').find('td:last').text().trim());
    reportObj.playerName = $( report ).find('#attack_info_def tr:first').find('a').text().trim();    
    reportObj.destination = $( report ).find('#attack_info_def .village_anchor a:first').text();
    reportObj.villageName = getVillageName( reportObj.destination);
    reportObj.coordinates = getCoordinates( reportObj.destination);
    reportObj.reportIcon = getIconFileName($(report).find('tr:first img').attr('src'));
    
    var spiedResources = $(report).find('#attack_spy_resources');
    var hauledResources = $(report).find('#attack_results');
    
    reportObj.resources = getResources(spiedResources, hauledResources);
    reportObj.actions = getActions(reportBaseUrl, reportObj.villageId, reportObj.id, reportObj.playerId, world);

    storeAsList(reportObj);
    // storeAsObjectOfList(reportObj);
});

function getId(reportUrl){
	return reportUrl.substring(reportUrl.lastIndexOf('=')+1);
}

function extractBaseUrl(reportUrl){
	var parser = document.createElement('a');
	parser.href = reportUrl;
	//something like that 'https://it36.tribals.it/game.php?village=4745'
	return parser.protocol+'//'+parser.host+parser.pathname+parser.search.split('&')[0];
}

function extractWorld(reportUrl){
	var parser = document.createElement('a');
	parser.href = reportUrl;
	//something like that it36 
	return parser.host.split('.')[0]
}

function getCoordinates(destination){
	return destination.substring(destination.indexOf('(')+1, destination.indexOf(')')).trim();
}

function getVillageName(destination){
	return destination.substring(0, destination.indexOf('(')).trim();
}

function getIconFileName(iconLink) {
	return iconLink.substring(iconLink.lastIndexOf('/')+1);
}

function getLinks(reportBaseUrl, playerId, villageId){
	var playerUrl = reportBaseUrl + '&screen=info_player&id=' + playerId;
	var villageUrl = reportBaseUrl + '&screen=info_village&id=' + villageId;

	var link = {
		villageLink: villageUrl,
		playerLink: playerUrl
	}
	return link;
}

function getActions(reportBaseUrl, villageId, reportId, playerId, world){
	var attackUrl = reportBaseUrl + '&screen=place&target=' + villageId;
	var sendResourcesUrl = reportBaseUrl + '&screen=market&mode=send&target=' + villageId;
	var targetMapUrl = reportBaseUrl + '&screen=map&beacon=1&id='+ villageId;
	var showReportUrl = reportBaseUrl + '&screen=report&mode=all&group_id=0&view='+ reportId;
	//http://it.twstats.com/it36/index.php?page=player&id=1046601
	const statsBaseUrl = 'http://it.twstats.com/';
	var showPlayerStatsUrl = statsBaseUrl + world + '/index.php?page=player&id='+ playerId;

	var actions = {
		attack: attackUrl,
		sendResources: sendResourcesUrl,
		targetMap: targetMapUrl,
		showReport: showReportUrl,
		showPlayerStats : showPlayerStatsUrl
	}

	return actions;
}

function getResources(spiedResources, hauledResources) {
	var spiedResourcesObj = parseResources(spiedResources);
	var hauledResourcesObj = parseResources(hauledResources);

	//Add transportable haul on hauled resources
	hauledResourcesObj.transportableHaul = parseNumber($(hauledResources).find('td:last').text().trim().split('/')[1]);

	result = {
	    	 spied: spiedResourcesObj, 
	    	 haul: hauledResourcesObj
    	};

	return result;
}

function parseResources(resources) {
	if(!resources)
		return {};
	
	var woodStr = $(resources).find('.wood').parent().text().trim();
	var stoneStr = $(resources).find('.stone').parent().text().trim();
	var ironStr = $(resources).find('.iron').parent().text().trim();

	var wood = parseNumber(woodStr);
	var stone = parseNumber(stoneStr);
	var iron = parseNumber(ironStr);

	var total = wood + stone + iron;

	var result = {
		wood: wood,
		stone: stone,
		iron: iron,
		total: total
	};

	return result;
}

function parseNumber(numberStr){
	if(!numberStr ||  !Number.parseInt(numberStr))
		return 0;

	return parseInt(numberStr.replace('.',''));
}

function getDate(localizedDate){
	if(!localizedDate)
		return null;

	const italianMonths = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

	dateArray = localizedDate.split(' ');
	dateArray[0] = italianMonths.indexOf(dateArray[0])+1

	aDate = new Date(Date.parse(dateArray.join(' '))); 
	return aDate.toJSON();
}

function reportsEquality(report){

	if(!this)
		return false;

	return this.id === report.id;

}

function storeAsObjectOfList(reportObj){
	// by passing an object you can define default values e.g.: []
	chrome.storage.local.get({reports: {}}, function (result) {
		// Save it using the Chrome extension storage API.
		// the input argument is ALWAYS an object containing the queried keys
    	// so we select the key we need
    	var reportsToStore = result.reports;
    	if(reportsToStore[reportObj.villageId]){
    		if(!reportsToStore[reportObj.villageId].find(reportsEquality, reportObj) ){    		
	    		reportsToStore[reportObj.villageId].push(reportObj);
	    		storeReports(reportsToStore);
    		}
    	}
    	else{
    		reportsToStore[reportObj.villageId] = [reportObj];
    		storeReports(reportsToStore);
    	}
	});
}

function storeAsList(reportObj) {
	// by passing an object you can define default values e.g.: []
	chrome.storage.local.get({reports: []}, function (result) {
		// Save it using the Chrome extension storage API.
		// the input argument is ALWAYS an object containing the queried keys
    	// so we select the key we need
    	var reportsToStore = result.reports;
    	if(reportsToStore.find(reportsEquality, reportObj) )
    		return;
	    
	    reportsToStore.push(reportObj);
	    storeReports(reportsToStore);    		    	
	});
}

function storeReports(reportsToStore){
	chrome.storage.local.set({reports: reportsToStore}, function() {
	  // Notify that we saved.
	  //console.log('reports saved');
	});
}

/*{
	'villageId': '4355',
	'playerId': '464534',
	'palyerName': 'M--M', 	
	'combatTime': 'ott 14,2016 19:15:56:442',
	'destination': 'Villaggio di M--M (435|484) C44',
	'villageName': 'Villaggio di M--M'
	'coordinates': '456|467',
	'reportIcon': 'green',
	'links': {
		'villageLink': 'https://it36.tribals.it/game.php?village=4745&screen=info_village&id=4947',
		'playerLink': 'https://it36.tribals.it/game.php?village=4745&screen=info_player&id=713542'
	
	},
	actions: {
		attack: 'https://it36.tribals.it/game.php?village=4745&screen=place&target=3771&',
		sendResources: 'https://it36.tribals.it/game.php?village=4745&screen=market&mode=send&target=3771&',
		targetMap: 'https://it36.tribals.it/game.php?village=4745&screen=map&beacon=1&id=3771&',
		showReport: 'https://it36.tribals.it/game.php?village=4745&screen=report&mode=all&group_id=0&view=5524008',
		showPlayerStats : 'http://it.twstats.com/it36/index.php?page=player&id=1046821'		
	},
	'resources' :{
	'spied':{
		'wood': 1000,
		'stone': 2000,
		'iron': 2200,
		'total': 5200
	},
	'haul':{
		'wood': 100,
		'stone': 200,
		'iron': 220,
		'total': 520,
		'transportablHaul':2445
	}}
}*/
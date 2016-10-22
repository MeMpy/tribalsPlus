chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    var report = $.parseHTML(request.table)[1];

    var reportObj = {};
    //TODO add report id -> Can be null!!!    
    reportObj.villageLink = $(report).find('#attack_info_def .village_anchor a:first').attr("href");
    reportObj.villageId = $(report).find('#attack_info_def .village_anchor').attr('data-id');
    reportObj.combatTime = getDate($(report).find('tr:eq(1)').find('td:last').text().trim());
    reportObj.playerName = $( report ).find('#attack_info_def tr:first').find('a').text().trim();
    reportObj.playerLink = $( report ).find('#attack_info_def tr:first').find('a').attr('href');
    reportObj.destination = $( report ).find('#attack_info_def .village_anchor a:first').text();
    reportObj.coordinates = getCoordinates( reportObj.destination);
    reportObj.reportIcon = getIconFileName($(report).find('tr:first img').attr('src'));
    
    var spiedResources = getResources($(report).find('#attack_spy_resources'));
    var hauledResources = getResources($(report).find('#attack_results'));
    
    reportObj.resources = {
	    	 spied: spiedResources, 
	    	 haul: hauledResources
    	};

    // by passing an object you can define default values e.g.: []
	chrome.storage.local.get({reports: {}}, function (result) {
		// Save it using the Chrome extension storage API.
		// the input argument is ALWAYS an object containing the queried keys
    	// so we select the key we need
    	var reportsToStore = result.reports;
    	if(reportsToStore[reportObj.villageId])
    		reportsToStore[reportObj.villageId].push(reportObj)
    	else
    		reportsToStore[reportObj.villageId] = [reportObj];

	    chrome.storage.local.set({reports: reportsToStore}, function() {
	      // Notify that we saved.
	      console.log('reports saved');
	    });
	});
});

function getCoordinates(destination){
	return destination.substring(destination.indexOf('(')+1, destination.indexOf(')')).trim();
}

function getIconFileName(iconLink) {
	return iconLink.substring(iconLink.lastIndexOf('/')+1);
}

function getResources(resources) {
	if(!resources)
		return {};
	
	var woodStr = $(resources).find('.wood').parent().text().trim();
	var stoneStr = $(resources).find('.stone').parent().text().trim();
	var ironStr = $(resources).find('.iron').parent().text().trim();

	var wood = !Number.parseInt(woodStr) ? 0: Number.parseInt(woodStr);
	var stone = !Number.parseInt(stoneStr) ? 0: Number.parseInt(stoneStr);
	var iron = !Number.parseInt(ironStr) ? 0: Number.parseInt(ironStr);
	var total = wood + stone + iron;

	var result = {
		wood: wood,
		stone: stone,
		iron: iron,
		total: total
	};

	return result;
}

function getDate(localizedDate){
	if(!localizedDate)
		return null;

	const italianMonths = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"]

	dateArray = localizedDate.split(' ');
	dateArray[0] = italianMonths.indexOf(dateArray[0])

	aDate = new Date(Date.parse(dateArray.join(' '))); 
	return aDate.toLocaleString();
}

/*{
	"villageId": "4355",
	"playerId": "464534",
	"palyerName": "M--M", 
	"villageName" : "Villaggio di M--M",
	"combatTime": "ott 14,2016 19:15:56:442",
	"destination": "Villaggio di M--M (435|484) C44"
	"coordinates": "456|467",
	"reportIcon": "green",
	"villageLink": "/game.php?village=4745&screen=info_village&id=4947",
	"playerLink": "/game.php?village=4745&screen=info_player&id=713542",
	"resources" :{
	"spied":{
		"wood": 1000,
		"stone": 2000,
		"iron": 2200,
		"total": 5200
	},
	"haul":{
		"wood": 100,
		"stone": 200,
		"iron": 220,
		"total": 520
	}}
}*/
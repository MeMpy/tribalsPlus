$(document).ready(function(){

	$('#report_table').on('click', 'a', function(){
		 chrome.tabs.create({url: $(this).attr('href')});
		 return false;
	});

	chrome.storage.local.get(null, function(items){
    var reports = items.reports; 
		console.log(reports);
		
    var dataSource = Object.keys(reports).map(key => reports[key][0]);
    console.log(dataSource);

    $('#report_table').DataTable( {
    data: dataSource,
    columns: [
        {
          data: 'reportIcon',
          render: buildImage,
          title: ''
        },

        { 
          data: 'playerName',
          title: 'Player'
         },

        { 
          data: 'destination',
          title: 'Village'
        },  

        { 
          data: 'combatTime',
          title: 'Time'
        },
        { 
          data: 'resources',
          title: 'Haul',
          render: buildResources
        },
        { 
          data: 'actions',
          title: 'Actions',
          render: renderActions 
        }
    ]
    });    
	})

})

function renderActions(data, type, row) {
  var attackLink = buildLink(data.attack, 'Attack')+'<br/>';
  var sendResourcesLink = buildLink(data.sendResources, 'Send resources')+'<br/>';
  var mapLink = buildLink(data.targetMap, 'Show on map')+'<br/>';

  return attackLink+sendResourcesLink+mapLink;
}

function buildLink( link, text ) {
    return '<a href="'+link+'">'+ text +'</a>';
}

function buildImage ( data, type, row){
    return '<img src="/../resources/'+data+'"/>';
}

function buildResources (data, type, row){
  var haulResource = data.haul;

  var wood = '<div class="square wood"></div>'+'<span class="resource">'+haulResource.wood+'</span>';
  var clay = '<div class="square stone"></div>'+'<span class="resource">'+haulResource.stone+'</span>';
  var iron = '<div class="square iron"></div>'+'<span class="resource">'+haulResource.iron+'</span>';

  return wood+clay+iron;
}
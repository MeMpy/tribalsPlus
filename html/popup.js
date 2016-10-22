$(document).ready(function(){
  //TODO fetch dinamically
	var baseUrl = 'https://it36.tribals.it';
	$('#report_table').on('click', 'a', function(){
		 chrome.tabs.create({url: baseUrl + $(this).attr('href')});
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
          data: 'villageLink',
          title: 'Attack',
          render: buildLink 
        }
    ]
    });    
	})

})

function buildLink( data, type, row ) {
    return '<a href="'+data+'">'+ row.destination +'</a>';
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
$(document).ready(function(){

  $('#report_table').on('click', 'a', function(){
    var href =$(this).attr('href');
    chrome.tabs.getSelected(null,function(tab) {      
      chrome.tabs.update(tab.id, {url: href});
    });
  //   chrome.tabs.create({url: $(this).attr('href')});
  //   return false;
  });

  $('#report_table').on('mouseenter mouseleave', '.popup', function(){
    $(this).find('.popupContent')[0].classList.toggle('show');
  });

//TODO I don't like this initialization since it's async.
//try to decouple the query and the datable initialization
	chrome.storage.local.get(null, function(items){
    var reports = items.reports; 
		// console.log(reports);
    var dataSource = retrieveReportsAsList(reports);
    // var dataSource = retrieveReportsAsObjectOfList(reports);

    $('#report_table').DataTable( {
      data: dataSource,
      columns: [
          {
            title: '',
            data: 'reportIcon',
            render: renderImage          
          },
          {
            title: 'Village',
            data: 'coordinates',
            render: renderVillage,
          },
          { 
            title: 'Details',
            data: 'villageName',
            render: renderDetails
          },  

          { 
            title: 'Time',
            data: 'combatTime',
            render: renderCombatTime
          },
          { 
            title: 'Resources',
            data: 'resources',          
            render: renderResources
          },
          { 
            title: 'Actions',
            data: 'actions',          
            render: renderActions 
          }
      ],    
      "columnDefs": [
          // { "width": "20%", "targets": 1 }
          { className: "dt-center", "targets": [ 2 ] }
      ],
      //buttons
      dom: 'Bfrtip',
      buttons: [
          {
              text: 'Clear report list',
              action: function ( e, dt, node, config ) {
                  chrome.storage.local.clear();
                  dt.clear();
                  dt.draw();
              }
          },
          // {
          //     text: 'Refresh report list',
          //     action: function ( e, dt, node, config ) {
          //         attachReportsToTable(dt);
          //     }
          // }
      ]
      });    
	})

})

function retrieveReportsAsList(reports) {
  var dataSource = [];
    if(reports)
      dataSource = reports;

  return dataSource;
}

function retrieveReportsAsObjectOfList(reports) {
  var dataSource = {}
    if(reports)
      dataSource = Object.keys(reports).map(key => reports[key][0]);

  return dataSource;
}


// function attachReportsToTable(dataTable){
//   chrome.storage.local.get(null, function(items){
//     var reports = items.reports;     
//     var dataSource = {};
//     if(reports)
//       dataSource = Object.keys(reports).map(key => reports[key][0]);

//     dataTable.clear();
//     dataTable.rows.add(dataSource);
//     dataTable.draw();
//   });
// }

function renderVillage(data, type, row) {
  var villageLink = buildLink(row.links.villageLink, data)    
  return villageLink;
}

function renderDetails(data, type, row) {
  var villageLink = buildLink(row.links.villageLink, data)
  if(row.playerName)
    villageLink += ' - '+ buildLink(row.links.playerLink, row.playerName );

  return villageLink;
}

function renderCombatTime(data, type, row) {
  var date = new Date(data);
  return date.toGMTString();
}

function renderActions(data, type, row) {
  var attackLink = buildLink(data.attack, 'Attack')+'<br/>';
  var sendResourcesLink = buildLink(data.sendResources, 'Send resources')+'<br/>';
  var mapLink = buildLink(data.targetMap, 'Show on map')+'<br/>';
  var reportLink = buildLink(data.showReport, 'Show report')+'<br/>';
  var showPlayerStatsLink = ''
  if(row.playerName)
    showPlayerStatsLink = buildLink(data.showPlayerStats, 'Show player stats')+'<br/>';

  return attackLink+sendResourcesLink+mapLink+reportLink+showPlayerStatsLink;
}

function renderImage ( data, type, row){
    return '<img src="/../resources/'+data+'"/>';
}

function renderResources(data, type, row) {
  var spied = '<span class="resource"><b>Spied: </b></span>'+buildResources(data.spied);
  var haul = '<span class="resource"><b>Haul: </b></span>'+buildResources(data.haul);

  var popupContent = '<span class="popupContent">'+'<table><tbody><tr class="resourceRow"><td>'+spied+'</td></tr><tr class="resourceRow"><td>'+haul+'</td></tr></tbody></table></span>';

  var cellContent = '';
  if(data.spied){
    cellContent += '<b>Spied: </b> '+data.spied.total+'<br/>';
  }

  cellContent += '<b>Haul: </b> '+data.haul.total+'/'+data.haul.transportableHaul;

  var resourceAndPopup = '<div class="popup">'+cellContent+popupContent+'</div>';

  return resourceAndPopup;

}

function buildLink( link, text ) {
    return '<a class="tribals" href="'+link+'">'+ text +'</a>';
}

function buildResources (resources){
  
  if(!resources)
    return '<span class="resource">.</span>';

  var wood = '<div class="square wood"></div>'+'<span class="resource">'+resources.wood+'</span>';
  var clay = '<div class="square stone"></div>'+'<span class="resource">'+resources.stone+'</span>';
  var iron = '<div class="square iron"></div>'+'<span class="resource">'+resources.iron+'</span>';

  return wood+clay+iron;
}
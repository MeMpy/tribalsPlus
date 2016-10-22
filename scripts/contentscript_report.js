$(document).ready( function() {

  var request = { table: $('#content_value .report_ReportAttack').parents('table.vis:first').html()};
  chrome.runtime.sendMessage(request, function(response) {
    console.log('response received');
  });

})
$(document).ready( function() {

	var requestUrl = window.location.href;
	var request = { 
		url: requestUrl,
		table: $('#content_value .report_ReportAttack').parents('table.vis:first').html()
	};
	chrome.runtime.sendMessage(request, function(response) {
	console.log('response received');
	});

})
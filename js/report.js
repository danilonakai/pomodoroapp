var tasks = check_localstorage();
var task_id = window.location.href.split("?id=")[1];
var report_list = "";

function generate_report(){
	$(tasks).each(function(){
		if($(this)[0].id == task_id){
			$.each($(this)[0].history, function(){
				let report = "Date: "+$(this)[0].date+" Action: "+$(this)[0].action+" Action duration: "+$(this)[0].action_duration+"</br>";

				report_list = report_list + report;
			});
		}
	});
	
	$('body').html(report_list);
}

function check_localstorage(){
	if(localStorage.getItem('tasks') != null){
		return JSON.parse(localStorage.getItem('tasks'));	
	}
};



$(document).ready(function(){
	generate_report();
});
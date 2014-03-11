/**
 * 
 */

function current_time(id)
{
    var current_time = moment().format("YYYY-MM-DD HH:mm:ss");
	$(id).html("Current Time: " + current_time)
    setTimeout('current_time("'+id+'");','1000');
}

function gather_requested_data() {
    // Get the selected sensors
	$("#center_status").html("")
    selected_sensors = new Array()
    checked = $(".checked")
    for (i=0; i<checked.length; i++){
        if (checked[i].checked) {
            id = checked[i].id.split("_")
            selected_sensors.push(id[0])
        }
    }
    // get the duration
    checked = $(".time_tick")
    for (i=0; i<checked.length; i++){
        if (checked[i].checked) {
            duration = checked[i].id
        }
    }
    GraphXivelyData.clearGraph()
    GraphXivelyData.graph(selected_sensors, moment.utc(), duration)
}

function find_wind_direction(direction){
	inc = 11.25
	if (direction >= 348.75 && direction < 360 || direction >= 0 && direction < inc) return "N";
	if (direction >= inc && direction < inc*3) return "NNE";
	if (direction >= inc*3 && direction < inc*5) return "NE";
	if (direction >= inc*5 && direction < inc*7) return "NEE";
	if (direction >= inc*7 && direction < inc*9) return "E";
	if (direction >= inc*9 && direction < inc*11) return "SEE";
	if (direction >= inc*11 && direction < inc*13) return "SE";
	if (direction >= inc*13 && direction < inc*15) return "SSE";
	if (direction >= inc*15 && direction < inc*17) return "S";
	if (direction >= inc*17 && direction < inc*19) return "SSW";
	if (direction >= inc*19 && direction < inc*21) return "SW";
	if (direction >= inc*21 && direction < inc*23) return "SWW";
	if (direction >= inc*23 && direction < inc*25) return "W";
	if (direction >= inc*25 && direction < inc*27) return "NWW";
	if (direction >= inc*27 && direction < inc*29) return "NW";
	if (direction >= inc*29 && direction < inc*31) return "NNW";
	return ("ERROR: " + direction); // error, disconnected?         
}

reject = new Array()
reject["Temperature"] = {min:-20, max:130};
reject["Battery"] = {min:-1, max:15.0};
reject["Humidity"] = {min:-1, max:100};
reject["Pressure"] = {min:20, max:120};
reject["WindDirection"] = {min:0, max:360};
reject["DailyRain"] = {min:0, max:20};
reject["Rain"] = {min:0, max:20};
reject["Light"] = {min:0, max:5};
reject["WindGust"] = {min:0, max:300};
reject["WindGust_10Minute"] = {min:0, max:300};
reject["WindGustDirection"] = {min:0, max:360};
reject["WindGustDirection_10Minute"] = {min:0, max:360};
reject["WindSpeed"] = {min:0, max:300};
reject["WindSpeed_Average_2Minute"] = {min:0, max:300};
reject["WindDirection_Average_2Minute"] = {min:0, max:360};

function rejected(id, value){
	if (id in reject){
		if (value < reject[id].min ||
			value > reject[id].max) {
			return true;
		} else { 
			return false;
		}
	}
	return false;
}
 
function display_data(feed){
     var at = 1
     var new_value;
     if (feed != null) {
	     if (feed.status == "frozen"){
		     for (var i = 0; i < feed.datastreams.length; i++){
		    	 var id = feed.datastreams[i].id;
		         var current_value = feed.datastreams[i].current_value;
		         var at = feed.datastreams[i].at
		         if (!rejected(id, current_value)) {
			         if (id.indexOf("Direction") > 0){
			             new_value = current_value + " " + find_wind_direction(current_value);
			         } else {
			             new_value = current_value;
			         }
			         $("#" + id).html(new_value);
		         }
		     }
		     var time_of_last_update = moment(at).format("YYYY-MM-DD HH:mm:ss");
	    	 $("#LastUpdate").html(time_of_last_update)
	    	 $("#center_status").html("")
	     }
	     else
	     {
		     $("#center_status").html("ERROR(content.js 107): " + feed.statusText);
	     }
     } else {
	     $("#center_status").html("ERROR(content.js 111): error getting data");    	 
     }
}

function start_displaying_data(){
	try {
		xively.setKey( xivelyKey )
		xively.feed.get(xivelyFeedID, function(feed){
			display_data(feed);
			xively.feed.subscribe(xivelyFeedID, function (x, feed ) {
				display_data(feed);
			})
		})
	}
	catch(err)
	{
		error_message = "ERROR(content.js 123) Error in contents.js start_displaying data: " + err;
		$("#center_status").html(error_message)
		console.log(error_message)
	}
}

function show_presentation(presentation){        	
}



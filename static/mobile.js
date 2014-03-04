/**
 * 
 */
xivelyKey = "4mQVPDxR9qd8F3PK97XUmMRZ72Y0RQRqWs2x5Ve7gGIZBgjB"
xivelyFeedID = "325548065"

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
 
function display_data(feed){
     var at = 1
     var new_value;
     if (feed = null){
		 if (feed.status == 200){
		     for (var i = 0; i < feed.datastreams.length; i++){
		    	 var id = feed.datastreams[i].id;
		         var current_value = feed.datastreams[i].current_value;
		         var at = feed.datastreams[i].at
		         if (id.indexOf("Direction") > 0){
		        	 new_value = current_value + " " + find_wind_direction(current_value);
		         } else {
		        	 new_value = current_value;
		         }
		         $("#" + id).html(new_value);
		         var time_of_last_update = moment(at).format("YYYY-MM-DD HH:mm:ss");
		         $("#LastUpdate").html(time_of_last_update)
		     }
		 } else {
		     $("#center_status").html("ERROR(mobile.js 46) " + feed.statusText);
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
		error_message = "ERROR(mobile.js 62) Error in contents.js start_displaying data: " + err;
		$("#center_status").html(error_message)
		console.log(error_message)
	}
}



reject = new Array();
reject["Temperature"] = {min:-20, max:130};
reject["Battery"] = {min:-1, max:15.0};
reject["Humidity"] = {min:-1, max:100};
reject["Pressure"] = {min:0, max:120};
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


var GraphXivelyData = {


	MAX_VALUE:  9999999,
	min: this.MAX_VALUE,
	max: -this.MAX_VALUE,

	time_zone_offset: moment().zone(),

	query: {
			start: null,
			stop: null,
			interval: null,
			limit: 1000
	},

	palette: new Rickshaw.Color.Palette(),

	// Array of sensor data. Each element will be a line.
	sensor_data: null,
	sensors:  null, // an array containing the sensor to graph. (ie. temperature)
	
	// graph data from xively
	// sensors is a array of the sensors to graph
	// end_time is the time when the graph will end
	// duration the interval to display (daily, weekly, monthly and yearly)
	graph: function (sensors, end_time, duration) {

		if (sensors.length != 0){
			this.sensors = sensors
			this.sensor_data = new Array()
			GraphXivelyData.min = GraphXivelyData.MAX_VALUE
			GraphXivelyData.max = -GraphXivelyData.MAX_VALUE
	
			xively.setKey(xivelyKey);
			this.query.stop = end_time.toJSON()
			
			if (duration == 'daily'){
				this.query.start = end_time.subtract('hours', 24).toJSON()
				this.query.interval = 300
			} else if (duration == 'weekly') {
				this.query.start = end_time.subtract('weeks', 1).toJSON()
				this.query.interval = 900
			} else if (duration == 'monthly') {
				this.query.start = end_time.subtract('months', 1).toJSON()
				this.query.interval = 3600
			} else if (duration == 'yearly') {
				this.query.start = end_time.subtract('years', 1).toJSON()	
				this.query.interval = 43200
			} else if (duration == '6hour') {
				this.query.start = end_time.subtract('hours', 6).toJSON()	
				this.query.interval = 300
			}
			this.get_data()
		} else {
			$("#center_status").html("ERROR(graph.js 75) No sensors selected");
		}
	},

	
	get_data: function get_data(){
		sensor = GraphXivelyData.sensors[0]
		xively.datastream.history( xivelyFeedID, sensor, GraphXivelyData.query, GraphXivelyData.load_data);
	},
	
	load_data: function (data) {
		if (data.datapoints == null || data.datapoints.length == 0) {
			$("#center_status").html("ERROR(graph.js 87) Error reading " + GraphXivelyData.sensors[0])
			return
		}
		var series = [];

		sensor = GraphXivelyData.sensors[0];
		var filtedData = data.datapoints.filter(function(x) { return (x.value >= reject[sensor].min && 
																	  x.value <= reject[sensor].max); });

		for (var i=0; i < filtedData.length; i++ ) {
			var utc = moment.utc(filtedData[i].at);
			var date = utc.subtract("minutes", GraphXivelyData.time_zone_offset);
			var value = parseFloat(filtedData[i].value)
			
			if (value > GraphXivelyData.max)
				GraphXivelyData.max = value
			if (value < GraphXivelyData.min)
				GraphXivelyData.min = value
			series[i] = {x: date.valueOf()/1000, y: value};
		}
		
		edge = (GraphXivelyData.max - GraphXivelyData.min) * 0.05
		GraphXivelyData.min -=  edge
		GraphXivelyData.max += edge 
		
		node = {
				name: GraphXivelyData.sensors.shift(),
				data: series,
				color: GraphXivelyData.palette.color()
		}
		GraphXivelyData.sensor_data.push(node)

		if (GraphXivelyData.sensors.length == 0){
			GraphXivelyData.draw_graph()
		} else {
			GraphXivelyData.get_data()
		}
	},
	 
	draw_graph: function() {
	
		var graph = new Rickshaw.Graph( {
			element: document.querySelector("#chart"),
			width: $("#chart").width(),
			height: $("#chart").height(),
			renderer: 'line',
			min: GraphXivelyData.min,
			max: GraphXivelyData.max,
			padding: {
				top: 0.02,
				right: 0.02,
				bottom: 0.02,
				left: 0.02
			},
		    series: GraphXivelyData.sensor_data	
		});
		
		var ticksTreatment = 'glow';
		var xAxis = new Rickshaw.Graph.Axis.Time( {
		    graph: graph,
		    ticksTreatment: ticksTreatment
		});
	
		var yAxis = new Rickshaw.Graph.Axis.Y( {
			graph: graph,
			element: document.getElementById('y_axis'),
	        orientation: 'left',
			tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
			ticksTreatment: ticksTreatment
		});
	
		var hoverDetail = new Rickshaw.Graph.HoverDetail({
			graph: graph,
			formatter: function(series_data, x, y) {
				var swatch = '<span class="detail_swatch" style="background-color: ' + series_data.color + ' padding: 4px;"></span>';
				var content = swatch + "&nbsp;&nbsp;" + y + '&nbsp;&nbsp;<br>';
				return content;
			}
		});
	
		var legend = new Rickshaw.Graph.Legend( {
	        element: document.querySelector('#legend'),
	        graph: graph
		} );
		
		graph.render();
	
		var slider = new Rickshaw.Graph.RangeSlider({
				graph: graph,
				element: document.querySelector('#slider')
		});
	
	},
	
	clearGraph: function() {
		$('#legend').empty();
		$('#slider').empty();
		$('#chart_container').html('<div id="y_axis"></div><div id="chart"></div><div id="legend"></div></div><div id="slider" >');
		this.palette = new Rickshaw.Color.Palette()
		GraphXivelyData.min = GraphXivelyData.MAX_VALUE
		GraphXivelyData.max = -GraphXivelyData.MAX_VALUE

	}
}

var display_sensors = new Array("Temperature", "Humidity");
//var display_sensors = new Array("Pressure");
GraphXivelyData.graph(display_sensors, moment.utc(), "daily")


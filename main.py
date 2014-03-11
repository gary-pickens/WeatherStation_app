"""`main` is the top level module for your Flask application."""

# Import the Flask Framework
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash

app = Flask( __name__ )
# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.
app = Flask( __name__.split( '.' )[0] )
app.config.from_object( __name__ )

# Load default config and override config from an environment variable
app.config.update( dict( 
    DEBUG=True,
    SECRET_KEY='',
    USERNAME='',
    PASSWORD='',
    PAGE_NAME='',
    XIVELYKEY="",
    XIVELYFEEDID=""

 ) )
app.config.from_object( 'settings' )

class MetaData():
    id = 0
    sensor_name = ""
    display_name = ""
    units = ""
    display_order = 0
    checked = False
    mobile = False

    def __init__( self, id, sensor_name, display_name, units, display_order, checked, mobile ):
        self.id = id
        self.sensor_name = sensor_name
        self.display_name = display_name
        self.units = units
        self.display_order = display_order
        self.checked = checked
        self.mobile = mobile

    def __repr__( self ):
        return "metadata({}, \"{}\", \"{}\", \"{}\", {})".format( 
                                          self.id,
                                          self.sensor_name,
                                          self.display_name,
                                          self.display_order,
                                          self.checked,
                                          self.mobile )

    def __str__( self ):
        return "{} {} {}, {}, {}".format( self.id,
                                          self.sensor_name,
                                          self.display_name,
                                          self.display_order,
                                          self.checked,
                                          self.mobile )

sensor_metadata = []
sensor_metadata.append( MetaData( 10, "Temperature",
                                  "Temperature", "F", 1, 1, True ) )
sensor_metadata.append( MetaData( 9, "Humidity",
                                  "Humidity", "%", 2, 1, True ) )
sensor_metadata.append( MetaData( 13, "Pressure",
                                  "Pressure", "kpa", 3, 0, True ) )
sensor_metadata.append( MetaData( 15, "Light",
                                  "Light", "", 4, 0, False ) )
sensor_metadata.append( MetaData( 11, "Rain",
                                  "Rain", "in", 5, 0, True ) )
sensor_metadata.append( MetaData( 12, "DailyRain",
                                  "Daily Rain", "in", 6, 0, True ) )
sensor_metadata.append( MetaData( 2, "WindSpeed",
                                  "Wind Speed", "MPH", 7, 0, False ) )
sensor_metadata.append( MetaData( 1, "WindDirection",
                                  "Wind Direction", "", 8, 0, False ) )
sensor_metadata.append( MetaData( 3, "WindGust",
                                  "Wind Gust", "MPH", 9, 0, True ) )
sensor_metadata.append( MetaData( 4, "WindGustDirection", "Wind Gust Dir",
                                  "", 10, 0, True ) )
sensor_metadata.append( MetaData( 5, "WindSpeed_Average_2Minute",
                                  "Wind Spd (2)", "MPH", 11, 0, False ) )
sensor_metadata.append( MetaData( 6, "WindDirection_Average_2Minute",
                                  "Wind Dir (2)", "", 12, 0, False ) )
sensor_metadata.append( MetaData( 7, "WindGust_10Minute",
                                  "Wind Spd (10)", "MPH", 13, 0, True ) )
sensor_metadata.append( MetaData( 8, "WindGustDirection_10Minute",
                                  "Wind Dir (10)", "", 14, 0, True ) )
sensor_metadata.append( MetaData( 14, "Battery",
                                  "Battery", "V", 15, 0, False ) )


@app.route( '/' )
def weather_station():
    g.sensor_metadata = sensor_metadata
    return render_template( 'presentation.html',
                            sensor_metadata=sensor_metadata,
                            title=app.config.get( "PAGE_NAME" ),
                            xivelykey=app.config['XIVELYKEY'],
                            xivelyfeedid=app.config['XIVELYFEEDID'] )

@app.route( '/m' )
def mobile_weather_station():
    g.sensor_metadata = sensor_metadata
    return render_template( 'mobile.html',
                            sensor_metadata=sensor_metadata,
                            title=app.config.get( "PAGE_NAME" ),
                            xivelykey=app.config['XIVELYKEY'],
                            xivelyfeedid=app.config['XIVELYFEEDID'] )

@app.route( '/raw' )
def raw_weather_station_data():
    g.sensor_metadata = sensor_metadata
    return render_template( 'raw_data.html',
                            sensor_metadata=sensor_metadata,
                            title=app.config.get( "PAGE_NAME" ),
                            xivelykey=app.config['XIVELYKEY'],
                            xivelyfeedid=app.config['XIVELYFEEDID'] )

@app.errorhandler( 404 )
def page_not_found( e ):
    """Return a custom 404 error."""
    return 'Sorry, Nothing at this URL.', 404

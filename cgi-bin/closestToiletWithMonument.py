#!C:/Python27/python.exe
import cgi
import cgitb
import json
from connection import connect
cgitb.enable()

arg = cgi.FieldStorage()
latitude = arg['latitude'].value
longitude = arg['longitude'].value
radius = arg['radius'].value


cur = connect()
cur.execute("WITH toaleta AS (SELECT ST_Distance(way::geography,(SELECT way from (SELECT ST_Distance(way::geography, ST_Transform(ST_SetSRID(ST_Point("+longitude+", "+latitude+"), 4326), 4326)) as distance, way FROM planet_osm_point where amenity='toilets' order by distance ASC limit 1) as toilet)::geography) as vzd,way,name,osm_id,historic FROM planet_osm_point WHERE historic is not null order by vzd limit 1)SELECT json_build_object('type','Feature','id',toaleta.osm_id,'geometry',ST_AsGeoJSON(toaleta.way)::jsonb,'properties', json_build_object('title', toaleta.name,'icon', toaleta.historic))FROM toaleta;")
result = cur.fetchall()
turns = json.dumps(result)
print ("Content-Type: text/html\n\n")
print (turns)
cur.close()
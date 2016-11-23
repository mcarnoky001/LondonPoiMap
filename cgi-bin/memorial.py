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
cur.execute("SELECT json_build_object('type','Feature','id',osm_id,'geometry',ST_AsGeoJSON(way)::jsonb,'properties', json_build_object('title', name,'icon', historic))FROM planet_osm_point WHERE ST_DWithin(way::geography, ST_Transform(ST_SetSRID(ST_Point("+longitude+", "+latitude+"), 4326),  4326), "+radius+") AND historic='memorial';")
result = cur.fetchall()
turns = json.dumps(result)
print ("Content-Type: text/html\n\n")
print (turns)
cur.close()
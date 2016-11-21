#!C:/Python27/python.exe
import psycopg2
import sys
 
def connect():
#Define our connection string
	conn_string = "host='localhost' dbname='postgres' user='postgres' password='bat3avE5'"
 
	# get a connection, if a connect cannot be made an exception will be raised here
	conn = psycopg2.connect(conn_string)
 
	# conn.cursor will return a cursor object, you can use this cursor to perform queries
	cursor = conn.cursor()
	return cursor
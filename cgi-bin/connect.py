#!/usr/bin/python2

import psycopg2

def makeConnect():
	print ("spusta sa makeConnect v connect")
	conn = psycopg2.connect(database="map", user="postgres", password="bat3avE5")
	print ("pripojilo sa")
	cur = conn.cursor()
	return cur
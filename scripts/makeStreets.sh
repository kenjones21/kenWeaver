#!/bin/bash
echo "Constructing topojson files"

FIELDS_TO_DELETE="ZIP_LEFT, ZIP_RIGHT, LENGTH, STCL2_, STCL2_ID, PRE_DIR, ST_NAME, ST_TYPE, "
FIELDS_TO_DELETE+="SUF_DIR, ONEWAY, L_F_ADD, L_T_ADD, R_F_ADD, R_T_ADD, ST_CODE, L_HUNDRED, "
FIELDS_TO_DELETE+="R_HUNDRED, SEG_ID, ONEWAY, CLASS, RESPONSIBL, UPDATE_, NEWSEGDATE, "
FIELDS_TO_DELETE+="MULTI_REP, STREETLABE, STNAME"

cd res/
rm streets.json philastreets.json temp.shp bikelanes.shp bikelanes.json
ogr2ogr -select "" temp.shp Street_Centerline.shp
#ogrinfo temp.shp -sql "ALTER TABLE temp DROP COLUMN ZIP_LEFT, DROP COLUMN ZIP_RIGHT"
ogr2ogr -t_srs EPSG:4326 -f GeoJSON -simplify 100 \
        streets.json temp.shp
ogr2ogr -t_srs EPSG:4326 -f GeoJSON bikelanes.json BikeLanes.kml
geo2topo -o philastreets.json -- \
	 streets.json bikelanes.json

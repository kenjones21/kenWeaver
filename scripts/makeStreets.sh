#!/bin/bash
echo "Constructing topojson files"

cd res/
rm streets.json philastreets.json temp.shp
ogr2ogr temp.shp Street_Centerline.shp
ogrinfo temp.shp -sql "ALTER TABLE temp DROP COLUMN ZIP_RIGHT"
ogr2ogr -t_srs EPSG:4326 -f GeoJSON -simplify 100 \
        streets.json temp.shp
geo2topo -o philastreets.json -- \
	 streets.json

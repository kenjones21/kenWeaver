#!/bin/bash
echo "Constructing topojson files"

cd res/
rm streets.json philastreets.json
ogr2ogr -t_srs EPSG:4326 -f GeoJSON -simplify 100 \
	-where "ST_NAME IN ('KINGSESSING')" streets.json Street_Centerline.shp
geo2topo -o philastreets.json -- \
	 streets.json

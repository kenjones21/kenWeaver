if [ $ENVIRONMENT == "DEV" ]; then
    ng serve --host 0.0.0.0 --port 4200;
elif [ $ENVIRONMENT == "PROD" ]; then
    echo "Building and moving static files, then exiting"
    ng build --base-href=/static/ --output-path=/code/backend/static/;
fi

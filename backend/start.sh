if [ $ENVIRONMENT == "DEV" ]; then python manage.py runserver 0.0.0.0:8000;
elif [ $ENVIRONMENT == "PROD" ]; then gunicorn kenWeaver.wsgi --bind 0.0.0.0:8000; fi

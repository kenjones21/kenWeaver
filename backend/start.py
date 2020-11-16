import os
from subprocess import run

print(os.getcwd())
SERVER_ENVIRONMENT = os.environ.get('ENVIRONMENT', 'DEV')
if SERVER_ENVIRONMENT == 'DEV':
    run(['python', 'manage.py', 'runserver', '0.0.0.0:8000'])
elif SERVER_ENVIRONMENT == 'PROD':
    print('Not supported yet')
else:
    raise ValueError('Only DEV and PROD server environments are valid')

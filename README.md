# My Personal Website

#### Ken Weaver

This is my open source, personal website. I am currently migrating to a
Django/Angular setup, and this is very much still a work in progress.

### Startup Instructions

To install backend:
1. Navigate to backend folder
2. Setup a new virtual environment: `python3 -m venv /path/to/venv`.
3. Activate virtual environment: `source /path/to/venv/bin/activate`
4. Install requirements: `pip3 install -r requirements.txt`
5. Run migrations: `python3 manage.py migrate`
6. Run django: `python3 manage.py runserver`

To install frontend:
1. Install [nvm](https://github.com/nvm-sh/nvm)
2. Use nvm to install node (instructions on same page as 1)
3. Install dependencies: `npm install`
4. Run angular: `ng serve`

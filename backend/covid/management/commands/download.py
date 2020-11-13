import requests
import csv
from datetime import datetime

from django.core.management.base import BaseCommand, CommandError
from covid.models import County, State, DailyDatum

DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv'
DATE_FORMAT = '%Y-%m-%d'

def construct_state_dict(state_query):
    print('Storing existing state data in memory...')
    state_dict = {}
    for state in state_query:
        state_dict[state.name] = state
    return state_dict

def construct_county_dict(county_query):
    print('Storing existing county data in memory...')
    county_dict = {}
    for county in county_query:
        key = county.name + '__' + county.state.name
        county_dict[key] = county
    return county_dict

def construct_data_dict(data_query):
    print('Storing existing state counts in memory...')
    data_dict = {}
    old_date_str = None
    for datum in data_query:
        date_str = datum.date.strftime(DATE_FORMAT)
        key = '__'.join((date_str, datum.county.name, datum.county.state.name))
        data_dict[key] = datum
    return data_dict

class Command(BaseCommand):
    help = 'Download nytimes covid data and store in database'

    def handle(self, *args, **kwargs):
        request = requests.get(DATA_URL)
        data_str = request.content.decode('utf-8')
        data = data_str.split('\n')
        reader = csv.DictReader(data)
        prev_date = None

        states = State.objects.all()
        state_dict = construct_state_dict(states)
        counties = County.objects.all().select_related('state')
        county_dict = construct_county_dict(counties)
        data = DailyDatum.objects.all().select_related('county', 'county__state')
        data_dict = construct_data_dict(data)
        new_data = []

        print('Beginning new data creation...')
        for line in reader:
            date = line['date']
            if date != prev_date:
                print(date)
                prev_date = date

            # Add state if missing
            state_name = line['state']
            if state_name not in state_dict:
                state = State.objects.create(name=state_name)
                state_dict[state_name] = state
            else:
                state = state_dict[state_name]

            # Add county if missing
            county_name = line['county']
            key = '__'.join((county_name, state.name))
            if key not in county_dict:
                county = County.objects.create(name=county_name, state=state)
                county_dict[key] = county
            else:
                county = county_dict[key]

            datum_date_str = line['date']
            key = '__'.join((datum_date_str, county.name, state.name))
            if key not in data_dict:
                datum_date = datetime.strptime(datum_date_str, DATE_FORMAT)
                datum = DailyDatum(county=county, date=datum_date,
                                   case_count=int(line['cases']),
                                   death_count=int(line['deaths'])) # Create in bulk
                new_data.append(datum)
        DailyDatum.objects.bulk_create(new_data)  

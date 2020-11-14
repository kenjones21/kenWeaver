from rest_framework import serializers
from covid import models

class DataSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.DailyDatum
        fields = ['case_count', 'death_count', 'county', 'date']

class StateSerializer(serializers.ModelSerializer):
    county_set = serializers.StringRelatedField(many=True)
    
    class Meta:
        model = models.State
        fields = ['name', 'county_set']

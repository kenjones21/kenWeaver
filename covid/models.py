from django.db import models

# Create your models here.

class State(models.Model):
    name = models.CharField(max_length=50, db_index=True, unique=True)
    initials = models.CharField(max_length=2, blank=True)

class County(models.Model):
    name = models.CharField(max_length=50, db_index=True)
    state = models.ForeignKey(State, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('name', 'state')

class DailyDatum(models.Model):
    case_count = models.IntegerField()
    death_count = models.IntegerField()
    county = models.ForeignKey(County, on_delete=models.CASCADE)
    date = models.DateField()
    

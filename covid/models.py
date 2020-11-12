from django.db import models

# Create your models here.

class State(models.Model):
    name = models.CharField(max_length=50, db_index=True, unique=True)
    initials = models.CharField(max_length=2, blank=True)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.__str__()

class County(models.Model):
    name = models.CharField(max_length=50, db_index=True)
    state = models.ForeignKey(State, on_delete=models.CASCADE)

    def __str(self):
        return self.name + ', ' + self.state.name

    def __repr__(self):
        return self.__str__()

    class Meta:
        unique_together = ('name', 'state')

class DailyDatum(models.Model):
    case_count = models.IntegerField()
    death_count = models.IntegerField()
    county = models.ForeignKey(County, on_delete=models.CASCADE)
    date = models.DateField()
    

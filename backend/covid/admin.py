from django.contrib import admin
from covid import models

# Register your models here.

admin.site.register(models.State)
admin.site.register(models.County)

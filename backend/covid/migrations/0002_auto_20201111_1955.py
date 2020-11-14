# Generated by Django 3.1.3 on 2020-11-11 19:55

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('covid', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='dailydatum',
            name='date',
            field=models.DateField(default=datetime.date(2020, 11, 11)),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='state',
            name='initials',
            field=models.CharField(blank=True, max_length=2),
        ),
    ]
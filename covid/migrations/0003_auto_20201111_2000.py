# Generated by Django 3.1.3 on 2020-11-11 20:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('covid', '0002_auto_20201111_1955'),
    ]

    operations = [
        migrations.AlterField(
            model_name='county',
            name='name',
            field=models.CharField(db_index=True, max_length=50),
        ),
        migrations.AlterField(
            model_name='state',
            name='name',
            field=models.CharField(db_index=True, max_length=50),
        ),
    ]

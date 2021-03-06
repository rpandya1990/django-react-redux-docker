# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2020-03-29 07:40
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AppList',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('record_create_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('record_update_time', models.DateTimeField(auto_now=True)),
                ('category', models.CharField(default='main', max_length=100)),
                ('name', models.CharField(max_length=12)),
                ('link', models.CharField(max_length=1024)),
                ('icon_name', models.CharField(max_length=100)),
                ('custom_icon_link', models.CharField(blank=True, max_length=1024, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]

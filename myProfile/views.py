from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

# Create your views here.

def hello_world(request):
    return HttpResponse("Hello World!")

def profile(request):
    template = loader.get_template('myProfile/profile.html')
    context = {
        'context': 42
    }
    return HttpResponse(template.render(context, request))

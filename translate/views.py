# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
import requests
from django.shortcuts import render
from django.http import HttpResponse
from apps import TranslateConfig
from django.views.decorators.csrf import csrf_exempt
# Create your views here.

@csrf_exempt
def translate(request):
    try:
        if request.method == 'POST':
            payload = {}
            print request.body
            payload['source'] = request.POST['source']
            payload['target'] = request.POST['target']
            payload['sourceText'] = request.POST['sourceText']
            url = 'http://fanyi.qq.com/api/translate'
            html=requests.post(url, payload)
            print html.content
            response_data = html.content
        return HttpResponse(response_data, content_type="application/json")
    except Exception, e:

        return HttpResponse(e)

def do(request):
    url='http://fanyi.qq.com/api/translate'


def index(request):
    try:
        if request.method == 'GET':
            return render(request, 'translate/index.html')
    except Exception, e:
        return HttpResponse(e)
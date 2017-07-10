# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import hashlib
from django.shortcuts import render
from django.http import HttpResponse
# Create your views here.
def index(request):
    return HttpResponse("wechat modules is developing !")


def token(request):
    if request.method == 'GET':
        print request.body
        signature = request.GET.get('signature', None)
        print signature
        timestamp = request.GET.get('timestamp', None)
        print timestamp
        nonce = request.GET.get('nonce', None)
        echostr = request.GET.get('echostr', None)
        token = 'katios'
        tmp_list = [token, timestamp, nonce]
        tmp_list.sort()
        sha1 = hashlib.sha1()
        map(sha1.update, tmp_list)
        hashcode = sha1.hexdigest()
        if hashcode == signature:
            return HttpResponse(echostr)
    if request.method == 'POST':
        print 456
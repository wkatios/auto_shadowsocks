#coding=utf-8

import os
print os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
print os.path.abspath(__file__)
print os.path.dirname(os.path.abspath(__file__))
print os.path.join('qqq''css')
def application(env, start_response):
    start_response('200 OK', [('Content-Type','text/html')])
    return [b"Hello World"]

SITE_ROOT=os.path.join(os.path.abspath(os.path.dirname(__file__)),)
print SITE_ROOT
STATIC_ROOT = os.path.join(SITE_ROOT,'static')
print STATIC_ROOT
print os.path.join(STATIC_ROOT,'css')
#application()

from django.conf.urls import url
from django.contrib import admin
from views import *
urlpatterns = [
    url(r'^$', index),
    url(r'katios/', wx),
    url(r'getqrcode/', getqrcode),
    url(r'geturl/', geturl),
    url(r'send_mail/', send_mail_get_newdomain),
]
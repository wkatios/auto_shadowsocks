"""auto_ss URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
#from django.conf.urls import url
from django.conf.urls import include, url
from django.contrib import admin
from ss_update import views as ss
from translate import views as ts
urlpatterns = [
    url(r'^ss',include('ss_update.urls')),
    url(r'^translate',include('translate.urls')),
    url(r'^$', ss.index),
    #url(r'^katios/', ss.wx),
    #url(r'^getqrcode/', ss.getqrcode,name='123'),
    #url(r'^geturl/', ss.geturl),
    #url(r'^send_mail/', ss.send_mail_get_newdomain),

    #url(r'^test/', ts.translate),
    url(r'^admin/', admin.site.urls),
]

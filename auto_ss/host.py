from django_hosts import patterns, host
from django.conf import settings
from ss_update import views as ss
from translate import views as ts

host_patterns = patterns('',
    host(r'www', 'ss_update.urls', name='www'),
    host(r'translate', 'translate.urls', name='translate'),

    #host(r'^static/(?P<path>.*)$','django.views.static.serve',{'document.root':settings.STATICFILES_DIRS}),
)
#coding=utf-8
from __future__ import unicode_literals

from django.test import TestCase

# Create your tests here.
import os
import ConfigParser

cp = ConfigParser.ConfigParser()
conf_path = os.path.dirname(os.path.abspath(__file__)) + '/conf.ini'
cp.read(conf_path)

print cp,type(cp)
print conf_path
appId = cp.get('weixin','TOKEN')
print appId
print cp.options("weixin")
cp.remove_section('hah')
cp.write(open('conf.ini','w'))

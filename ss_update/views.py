#coding=utf-8
from __future__ import unicode_literals

import re
import json
import yagmail
import poplib
import logging
import requests
LOG = logging.getLogger('main')
from email import parser



from django.shortcuts import render
from django.http import HttpResponse
from django.core.mail import send_mail

from django.utils.encoding import smart_unicode
from django.utils.encoding import smart_str
# Create your views here.
def index(request):
    return HttpResponse("who are you!")

def geturl(request):
    '''
    get free shadowsocks website's url
    :return: url
    '''
    try:
        if request.method == 'GET':
            url=get_ss_url()
            response_data = {'url':url}
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except Exception, e:
        LOG.error(e)
        return HttpResponse(e)

def send_mail_get_newdomain(request):
    '''
    send mail to autor of the website 
    to get new adress of website
    :return: 
    '''
    send_mail('get_ss', 'get_ss', 'wkatios<wxjytesting@163.com>',
              ['admin@ishadowsocks.com'], fail_silently=False)
    return HttpResponse(json.dumps({'result':'success'}), content_type="application/json")

def get_ss_url():
    host = 'pop.163.com'
    username = 'wxjytesting@163.com'
    password = '123456wk'
    pop_conn = poplib.POP3_SSL(host)
    pop_conn.user(username)
    pop_conn.pass_(password)
    #print('Messages: %s. Size: %s' % pop_conn.stat())
    resp, mails, octets = pop_conn.list()
    index =len(mails)
    # Get messages from server:
    resp, lines, octets = pop_conn.retr(index)
    msg_content = '\r\n'.join(lines)
    # Concat message pieces:
    msg = parser.Parser().parsestr(msg_content)
    #print type(msg),msg
    subject = msg.get('subject')
    subject=subject.replace('=?UTF-8?B?','')
    subject=subject.replace('?=','')
    #print subject
    #print base64.decodestring(subject) # 对字符串解码
    content =msg.get_payload(decode=True)
    url = re.search(r'[a-zA-z]+://[^\s]*',content)
    ss_url = url.group().replace('"','')
    # Parse message intom an email object:
    pop_conn.quit()
    return ss_url


def send_yagmail(request):
    #runtime = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
    host=smart_str('smtp.163.com')
    port =smart_str('25')
    yag = yagmail.SMTP(user='wxjytesting@163.com', password='123456wk', host=host, port=port)
    to_list = ['admin@ishadowsocks.com', ]
    yag.send(to=to_list, headers={'From': 'katios<wxjytesting@163.com>;'}, subject='get_ss', contents='get_ss')

def getqrcode(request):
    pictures = ['usa', 'usb', 'usc', 'jpa', 'jpb', 'jpc', 'sga', 'sgb', 'sgc']
    # result = requests.get('https://katios.xyz:80/geturl')
    url = get_ss_url()
    # return render(request, 'ss_update/index.html')
    return render(request, 'ss_update/qrcode.html', {'url': url, 'pictures': pictures})

import hashlib
def wx(request):
    if request.method == 'GET':
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
import os
def testSchedule():
    path = os.path.abspath('.')
    shell = 'echo aaa >> ~/crontab'.format(path)
    os.system(shell)


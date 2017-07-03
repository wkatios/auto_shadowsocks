#coding=utf-8
import yagmail
from email import parser
import time, datetime
from django.utils.encoding import smart_unicode
from django.utils.encoding import smart_str
'''
sendmail() to send a mail for new website
'''

def sendmail():
    try:
        runtime = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
        host=smart_str('smtp.163.com')
        port =smart_str('25')
        yag = yagmail.SMTP(user='wxjytesting@163.com', password='123456wk', host=host, port=port)
        to_list = ['admin@ishadowsocks.com', ]
        yag.send(to=to_list, headers={'From': 'katios<wxjytesting@163.com>;'}, subject='get_ss', contents='get_ss')
        print runtime,'    send mail success'
    except e:
        print runtime, '    send mail failed'
import unittest

import webapp2
import cgi
import datetime
import urllib
import webapp2
import jinja2
import os
import json
import logging

from StringIO import StringIO
from google.appengine.ext.webapp import Request
from google.appengine.ext.webapp import Response
from google.appengine.api import memcache
from google.appengine.ext import testbed
from google.appengine.ext import ndb
from google.appengine.api import channel
from google.appengine.api import users

from main import *

class TestUserObj:
    def __init__(self):
        self.name = 'tester'
        self.id = 1234567890
    def nickname(self):
        return self.name
    def user_id(self):
        return self.id

class Test(unittest.TestCase):
    def setUp(self):
        self.user = TestUserObj()
        self.newUser = AppUser(nickname='testuser1@test.com',
            musics=[1,2,3], movies=[4,5,6],games=[7,8,9],
            sports=[1,2,3],longitude=99.99, latitude=11.11)
        self.newUser.put()
        self.newUser2 = AppUser(nickname='testuser2@test.com',
            musics=[1,2,3], movies=[4,5,6],games=[7,8,9],
            sports=[1,2,3],longitude=99.99, latitude=11.11)
        self.newUser2.put()

    def test_main_page_get_with_user_notnone(self):
        user = self.user
        requestUrl = 'www.testuri.com'
        token = 'testtoken'
        ret = handleTestMainPageGet(requestUrl, token, user)
        self.assertTrue(ret is not None)
        self.assertEqual(ret['token'], token)
        self.assertEqual(ret['logoutUrl'], requestUrl)
        self.assertEqual(ret['nickname'], user.nickname())

    def test_user_handler_get_with_exist_user(self):
        username = 'testuser1@test.com'
        response = userHandlerGet(username)
        self.assertTrue(response is not None)
        json_resp = json.loads(response)
        logging.info(json_resp)
        self.assertEqual(json_resp['movies'],[4,5,6])
        self.assertEqual(json_resp['musics'],[1,2,3])
        self.assertEqual(json_resp['games'],[7,8,9])
        self.assertEqual(json_resp['sports'],[1,2,3])

    def test_user_handler_get_with_nonexist_user(self):
        username = 'nonexistuser@test.com'
        response = userHandlerGet(username)
        self.assertTrue(response is not None)
        self.assertEqual(response, 'error')

    def test_user_handler_post(self):
        test_req = '{"nickname":"testuser2@test.com","musics":[1,6,8],"movies":[2,3,4], "games":[3,4,5], "sports":[4,5,6]}'
        userHandlerPost(test_req)
        q = AppUser.query(AppUser.nickname=='testuser2@test.com')
        u = q.get()
        self.assertTrue(memcache.get('interests'+'testuser2@test.com') is not None)
        self.assertEqual(u.musics, [1,6,8])
        self.assertEqual(u.movies, [2,3,4])
        self.assertEqual(u.games, [3,4,5])
        self.assertEqual(u.sports, [4,5,6])

    def test_user_create_handler_post_exsit_user(self):
        json_resp = {"nickname":"testuser1@test.com", "longitude":12.34,"latitude":56.78}
        userCreateHandlerPost(json_resp, None)
        q = AppUser.query(AppUser.nickname==self.newUser.nickname)
        u = q.get()
        self.assertEqual(u.longitude, 12.34)
        self.assertEqual(u.latitude, 56.78)

    def test_user_create_handler_post_nonexsit_user(self):
        json_resp = {"nickname":"nonexistuser@test.com", "longitude":12.34,"latitude":56.78}
        userCreateHandlerPost(json_resp, None)
        q = AppUser.query(AppUser.nickname=='nonexistuser@test.com')
        self.assertTrue(q is not None)
        u = q.get()
        self.assertEqual(u.longitude, 12.34)
        self.assertEqual(u.latitude, 56.78)

    def test_common_elements_with_empty_arr(self):
        intArr1 = [1,3,4,5,6,7,8,9]
        intArr2 = []
        common = common_elements(intArr1, intArr2)
        self.assertTrue(common is not None)
        self.assertEqual(common, [])

    def test_common_elements_with_no_common(self):
        intArr1 = [1,3,4,5,7,9]
        intArr2 = [2,6,8]
        common = common_elements(intArr1, intArr2)
        self.assertTrue(common is not None)
        self.assertEqual(common, [])

    def test_common_elements_with_multi_common(self):
        intArr1 = [1,3,4,5,7,9]
        intArr2 = [3,4,5,7,8,9,2]
        common = common_elements(intArr1, intArr2)
        self.assertTrue(common is not None)
        self.assertEqual(common, [3,4,5,7,9])

    def test_is_nearby(self):
        isNear = isNearBy(1.455,1.45,1.5,1.5)
        self.assertTrue(isNear)
        isNear = isNearBy(1.5,1.45,1.5,1.5)
        self.assertFalse(isNear)

    def test_find_near_people(self):
        longitude=99.99
        latitude=11.11
        ppl = findNearPeople(longitude, latitude, self.newUser)
        self.assertTrue(ppl is not None)
        self.assertEqual(len(ppl), 1)
        

    def test_find_people_handler_get(self):
        resp = findPeopleHandlerGet(self.newUser.nickname)
        self.assertTrue(resp is not None)
        json_resp = json.loads(resp)
        self.assertEqual(len(json_resp),1)
        self.assertEqual(json_resp[0]["nickname"], self.newUser2.nickname)

    def tearDown(self):
        q = AppUser.query(AppUser.nickname==self.newUser.nickname)
        q.get().key.delete()

        q = AppUser.query(AppUser.nickname==self.newUser2.nickname)
        q.get().key.delete()

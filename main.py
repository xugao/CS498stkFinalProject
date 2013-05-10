#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import cgi
import datetime
import urllib
import webapp2
import jinja2
import os
import json
import logging

from google.appengine.ext import ndb
from google.appengine.api import channel
from google.appengine.api import memcache
from google.appengine.api import users


jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

def handleTestMainPageGet(requestUrl, token, user):

    template_values = {
      'token' : token,
      'logoutUrl':requestUrl,
      'nickname': user.nickname(),
    }
    return template_values

def checkUserLoggedIn(self, user):
    if not user:
        self.redirect(users.create_login_url(self.request.uri))
        return False
    return True

class MainPage(webapp2.RequestHandler):
    def get(self): 
        user = users.get_current_user()
        if checkUserLoggedIn(self, user):
            token = channel.create_channel(user.nickname() + user.user_id())
            ret = handleTestMainPageGet(users.create_logout_url(self.request.uri), token, user)
            template = jinja_environment.get_template('index.html')
            self.response.out.write(template.render(ret))

class AboutHandler(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()    
        if checkUserLoggedIn(self, user):
            template_values = {
              'logoutUrl':users.create_login_url(self.request.uri),
              'nickname': user.nickname(),
            }

            template = jinja_environment.get_template('about.html')
            self.response.out.write(template.render(template_values))

#ndb models
class AppUser(ndb.Model):
    nickname = ndb.StringProperty()
    user = ndb.UserProperty()
    musics = ndb.IntegerProperty(repeated=True)
    movies = ndb.IntegerProperty(repeated=True)
    games = ndb.IntegerProperty(repeated=True)
    sports = ndb.IntegerProperty(repeated=True)
    longitude = ndb.FloatProperty()
    latitude = ndb.FloatProperty()


def isValidUser(nickname):
    curr_nickname = users.get_current_user().nickname()
    if nickname == curr_nickname:
        return True
    return False

def userHandlerGet(name):
    cacheKey = 'interests' + name 
    interests = memcache.get(cacheKey)
    retVal = ""
    if interests is not None:
        retVal = interests
    else:
        q = AppUser.query(AppUser.nickname==name)

        if q.count() > 0:
            logging.info("q count is larger than 0");
            u = q.get()
            user_info = {
                "nickname:": u.nickname,
                "musics" : u.musics,
                "movies" : u.movies,
                "games" : u.games,
                "sports" : u.sports
            }
            info_str = json.dumps(user_info, separators=(',', ':'))
            memcache.add(cacheKey, info_str, 1800)
            retVal = info_str
        else:
            retVal = 'error'
    return retVal

def userHandlerPost(request):
    json_req = json.loads(request)
    name = json_req["nickname"]
    cacheKey = 'interests' + name 

    musics = json_req["musics"]
    movies = json_req["movies"]
    games = json_req["games"]
    sports = json_req["sports"]
    q = AppUser.query(AppUser.nickname==name)

    if q.count() > 0:
        u = q.get()
        u.musics = musics
        u.movies = movies
        u.games = games
        u.sports = sports
        u.put()

    if memcache.get(cacheKey) is not None:
        memcache.set(cacheKey,request, 1800)
    else:
        memcache.add(cacheKey, request, 1800)

class UserHandler(webapp2.RequestHandler):
    def get(self):
        name = self.request.get('nickname')
        self.response.write(userHandlerGet(name))

    def post(self): #update user's interests
        request = self.request.body
        json_req = json.loads(request)
        name = json_req["nickname"] 
        curr_nickname = users.get_current_user().nickname()
        if not isValidUser(name):
            self.response.write('error')
            return
        userHandlerPost(request)

def userCreateHandlerPost(json_req, curr_user):
    name = json_req["nickname"]
    q = AppUser.query(AppUser.nickname==name)
    lo = float(json_req["longitude"])
    la = float(json_req["latitude"])
    if q.count() <= 0:
        newuser = AppUser(nickname=name,user=curr_user,
            longitude=lo,latitude=la)
        newuser.put()
    else :
        user=q.get()
        user.longitude = lo
        user.latitude = la
        user.put()

class UserCreateHandler(webapp2.RequestHandler):
    def post(self):
        request = self.request.body
        json_req = json.loads(request)
        name = json_req["nickname"]
        if not isValidUser(name):
            self.response.write('error')
            return
        userCreateHandlerPost(json_req, users.get_current_user())

def common_elements(a, b):
   #find common integers in two int arrays
    a.sort()
    b.sort()
    i, j = 0, 0
    common = []
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            common.append(a[i])
            i += 1
            j += 1
        elif a[i] < b[j]:
            i += 1
        else:
            j += 1
    return common

def isNearBy(lo1, lo2, la1, la2):
    #1 degree diff in lo/la == 69 miles
    MILE_PER_DEGREE = 69.0
    NEARBY_BOUND = 9.0
    lo_diff = abs(lo2 - lo1) * MILE_PER_DEGREE
    la_diff = abs(la2 - la1) * MILE_PER_DEGREE
    total_diff = lo_diff * lo_diff + la_diff * la_diff
    return total_diff <= NEARBY_BOUND

#find someone who have 5 or more commons in interests
#return a list of people and their shared commons
def findNearPeople(lo, la, user):
    all_users = AppUser.query()
    people_found = []
    backup = []
    MIN_NUM_COMMONS = 3
    for other in all_users:
        if (other.nickname != user.nickname) and isNearBy(other.longitude, user.longitude,other.latitude, user.latitude):
            common_musics = common_elements(other.musics, user.musics)
            common_movies = common_elements(other.movies, user.movies)
            common_games = common_elements(other.games, user.games)
            common_sports = common_elements(other.sports, user.sports)
            num_commons = len(common_musics) + len(common_movies) + len(common_games) + len(common_sports)
            common_interests = {
                    "nickname" : other.nickname,
                    "musics" : common_musics,
                    "movies" : common_movies,
                    "games" : common_games,
                    "sports" : common_sports
                }
            if num_commons >= MIN_NUM_COMMONS:
                people_found.append(common_interests)
            backup.append(common_interests)
    if len(people_found) == 0:
        return backup
    return people_found


def findPeopleHandlerGet(name):
    q = AppUser.query(AppUser.nickname==name)
    if q.count() > 0:
        u = q.get()
        lo = u.longitude
        la = u.latitude
        people = findNearPeople(lo, la, u)
        return json.dumps(people)
    return None

class FindPeopleHandler(webapp2.RequestHandler):
    def get(self):
        name = self.request.get('nickname')
        self.response.out.write(findPeopleHandlerGet(name))

class LookAroundHandler(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()      
        if checkUserLoggedIn(self, user):
            token = channel.create_channel(user.nickname() + user.user_id())
            template_values = {
                'nickname': user.nickname(),
                'token' : token
            }
            template = jinja_environment.get_template('lookaround.html')
            self.response.out.write(template.render(template_values))

class ChatOpenHandler(webapp2.RequestHandler):
    def get(self):        
        name = self.request.get('nickname')
        chatWith = self.request.get('other')
        if not isValidUser(name):
            self.response.write('error')
            return
        token = channel.create_channel(name + users.get_current_user().user_id())

        template_values = {'token': token,
                       'nickname': name,
                       'other': chatWith}
        template = jinja_environment.get_template('chat.html')
        self.response.out.write(template.render(template_values))

    def post(self):
        request = self.request.body
        json_req = json.loads(request)
        name = json_req["nickname"]
        chatWith = json_req["other"]
        msg = json_req["message"]
        msgJsonObj = {"sender": name, "message" : msg}
        if not isValidUser(name):
            self.response.write('error')
            return
        q = AppUser.query(AppUser.nickname==chatWith)
        if q.count() > 0:
            u = q.get()
            otherNickname = u.user.nickname()
            otherUserId = u.user.user_id()
            channel.send_message(otherNickname + otherUserId, json.dumps(msgJsonObj))

class viewUserHandler(webapp2.RequestHandler):
    def get(self):        
        name = self.request.get('nickname')
        cacheKey = 'interests' + name
        userinfo = memcache.get(cacheKey)
        if userinfo is not None:        
            template = jinja_environment.get_template('/viewUser.html')
            self.response.out.write(template.render(json.loads(userinfo)))
            return

        q = AppUser.query(AppUser.nickname==name)
        logging.info(q)
    
        if q.count() > 0:
            logging.info("q count is larger than 0");
            u = q.get()

            user_info = {
                'nickname': u.nickname,
                'musics' : u.musics,
                'movies' : u.movies,
                'games' : u.games,
                'sports' : u.sports
            }
            info_str = json.dumps(user_info, separators=(',', ':'))
            memcache.add(cacheKey, info_str, 1800)
            template = jinja_environment.get_template('/viewUser.html')
            self.response.out.write(template.render(user_info))
        else:
            self.response.write('error')

class testJSHandler(webapp2.RequestHandler):
    def get(self): 
        user_info = {}
        template = jinja_environment.get_template('/qunitTest.html')
        self.response.out.write(template.render(user_info))
      

app = webapp2.WSGIApplication([('/', MainPage), 
                                ('/jstest', testJSHandler),
                                ('/about', AboutHandler),
                                ('/user', UserHandler),
                                ('/createuser',UserCreateHandler),
                                ('/findpeople',FindPeopleHandler),
                                ('/lookaround',LookAroundHandler), 
                                ('/chat', ChatOpenHandler),
                                ('/viewUser', viewUserHandler)],
                                debug=True)
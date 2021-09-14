#==========================================================
        #Import Packages
# ==========================================================
import os
from database.models import *
import flask_sqlalchemy
import flask_praetorian
import flask_cors
from flask_restful import  reqparse
from datetime import datetime, timezone
import dateutil.parser
from calendar import monthrange
import flask
from __init__ import web_app, db, guard, cors
from database.sql_tools import *
from flask import Blueprint

login_api = Blueprint('login_api', __name__)
signup_api = Blueprint('signup_api', __name__)
refresh_token_api = Blueprint('refresh_token_api', __name__)

#==========================================================
        #Login
#==========================================================
@login_api.route('/api/login', methods=['POST'])
def login():
    req = flask.request.get_json(force=True)
    email = req.get('email', None)
    password = req.get('password', None)
    
    if db.session.query(User).filter_by(email=email).count() < 1:
        print("User doesn't exist??")
        ret = {'message': "User with email not in database. Please Sign Up first!", 'status': 401}
        return flask.jsonify(ret)
    user = guard.authenticate(email, password)
    ret = {'access_token': guard.encode_jwt_token(user), 'status': 200}
    return flask.jsonify(ret)

#==========================================================
        #Signup
#==========================================================
@signup_api.route('/api/signup', methods=['POST'])
def signup():
    req = flask.request.get_json(force=True)
    email = req.get('email', None)
    password = req.get('password', None)

    phone = firstName = lastName = skills = None  # placeholders for now
    if db.session.query(User).filter_by(email=email).count() < 1:
        pwd = guard.hash_password(password)
        sql_create_user(email, phone, pwd, firstName, lastName, skills)
    else:
        print("User already exists!! redirect to sign in??")
        ret = {'message': "User with email already exists. Please use another email.", 'status': 400}
        return flask.jsonify(ret)
    try:
        user = guard.authenticate(email, password)
        ret = {'access_token': guard.encode_jwt_token(user), 'status': 200}
        newconnection1 = Connections(mainuserid=user.id
                                , connecteduserid=user.id
                                , connectionstatus=1)     
        db.session.add(newconnection1)
        db.session.commit()
        return flask.jsonify(ret)
    except Exception as e:
        ret = {'message': "Failed to log in. Authentication failed.", 'status': 500}
        return flask.jsonify(ret)
        
#==========================================================
        #Refresh
#==========================================================
@refresh_token_api.route('/api/refresh', methods=['POST'])
def refresh():
    old_token = flask.request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token, 'status': 200}
    return flask.jsonify(ret)
#==========================================================
        #Import Packages
#==========================================================
import os
from database.models import *
import flask_sqlalchemy
from flask_restful import  reqparse
from datetime import datetime, timezone
import dateutil.parser
from calendar import monthrange
import flask
import flask_praetorian
from __init__ import web_app, db, guard, cors
from database.sql_tools import *
from flask import Blueprint


write_profile_api = Blueprint('write_profile_api', __name__)
get_profile_api = Blueprint('get_profile_api', __name__)
delete_profile_api = Blueprint('delete_profile_api', __name__)

#==========================================================
        #Provide formatted profile for return
#==========================================================

def formatProfile():
    features = {}
    
    features['id'] = flask_praetorian.current_user().id
    features['busyness'] = flask_praetorian.current_user().business
        
    if flask_praetorian.current_user().phone:
        features['phone'] = flask_praetorian.current_user().phone
    else:
        features['phone'] = ''
    if flask_praetorian.current_user().skills:
        features['skills'] = flask_praetorian.current_user().skills
    else:
        features['skills'] = ''
    if flask_praetorian.current_user().firstName:
        features['firstName'] = flask_praetorian.current_user().firstName
    else:
        features['firstName'] = ''
    if flask_praetorian.current_user().lastName:
        features['lastName'] = flask_praetorian.current_user().lastName
    else:
        features['lastName'] = ''
    if flask_praetorian.current_user().email:
        features['email'] = flask_praetorian.current_user().email
    else:
        features['email'] = ''
    if flask_praetorian.current_user().password:
        features['password'] = flask_praetorian.current_user().password
    else:
        features['password'] = ''
    return features


#==========================================================
        #Edit user profile
#==========================================================
@write_profile_api.route('/api/profiles', methods=['POST'])
@flask_praetorian.auth_required
def writeProfile():
    req = flask.request.get_json(force=True)

    phone = req.get('phone', None)
    password = req.get('password', None)
    skills = req.get('skills', None)
    firstName = req.get('firstName', "")
    lastName = req.get('lastName', "")

    features = {}
    features['phone'] = phone
    features['skills'] = skills
    features['firstName'] = firstName
    features['lastName'] = lastName
    features['email'] = flask_praetorian.current_user().email

    if password:
        features.update({'password': guard.hash_password(password)})
    sql_update_user(flask_praetorian.current_user().id, features)
    return flask.jsonify(formatProfile()), 200


#==========================================================
        #View user profile
#==========================================================
@get_profile_api.route('/api/profile', methods=['GET'])
@flask_praetorian.auth_required
def getProfile():
    return flask.jsonify(formatProfile()), 200

#==========================================================
        #Delete user profile
#==========================================================
@delete_profile_api.route('/api/profile', methods=['DELETE'])
@flask_praetorian.auth_required
def deleteProfile():
    try:
        userid = flask_praetorian.current_user().id
        sql_delete_user(userid)
        session = db.session()
        session.query(Connections). \
                filter((Connections.connecteduserid == userid)| (Connections.connecteduserid == userid)) \
                .delete()
        session.commit()
        ret = {'message': 'User deleted from database', 'status': 200}
        return flask.jsonify(ret), 200
    except Exception as e:
        ret = {'message': 'User failed to be deleted from database', 'status': 500}
        return flask.jsonify(ret), 500
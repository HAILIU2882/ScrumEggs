
#==========================================================
  #import all the packages
#==========================================================
import os
from calendar import monthrange
import flask_sqlalchemy
import flask_cors
from __init__ import web_app, db, guard, cors
from database.models import *
from datetime import datetime, timezone
from flask import blueprints, request

import flask
import flask_praetorian
from database.sql_tools import *
from flask_restful import reqparse
import dateutil.parser
from flask import Blueprint, abort

                    ########################################
                    #  Endpoints for Connection management
                    ########################################
connected_people_api = Blueprint('connected_people_api', __name__)
get_user_profile_api = Blueprint('get_user_profile_api', __name__)
update_connection_api = Blueprint('update_connection_api', __name__)
all_people_connection_api = Blueprint('all_people_connection_api', __name__)  # not connected yet
pending_connection_api = Blueprint('pending_connection_api', __name__)  # not connected yet
pending_connection_requestsN_api = Blueprint('pending_connection_requestsN_api', __name__) 


#=============================================================
    # Responds to My Network connected user list, calls sql function in sql_tools
# ============================================================
@connected_people_api.route('/connections/connected', methods=['GET'])
@flask_praetorian.auth_required
def getConnectedPeople():
    userid = flask_praetorian.current_user().id
    rows = sql_get_connected_users(userid, 'Connected')
    print(rows)
    return flask.jsonify(rows), 200


#=============================================================
    # View connected user details
# ============================================================
@get_user_profile_api.route('/people/<string:user_id>', methods=['GET'])
@flask_praetorian.auth_required
def getUserProfile(user_id):
    print("user's id is: ", user_id)
    currentuserid = flask_praetorian.current_user().id
    rows = sql_get_connection_profile(user_id, currentuserid)

    return flask.jsonify(rows), 200


#=============================================================
    # Update connections- corresponds to 5 buttons in connections details
# ============================================================
# WITHDRAWAL/REJECT/DISCONNECT  buttons  - status 0
# ACCEPT button - both connections change to 1
# CONNECT button - pass through status 2
# requester is the main user, status = 2
# requestee is the connecteduser, status = 3
@update_connection_api.route('/statusconnect/<string:user_id>/<string:new_status>', methods=['PUT'])
@flask_praetorian.auth_required
def updateConnection(user_id, new_status):
    print(new_status)
    connection_dict = {"Not Connected": 0, "Connected": 1, "Request Sent": 2, "Request Received": 3}
    mainuserid = flask_praetorian.current_user().id
    print(f"Change {mainuserid} and {user_id} pair to new status {new_status}")

    try:
        sql_update_connection(user_id, mainuserid, connection_dict[new_status])
        print("hello there")
        return flask.jsonify({'response': 'connection updated', 'status code': '200'})
    except:
        return flask.jsonify({'status code': '404'})

#=============================================================
    # fetch all users with their connections status with current user
# ============================================================
# NO input required, it will read current userid, output format in function example
# this function is to get All button content in connections,
# list of users :
#       that are not currently connected to user
#       will include pending connections ( status code 2)
@all_people_connection_api.route('/connections/all', methods=['GET'])
@flask_praetorian.auth_required
def getAllPeopleforConnection():
    userid = flask_praetorian.current_user().id
    print(userid)
    rows = sql_get_all_to_connect_users(userid)
    order = {"Not Connected": 0, "Connected": 3, "Request Sent": 2, "Request Received": 1}
    
    rows_sorted = sorted(rows, key=lambda profile: (order[profile['connected']], 
                    profile['firstName']))

    for _ in rows_sorted : print(_)

    return flask.jsonify(rows_sorted), 200


#=============================================================
    # Get the list of pending connection users
# ============================================================
# NO input required, it will read current userid, output format in function example
# this function is to get Pending button content in connections,
# list of users with status code 2
@pending_connection_api.route('/connections/pending', methods=['GET'])
@flask_praetorian.auth_required
def getPendingConnections():
    userid = flask_praetorian.current_user().id
    print(userid)
    rows = sql_get_pending_connect_users(userid)
    
    order = {"Request Sent": 1, "Request Received": 0}
    rows_sorted = sorted(rows, key=lambda profile: (order[profile['connected']], 
                    profile['firstName']))
    
    return flask.jsonify(rows_sorted), 200

#=============================================================
    # helper function to return number of pending connections - signals the notification
# ============================================================
# this function is to provide number of pending requests
# list of users with status code 3
@pending_connection_requestsN_api.route('/invitations', methods=['GET'])
@flask_praetorian.auth_required
def getPendingRequestNumbers():
    userid = flask_praetorian.current_user().id
    rows = sql_get_pending_requestsN(userid)
    print('Number of invites is', len(rows))
    return flask.jsonify(len(rows)), 200


#All task processing funtions on this.

#==========================================================
        #Import Packages
# ==========================================================
import os
from calendar import monthrange
import flask_sqlalchemy
import flask_cors
#from __init__ import web_app, db, guard, cors
from database.models import *

from flask import request

import flask
import flask_praetorian
from database.sql_tools import *
from flask_restful import reqparse
import dateutil.parser
from flask import Blueprint, abort

#=================================================================
    #API Blueprint for task activities
#==================================================================

current_tasks_api = Blueprint('current_tasks_api', __name__)
mytasks_api = Blueprint('mytasks_api', __name__)
connected_tasks_api = Blueprint('connected_tasks_api', __name__)
historical_tasks_api = Blueprint('historical_tasks_api', __name__)
search_tasks_api = Blueprint('search_tasks_api', __name__)
create_task_api = Blueprint('create_task_api', __name__)  # to create a task
update_task_api = Blueprint('update_task_api', __name__)  # to update the task
delete_task_api = Blueprint('delete_task_api', __name__)  # to delete the task

''' "Not Started" (start state for new tasks), "In Progress", "Blocked", Completed".'''
''' Current - my tasks which are not started or in progress'''

#=================================================================
    # This function to Shows the Users task
#==================================================================
    #My Tasks and Tasks of all connected people that are NOT completed 
#====================================================================

@current_tasks_api.route('/mytasks', methods=['GET'])
@flask_praetorian.auth_required
def getBacklogTasks():
    assigneeid = flask_praetorian.current_user().id
    rows = sql_get_backlog_tasks(assigneeid)
    print(rows)
    if rows is None:
        return flask.jsonify([{"message": "Server error"}]), 500
    if not rows:
        return flask.jsonify([]), 204
    rows_sorted = sorted(rows, key=lambda k: k['deadline'])
    # update current user business
    features = {'business': estimation_stats(assigneeid)}
    sql_update_user(assigneeid, features)
    return flask.jsonify(rows_sorted), 200


#=================================================================
    #This function to shows all the task of connected people
#==================================================================
    #My Tasks and Tasks of all connected people completed tasks
#==================================================================
@connected_tasks_api.route('/mytasks/connected', methods=['GET'])
@flask_praetorian.auth_required
def getConnectedTasks():
    assigneeid = flask_praetorian.current_user().id
    rows = sql_get_connected_tasks(assigneeid)
    if rows is None:
        return flask.jsonify([{"message": "Server error"}]), 500
    if not rows:
        return flask.jsonify([]), 204
    rows_sorted = sorted(rows, key=lambda k: k['deadline'])
    return flask.jsonify(rows_sorted), 200

#=================================================================
    #This function to shows all historical task
#==================================================================
    #Need to make sure the search is not case-sensitive
#==================================================================
@historical_tasks_api.route('/mytasks/historical', methods=['GET'])
@flask_praetorian.auth_required
def getHistoricalTasks():
    assigneeid = flask_praetorian.current_user().id
    rows = sql_get_historical_tasks(assigneeid)
    if rows is None:
        return flask.jsonify([{"message": "Server error"}]), 500
    if not rows:
        return flask.jsonify([]), 204
    rows_sorted = sorted(rows, key=lambda k: k['deadline'])
    return flask.jsonify(rows_sorted), 200



#================================================================================
    #This function for search function, it request from the frontend
#===================================================================================
    

@search_tasks_api.route('/task/search/<string:find_tasks>', methods=['GET'])
@flask_praetorian.auth_required
def search(find_tasks):
    req = flask.json.loads(find_tasks)
    print(req)
    print(1)
    userid = flask_praetorian.current_user().id
    found_tasks = sql_search_task(userid,req['taskid'], req['title'], req['popularity'], req['priority'],\
                                  req['creator'],\
                                    (datetime.strptime(req['created_on_after'],"%Y-%m-%d %H:%M") if len(req['created_on_after'])> 0 else None),\
                                   (datetime.strptime(req['created_on_before'],"%Y-%m-%d %H:%M") if len(req['created_on_before'])> 0 else None),\
                                    ( datetime.strptime(req['deadline_after'],"%Y-%m-%d %H:%M")if len(req['deadline_after'])> 0 else None ),\
                                    (datetime.strptime(req['deadline_before'],"%Y-%m-%d %H:%M")if len(req['deadline_before'])> 0 else None ),\
                                    req['assignee'], req['status'] )
    print(found_tasks)
    
    if found_tasks is None:
        return flask.jsonify([]), 204
    found_tasks_sorted = sorted(found_tasks, key=lambda k: k['deadline'])
    return flask.jsonify(found_tasks_sorted), 200


# ======================================================================
# This function is for create a new task 
# =======================================================================
# request to create the task amd make a new task.
# =========================================================
#create task
#==================================================

@create_task_api.route('/task/create', methods=['POST'])  # to create a task
@flask_praetorian.auth_required
def createTask():
    # ========================= new task variables=============
    format = "%Y-%m-%d %H:%M"
    req = flask.request.get_json(force=True)
    print(req)
    title = req.get('title', None)
    description = req.get('description', None)
    priority = req.get('priority', None)
    deadline = datetime.strptime(req.get('deadline', None), format)  # format to datetime format
    status = req.get('status', None)
    assignee = req.get('assignee', None)
    assigneeid = sql_search_user(email=assignee)['id']
    popularity = 'Low'
    comments = req.get('comments', None)
    linkedfile = req.get('files', None)
    tags = req.get('tags', None)
    archived = 0
    viewcount = 0
    date_created = datetime.now()  # format to datetime format
    creator_email = flask_praetorian.current_user().email
    creator_id = flask_praetorian.current_user().id
    lastmodifiedbyemail = flask_praetorian.current_user().email
    lastmodifieddate = datetime.now()  # format to datetime format

    if sql_create_task(title, description, priority, deadline,
                       status, assignee, assigneeid, popularity, comments, linkedfile, tags,
                       archived, viewcount, date_created, creator_email, creator_id,
                       lastmodifiedbyemail, lastmodifieddate) == True:

        #print("Task Successfully created and added to database!")
        ret = {'message': "Task Successfully created!", 'status': 200}
        return flask.jsonify(ret)
    else:
        #print("Error! Task was not created, something went wrong")
        ret = {'message': "Mission failed, we'll get them next time.", 'status': 500}
        return flask.jsonify(ret)


# ================================================================
    # view task and used for popularity count
# ====================================================================

@mytasks_api.route('/task/view/<taskid>', methods=['GET'])
@flask_praetorian.auth_required
def viewTask(taskid):
    currentuserid = flask_praetorian.current_user().id
    try:
        task_obj = sql_view_task(taskid, currentuserid)
        task_obj['deadline'] = task_obj['deadline'].strftime("%Y-%m-%d %H:%M")
        task_obj['date_created'] = task_obj['date_created'].strftime("%Y-%m-%d %H:%M")
        task_obj['lastmodifieddate'] = task_obj['lastmodifieddate'].strftime("%Y-%m-%d %H:%M")
        print(task_obj)
        return flask.jsonify(task_obj)
    except Exception as e:
        print("Error! Task was not jsonified, something went wrong")
        print(e)
        ret = {'message': "Mission failed, we'll get them next time.", 'status': 500}
        return flask.jsonify(ret)


# ================================================================
    # This function is used to edit and update the task
# ====================================================================

@update_task_api.route('/task/edit/<taskid>', methods=['PUT'])  # to update the task
@flask_praetorian.auth_required
def edit_a_task(taskid):
    format = "%Y-%m-%d %H:%M"
    req = flask.request.get_json(force=True)
    taskid = req.get('taskid', None)
    title = req.get('title', "")
    description = req.get('description', "")
    priority = req.get('priority', "")
    deadline = datetime.strptime(req.get('deadline', ""), format)
    status = req.get('status', "")
    assignee = req.get('assignee', flask_praetorian.current_user().email)
    assigneeid = sql_search_user(email=assignee)['id']
    linkedfile = req.get('files', "")
    comments = req.get('comments', "")
    tags = req.get('tags', "")
    lastmodifiedbyemail = flask_praetorian.current_user().email
    lastmodifieddate = datetime.now()  # format to datetime format
    task = {"title": title,
            "description": description,
            "priority": priority,
            "deadline": deadline,
            "status": status,
            "assignee": assignee,
            "assigneeid": assigneeid,
            "linkedfile": linkedfile,
            "comments": comments,
            "tags": tags,
            "lastmodifiedbyemail": lastmodifiedbyemail,
            "lastmodifieddate": lastmodifieddate
            }

    edit_task = sql_update_task(taskid, task)

    if edit_task:
        #print("Task updated in database!")
        ret = {'message': "Task updated!", 'status': 200}
        return flask.jsonify(ret)
    else:
        #print("Error with task update!")
        ret = {'message': "Task failed to update", 'status': 500}
        return flask.jsonify(ret)

# ===================================================================
    # This function is use to delete the task
# =====================================================================

@delete_task_api.route('/task/delete/<taskid>', methods=['DELETE'])  # to delete the task
def deleteTask(taskid):
    try:
        task = Task.query.get(taskid)
        if task is None:
            #print('No Task fetched')
            abort(404)
        db.session.delete(task)
        db.session.commit()
    except Exception as e:
        #print("Failed to delete the task due to error :")
        print(e)
    return flask.jsonify({'result': True})
#=======================================================================================================

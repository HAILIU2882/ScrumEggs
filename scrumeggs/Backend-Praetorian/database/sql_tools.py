# create database in mysql server
# import mysql.connector as MySQLdb
from typing import ValuesView
from sqlalchemy.sql.functions import user
from __init__ import db
from database.models import *
from sqlalchemy import func
from datetime import datetime, timedelta

                    ########################################
                    #  User Related SQL functions   #
                    ########################################

#=============================================================
    # create a new user into User table
# ==============================================================
def sql_create_user(email, phone, password, firstname, lastname, skills):
    session = db.session()
    try:
        '''create the new user '''
        print((email, phone, password, firstname, lastname, skills))
        User_new = User(email=email, phone=phone, password=password, firstName=firstname, lastName=lastname,
                        skills=skills)
        print("trying to add user {}".format(email))
        print("neww user has {}".format(User_new))
        session.add(User_new)

        '''create self connection with the user'''
        newconnection = Connections(mainuserid=User_new.id
                                        , connecteduserid=User_new.id
                                        , connectionstatus=1)

        session.add(newconnection)
        session.commit()
        session.close()
        print('user creation successful')
        return True
    except Exception as e:
        session.rollback()
        print('Error is : {}'.format(e))
        print('user creation failed')
        return False

#=============================================================
    # feed a user's detail matching by id and email - unique result
# ==============================================================
def sql_search_user(id=None, email=None):
    session = db.session()
    try:
        if id != None:
            user = User.query.filter(User.id == id).first()
        else:
            user = User.query.filter(User.email == email).first()
        session.commit()
        if user:
            print('user search successful')
            return {'id': user.id,
                    'email': user.email,
                    'phone': user.phone,
                    'password': user.password,
                    'firstName': user.firstName,
                    'lastName': user.lastName,
                    'skills': user.skills,
                    'business': user.business,
                    'rolenames': user.rolenames,
                    'date_created': user.date_created.strftime("%Y/%m/%d, %H:%M")}
        else:
            return None
    except Exception as e:
        session.rollback()
        print('Error is : {}'.format(e))
        print('user search by id or email failed')
        return False

#=============================================================
    # update user information - userid and features
# ==============================================================
def sql_update_user(id, features):
    session = db.session()
    try:
        print("Updating features {}".format(features))

        User.query.filter_by(id=id).update(features)
        session.commit()
        print('user update successful')
        return True
    except Exception as e:
        session.rollback()
        print('Error is : {}'.format(e))
        print('user update failed')
        return False

#=============================================================
    # delete a user from User table
    # also delete all user connections
# ==============================================================
def sql_delete_user(id):
    print("Deleting UserID {} ".format(id))
    session = db.session()
    try:
        '''delete the user'''
        user = User.query.get(id)
        session.delete(user)
        session.commit()

        '''also delete all connections'''            
        session.query(Connections).\
            filter((Connections.mainuserid == id)|(Connections.connecteduserid == id)).\
            delete()

        print('user deleted')
        return True
    except Exception as e:
        session.rollback()
        print('Error is : {}'.format(e))
        print('user deletion failed')
        return False


                    ########################################
                    #  Tasks Related SQL functions   #
                    ########################################

#=============================================================
    # query user table to show info of connected users
# ==============================================================
def popularityConvertor(viewcount):
    if viewcount <= 10:
        return 'Low'
    elif viewcount <= 100:
        return 'Medium'
    else: 
        return 'High'

#=============================================================
    # search task function  #
# ==============================================================
def sql_search_task(mainuserid, taskid, title, popularity, priority, creator, created_on_after,created_on_before, deadline_after, deadline_before, assignee, status):
#def sql_search_task(mainuserid, taskid, title, popularity, priority, creator, date_created, assignee, deadline, status):
    # def sql_search_task(req):
    session = db.session()
    try:
        kwargs = {}

        if taskid:
            kwargs['taskid'] = int(taskid)

        # filter task to only the ones belowing to connected users
        connected_users = session.query(Connections.connecteduserid). \
            filter(Connections.mainuserid == mainuserid). \
            filter(Connections.connectionstatus == 1).all()
        connected_users_list = [_[0] for _ in connected_users]
        print(connected_users_list)
        tasks = Task.query.filter_by(**kwargs).\
                filter(Task.assigneeid.in_(connected_users_list))

    #===================================== search by deadline======================================================
        if deadline_after and  deadline_before:
            tasks = tasks.filter((Task.deadline >= deadline_after)&(Task.deadline <= deadline_before))
        elif deadline_after:
            tasks = tasks.filter(Task.deadline >= deadline_after)
        elif deadline_before:
            tasks = tasks.filter(Task.deadline <= deadline_before)
       
        #===============================search by created date======================================================
        if created_on_after and created_on_before :
             tasks = tasks.filter((Task.date_created <= created_on_after) & (Task.date_created >= created_on_before))
        elif created_on_after:
            tasks = tasks.filter(Task.date_created >= created_on_after)
        elif created_on_before:
            tasks = tasks.filter(Task.date_created <= created_on_before)
       
        #==============================================================================================
                
        if popularity.lower() == 'low':
            tasks = tasks.filter(Task.viewcount <= 10)
        elif popularity.lower() == 'medium':
            tasks = tasks.filter(Task.viewcount > 10).filter(Task.viewcount <= 100)
        elif popularity.lower() == 'high':
            tasks = tasks.filter(Task.viewcount > 100)

        if priority:
            tasks = tasks.filter(func.lower(Task.priority) == func.lower(priority))
        if status:
            tasks = tasks.filter(func.lower(Task.status) == func.lower(status))
        if title:
           tasks = tasks.filter(Task.title.contains(title))
        if assignee:
            tasks = tasks.filter(Task.assignee.contains(assignee))
        if creator:
            tasks = tasks.filter(Task.creator_email.contains(creator))
#=======================================================================================================
        tasks = tasks.all()
        print(tasks)
        session.commit()
        return [{'id': task.taskid,
                 'title': task.title,
                 'priority': task.priority,
                 'assignee': task.assignee,
                 'status': task.status,
                 'popularity': popularityConvertor(task.viewcount),
                 'deadline': task.deadline.strftime("%Y-%m-%d %H:%M"),
                 'creator': task.creator_email,
                 'date_created': task.date_created.strftime("%Y-%m-%d %H:%M")}
                for task in tasks]
    except Exception as e:
        session.rollback()
        print('Error is : {}'.format(e))
        return None
#===================================================================================================

#=============================================================
    # fetch a list of backlog tasks
# ==============================================================
def sql_get_backlog_tasks(id):
    session = db.session()
    try:
        tasks = Task.query. \
            filter(Task.assigneeid == id). \
            filter((Task.status == 'Not Started') | (Task.status == 'In Progress') | (Task.status == 'Blocked')).all()
        print(tasks)
        session.commit()
        return [{'id': task.taskid,
                 'title': task.title,
                 'assignee': task.assignee,
                 'priority': task.priority,
                 'deadline': task.deadline.strftime("%Y/%m/%d, %H:%M"),
                 'popularity': popularityConvertor(task.viewcount),
                 'status': task.status,
                 'creator': task.creator_email,
                 'date_created': task.date_created.strftime("%Y/%m/%d, %H:%M")}
                for task in tasks]
    except Exception as e:
        session.rollback()
        print('Error is : {}'.format(e))
        return None


#=============================================================
    # query Task table to get all tasks in connected users incl self
# ==============================================================
def sql_get_connected_tasks(id):
    session = db.session()
    try:
        tasks = Task.query. \
            join(Connections, Connections.connecteduserid == Task.assigneeid). \
            filter((Connections.mainuserid == id) & (Connections.connectionstatus ==1)). \
            filter(Task.status != 'Completed'). \
            order_by(Task.status, Connections.connecteduserid).all()
        session.commit()
        return [{'id': task.taskid,
                 'title': task.title,
                 'assignee': task.assignee,
                 'priority': task.priority,
                 'deadline': task.deadline.strftime("%Y/%m/%d, %H:%M"),
                 'popularity': popularityConvertor(task.viewcount),
                 'status': task.status,
                 'creator': task.creator_email,
                 'date_created': task.date_created.strftime("%Y/%m/%d, %H:%M")}
                for task in tasks]
    except Exception as e:
        session.rollback()
        print('Error is : {}'.format(e))
        return None


#=============================================================
    # query Task table to get historical(completed) tasks in connected users incl self
# ==============================================================
def sql_get_historical_tasks(id):
    print(id)
    session = db.session()
    try:
        tasks = Task.query. \
            join(Connections, Connections.connecteduserid == Task.assigneeid). \
            filter((Connections.mainuserid == id) & (Connections.connectionstatus ==1)). \
            filter(Task.status == 'Completed'). \
            order_by(Connections.connecteduserid).all()
        session.commit()
        return [{'id': task.taskid,
                 'title': task.title,
                 'assignee': task.assignee,
                 'priority': task.priority,
                 'deadline': task.deadline.strftime("%Y/%m/%d, %H:%M"),
                 'popularity': popularityConvertor(task.viewcount),
                 'status': task.status,
                 'creator': task.creator_email,
                 'viewcount': task.viewcount,
                 'date_created': task.date_created.strftime("%Y/%m/%d, %H:%M")}
                for task in tasks]
    except Exception as e:
        session.rollback()
        print('Error is : {}'.format(e))
        return None


#=============================================================
    # create a task
# ==============================================================
def sql_create_task(title, description, priority, deadline,
                    status, assignee, assigneeid, popularity, comments, linkedfile, tags,
                    archived, viewcount, date_created, creator_email, creator_id,
                    lastmodifiedbyemail, lastmodifieddate):
    session = db.session()
    try:
        new_task = Task(title=title,
                        description=description,
                        priority=priority,
                        deadline=deadline,
                        status=status,
                        assignee=assignee,
                        assigneeid=assigneeid,
                        popularity=popularity,
                        comments=comments,
                        linkedfile=linkedfile,
                        tags=tags,
                        archived=archived,
                        viewcount=viewcount,
                        date_created=date_created,
                        creator_email=creator_email,
                        creator_id=creator_id,
                        lastmodifiedbyemail=lastmodifiedbyemail,
                        lastmodifieddate=lastmodifieddate)

        print("Trying to add new task with title {}".format(title))
        session.add(new_task)
        session.commit()
        # session.close()
        print('Task creation successful')
        return True
    except Exception as e:
        session.rollback()
        print('Error is : {}'.format(e))
        print('Task creation failed')
        return False


#=============================================================
    # fetch a given task's details
# ==============================================================
def sql_view_task(taskid, currentuserid):
    try:
        task = Task.query.get(taskid)
        print("my task: ", task, type(task))
        task_dict = {}
        for key, value in task.__dict__.items():
            if not key.startswith('_'):
                task_dict[key] = getattr(task, key)

        # increase viewcount in task by 1 if it was viewed by non ticket owner
        if task_dict['assigneeid'] != currentuserid:
            newcount = task_dict['viewcount'] + 1
            session = db.session()
            Task.query.filter_by(taskid=task_dict['taskid']).update({'viewcount': newcount})
            session.commit()
            print(f"User {currentuserid} viewed user {task_dict['assigneeid']}, increased view count to {newcount}")
        task_dict['popularity'] = popularityConvertor(task_dict['viewcount']),
        # print(task_dict)
        print("Task Successfully gotten from database!")
        return task_dict
    except Exception as e:
        print('Error is : {}'.format(e))
        print('Task get failed in data layer')
        return False


#=============================================================
    # update a task
# ==============================================================
def sql_update_task(taskid, task):
    try:
        if taskid != None:
            session = db.session()
            Task.query.filter_by(taskid=taskid).update(task)
            session.commit()
            print('Task update sucessful')
            print(task)
            return True
        else:
            print("no taskid given to update task")
            return False
    except Exception as e:
        session.rollback()
        print('Error is : {}'.format(e))
        return False


                    ########################################
                    #  Connections Related SQL functions   #
                    ########################################

#=============================================================
    # query user table to show info of connected users
# ==============================================================
def sql_get_connected_users(userid, status):
    connection_dict = {"Not Connected": 0, "Connected": 1, "Request Sent": 2, "Request Received": 3}
    status_code = connection_dict[status]
    users = User.query. \
        join(Connections, Connections.connecteduserid == User.id). \
        filter(Connections.mainuserid == userid). \
        filter(Connections.connecteduserid != userid). \
        filter(Connections.connectionstatus == status_code). \
        order_by(Connections.connecteduserid).all()
    try:
        return [{
            'id': user.id,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'email': user.email,
            'phone': user.phone,
            'busyness': estimation_stats(user.id),
            'skills': user.skills,  # we can list skills but a short version here
            'connected': status,
        }
            for user in users]
    except Exception as e:
        print('Failed to fetch connected users. Error is : {}'.format(e))
        return 404

#=============================================================
    # fetch the user profile of a connected user
# ==============================================================
def sql_get_connection_profile(connectionid, mainuserid):
    try:
        connection = Connections.query.filter_by(connecteduserid=connectionid, mainuserid=mainuserid).first()
        user = User.query.filter_by(id=connectionid).first()
        if not user:
            print("Connected user does not exist!")
            return None

        connection_dict = {0: "Not Connected", 1: "Connected", 2: "Request Sent", 3: "Request Received"}
        try:
            connection_status = connection_dict[connection.connectionstatus]
        except:
            connection_status = "Not Connected"
        print('Connections status is: ', connection_status)
        return {
            'id': user.id,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'email': user.email,
            'phone': user.phone,
            'busyness': estimation_stats(user.id),
            'skills': user.skills,  
            'connected': connection_status,
        }
    except Exception as e:
        print('Failed to fetch connected usesrs. Error is : {}'.format(e))
        return None

#=============================================================
    # Update connections table when receiving different connection modification requests
# ==============================================================
def sql_update_connection(userid, mainuserid, statusid):
    session = db.session()
    try:
        # WITHDRAWAL/REJECT/DISCONNECT  buttons  - status 0
        # if new status id is 0, deletion required, remove connections from table
        if statusid == 0:
            session.query(Connections). \
                filter(((Connections.connecteduserid == userid) & (Connections.mainuserid == mainuserid)) \
                       | ((Connections.connecteduserid == mainuserid) & (Connections.mainuserid == userid))) \
                .delete()
            session.commit()
            print(f"Connection from {mainuserid} to {userid} removed.")
        # ACCEPT button - both connections change to 1
        elif statusid == 1:
            session.query(Connections). \
                filter(((Connections.connecteduserid == userid) & (Connections.mainuserid == mainuserid)) \
                       | ((Connections.connecteduserid == mainuserid) & (Connections.mainuserid == userid))) \
                .update({Connections.connectionstatus: statusid})
            session.commit()
            print(f"Connection from {mainuserid} to {userid} connected")
        # CONNECT button: Create 2 new entries
        # requester is the main user, status = 2
        # requestee is the connecteduser, status = 3
        elif statusid == 2:
            newconnection1 = Connections(mainuserid=mainuserid
                                         , connecteduserid=userid
                                         , connectionstatus=2)
            newconnection2 = Connections(mainuserid=userid
                                         , connecteduserid=mainuserid
                                         , connectionstatus=3)
            session.add(newconnection1)
            session.add(newconnection2)
            session.commit()
            print(f"Connection from {mainuserid} to {userid} created with pending status")
    except Exception as e:
        session.rollback()
        print('Failed to update connections. Error is : {}'.format(e))
        return None

#=============================================================
    # Query DB for ALL users in the org - to look for potential persons to connect
    # This also includes connected persons, which are sorted to be at the last of the list
# ==============================================================
def sql_get_all_to_connect_users(userid):
    try:
        connection_dict = {0: "Not Connected", 1: "Connected", 2: "Request Sent", 3: "Request Received"}
        session = db.session()

        connected_or_pending_users = session.query(Connections.connecteduserid). \
            filter(Connections.mainuserid == userid). \
            filter((Connections.connectionstatus == 2) | (Connections.connectionstatus == 3) | 
                    (Connections.connectionstatus == 1)). \
            all()
        connected_or_pending_users_list = [_[0] for _ in connected_or_pending_users]

        not_connected_or_pending_users = session.query(User). \
            filter(~User.id.in_(connected_or_pending_users_list)). \
            order_by(User.id).all()

        pending_users = session.query(User, Connections). \
            join(Connections, Connections.connecteduserid == User.id). \
            filter((Connections.mainuserid == userid)&(Connections.connecteduserid != userid)). \
            filter((Connections.connectionstatus == 2) | (Connections.connectionstatus == 3) | 
                    (Connections.connectionstatus == 1)). \
            all()
            
        return [{
            'id': user.id,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'email': user.email,
            'phone': user.phone,
            'busyness': user.business,
            'skills': user.skills,  # we can list skills but a short version here
            'connected': connection_dict[connection.connectionstatus],
        }
                   for user, connection in pending_users] + \
               [{
                   'id': user.id,
                   'firstName': user.firstName,
                   'lastName': user.lastName,
                   'email': user.email,
                   'phone': user.phone,
                   'busyness': user.business,
                   'skills': user.skills,  # we can list skills but a short version here
                   'connected': "Not Connected",
               }
                   for user in not_connected_or_pending_users]
    except Exception as e:
        print('Failed to fetch all to be connected usesrs. Error is : {}'.format(e))
        return None


#=============================================================
    # Query DB for ALL pending connection users, with status code 2 and 3
# ==============================================================
def sql_get_pending_connect_users(userid):
    try:
        connection_dict = {0: "Not Connected", 1: "Connected", 2: "Request Sent", 3: "Request Received"}
        users = db.session.query(User, Connections). \
            join(Connections, Connections.connecteduserid == User.id). \
            filter(Connections.mainuserid == userid). \
            filter(Connections.connecteduserid != userid). \
            filter((Connections.connectionstatus == 2) | (Connections.connectionstatus == 3)). \
            order_by(Connections.connecteduserid).all()
        print(users)
        return [{
            'id': user.id,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'email': user.email,
            'phone': user.phone,
            'busyness': user.business,
            'skills': user.skills,  # we can list skills but a short version here
            'connected': connection_dict[connection.connectionstatus],
        }
            for user, connection in users]
    except Exception as e:
        print('Failed to fetch all to be connected usesrs. Error is : {}'.format(e))
        return None
        
#=============================================================
    # Query DB for number of connection requests, with status code 3
# ==============================================================
def sql_get_pending_requestsN(userid):
    try:
        connection_dict = {0: "Not Connected", 1: "Connected", 2: "Request Sent", 3: "Request Received"}
        users = db.session.query(User, Connections). \
            join(Connections, Connections.connecteduserid == User.id). \
            filter(Connections.mainuserid == userid). \
            filter(Connections.connecteduserid != userid). \
            filter(Connections.connectionstatus == 3). \
            order_by(Connections.connecteduserid).all()
        print(users)
        return [{
            'id': user.id,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'email': user.email,
            'phone': user.phone,
            'busyness': user.business,
            'skills': user.skills,  # we can list skills but a short version here
            'connected': connection_dict[connection.connectionstatus],
        }
            for user, connection in users]
    except Exception as e:
        print('Failed to fetch all to be connected usesrs. Error is : {}'.format(e))
        return None
        
        
                        #============================================================ #
                            #          Estimation of busyness score              #
                        # ============================================================ #

#=============================================================
    # This function for week estimation
# ==============================================================
def week_estimation():
    #===============================================================
        #week start at Monday and ends at the Friday == 5  working days
        # to find the range of 1 weeks
        #weekday = ("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")
        # :Note that week day excluded the saturday and sunday
    #=========================================================================
    today = datetime.utcnow()

    one_weekrange = today.weekday()
    #print(one_weekrange)
    if (one_weekrange == 5):
        start_of_week =today + timedelta(days=2)
    elif (one_weekrange == 6):
        start_of_week = today + timedelta(days=1)
    else:
        start_of_week = datetime(today.year, today.month, today.day)

    end_week = start_of_week + timedelta(days= 7)
    end_of_week = datetime(end_week.year, end_week.month,end_week.day)
            
    
    return (start_of_week, end_of_week)

#==========================================================
# get the task, by assignedid, deadline and task status
# ============================================================
def numberoftask_assigned(assigneeid, begin, deadline):
    numberoftask = []
    total_task_assigned = Task.query.filter_by(assigneeid=assigneeid)
    #filter by status  and deadline 

    #==================================================
    # Weight
    # In progress: 100% full-load , 1 task== 1
    # Blocked: 150% load ,1 task == 1.5 
    # Not Started: 120% load,1 task == 1.2 
    #============================================================
    task_IP = total_task_assigned.\
                        filter((Task.status == "In Progress") 
                                & (Task.deadline >= begin)
                                & (Task.deadline < deadline)).all()
    task_Blocked = total_task_assigned.\
                        filter((Task.status == "Blocked") 
                                & (Task.deadline >= begin)
                                & (Task.deadline < deadline)).all()
    task_NS = total_task_assigned.\
                        filter((Task.status == "Not Started") 
                                & (Task.deadline >= begin)
                                & (Task.deadline < deadline)).all()
    #print("there are {} IP, {} Blocked, {} NS Tasks".format(task_IP,task_Blocked,task_NS))
    return len(task_IP)+1.5*len(task_Blocked)+1.2*len(task_NS)

#========================================================
    #To calculate the estimation of the busyness score
#==========================================================
def estimation_stats(assigneeid):
    start_day, end_day = week_estimation()
    print(end_day)
    task_timerange = numberoftask_assigned(assigneeid=assigneeid, begin=start_day, deadline=end_day)
    print(start_day, end_day, assigneeid, task_timerange)
    # 5 working days
    #if len(task_timerange)/5*100
    busyness = int(task_timerange/5*100)
    if busyness > 100:
        busyness = 101
    return busyness

#========================================================================================================

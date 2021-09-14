from os import name
from typing import DefaultDict
from __init__ import db, web_app, guard
from database.models import User, Task, Connections
from database.sql_tools import *
from flask_sqlalchemy import SQLAlchemy
from random import randint
from datetime import date, datetime, timedelta
app = web_app()
# this variable, db, will be used for all SQLAlchemy commands
db = SQLAlchemy(app)
guard.init_app(app, User)

user_N = 10
tasks_per_user = 10
task_N = user_N * tasks_per_user  # each user has 4 tasks

###########################################################
# creating user_N dummy users
# it will not create the same user, only new ones
###########################################################
names = ['Tom Cruise'
        , 'Joffrey Barth'
        , 'Samwell Tarly'
        , 'Sansa Stark'
        , 'Walder Frey'
        , 'Cersei Lannister'
        , 'Amory Lorch'
        , 'Petyr Baelish'
        , 'Old Nan'
        , 'Mance Rayder']
skill_list = ['Business Acumen'
                , 'Communicaiton'
                , 'Teamwork'
                , 'Negotiation'
                , 'Problem Solving'
                , 'Leadership'
                , 'Organisation'
                , 'Motivation'
                , 'Work Under Pressure'
                , 'Confidence'
                ]
for i in range(0, user_N):

    usertoken = {}
    usertoken['email'] = names[i].replace(' ','.').lower()+ '@gmail.com'
    usertoken['phone'] = str(i) * 8
    usertoken['password'] = guard.hash_password('111')
    usertoken['firstName'] = names[i].split()[0]
    usertoken['lastName'] = names[i].split()[1]
    usertoken['skills'] = skill_list[i]
    usertoken['business'] = 0
    usertoken['rolenames'] = []  # must have for user_class in praetorian}
    # print('Creating New USer : ',usertoken)

    session = db.session()
    try:
        newUser = User(**usertoken)
        session.add(newUser)
        session.commit()
        session.close()
        print('User created successfully!')
    except:
        session.rollback()
        # print('User creation failed!!')

###########################################################
# creating task_N dummy tasks
###########################################################

status_list = ['Not Started', 'In Progress', 'Blocked', 'Completed']
popularity_list = ['High', 'Medium', 'Low']
tags_list = ['Core business', 'Social', 'Analytics', 'Sprint A']
title_list = ['frontend UI'
            ,'create task list'
            , 'search for tasks in UI'
            , 'generate connections'
            , ' accept connections functions'
            , 'decline connection objective'
            , 'filter tasks']
for i in range(task_N):
    userid = i // tasks_per_user 
    tasknumber = i % tasks_per_user
    useremail = names[userid].replace(' ','.').lower()+ '@gmail.com'
    tasktoken = {}

    tasktoken['title'] = title_list[randint(0,len(title_list)-1)]
    tasktoken['assignee'] = useremail
    tasktoken['priority'] = popularity_list[randint(0,2)] #high low med
    tasktoken['deadline'] = datetime.now()+timedelta(days = randint(2,20))
    tasktoken['popularity'] = popularity_list[randint(0,2)]
    tasktoken['status'] = status_list[randint(0,3)]
    tasktoken['description'] = 'This is the description of this TAsk'
    tasktoken['comments'] = 'Here are some comments'
    tasktoken['linkedfile'] = None
    tasktoken['tags'] = tags_list[randint(0,3)]
    tasktoken['archived'] = 0  # we probably don't need this
    tasktoken['viewcount'] = randint(0,200)
    tasktoken['lastmodifiedbyemail'] = useremail
    tasktoken['lastmodifieddate'] = datetime.now()+timedelta(minutes = randint(0,1000))
    tasktoken['date_created'] = datetime.now()
    tasktoken['creator_email'] = useremail
    tasktoken['creator_id'] = userid+1
    tasktoken['assigneeid'] = userid+1

    # print('Creating New Task : ',tasktoken)

    session = db.session()
    try:
        newTask = Task(**tasktoken)
        session.add(newTask)
        session.commit()
        session.close()
        print('Task created successfully!')

    except Exception as e:
        session.rollback()
        print(f'Task creation failed!! for {e}')
        break


###########################################################
# create connection table values
# create self connections first
###########################################################

def sql_create_connection(token):
    session = db.session()
    with app.app_context():
        try:
            c = Connections.query.filter_by(mainuserid=token['mainuserid'],
                                            connecteduserid=token['connecteduserid']).all()
            if c:
                print('connections exist!')
            else:
                newCon = Connections(**token)
                session.add(newCon)
                session.commit()
                session.close()
                print('Connection created successfully!')
        except:
            session.rollback()
            # print('Connection creation failed!!')


# create connection
for i in range(1, user_N + 1):
    connectiontoken = {}
    connectiontoken['mainuserid'] = str(i)
    connectiontoken['connecteduserid'] = str(i)
    connectiontoken['connectionstatus'] = 1
    connectiontoken['date_created'] = datetime.now()
    sql_create_connection(connectiontoken)

# create custom connections below
customConnections = {'1': [2, 3, 4, 5], '2': [1, 3], '3': [1, 2], '4': [1]}

for k, v in customConnections.items():
    for i in v:
        connectiontoken = {}
        connectiontoken['mainuserid'] = k
        connectiontoken['connecteduserid'] = str(i)
        connectiontoken['connectionstatus'] = 1
        connectiontoken['date_created'] = datetime.now()
        sql_create_connection(connectiontoken)
        connectiontoken = {}
        connectiontoken['mainuserid'] = str(i)
        connectiontoken['connecteduserid'] = k
        connectiontoken['connectionstatus'] = 1
        connectiontoken['date_created'] = datetime.now()
        sql_create_connection(connectiontoken)

# 1 sent connection request to below
customConnections = {'1': [6, 7]}

for k, v in customConnections.items():
    for i in v:
        connectiontoken = {}
    connectiontoken['mainuserid'] = k
    connectiontoken['connecteduserid'] = str(i)
    connectiontoken['connectionstatus'] = 2
    connectiontoken['date_created'] = datetime.now()
    sql_create_connection(connectiontoken)
    connectiontoken = {}
    connectiontoken['mainuserid'] = str(i)
    connectiontoken['connecteduserid'] = k
    connectiontoken['connectionstatus'] = 3
    connectiontoken['date_created'] = datetime.now()
    sql_create_connection(connectiontoken)

# 1 received connection request from below
customConnections = {'1': [8, 9]}

for k, v in customConnections.items():
    for i in v:
        connectiontoken = {}
    connectiontoken['mainuserid'] = k
    connectiontoken['connecteduserid'] = str(i)
    connectiontoken['connectionstatus'] = 3
    connectiontoken['date_created'] = datetime.now()
    sql_create_connection(connectiontoken)
    connectiontoken = {}
    connectiontoken['mainuserid'] = str(i)
    connectiontoken['connecteduserid'] = k
    connectiontoken['connectionstatus'] = 2
    connectiontoken['date_created'] = datetime.now()
    sql_create_connection(connectiontoken)
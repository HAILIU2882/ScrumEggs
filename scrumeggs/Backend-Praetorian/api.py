import os
import flask
import flask_sqlalchemy
import flask_praetorian
import flask_cors
from flask_restful import  reqparse
from datetime import datetime, timezone
import dateutil.parser
from calendar import monthrange
from database.models import *

from __init__ import web_app, db, guard, cors
from database.sql_tools import *
'''
from endpoints.login_logout import login_api, signup_api, refresh_token_api
from endpoints.task_processing import mytasks_api, connected_tasks_api, historical_tasks_api, search_tasks_api, \
    all_tasks_api, create_task_api, update_task_api, delete_task_api
from endpoints.edit_view_profile import write_profile_api, get_profile_api, delete_profile_api
from endpoints.connections import connected_people_api, get_user_profile_api, update_connection_api
'''

from endpoints.login_logout import *
from endpoints.task_processing import *
from endpoints.edit_view_profile import *
from endpoints.connections import *

# from the init---flask initialization
app = web_app()
# Initialize the flask-praetorian instance for the app


###################################################
# Users
###################################################
guard.init_app(app, User)
app.register_blueprint(login_api)
app.register_blueprint(signup_api)
app.register_blueprint(write_profile_api)
app.register_blueprint(get_profile_api)
app.register_blueprint(delete_profile_api)

###################################################
# Tasks
###################################################
app.register_blueprint(current_tasks_api)
app.register_blueprint(mytasks_api)
app.register_blueprint(connected_tasks_api)
app.register_blueprint(historical_tasks_api)
app.register_blueprint(search_tasks_api)
#app.register_blueprint(all_tasks_api)
app.register_blueprint(create_task_api)
app.register_blueprint(update_task_api)
app.register_blueprint(delete_task_api)
app.register_blueprint(pending_connection_requestsN_api)
###################################################
# Connections
###################################################
app.register_blueprint(refresh_token_api)
app.register_blueprint(connected_people_api)
app.register_blueprint(get_user_profile_api)
app.register_blueprint(update_connection_api)
app.register_blueprint(all_people_connection_api)
app.register_blueprint(pending_connection_api)
app.register_blueprint(pending_connection_requestsN_api)
#====================================================================================
# Run the example
if __name__ == '__main__':
    #for the database  saved
    db.create_all(app=web_app())  # sql alchemy. create _all
    app.run(host='127.0.0.1', port=5194)




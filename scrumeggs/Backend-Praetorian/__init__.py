#=================================this help to link to database with the authorisation check================================

import flask
import flask_sqlalchemy
import flask_praetorian
import flask_cors
import os

db = flask_sqlalchemy.SQLAlchemy()
guard = flask_praetorian.Praetorian()
cors = flask_cors.CORS()

DB_NAME = 'scrumeggs.db'

def web_app():
    # Initialize flask app for the example
    app = flask.Flask(__name__, static_folder='../build', static_url_path=None)
    app.debug = True
    app.config['SECRET_KEY'] = 'top secret'
    app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
    app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}

    # Initialize a local database for the example
    print(os.path.join(os.getcwd(), DB_NAME))
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///{}".format(os.path.join(os.getcwd(), DB_NAME))
    db.init_app(app)

    # Initializes CORS so that the api_tool can talk to the example app
    cors.init_app(app)
    return app

import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Error from "./layout/Error";
import TopBar from "./layout/topbar";
import BasePage from "./layout/BasePage";
import SignIn from "./authentication/signin";
import SignUp from "./authentication/signup";
import { useAuth } from "./authentication/auth";
import TaskBoard from "./task-related-functions/taskboard";
import ViewProfile from "./users/viewprofile";
import ProfileForms from "./users/profileforms";
import CreateTask from './task-related-functions/createtask'
import ViewTask from "./task-related-functions/detailedtask";
import EditTask from "./task-related-functions/edittask";
import ManageConnections from "./users/manage_connections";
import ViewUserProfile from "./users/people";
import NameSet from "./state-management/name-setting";
import GetInvites from "./state-management/notifications";

function App() {
  sessionStorage.clear();
  const [loggedIn] = useAuth();
  if (loggedIn) {
    return (
      <div>
        <Router>
          <TopBar />
          <NameSet />
          <GetInvites />
          <BasePage>
            <Switch>
              <Route
                exact
                path="/"
                render={() => {
                  return loggedIn ? (
                    <Redirect to="/taskboard" />
                  ) : (
                    <Redirect to="/login" />
                  );
                }}
              />
              <Route exact path="/taskboard">
                <TopBar title={"Task Board"} />
                <TaskBoard />
              </Route>
              <Route path="/editProfile">
                <TopBar title={"Edit Profile"} />
                <ProfileForms />
              </Route>
              <Route path="/viewProfile">
                <TopBar title={"View Profile"} />
                <ViewProfile />
              </Route>
              <Route path="/createTask">
                <TopBar title={"Create Task"} />
                <CreateTask />
              </Route>
              <Route path="/viewTask/:id">
                <TopBar title={"View Task"} />
                <ViewTask />
              </Route>
              <Route path="/editTask/:id">
                <TopBar title={"Edit Task"} />
                <EditTask />
              </Route>
              <Route path="/connections">
                <GetInvites />
                <TopBar title={"Manage Connections"} />
                <ManageConnections />
              </Route>
              <Route path="/people/:email">
                <TopBar title={"Profile View"} />
                <ViewUserProfile />
              </Route>
              <Route path="*">
                <Error />
              </Route>
            </Switch>
          </BasePage>
        </Router>
      </div>
    );
  } else {
    return (
      <div className="container">
        <Router>
          <Switch>
            <Route
              exact
              path="/"
              render={() => {
                return loggedIn ? (
                  <Redirect to="/taskboard" />
                ) : (
                  <Redirect to="/login" />
                );
              }}
            />
            <Route exact path="/login">
              <SignIn />
            </Route>
            <Route path="/signup">
              <SignUp />
            </Route>
            <Route path="*">
              <Error />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;

import React, { useState, useEffect } from "react";
import { authFetch } from "../authentication/auth";
import {
  TextField,
  TextareaAutosize,
  Select,
  MenuItem,
  FormControl,
} from "@material-ui/core/";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from "@material-ui/pickers";
import Grid from "@material-ui/core/Grid";
import { useHistory } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from "@material-ui/core/Chip";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useStyles } from "../layout/styles";

// function for sending the information to backend for task creation
async function taskFormSubmit(
  title,
  description,
  deadline,
  priority,
  assignee,
  status,
  tags,
  files,
  comments
) {
  let year = deadline.getFullYear();
  let month = "" + (deadline.getMonth() + 1);
  let day = "" + deadline.getDate();
  let hour = "" + deadline.getHours();
  let minute = "" + deadline.getMinutes();
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }
  if (hour.length < 2) {
    hour = "0" + hour;
  }
  if (minute.length < 2) {
    minute = "0" + minute;
  }
  deadline = [year, month, day].join("-") + " " + [hour, minute].join(":");

  const taskInfo = {
    title,
    description,
    deadline,
    priority,
    assignee,
    status,
    tags,
    files,
    comments,
  };

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskInfo),
  };
  // change url for backend
  console.log("submitting");
  console.log(taskInfo);
  const postUrl = "/task/create";
  const postResponse = await authFetch(postUrl, requestOptions);
  const createResponse = await postResponse.json();
  console.log(createResponse);
}

export default function CreateTask() {
  // get self user profile deatils
  const [currentUser, setCurrentUser] = useState();
  const [connectedUsers, setconnectedUsers] = useState();
  const classes = useStyles();

  // this gets preplaced with a call to get a list of all connected users
  const getUsers = async () => {
    const connectedUserUrl = "/connections/connected";
    const getResponse = await authFetch(connectedUserUrl);
    const connectedUsers = await getResponse.json();
    setconnectedUsers(connectedUsers);
    console.log(connectedUsers);

    const currentUserUrl = "/api/profile";
    const response = await authFetch(currentUserUrl);
    const currentUser = await response.json();
    setCurrentUser(currentUser);
    console.log(currentUser);
  };

  useEffect(() => {
    getUsers();
  }, []);

  if (connectedUsers === undefined || currentUser === undefined) {
    console.log("User undefined");
    return (
      <div className={classes.form}>
        <div className={classes.loading}>
          <p>Loading...</p> <CircularProgress />
        </div>
      </div>
    );
  } else {
    return <TaskInfoForm currentUser={currentUser} users={connectedUsers} />;
  }
}

const TaskInfoForm = ({ currentUser, users }) => {
  // declaring variable names and functions
  const [title, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState(currentUser.email);
  const [status, setStatus] = useState("Not Started");
  const [tags, setTags] = useState("");
  const [chips, setChips] = useState([]);
  const [files, setFiles] = useState("");
  const [comments, setComments] = useState("");

  // import styles from above
  const classes = useStyles();
  const history = useHistory();

  // function activated for the actual submit of a form
  const handleSubmit = (e) => {
    e.preventDefault();
    taskFormSubmit(
      title,
      description,
      deadline,
      priority,
      assignee,
      status,
      tags,
      files,
      comments
    )
      .then(() => {
        history.push({
          pathname: "/taskboard",
          data: "Task Successfully Created!",
        });
      })
      .catch((error) => {
        console.log("why");
        console.log(error);
      });
  };

  // handle tag creation, when user presses enter to create tags, or backspace to delete tag
  const handleTags = (e) => {
    if (e.key === "Enter") {
      if (!chips.includes(e.target.value.trim())) {
        chips.push(e.target.value.trim());
        console.log(chips);
        setTags(chips.join(";"));
        console.log("Tags entered " + tags);
      }
    }
    if (e.key === "Backspace") {
      chips.splice(-1, 1);
      setTags(chips.join(";"));
    }
  };

  // when user presses delete on tag
  const handleDeleteTag = (chipToDelete) => () => {
    console.log("Tags delete left " + tags);
    let index = chips.indexOf(chipToDelete);
    console.log("Delete " + chipToDelete);
    console.log(index);
    if (index > -1) {
      chips.splice(index, 1);
      setChips(chips);
      setTags(chips.join(";"));
      console.log(tags);
    }
  };

  // render the page
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <form className={classes.form} onSubmit={handleSubmit}>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={6}>
            <div id="taskname" className={classes.customFormControl}>
              <FormControl required className={classes.textField}>
                <label htmlFor="taskname" className={classes.labels}>
                  {" "}
                  Task Name{" "}
                </label>
                <TextField
                  id="taskname"
                  onChange={(e) => setTaskName(e.target.value)}
                  variant="outlined"
                  multiline
                  rows={2}
                  required
                  label="Required"
                  placeholder="Name of your task"
                />
              </FormControl>
            </div>

            <div id="description" className={classes.customFormControl}>
              <FormControl className={classes.textField}>
                <label htmlFor="description" className={classes.labels}>
                  {" "}
                  Task Description{" "}
                </label>
                <TextareaAutosize
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  maxLength="1000"
                  rows={4}
                  placeholder=" Description of your task"
                  textalign={"center"}
                  style={{ font: "inherit", resize: "vertical", borderColor: "#bcccdc" }}
                />
              </FormControl>
            </div>

            <div id="tags" className={classes.customFormControl}>
              <FormControl className={classes.textField}>
                <label htmlFor="tags" className={classes.labels}>
                  {" "}
                  Tags{" "}
                </label>
                <Autocomplete
                  multiple
                  id="tags-filled"
                  options={[]}
                  value={chips}
                  freeSolo
                  disableClearable
                  onChange={handleTags}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        onDelete={handleDeleteTag(option)}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Tags"
                      helperText="After input press Enter to create new tag"
                    />
                  )}
                />
              </FormControl>
            </div>
            <div id="comments" className={classes.customFormControl}>
              <FormControl className={classes.textField}>
                <label htmlFor="comments" className={classes.labels}>
                  {" "}
                  Comments{" "}
                </label>
                <TextareaAutosize
                  id="comments"
                  onChange={(e) => setComments(e.target.value)}
                  variant="outlined"
                  rows={4}
                  maxLength="1000"
                  placeholder=" Comments about your task"
                  style={{ font: "inherit", resize: "vertical", borderColor: "#bcccdc" }}
                />
              </FormControl>
            </div>
          </Grid>

          <Grid item xs={6}>
            <div id="assignee" className={classes.customFormControl}>
              <FormControl className={classes.textField}>
                <label htmlFor="assignee" className={classes.labels}>
                  {" "}
                  Assignee (Busyness){" "}
                </label>
                <Select
                  id="assignee"
                  onChange={(e) => setAssignee(e.target.value)}
                  value={assignee}
                  displayEmpty
                >
                  <MenuItem key={currentUser.email} value={currentUser.email}>
                    {currentUser.email} (
                    {currentUser.busyness > 100 ? "100+" : currentUser.busyness}
                    %)
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.email} value={user.email}>
                      {user.email} (
                      {user.busyness > 100 ? "100+" : user.busyness}%)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <br></br>

            <div id="deadline" className={classes.customFormControl}>
              <FormControl required className={classes.textField}>
                <label htmlFor="deadline" className={classes.labels}>
                  {" "}
                  Deadline{" "}
                </label>
                <br></br>
                <KeyboardDateTimePicker
                  id="deadline"
                  onChange={setDeadline}
                  value={deadline}
                  format="yyyy-MM-dd HH:mm"
                  ampm={false}
                  disablePast
                  required
                  label="Required"
                  placeholder="YYYY-MM-DD hh:mm"
                />
              </FormControl>
            </div>
            <br></br>

            <div id="priority" className={classes.customFormControl}>
              <FormControl className={classes.textField}>
                <label htmlFor="priority" className={classes.labels}>
                  {" "}
                  Priority{" "}
                </label>
                <Select
                  id="priority"
                  onChange={(e) => setPriority(e.target.value)}
                  value={priority}
                  displayEmpty
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </div>
            <br></br>
            <br></br>
            <div id="status" className={classes.customFormControl}>
              <FormControl className={classes.textField}>
                <label htmlFor="status" className={classes.labels}>
                  {" "}
                  Status{" "}
                </label>
                <Select
                  id="status"
                  onChange={(e) => setStatus(e.target.value)}
                  value={status}
                  displayEmpty
                >
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
            </div>
            <br></br>
          </Grid>
        </Grid>

        <button type="submit" className={classes.formButton}>
          CREATE TASK
        </button>
      </form>
    </MuiPickersUtilsProvider>
  );
};

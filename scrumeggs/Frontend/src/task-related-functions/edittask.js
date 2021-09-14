import React, { useState, useEffect } from "react";
import { authFetch } from '../authentication/auth';
import { TextField, TextareaAutosize, Select, MenuItem, FormControl, } from '@material-ui/core/';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDateTimePicker, } from '@material-ui/pickers';
import Grid from '@material-ui/core/Grid'
import { useHistory } from 'react-router-dom';
import { useParams } from "react-router-dom";
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useStyles } from '../layout/styles';
import Typography from "@material-ui/core/Typography";

// function for sending the form information to backend for PATCH
async function editTaskForm(
  taskid,
  title,
  description,
  deadline,
  priority,
  assignee,
  status,
  tags,
  files,
  comments) {
  let year = deadline.getFullYear();
  let month = '' + (deadline.getMonth() + 1);
  let day = '' + deadline.getDate();
  let hour = '' + deadline.getHours();
  let minute = '' + deadline.getMinutes();
  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }
  if (hour.length < 2) {
    hour = '0' + hour;
  }
  if (minute.length < 2) {
    minute = '0' + minute;
  }
  deadline = [year, month, day].join('-') + " " + [hour, minute].join(':');

  const taskInfo = {
    taskid,
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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskInfo),
  };

  console.log("submit edit");
  console.log(taskInfo);
  const postUrl = "/task/edit/" + taskid;
  const postResponse = await authFetch(postUrl, requestOptions);
  const editResponse = await postResponse.json();
  console.log(editResponse);
}

// main editing function
export default function EditTask() {
  // getting task information
  let { id } = useParams();
  const [task, setTask] = useState();
  const [currentUser, setCurrentUser] = useState();
  const [connectedUsers, setconnectedUsers] = useState();

  const getTask = async () => {
    const url = '/task/view/' + id;
    const taskResponse = await authFetch(url)
    const task = await taskResponse.json();
    setTask(task);
    console.log(task)

    const connectedUserUrl = "/connections/connected";
    const getResponse = await authFetch(connectedUserUrl);
    const connectedUsers = await getResponse.json();
    setconnectedUsers(connectedUsers);
    console.log(connectedUsers);

    const currentUserUrl = "/api/profile";
    const response = await authFetch(currentUserUrl)
    const currentUser = await response.json();
    setCurrentUser(currentUser);
    console.log(currentUser)
  };

  useEffect(() => {
    getTask();
  }, []);

  if (connectedUsers === undefined || currentUser === undefined || task === undefined) {
    console.log('Task undefined')
    return <></>;
  } else {
    // call the ouput function view form to generate the form for viewing
    return (
      <EditTaskWithValues
        currentUser={currentUser}
        users={connectedUsers}
        taskid={task.taskid}
        title={task.title}
        assignee={task.assignee}
        priority={task.priority}
        deadline={task.deadline}
        status={task.status}
        description={task.description}
        comments={task.comments}
        files={task.linkedfile}
        tags={task.tags}
        popularity={task.popularity}
        created={task.date_created}
        creator={task.creator_email}
        modifiedEmail={task.lastmodifiedbyemail}
        modifiedDate={task.lastmodifieddate}
        archived={task.archived}
      />
    );
  };
};

// function to generate output form view
const EditTaskWithValues = ({
  currentUser,
  users,
  taskid,
  title,
  assignee,
  priority,
  deadline,
  status,
  description,
  comments,
  files,
  tags,
  popularity,
  created,
  creator,
  modifiedEmail,
  modifiedDate,
  archived,
}) => {
  // declaring variable names and functions
  const [newtitle, setTaskName] = useState(title);
  const [newdescription, setDescription] = useState(description);
  const [newdeadline, setDeadline] = useState(new Date(deadline));
  const [newpriority, setPriority] = useState(priority);
  const [newassignee, setAssignee] = useState(assignee);
  const [newstatus, setStatus] = useState(status);
  const [newtags, setTags] = useState(tags);
  const [chips, setChips] = useState(newtags.length > 0 ? 
    newtags.split(';').map(Function.prototype.call, String.prototype.trim) : []);
  
  const [newfiles, setFiles] = useState(files);
  const [newcomments, setComments] = useState(comments);

  // import styles from above
  const classes = useStyles();
  const history = useHistory();

  // function activated for the actual submit of a form
  const handleSubmit = (e) => {
    e.preventDefault();
    editTaskForm(
      taskid,
      newtitle,
      newdescription,
      newdeadline,
      newpriority,
      newassignee,
      newstatus,
      newtags,
      newfiles,
      newcomments
    )
      .then(() => {
        history.push({
          pathname: '/viewTask/' + taskid,
          data: 'Task Edited Successfully!',
        });
      }).catch((error) => {
        console.log("why");
        console.log(error);
      });
  };
  
  const handleTags = (e) => {
    if (e.key === "Enter") {
      if (!chips.includes(e.target.value.trim())) {
        chips.push(e.target.value.trim());
        console.log(chips);
        setTags(chips.join(";"));
        console.log("Tags entered " + newtags);
      }
    }
    if (e.key === "Backspace") {
      chips.splice(-1, 1);
      setTags(chips.join(";"));
    }
  };

  // when user presses delete on tag
  const handleDeleteTag = (chipToDelete) => () => {
    console.log("Tags delete left " + newtags);
    let index = chips.indexOf(chipToDelete);
    console.log("Delete " + chipToDelete);
    console.log(index);
    if (index > -1) {
      chips.splice(index, 1);
      setChips(chips);
      setTags(chips.join(";"));
      console.log(newtags);
    }
  };
  // render the page
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <form className={classes.form} onSubmit={handleSubmit}>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={12} >
            <Typography variant="h4" color="inherit"> Task {taskid} </Typography>
            <Typography variant="subtitle2" color="inherit"> Task created by {creator}, on {created}</Typography>
            <Typography variant="subtitle2" color="inherit">  Last modified by {modifiedEmail}, on {modifiedDate} </Typography>
            <Typography variant="subtitle2" color="inherit"> Popularity: {popularity} </Typography>
          </Grid>
          <Grid item xs={6} >
            <div id="taskname" className={classes.customFormControl}>
              <FormControl required className={classes.textField}>
                <label htmlFor="taskname" className={classes.labels}> Task Name </label><br></br>
                 <TextField
                  id="taskname"
                  onChange={(e) => setTaskName(e.target.value)}
                  variant="outlined"
                  multiline
                  rows={2}
                  required
                  label="Required"
                  value={newtitle}
                />
              </FormControl>
            </div>

            <div id="description" className={classes.customFormControl}>
              <FormControl required className={classes.textField}>
                <label htmlFor="description" className={classes.labels}> Task Description </label>
                 <TextareaAutosize
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  rows={4}
                  maxLength="1000"
                  placeholder="Description of your task"
                  style={{ font: "inherit", resize: "vertical", borderColor: "#bcccdc"}}
                  value={newdescription}
                />
              </FormControl>
            </div>
            <div id="tags" className={classes.customFormControl}>
              <FormControl required className={classes.textField}>
                <label htmlFor="tags" className={classes.labels}> Tags </label>
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
                    <TextField {...params}
                      variant="outlined"
                      placeholder="Tags"
                      helperText="After input press Enter to create new tag"
                    />
                  )}
                />
              </FormControl>
            </div>
            <div id="comments" className={classes.customFormControl}>
              <FormControl required className={classes.textField}>
                <label htmlFor="comments" className={classes.labels}> Comments </label> 
                <TextareaAutosize
                  id="comments"
                  onChange={(e) => setComments(e.target.value)}
                  variant="outlined"
                  rows={4}
                  maxLength="1000"
                  placeholder="Comments about your task"
                  style={{ font: "inherit", resize: "vertical", borderColor: "#bcccdc" }}
                  value={newcomments}
                />
              </FormControl>
            </div>
          </Grid>

          <Grid item xs={6} >
            <div id="assignee" className={classes.customFormControl}>
              <FormControl required className={classes.textField}>
                <label htmlFor="assignee" className={classes.labels}> Assignee (Busyness) </label>
                <Select
                  id="assignee"
                  onChange={(e) => setAssignee(e.target.value)}
                  value={newassignee}
                  displayEmpty
                >
                  <MenuItem key={currentUser.email} value={currentUser.email}>
                    {currentUser.email} ({currentUser.busyness > 100 ? "100+" : currentUser.busyness}%)
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.email} value={user.email}>
                      {user.email} ({user.busyness > 100 ? "100+" : user.busyness}%)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <br></br>

            <div id="deadline" className={classes.customFormControl}>
              <FormControl required className={classes.textField}>
                <label htmlFor="deadline" className={classes.labels}> Deadline </label>
                <br></br>
                <KeyboardDateTimePicker
                  id="deadline"
                  onChange={setDeadline}
                  value={newdeadline}
                  ampm={false}
                  // disablePast
                  format="yyyy-MM-dd HH:mm"
                  required
                  label="Required"
                  placeholder="YYYY-MM-DD hh:mm"
                />
              </FormControl>
            </div>
            <br></br>

            <div id="priority" className={classes.customFormControl}>
              <FormControl className={classes.textField}>
                <label htmlFor="priority" className={classes.labels}> Priority </label>
                <Select
                  id="priority"
                  onChange={(e) => setPriority(e.target.value)}
                  value={newpriority}
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
                <label htmlFor="status" className={classes.labels}> Status </label>
                <Select
                  id="status"
                  onChange={(e) => setStatus(e.target.value)}
                  value={newstatus}
                  displayEmpty
                >
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Blocked">Blocked</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </div>
 
          </Grid>
        </Grid>
        <button type="submit" className={classes.formButton}>
          SAVE EDITS
        </button>
      </form>
    </MuiPickersUtilsProvider>
  );
};
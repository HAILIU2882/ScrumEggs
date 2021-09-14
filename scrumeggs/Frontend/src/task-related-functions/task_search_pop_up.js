import React, { useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { FormControl, } from '@material-ui/core/';
import { authFetch } from "../authentication/auth";
import { useHistory } from 'react-router-dom';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useRecoilState } from "recoil";
import { taskRows, openState, buttonSelect, prevButtonSelect } from '../state-management/atoms';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker, } from '@material-ui/pickers';
import { useStyles } from "../layout/styles";
import Grid from '@material-ui/core/Grid'

const datetimeFormat = (date, hoursValue, minutesValue) => {
  let year = date.getFullYear();
  let month = '' + (date.getMonth() + 1);
  let day = '' + date.getDate();
  let hour = '' + hoursValue;
  let minute = '' + minutesValue;
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
  date = [year, month, day].join('-') + " " + [hour, minute].join(':');
  return date;
}
// function to send search information to the backend and retrieve results
async function taskSearchSubmit(taskid,
  title,
  popularity,
  priority,
  creator,
  created_on_after,
  created_on_before,
  assignee,
  deadline_after,
  deadline_before,
  status,) {

  if ((created_on_after != null) && (created_on_before != null) && (created_on_after > created_on_before)) {
    const returnedTasks = { status: 400, message: "Date created on Before must be smaller than After" };
    return returnedTasks;
  }
  if ((deadline_after != null) && (deadline_before != null) && (deadline_after > deadline_before)) {
    const returnedTasks = { status: 401, message: "Date deadline Before must be smaller than After" };
    return returnedTasks;
  }
  if (created_on_after) {
    created_on_after = datetimeFormat(created_on_after, "00", "00");
  } else {
    created_on_after = "";
  }
  if (created_on_before) {
    created_on_before = datetimeFormat(created_on_before, "23", "59");
  } else {
    created_on_before = "";
  }
  if (deadline_after) {
    deadline_after = datetimeFormat(deadline_after, "00", "00");
  } else {
    deadline_after = "";
  }

  if (deadline_before) {
    deadline_before = datetimeFormat(deadline_before, "23", "59");
  } else {
    deadline_before = "";
  }

  const searchedTask = {
    taskid,
    title,
    popularity,
    priority,
    creator,
    created_on_after,
    created_on_before,
    assignee,
    deadline_after,
    deadline_before,
    status,
  };
  console.log(searchedTask);
  let string = taskid + title + popularity + priority + creator + assignee + status + created_on_after + created_on_before + deadline_after + deadline_before;

  if (string.length < 1) {
    const returnedTasks = { status: 402, message: "Please have at least one entry for a valid search" };
    return returnedTasks;
  }
  if (taskid.length > 0) {
    if ((isNaN(taskid)) || !(Number.isInteger(parseFloat(taskid)))) {
      const returnedTasks = { status: 403, message: "Input for task id must be an integer" }
      return returnedTasks;
    }
  }

  const requestOptions = {
    method: "GET",
  };

  const getUrl = "/task/search/" + JSON.stringify(searchedTask);
  const getResponse = await authFetch(getUrl, requestOptions);
  console.log(requestOptions)

  const returnedTasks = await getResponse.json();
  console.log(returnedTasks);
  return returnedTasks;
};

const SearchTaskForm = () => {
  const [rows, setRows] = useRecoilState(taskRows);
  const [open, setOpen] = useRecoilState(openState);
  const [isSelected, setIsSelected] = useRecoilState(buttonSelect);
  const [prevSelected, setPrevSelected] = useRecoilState(prevButtonSelect);
  const [error, setError] = useState(["", "", "", ""]);

  const classes = useStyles();
  const [taskid, setTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [popularity, setPopularity] = useState('');
  const [priority, setPriority] = useState('');
  const [creator, setCreator] = useState('');
  const [created_on_after, setCreatedOnAfter] = useState(null);
  const [created_on_before, setCreatedOnBefore] = useState(null);
  const [assignee, setAssignee] = useState('');
  const [deadline_after, setDeadlineAfter] = useState(null);
  const [deadline_before, setDeadlineBefore] = useState(null);
  const [status, setStatus] = useState('');
  const history = useHistory();

  // handling when search is cancelled
  const handleClose = () => {
    setOpen(false);
    setIsSelected(prevSelected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    taskSearchSubmit(
      taskid,
      title,
      popularity,
      priority,
      creator,
      created_on_after,
      created_on_before,
      assignee,
      deadline_after,
      deadline_before,
      status,
    )
      .then((returnedTasks) => {
        console.log(returnedTasks);
        if (returnedTasks.status === 402) {
          setError([returnedTasks.message, "", "", ""]);
        } else if (returnedTasks.status === 403) {
          setError(["", returnedTasks.message, "", ""]);
        } else if (returnedTasks.status === 401) {
          setError(["", "", returnedTasks.message, ""]);
        } else if (returnedTasks.status === 400) {
          setError(["", "", "", returnedTasks.message]);
        } else {
          setRows(returnedTasks);
          console.log('Returned Tasks after search: ', rows);
          setOpen(false);
          history.push({
            pathname: '/taskboard',
            data: 'Task search done!',
          });
        }
      }).catch((error) => {
        console.log("why");
        console.log(error);
      });
  };

  return (
    <>
      <DialogTitle id="form-dialog-title" >Task Search</DialogTitle>
      <DialogContent dividers>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid container>
            <Grid item>
              <div
                className={classes.errorText}
                style={{ display: error[0].length > 0 ? "inline-block" : "none" }}>
                {error[0]}
              </div>
            </Grid>
          </Grid>
          <Grid container direction="row" spacing={2} >
            <Grid item xs={6}>
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="taskid" className={classes.labels}> Task ID </label>
                  <br></br>
                  <TextField
                    id="taskid"
                    value={taskid}
                    onChange={(e) => setTaskId(e.target.value)}
                    error={error[1].length > 0}
                    helperText={error[1].length > 0 ? error[1] : ""}
                  >
                  </TextField>
                </FormControl>
              </div>
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="title" className={classes.labels}> Task Title </label>
                  <br></br>
                  <TextField
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </FormControl>
              </div>
              <br></br>
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="assignee" className={classes.labels}> Assignee (email) </label>
                  <br></br>
                  <TextField
                    id="assignee"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  />
                </FormControl>
              </div>
              <br></br>
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="status" className={classes.labels}> Status </label>
                  <br></br>
                  <TextField
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                </FormControl>
              </div>
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="priority" className={classes.labels}> Priority </label>
                  <br></br>
                  <TextField
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  />
                </FormControl>
              </div>
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="popularity"> Popularity </label>
                  <br></br>
                  <TextField
                    id="popularity"
                    value={popularity}
                    onChange={(e) => setPopularity(e.target.value)}
                  />
                </FormControl>
              </div>
            </Grid>

            <Grid item xs={6} >
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="deadline-after" className={classes.labels}> Deadline after </label>
                  <br></br>
                  <KeyboardDatePicker
                    id="deadline-after"
                    placeholder="YYYY-MM-DD"
                    value={deadline_after}
                    onChange={setDeadlineAfter}
                    format="yyyy-MM-dd"
                  />
                </FormControl>
              </div>
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="deadline-before" className={classes.labels}> Deadline before  </label> <br></br>
                  <KeyboardDatePicker
                    id="deadline-before"
                    placeholder="YYYY-MM-DD"
                    value={deadline_before}
                    onChange={setDeadlineBefore}
                    format="yyyy-MM-dd"
                    error={error[2].length > 0}
                    helperText={error[2].length > 0 ? error[2] : ""}
                  />
                </FormControl>
              </div>
              <br></br>
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="creator" className={classes.labels} > Creator (email) </label>
                  <br></br>
                  <TextField
                    id="creator"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                  />
                </FormControl>
              </div>
              <br></br>
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="createdon-after" className={classes.labels}> Created after </label> <br></br>
                  <KeyboardDatePicker
                    id="createdon-after"
                    placeholder="YYYY-MM-DD"
                    value={created_on_after}
                    onChange={setCreatedOnAfter}
                    format="yyyy-MM-dd"
                  />
                </FormControl>
              </div>
              <div className={classes.customFormControl}>
                <FormControl required className={classes.textField}>
                  <label htmlFor="createdon-before" className={classes.labels}> Created before  </label> <br></br>
                  <KeyboardDatePicker
                    id="createdon-before"
                    placeholder="YYYY-MM-DD"
                    value={created_on_before}
                    onChange={setCreatedOnBefore}
                    format="yyyy-MM-dd"
                    error={error[3].length > 0}
                    helperText={error[3].length > 0 ? error[3] : ""}
                  />
                </FormControl>
              </div>
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Search
        </Button>
      </DialogActions>
    </>
  );
};

// main function to update and provide emty values for task search form
export default function SearchPopUp() {
  const [rows, setRows] = useRecoilState(taskRows);
  const [open, setOpen] = useRecoilState(openState);
  const [isSelected, setIsSelected] = useRecoilState(buttonSelect);
  const [prevSelected, setPrevSelected] = useRecoilState(prevButtonSelect);

  const handleClose = () => {
    setOpen(false);
    setIsSelected(prevSelected);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={"paper"}
        aria-labelledby="form-dialog-title"
        fullWidth maxWidth='md'>
        <SearchTaskForm />
      </Dialog>
    </>
  );
}
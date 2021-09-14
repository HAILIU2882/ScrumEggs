import React, { useState, useEffect, useRef } from "react";
import { authFetch } from "../authentication/auth";
import { useParams } from "react-router-dom";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import Grid from "@material-ui/core/Grid";
import { useHistory } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { useStyles } from "../layout/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import { useRecoilState } from "recoil";
import { taskRows } from "../state-management/atoms";

// fetch the details of the task using task id from database
export default function ViewTask() {
  const isMounted = useRef(false);
  // function to monitor if the component is mounted
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  // setting rows of the Task Board
  let { id } = useParams();
  const [rows, setRows] = useRecoilState(taskRows);
  const url = "/task/view/" + id;
  const [task, setTask] = useState();

  const getTask = async () => {
    const response = await authFetch(url);
    const task = await response.json();
    if (isMounted.current) {
      setTask(task);
      console.log(task);
    }
  };

  useEffect(() => {
    getTask();
    if (isMounted.current) {
      setRows([]);
    }
  }, []);

  if (task === undefined) {
    console.log("Task undefined");
    return <></>;
  } else {
    return (
      <ViewTaskWithValues
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
  }
}

const ViewTaskWithValues = ({
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
  const classes = useStyles();
  const history = useHistory();

  // response for going to delete task
  const handleDelete = async (e) => {
    e.preventDefault();

    const requestOptions = {
      method: "DELETE",
    };
    const url = "/task/delete/" + taskid;
    const response = await authFetch(url, requestOptions);
    if (response.status === 200) {
      history.push({
        pathname: "/taskboard",
        data: "Task Deleted Successfully!",
      });
    } else {
      alert("error with deleting task");
    }
  };
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <div
          className={"form"}
          style={{
            textAlign: "center",
            padding: "0.5rem",
            width: "60%",
            position: "relative",
          }}
        >
          <Typography variant="h4" color="inherit">
            {" "}
            Task {taskid}{" "}
          </Typography>
          <Typography variant="subtitle2" color="inherit">
            {" "}
            Task created by {creator}, on {created}
          </Typography>
          <Typography variant="subtitle2" color="inherit">
            {" "}
            Last modified by {modifiedEmail}, on {modifiedDate}{" "}
          </Typography>
          <Typography variant="subtitle2" color="inherit">
            {" "}
            Popularity: {popularity}{" "}
          </Typography>
          <br></br>
          <TableContainer>
            <Table
              aria-label="profile-table"
              style={{ maxHeight: "auto", wordWrap: "break-word" }}
            >
              <TableBody>
                <TableRow key={0}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ width: "175px" }}
                  >
                    {" "}
                    <b>Task name</b>{" "}
                  </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    {title}
                  </TableCell>
                </TableRow>
                <TableRow key={1}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ width: "175px" }}
                  >
                    {" "}
                    <b>Task description</b>{" "}
                  </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    {description}
                  </TableCell>
                </TableRow>
                <TableRow key={2}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ width: "175px" }}
                  >
                    {" "}
                    <b>Tags</b>{" "}
                  </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    {tags}
                  </TableCell>
                </TableRow>
                <TableRow key={3}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ width: "175px" }}
                  >
                    {" "}
                    <b>Comments</b>{" "}
                  </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    {comments}
                  </TableCell>
                </TableRow>
                <TableRow key={4}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ width: "175px" }}
                  >
                    {" "}
                    <b>Assignee</b>{" "}
                  </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    {assignee}
                  </TableCell>
                </TableRow>
                <TableRow key={5}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ width: "175px" }}
                  >
                    {" "}
                    <b>Deadline</b>{" "}
                  </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    {deadline}
                  </TableCell>
                </TableRow>
                <TableRow key={6}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ width: "175px" }}
                  >
                    {" "}
                    <b>Priority</b>{" "}
                  </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    {priority}
                  </TableCell>
                </TableRow>
                <TableRow key={7}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ width: "175px" }}
                  >
                    {" "}
                    <b>Status</b>{" "}
                  </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    {status}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <br></br>
          <Grid item xs={12}>
            <div>
              <button
                type="submit"
                onClick={() => history.push("/editTask/" + taskid)}
                className={classes.formButton}
                style={{
                  display: "inline block",
                  position: "relative",
                  left: "-10%",
                  margin: "0.5rem",
                }}
              >
                EDIT TASK
              </button>
              <button
                onClick={handleClickOpen}
                className={classes.formButton}
                style={{
                  display: "inline block",
                  position: "relative",
                  left: "10%",
                  margin: "0.5rem",
                }}
              >
                DELETE TASK
              </button>
              <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Delete Task?"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure that you want to delete this task?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    Disagree
                  </Button>
                  <Button onClick={handleDelete} color="primary" autoFocus>
                    Agree
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </Grid>
        </div>
      </MuiPickersUtilsProvider>
    </>
  );
};

import React, { useState, useEffect } from "react";
import { authFetch, logout } from "../authentication/auth";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { Button } from "@material-ui/core";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Alert  from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { useLocation } from "react-router-dom";
import NameSet from "../state-management/name-setting";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "50ch",
    },
  },
  margin: {
    margin: theme.spacing(5.5),
    left: theme.spacing(6),
    flexShrink: 0,
  },
}));

// Display logged-in user profile
const ViewProfile = () => {
  const url = "/api/profile";

  const [user, setUser] = useState();

  const getUser = async () => {
    const response = await authFetch(url);
    const user = await response.json();
    setUser(user);
    console.log(user);
  };

  useEffect(() => {
    getUser();
    return;
  }, []);

  if (user === undefined) {
    return <></>;
  } else {
    return (
      <ViewProfileWithValues
        firstName={user.firstName}
        lastName={user.lastName}
        phone={user.phone}
        skills={user.skills}
        email={user.email}
        busyness={user.busyness === 101 ? "100+" : user.busyness}
      />
    );
  }
};

const ViewProfileWithValues = ({
  firstName,
  lastName,
  phone,
  skills,
  email,
  busyness
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [snackBar, setSnackBar] = useState(false);
  const snackBarData = useLocation();

  const handleDelete = async (e) => {
    e.preventDefault();

    const requestOptions = {
      method: "DELETE",
    };
    const url = "/api/profile";
    const response = await authFetch(url, requestOptions);
    if (response.status === 200) {
      logout();
      history.push("/");
    } else {
      alert("error with deleting account");
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    history.push("/editProfile");
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (snackBarData.data) {
      setSnackBar(true);
    }
  }, []);

  // handling of snackbars
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBar(false);
  };

  return (
    <article fullwidth="true">
      <form className={"form"} style={{textAlign: "center",}}>
        <TableContainer>
          <Table aria-label="profile-table" style={{ maxHeight: "auto", wordWrap: "break-word" }}>
            <TableBody>
              <TableRow key={0} >
                <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>First Name</b> </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>{firstName}</TableCell>
              </TableRow>
              <TableRow key={1}>
                <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Last Name</b> </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>{lastName}</TableCell>
              </TableRow>
              <TableRow key={2}>
                <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Email</b> </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>{email}</TableCell>
              </TableRow>
              <TableRow key={3}>
                <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Phone</b> </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>{phone}</TableCell>
              </TableRow>
              <TableRow key={4}>
                <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Skills</b> </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>{skills}</TableCell>
              </TableRow>
              <TableRow key={5}>
                <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Busyness</b> </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>{busyness > 100 ? "100+" : busyness}% </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <button
          className={classes.margin}
          type="reset"
          onClick={handleClickOpen}
          style={{ display: "inline block" }}
        >
          DELETE PROFILE
        </button>
        <button
          className={classes.margin}
          type="reset"
          onClick={handleEditProfile}
          style={{ display: "inline block" }}
        >
          EDIT PROFILE
        </button>
        <NameSet />
        <Dialog
          open={open}
          onClose={handleClickClose}
          aria-labelledby="delete-profile-alert"
          aria-describedby="delete-profile-alert"
        >
          <DialogTitle id="delete-profile-alert">{"Delete Account?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure that you want to delete your account?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClickClose} color="primary">
              No
            </Button>
            <Button onClick={handleDelete} color="primary" autoFocus>
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </form>
      <Snackbar
        open={snackBar}
        autoHideDuration={5000}
        onClose={handleClose}
        style={{ position: "fixed", left: "57%" }}
      >
        <Alert elevation={6} variant="filled" onClose={handleClose} severity="success">
          {snackBarData.data}
        </Alert>
      </Snackbar>
    </article>
  );
};

ViewProfileWithValues.defaultProps = {
  firstName: "",
  lastName: "",
  phone: "",
  skills: "",
  email: "",
};
export default ViewProfile;

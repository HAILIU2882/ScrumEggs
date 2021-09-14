import React, { useState, useEffect } from "react";
import { authFetch } from "../authentication/auth";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { atom, useRecoilState, selector, useRecoilValue } from "recoil";
import { invitations, invisible } from "../state-management/atoms";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "50ch",
    },
  },
  margin: {
    margin: theme.spacing(1),
    left: theme.spacing(3),
    flexShrink: 0,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  textField: {
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(1),
    width: "50ch",
    margin: 4,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

const userState = atom({
  key: "user",
  default: {},
});

// Define state of the buttons (active/disabled)
const connectDisableState = selector({
  key: "connectDisableState",
  get: ({ get }) => {
    const user = get(userState);
    return !(user.connected === "Not Connected");
  },
});

const disconnectDisableState = selector({
  key: "disconnectDisableState",
  get: ({ get }) => {
    const user = get(userState);
    return !(user.connected === "Connected");
  },
});

const acceptRejectDisableState = selector({
  key: "acceptRejectDisableState",
  get: ({ get }) => {
    const user = get(userState);
    return !(user.connected === "Request Received");
  },
});

const withdrawDisableState = selector({
  key: "withdrawDisableState",
  get: ({ get }) => {
    const user = get(userState);
    return !(user.connected === "Request Sent");
  },
});

// Display profile of another user
const ViewUserProfile = () => {
  console.log(window.location.pathname);
  const url = String(window.location.pathname);
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    const getUser = async () => {
      const response = await authFetch(url);
      const user = await response.json();
      setUser(user);
      console.log("user is: ", user);
    };
    getUser();
  }, []);

  if (user === undefined) {
    return <></>;
  } else {
    return (
      <ViewProfileWithValues
        id={user.id}
        firstName={user.firstName}
        lastName={user.lastName}
        phone={user.phone}
        connected={user.connected}
        email={user.email}
        skills={user.skills}
        busyness={user.busyness}
      />
    );
  }
};

const ViewProfileWithValues = ({
  id = "",
  firstName = "",
  lastName = "",
  phone = "",
  connected = "",
  email = "",
  skills = "",
  busyness = "",
}) => {
  const classes = useStyles();
  const [invs, setInvs] = useRecoilState(invitations);
  const [invis, setInvis] = useRecoilState(invisible);
  const [open, setOpen] = useState(false);

  const connect = useRecoilValue(connectDisableState);
  const disconnect = useRecoilValue(disconnectDisableState);
  const acceptReject = useRecoilValue(acceptRejectDisableState);
  const withdraw = useRecoilValue(withdrawDisableState);
  const history = useHistory();
  const handleChangeConnectionStatus = async (e, status) => {
    e.preventDefault();
    const requestOptions = {
      method: "PUT",
    };
    const url = "/statusconnect/" + String(id) + "/" + status; //new endpoint
    const response = await authFetch(url, requestOptions);
    console.log("PUT request url: ", url);
    let message = "Connect request sent to ";

    if (response.status === 200) {
      console.log("response");
      if (status === "Request Sent") {
        message = message + email;
      } else if (status === "Not Connected") {
        message = "Now not connected with " + email;
      } else if (status === "Connected") {
        setInvs(invs - 1);
        if (invs > 0) {
          setInvis(false);
        } else {
          setInvis(true);
        }
        message = "Now connected with " + email;
      }
      history.push({
        pathname: "/connections",
        data: message,
      });
    } else {
      alert("error with change request");
    }
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickClose = () => {
    setOpen(false);
  };

  return (
    <article>
      <form className="form">
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
                  <b>First Name</b>{" "}
                </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>
                  {firstName}
                </TableCell>
              </TableRow>
              <TableRow key={1}>
                <TableCell
                  component="th"
                  scope="row"
                  style={{ width: "175px" }}
                >
                  {" "}
                  <b>Last Name</b>{" "}
                </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>
                  {lastName}
                </TableCell>
              </TableRow>
              <TableRow key={2}>
                <TableCell
                  component="th"
                  scope="row"
                  style={{ width: "175px" }}
                >
                  {" "}
                  <b>Email</b>{" "}
                </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>
                  {email}
                </TableCell>
              </TableRow>
              <TableRow key={3}>
                <TableCell
                  component="th"
                  scope="row"
                  style={{ width: "175px" }}
                >
                  {" "}
                  <b>Phone</b>{" "}
                </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>
                  {phone}
                </TableCell>
              </TableRow>
              <TableRow key={4}>
                <TableCell
                  component="th"
                  scope="row"
                  style={{ width: "175px" }}
                >
                  {" "}
                  <b>Connected</b>{" "}
                </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>
                  {connected}
                </TableCell>
              </TableRow>
              <TableRow key={5}>
                <TableCell
                  component="th"
                  scope="row"
                  style={{ width: "175px" }}
                >
                  {" "}
                  <b>Skills</b>{" "}
                </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>
                  {skills}
                </TableCell>
              </TableRow>
              <TableRow key={6}>
                <TableCell
                  component="th"
                  scope="row"
                  style={{ width: "175px" }}
                >
                  {" "}
                  <b>Busyness</b>{" "}
                </TableCell>
                <TableCell align="left" style={{ maxWidth: "304px" }}>
                  {busyness > 100 ? "100+" : busyness}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </form>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          onClick={(e) => handleChangeConnectionStatus(e, "Connected")}
          disabled={acceptReject}
          variant="contained"
          size="large"
          min-width="100px"
          color="primary"
          className={classes.margin}
        >
          Accept
        </Button>
        <Button
          onClick={(e) => handleChangeConnectionStatus(e, "Not Connected")}
          disabled={acceptReject}
          variant="contained"
          min-width="60px"
          size="large"
          color="primary"
          className={classes.margin}
        >
          Reject
        </Button>
        <Button
          onClick={(e) => handleChangeConnectionStatus(e, "Request Sent")}
          disabled={connect}
          variant="contained"
          color="primary"
          size="large"
          className={classes.margin}
        >
          Connect
        </Button>
        <Button
          onClick={handleClickOpen}
          disabled={disconnect}
          variant="contained"
          color="primary"
          size="large"
          className={classes.margin}
        >
          Disconnect
        </Button>
        <Button
          onClick={(e) => handleChangeConnectionStatus(e, "Not Connected")}
          disabled={withdraw}
          variant="contained"
          color="primary"
          size="large"
          className={classes.margin}
        >
          Withdraw
        </Button>
        <Dialog
          open={open}
          onClose={handleClickClose}
          aria-labelledby="delete-profile-alert"
          aria-describedby="delete-profile-alert"
        >
          <DialogTitle id="delete-profile-alert">{"Disconnect?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to disconnect with {email}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClickClose} color="primary">
              No
            </Button>
            <Button
              onClick={(e) => handleChangeConnectionStatus(e, "Not Connected")}
              color="primary"
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </article>
  );
};

export default ViewUserProfile;

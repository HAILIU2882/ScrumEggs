import { DataGrid } from "@material-ui/data-grid";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState, useEffect } from "react";
import { authFetch } from "../authentication/auth";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { defaultPageSize } from "../state-management/atoms";
import { useRecoilState } from "recoil";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  grow: {
    flexGrow: 1,
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "relative",
    pointerEvents: "none",
    display: "flex",
    alignItems: "left",
    justifyContent: "left",
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  filterButton: {
    width: "100%",
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#303f9f",
    color: "#fff",
    margin: theme.spacing(1),
    left: theme.spacing(3),
    "&:hover": {
      backgroundColor: "hsl(205, 90%, 76%)",
      color: "#fff",
    },
  },
  inactiveButton: {
    margin: theme.spacing(1),
    left: theme.spacing(3),
    "&:hover": {
      backgroundColor: "hsl(205, 90%, 76%)",
      color: "#fff",
    },
  },
}));

// Only connected people
export default function ManageConnections() {
  const classes = useStyles();
  const getConnectedUrl = "/connections/connected";
  const [rows, setRows] = useState([]);
  const [isSelected, setIsSelected] = useState(0);
  const [snackBar, setSnackBar] = useState(false);
  const snackBarData = useLocation();
  
  const [pageSize, setPageSize] = useRecoilState(defaultPageSize);

  const getPeople = async () => {
    const response = await authFetch(getConnectedUrl);
    const rows = await response.json();
    setRows(rows);
    console.log(response.status);
    setIsSelected(0);
  };

  useEffect(() => {
    getPeople();
    if (snackBarData.data) {
      setSnackBar(true);
    }
  }, []);

  // Connected people
  const handleConnected = async () => {
    const response = await authFetch(getConnectedUrl);
    const rows = await response.json();
    setRows(rows);
    console.log(rows);
    setIsSelected(0);
  };

  // Pending connection approval
  const handlePending = async () => {
    const getPendingPeopleUrl = "/connections/pending";
    const response = await authFetch(getPendingPeopleUrl);
    const rows = await response.json();
    console.log("change");
    setRows(rows);
    console.log(rows);
    setIsSelected(1);
  };

  // All people
  const handleAll = async () => {
    const getAllPeopleUrl = "/connections/all";
    const response = await authFetch(getAllPeopleUrl);
    const rows = await response.json();
    console.log("change");
    setRows(rows);
    console.log(rows);
    setIsSelected(2);
  };

  const history = useHistory();
  const handleRowClick = (param, event) => {
    console.log(param.row.email);
    let personId = param.row.id;
    const personUrl = "/people/" + String(personId);
    console.log(personUrl);
    history.push(personUrl);
  };

  //handling of snackbars
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBar(false);
  };

  const [page, setPage] = React.useState(0);

  const columns = [
    { field: "connected", headerName: "Connected", width: 150 },
    {
      field: "firstName",
      headerName: "First Name",
      width: 220,
      editable: false,
    },
    { field: "lastName", headerName: "Last Name", width: 220, editable: false },
    { field: "email", headerName: "Email", width: 250 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "skills", headerName: "Skills", width: 400 },
  ];
  
  const handlePageSizeChange = (params) => {
    setPageSize(params.pageSize);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          onClick={() => handleConnected()}
          variant="outlined"
          size="large"
          min-width="100px"
          color="primary"
          className={
            isSelected === 0 ? classes.activeButton : classes.inactiveButton
          }
        >
          Connected
        </Button>
        <Button
          onClick={() => handlePending()}
          variant="outlined"
          min-width="60px"
          size="large"
          color="primary"
          className={
            isSelected === 1 ? classes.activeButton : classes.inactiveButton
          }
        >
          Pending
        </Button>
        <Button
          onClick={() => handleAll()}
          variant="outlined"
          size="large"
          color="primary"
          className={
            isSelected === 2 ? classes.activeButton : classes.inactiveButton
          }
        >
          All
        </Button>
      </div>

      <div style={{ height: 400, width: "95%", marginLeft: 40 }}>
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ flexGrow: 1 }}>
            <DataGrid
              page={page}
              onPageChange={(params) => {
                setPage(params.page);
              }}
              onRowClick={handleRowClick}
              autoHeight
              rows={rows}
              columns={columns}
              pagination
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              rowsPerPageOptions={[5, 10, 20]}
              rowCount={rows.length}
            />
          </div>
        </div>
      </div>
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
    </>
  );
}

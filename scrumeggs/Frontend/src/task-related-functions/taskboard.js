import { DataGrid } from "@material-ui/data-grid";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState, useEffect, useRef } from "react";
import { authFetch } from "../authentication/auth";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import { taskRows, openState, currentRows } from "../state-management/atoms";
import SearchPopUp from "./task_search_pop_up";
import LinearProgress from "@material-ui/core/LinearProgress";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { buttonSelect, prevButtonSelect, defaultPageSize } from "../state-management/atoms";
import Chip from "@material-ui/core/Chip";
import DoneOutlinedIcon from '@material-ui/icons/DoneOutlined';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import AutorenewOutlinedIcon from '@material-ui/icons/AutorenewOutlined';

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "50ch",
    },
  },
  loading: {
    position: "fixed",
    top: "50%",
    left: "50%",
  },
  margin: {
    margin: theme.spacing(1),
    left: theme.spacing(3),
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
  notStarted: {
    color: "#1976d2",
    border: "1px solid #2196f3"
  },
  inProgress: {
    color: "#ff8400",
    border: "1px solid #ff9800"
  },
  blocked: {
    color: "#d32f2f",
    border: "1px solid #f44336"
  },
  completed: {
    color: "#388e3c",
    border: "1px solid #2cc132"
  },
}));


// Central function of the application that defines which rows are displayed in the Task Board page
export default function TaskBoard() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const classes = useStyles();
  const [rows, setRows] = useRecoilState(taskRows);
  const [currRows, setCurrRows] = useRecoilState(currentRows);
  const [isSelected, setIsSelected] = useRecoilState(buttonSelect);
  const [prevSelected, setPrevSelected] = useRecoilState(prevButtonSelect);

  const [pageSize, setPageSize] = useRecoilState(defaultPageSize);

  console.log("Loading TaskBoard page with:", rows);
  const [open, setOpen] = useRecoilState(openState);
  const [page, setPage] = useState(0);

  const [snackBar, setSnackBar] = useState(false);
  const snackBarData = useLocation();
  const getTasksUrl = "/mytasks";

  // default function
  const getTasks = async () => {
    const response = await authFetch(getTasksUrl);
    console.log("Response status ", response.status);
    if (response.status === 200) {
      const rows = await response.json();
      if (isMounted.current) {
        setRows(rows);
        setCurrRows(rows);
      }
    } else {
      if (isMounted.current) {
        setRows([]);
        console.log("Supposed to set the rows to empty", response);
      }
    }
    if (isMounted.current) {
      setPrevSelected(isSelected);
      setIsSelected(0);
    }
  };

  useEffect(() => {
    if (rows.length < 1) {
      console.log("Get Tasks");
      getTasks();
      return;
    }
    // refresh the taskboard if 
    if (snackBarData.data) {
      console.log("Snacks");
      setSnackBar(true);
      getTasks();
      return;
    }
  }, []);

  // Backlog and my tasks which are in progress
  const handleCurrent = async () => {
    const response = await authFetch(getTasksUrl);
    if (response.status === 200) {
      const rows = await response.json();
      if (isMounted.current) {
        console.log(rows);
        setRows(rows);
      }
    } else {
      if (isMounted.current) {
        setRows([]);
        console.log(response);
      }
    }
    if (isMounted.current) {
      setPrevSelected(isSelected);
      setIsSelected(0);
    }
  };

  // My Tasks and Tasks of all connected people that are in progress
  const handleConnected = async () => {
    const getConnectedTasksUrl = "/mytasks/connected";
    const response = await authFetch(getConnectedTasksUrl);
    if (response.status === 200) {
      const rows = await response.json();
      if (isMounted.current) {
        setRows(rows);
      }
    } else {
      if (isMounted.current) {
        setRows([]);
        console.log(response);
      }
    }
    if (isMounted.current) {
      setPrevSelected(isSelected);
      setIsSelected(1);
    }
  };
  // My Tasks and Tasks of all connected people current and historical
  const handleHistorical = async () => {
    const getHistoricalTasksUrl = "/mytasks/historical";
    const response = await authFetch(getHistoricalTasksUrl);
    if (response.status === 200) {
      const rows = await response.json();
      if (isMounted.current) {
        setRows(rows);
      }
    } else {
      if (isMounted.current) {
        setRows([]);
      }
    }
    if (isMounted.current) {
      setPrevSelected(isSelected);
      setIsSelected(2);
    }
  };
  const [operate, setOperate] = useState();
  const handleTaskSearch = async () => {
    if (isMounted.current) {
      setOpen(true);
      setPrevSelected(isSelected);
      setIsSelected(3);
      setOperate(<SearchPopUp />);
    }
    return operate;
  };

  // enter detailed task view
  const history = useHistory();
  const handleRowClick = (param, event) => {
    console.log(param.row.id);

    let taskId = param.row.id;
    const taskUrl = "/viewTask/" + String(taskId);
    console.log(taskUrl);
    history.push(taskUrl);
  };

  //handling of snackbars
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBar(false);
  };

  const getStatusColor = (status) => {
    if (status === "Not Started") {
      return classes.notStarted;
    } else if (status === "In Progress") {
      return classes.inProgress;
    } else if (status === "Blocked") {
      return classes.blocked;
    } else {
      return classes.completed;
    }
  };
  const getStatusIcon = (status) => {
    if (status === "Not Started") {
      return <InfoRoundedIcon style={{ color: "#1976d2" }} />;
    } else if (status === "In Progress") {
      return <AutorenewOutlinedIcon style={{ color: "#ff8400" }} />;
    } else if (status === "Blocked") {
      return <WarningRoundedIcon style={{ color: "#d32f2f" }} />;
    } else {
      return <DoneOutlinedIcon style={{ color: "#388e3c" }} />;
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100, editable: false },
    { field: "title", headerName: "Title", width: 220, editable: false },
    { field: "assignee", headerName: "Assignee", width: 200 },
    { field: "priority", headerName: "Priority", width: 140 },
    {
      field: "deadline", headerName: "Deadline", width: 140,
      renderCell: (params) => (
        new Date() > new Date(params.value.slice(0, 4) + "-" +
          params.value.slice(5, 7) + "-" +
          params.value.slice(8, 10) + " " +
          params.value.slice(12, 14) + ":" +
          params.value.slice(15, 17)
        ) ?
          <div style={{ color: "red" }}>
            {params.value}
          </div>
          :
          <div>
            {params.value}
          </div>
      ),
    },
    { field: "popularity", headerName: "Popularity", width: 150 },
    {
      field: "status", headerName: "Status", align: "left", width: 120,
      renderCell: (params) => (
        <div>
          <Chip
            variant="outlined"
            color="primary"
            size="small"
            className={getStatusColor(params.value)}
            icon={getStatusIcon(params.value)}
            label={params.value}
          />
        </div>
      ),
    },
    { field: "creator", headerName: "Creator", align: "left", width: 200 },
    { field: "date_created", headerName: "Created", align: "left", width: 200 },
  ];

  const handlePageSizeChange = (params) => {
    setPageSize(params.pageSize);
  };

  if (rows === undefined) {
    return (
      <div className={classes.loading}>
        <p>Loading...</p> <LinearProgress />
      </div>
    );
  } else {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            onClick={() => handleCurrent()}
            variant="outlined" // contained
            size="large"
            min-width="100px"
            color="primary"
            selected
            className={
              isSelected === 0 ? classes.activeButton : classes.inactiveButton
            }
          >
            My Current Tasks
          </Button>
          <Button
            onClick={() => handleConnected()}
            variant="outlined"
            min-width="60px"
            size="large"
            color="primary"
            className={
              isSelected === 1 ? classes.activeButton : classes.inactiveButton
            }
          >
            Tasks in my Network
          </Button>
          <Button
            onClick={() => handleHistorical()}
            variant="outlined"
            size="large"
            color="primary"
            className={
              isSelected === 2 ? classes.activeButton : classes.inactiveButton
            }
          >
            Historical Tasks
          </Button>
          <Button
            onClick={() => handleTaskSearch()}
            variant="outlined"
            size="large"
            color="primary"
            className={
              isSelected === 3 ? classes.activeButton : classes.inactiveButton
            }
          >
            Search Tasks
          </Button>
        </div>
        {operate}

        <div
          style={{ height: 400, width: "95%", marginLeft: 40, marginRight: 40 }}
        >
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
        <div>
          <Snackbar
            open={snackBar}
            autoHideDuration={5000}
            onClose={handleCloseSnackbar}
            style={{ position: "fixed", left: "57%" }}
          >
            <Alert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">
              {snackBarData.data}
            </Alert>
          </Snackbar>
        </div>
      </div>
    );
  }
}

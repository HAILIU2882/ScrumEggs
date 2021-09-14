import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { logout } from "../authentication/auth";
import { useHistory } from "react-router-dom";
import { useRecoilState } from "recoil";
import { taskRows, sideBarOpen, defaultPageSize } from "../state-management/atoms";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import MenuIcon from "@material-ui/icons/Menu";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  name: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

export default function TopBar(props) {
  const [rows, setRows] = useRecoilState(taskRows);
  const [sideBar, setSideBar] = useRecoilState(sideBarOpen);
  const [pageSize, setPageSize] = useRecoilState(defaultPageSize);
  const handleDrawerToggle = () => {
    setSideBar(!sideBar);
  };

  const classes = useStyles();
  const history = useHistory();
  console.log(props);
  const handleSubmit = () => {
    setRows([]);
    localStorage.clear();
    sessionStorage.clear();
    setSideBar(false);
    setPageSize(10);
    logout();
    history.push("/");
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" noWrap>
            {props.title}
          </Typography>
          <Typography
            variant="subtitle1"
            style={{ position: "fixed", left: "52%" }}
            className={classes.name}
          >
            Logged in as {sessionStorage.getItem("firstName")}{" "}
            {sessionStorage.getItem("lastName")}
          </Typography>
          <Button
            variant="contained"
            style={{ marginLeft: "auto" }}
            color="default"
            onClick={handleSubmit}
          >
            Log Out{" "}
            <ExitToAppIcon
              style={{ position: "relative", right: "-5%", margin: "0.1 rem" }}
            />
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

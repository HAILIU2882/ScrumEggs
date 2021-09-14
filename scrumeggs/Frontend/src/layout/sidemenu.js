import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PersonIcon from '@material-ui/icons/Person';
import { Link } from 'react-router-dom'
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import AddIcon from '@material-ui/icons/Add';
import { useLocation } from 'react-router-dom'
import eggs from './eggs.jpg'
import { useRecoilState } from "recoil";
import { taskRows, currentRows } from '../state-management/atoms';
import { buttonSelect, sideBarOpen } from '../state-management/atoms';
import { invitations, invisible } from '../state-management/atoms';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
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
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    padding: '0 4px',
  },
}))(Badge);

const SideMenu = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();

  const [invs, setInvs] = useRecoilState(invitations);
  const [invis, setInvis] = useRecoilState(invisible);
  const [sideBar, setSideBar] = useRecoilState(sideBarOpen);
  const [rows, setRows] = useRecoilState(taskRows)
  const [currRows, setCurrRows] = useRecoilState(currentRows)
  const [isSelected, setIsSelected] = useRecoilState(buttonSelect)

  // Resets rows in the TaskBoard page
  const resetRows = () => {
    setRows(currRows)
    setIsSelected(0)
  }

  const { window } = props;

  const handleDrawerToggle = () => {
    setSideBar(!sideBar);
  };

  const container = window !== undefined ? () => window().document.body : undefined;

  const handleSubmit = () => {
    resetRows();
  }
  const drawer = (
    <Drawer className={classes.drawer} variant="permanent" classes={{ paper: classes.drawerPaper, }} anchor="left" >
      <div style={{ textalign: "center" }}>
        <img src={eggs} align="middle" width="220" height="64"/>
      </div>
      <Divider />
      <List>
        <ListItem button component={Link} to='/viewProfile' key='viewProfile'
          selected={location.pathname === "/viewProfile"}  >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary='View Profile' />
        </ListItem>
        <ListItem button component={Link} to='/taskboard' key='taskBoard'
          selected={location.pathname === "/taskboard"}
          onClick={handleSubmit}
        >
          <ListItemIcon>
            <AssignmentTurnedInIcon />
          </ListItemIcon>
          <ListItemText primary='Task Board' />
        </ListItem>
        <ListItem button component={Link} to='/createTask' key='createTask'
          selected={location.pathname === '/createTask'}  >
          <ListItemIcon>
            < AddIcon />
          </ListItemIcon>
          <ListItemText primary='Create Task' />
        </ListItem>
        <ListItem button component={Link} to='/connections' key='connections'
          selected={location.pathname === '/connections'}  >
          <ListItemIcon>
            <IconButton aria-label="people" style={{ padding: 0 }}>
              <StyledBadge badgeContent={invs} color="secondary" invisible={invis}>
                <PeopleAltIcon />
              </StyledBadge>
            </IconButton>
          </ListItemIcon>
          <ListItemText primary='My Network' />
        </ListItem>
      </List>
      <Divider />
    </Drawer>
  );

  return (
    <>
      <nav className={classes.drawer}>
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={sideBar}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, 
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
    </>
  )
};

export default SideMenu

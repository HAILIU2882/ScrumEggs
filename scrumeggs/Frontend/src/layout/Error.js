import React from 'react'
import CancelTwoToneIcon from '@material-ui/icons/CancelTwoTone';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', 
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Error = () => {
    const classes = useStyles();
    return (   
    <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <h2>Page Not found...</h2>
            <Avatar className={classes.avatar}>
              <CancelTwoToneIcon />
            </Avatar>
        </div>
    </Container>
    )
}

export default Error

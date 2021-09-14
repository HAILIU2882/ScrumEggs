import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { login } from "./auth";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp() {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(["", "", "", ""]);
  const emailRegex = /^\S+@\S+\.\S+$/;
  const history = useHistory();
  
  // Getting token from the backend in response to credentials, and logging in
  const provideLogin = async ({ email, password }) => {
    email = email.trim();
    const loginInfo = { email, password }
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginInfo),
    }
    
    const url = "/api/signup";
    const response = await fetch(url, requestOptions)
    const accessToken = await response.json()
    console.log(accessToken)
    return accessToken;
  }
  // Handling submit, with error checking
  const handleSubmit = (e) => {
    e.preventDefault();
    if ((email && password) && (password === passwordConfirm) && emailRegex.test(email.trim())) {
      provideLogin({ email, password })
        .then((accessToken) => {
          if (accessToken.status === 200) {
            login(accessToken);
            history.push("/editProfile");
          } else {
            setError([accessToken.message, "", ""]);
          };
        });
    }
    if (email.length < 1 && password.length < 1 && passwordConfirm < 1) {
      setError(["Email cannot be empty", "Password cannot be empty", "Password Confirm cannot be empty"]);
    } else if (email.length < 1) {
      setError(["Email cannot be empty", "", ""]);
    } else if (!emailRegex.test(email.trim())) {
      setError(["Email invalid, should follow format abc@email.com", "", ""]);
    } else if (password.length < 1) {
      setError(["", "Password cannot be empty", ""]);
    } else if (password !== passwordConfirm) {
      setError(["", "Passwords do not match", "Passwords do not match"]);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            autoFocus
            required
            requirederror="Email is a required field."
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginTop: "8px", marginBottom: "2px" }}
            error={error[0].length > 0}
            helperText={error[0].length > 0 ? error[0] : ""}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginTop: "8px", marginBottom: "2px" }}
            error={error[1].length > 0}
            helperText={error[1].length > 0 ? error[1] : ""}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password_confirm"
            label="Password Confirm"
            type="password"
            id="password_confirm"
            autoComplete="current-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            style={{ marginTop: "8px", marginBottom: "2px" }}
            error={error[2].length > 0}
            helperText={error[2].length > 0 ? error[2] : ""}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
          <Grid container>
            <Grid item>
              <Link href="/login" variant="body2">
                {"Already have an account? Log In"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
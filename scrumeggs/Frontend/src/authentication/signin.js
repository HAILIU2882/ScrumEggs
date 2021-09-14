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
    width: "100%",
    marginTop: theme.spacing(1),
  },
  errorText: {
    width: "100%",
    marginTop: theme.spacing(1),
    color: "red"
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn() {
  localStorage.clear();
  sessionStorage.clear();

  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(["", "", ""]);
  const emailRegex = /^\S+@\S+\.\S+$/;
  const history = useHistory();

  const provideLogin = async ({ email, password }) => {
    email = email.trim();
    const loginInfo = { email, password }
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(loginInfo),
    }
    
    // Getting token from the backend in response to username and password
    const url = "/api/login";
    const response = await fetch(url, requestOptions)
    const accessToken = await response.json()
    console.log(response.status, accessToken)
    if (accessToken.status === 200) {
      login(accessToken);
      history.push("/taskboard");
    }
    else {
      setError([accessToken.message + ".", " ", " "]);
    }
  }
  sessionStorage.setItem("email", email);
  sessionStorage.setItem("firstSignIn", true);

  // Handling submit, with error checking
  const handleSubmit = (e) => {
    e.preventDefault();

    if ((email && password) && emailRegex.test(email.trim())) {
      provideLogin({ email, password })
    }

    if (email.length < 1 && password.length < 1) {
      setError(["", "Email cannot be empty", "Password cannot be empty"]);
    } else if (email.length < 1) {
      setError(["", "Email cannot be empty", ""]);

    } else if (password.length < 1) {
      setError(["", "", "Password cannot be empty"]);
    } else if (!emailRegex.test(email.trim())) {
      setError(["", "Email invalid, should follow format abc@email.com", ""]);
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
          Log in
        </Typography>

        <form className={classes.form} noValidate>
          <Grid container>
            <Grid item>
              <div
                className={classes.errorText}
                style={{ display: error[0].length > 0 ? "inline-block" : "none" }}>
                {error[0]}
              </div>
            </Grid>
          </Grid>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginTop: "8px", marginBottom: "2px" }}
            error={error[1].length > 0}
            helperText={error[1].length > 0 ? error[1] : ""}
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
            Log In
          </Button>
          <Grid container>
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
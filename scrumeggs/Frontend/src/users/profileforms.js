import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, } from "@material-ui/core/";
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { authFetch } from "../authentication/auth";
import { useHistory } from "react-router-dom";
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
  textField: {
    width: "35ch",
    size: "medium",
    background: "hsl(0, 0%, 100%)",
  },
}));

// Retrieving logged-in user information
const ProfileForms = () => {
  const [user, setUser] = useState();

  const getUsers = async () => {
    const getUrl = "/api/profile";
    const getResponse = await authFetch(getUrl);
    const user = await getResponse.json();
    setUser(user);
    console.log(user);
  };

  useEffect(() => {
    getUsers();
  }, []);

  if (user === undefined) {
    console.log("User undefined");
    return <></>;
  } else {
    return (
      <ProfileFormsForLoadedProfile
        baseFirstName={user.firstName}
        baseLastName={user.lastName}
        basePhone={user.phone}
        baseSkills={user.skills}
        baseEmail={user.email}
      />
    );
  }
};

// Updating logged-in user information
const ProfileFormsForLoadedProfile = ({
  baseFirstName,
  baseLastName,
  basePhone,
  baseSkills,
  baseEmail,
}) => {
  const [firstName, setFirstName] = useState(baseFirstName);
  const [lastName, setLastName] = useState(baseLastName);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [skills, setSkills] = useState(baseSkills);
  const [chips, setChips] = useState(skills.length > 0 ?
    skills.split(';').map(Function.prototype.call, String.prototype.trim) : []);
  const [phone, setPhone] = useState(basePhone);
  const phoneRegex = /^([+]{1})?[0-9]{8,14}$/;
  const [error, setError] = useState(["", "", ""]);

  const classes = useStyles();

  const writeProfile = async ({
    firstName,
    lastName,
    phone,
    password,
    skills,
    baseEmail,
  }) => {
    const updatedProfile = {
      firstName,
      lastName,
      phone,
      password,
      skills,
      baseEmail,
    };
    sessionStorage.setItem("firstName", firstName);
    sessionStorage.setItem("lastName", lastName);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProfile),
    };
    const postUrl = "/api/profiles";
    const postResponse = await authFetch(postUrl, requestOptions);
    const returnedProfile = await postResponse.json();
    console.log(returnedProfile);
  };

  const history = useHistory();
  // storing profile information
  const handleSubmit = (e) => {
    e.preventDefault();
    const person = { firstName, lastName, phone, password, skills, baseEmail };
    console.log("Passing");
    console.log(person);

    if (password !== passwordConfirm) {
      setError(["", "Passwords do not match", "Passwords do not match"]);
      return;
    }
    if (phone.length > 1 && !phoneRegex.test(phone.trim())) {
      setError(["Phone number should be digits (Max length 14)", "", ""]);
      return;
    }
    writeProfile({ firstName, lastName, phone, password, skills, baseEmail })
      .then(() => {
        history.push({
          pathname: '/viewProfile',
          data: 'Profile Saved Successfully!',
        });
      }).catch((error) => {
        console.log("why");
        console.log(error);
      });
  };

  // handle tag creation, when user presses enter to create tags, or backspace to delete tag
  const handleTags = (e) => {
    if (e.key === "Enter") {
      if (!chips.includes(e.target.value.trim())) {
        chips.push(e.target.value.trim());
        console.log(chips);
        setSkills(chips.join(";"));
        console.log("Skills entered " + skills);
      }
    }
    if (e.key === "Backspace") {
      chips.splice(-1, 1);
      setSkills(chips.join(";"));
    }
  };

  // when user presses delete on tag
  const handleDeleteTag = (chipToDelete) => () => {
    console.log("Skills delete left " + skills);
    let index = chips.indexOf(chipToDelete);
    console.log("Delete " + chipToDelete);
    console.log(index);
    if (index > -1) {
      chips.splice(index, 1);
      setChips(chips);
      setSkills(chips.join(";"));
      console.log(skills);
    }
  };

  return (
    <>
      <article fullwidth="true">
        <form className={"form"} style={{ textAlign: "center", }} onSubmit={handleSubmit}>
          <TableContainer>
            <Table aria-label="edit-profile-table" style={{ maxHeight: "auto", wordWrap: "break-word" }}>
              <TableBody>
                <TableRow key={0} >
                  <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>First Name</b> </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    <TextField
                      id="firstName"
                      className={classes.textField}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      variant="outlined"
                      style={{ maxWidth: "304px" }}
                    >
                    </TextField>
                  </TableCell>
                </TableRow>
                <TableRow key={1}>
                  <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Last name</b> </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    <TextField
                      id="lastName"
                      className={classes.textField}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
                <TableRow key={2}>
                  <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Email</b> </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>{baseEmail}</TableCell>
                </TableRow>
                <TableRow key={3}>
                  <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Phone</b> </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    <TextField
                      id="phone"
                      className={classes.textField}
                      value={phone}
                      type="tel"
                      onChange={(e) => setPhone(e.target.value)}
                      variant="outlined"
                      error={error[0].length > 0}
                      helperText={error[0].length > 0 ? error[0] : ""}
                    />
                  </TableCell>
                </TableRow>
                <TableRow key={4}>
                  <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Password</b> </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    <TextField
                      id="password"
                      autoComplete="off"
                      className={classes.textField}
                      value={password}
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                      variant="outlined"
                      error={error[1].length > 0}
                      helperText={error[1].length > 0 ? error[1] : ""}
                    />
                  </TableCell>
                </TableRow>
                <TableRow key={5}>
                  <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Password Confirm</b> </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    <TextField
                      id="passwordConfirm"
                      autoComplete="off"
                      className={classes.textField}
                      value={passwordConfirm}
                      type="password"
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      variant="outlined"
                      error={error[2].length > 0}
                      helperText={error[2].length > 0 ? error[2] : ""}
                    />
                  </TableCell>
                </TableRow>
                <TableRow key={6}>
                  <TableCell component="th" scope="row" style={{ width: "175px" }}> <b>Skills</b> </TableCell>
                  <TableCell align="left" style={{ maxWidth: "304px" }}>
                    <Autocomplete
                      multiple
                      id="tags-filled"
                      options={[]}
                      value={chips}
                      freeSolo
                      disableClearable
                      onChange={handleTags}
                      // className={classes.textField}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={index}
                            variant="outlined"
                            label={option}
                            // className={classes.textField}
                            {...getTagProps({ index })}
                            onDelete={handleDeleteTag(option)}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField {...params}
                          variant="outlined"
                          placeholder="Skills"
                          helperText="After input press Enter to create new tag"
                        />
                      )}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <button
            className={classes.margin}
            type="submit"
            style={{ display: "inline block" }}
          >
            SAVE PROFILE
          </button>
        </form>
      </article>
    </>
  );
};

export default ProfileForms;

import { makeStyles } from '@material-ui/core/styles';

// css like style themes using material-ui
// make a form box, and format text boxes and buttons and labels
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
    left: "53%",
  },
  form: {
    marginTop: "2rem",
    position: "relative",
    left: "20%",
    backgroundColor: "white",
    padding: "1rem 2rem",
    borderRadius: "0.25rem",
    textAlign: "center",
    width: "60%",
  },
  customFormControl: {
    // display: "inline-flex",
    margin: "0.5rem 0",
    gridTemplateColumns: "100%",
    alignItems: "center",
    textAlign: "center",
  },
  textField: {
    resize: "vertical",
    font: "inherit",
    textAlign: "left",
    width: "85%",
    borderColor: "#bcccdc",
    marginBottom: "0.5rem",
    justifyContent: "space-evenly"
  },
  errorText: {
    width: "100%",
    marginTop: theme.spacing(1),
    color: "red"
  },
  labels: {
    textAlign: "left",
    marginBottom: "0.2rem",
  },
  formButton: {
    display: "inline-block",
    background: "white",
    color: "#222",
    borderColor: " #bcccdc",
    marginTop: "2rem",
    letterSpacing: "0.1rem",
    padding: "0.65rem 0.65rem",
    textTransform: "capitalize",
    borderRadius: "0.25rem",
    cursor: "pointer",
    margin: "44px",
  },
}));

export { useStyles };
import { useCallback, useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Snackbar from "@material-ui/core/Snackbar";
import { LoginService } from "./services/auth";
import { useStyles } from "./styles/authStyles";
import { Avatar, Container, CssBaseline, Typography } from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";

const passwordValidationsMsg =
  "The password must contain at least 8 characters, one upper case letter, one number and one special character";

const validateEmail = (email: string) => {
  const regex = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;

  return regex.test(email);
};

const validatePassword = (password: string) => {
  const passwordRulesRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

  return passwordRulesRegex.test(password);
};

export const LoginPage = () => {
  const classes = useStyles();

  const [emailValidationMessage, setEmailValidationMessage] = useState("");
  const [passwordValidationMessage, setPasswordValidationMessage] =
    useState("");
  const [formValues, setFormValues] = useState<{
    email: string;
    password: string;
  }>({ email: "", password: "" });
  const [isFetching, setIsFetching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = useCallback(() => {
    const { email, password } = formValues;

    const isEmailEmpty = !email;
    const isPasswordEmpty = !password;

    if (isEmailEmpty) {
      setEmailValidationMessage("The email is required");
    }

    if (isPasswordEmpty) {
      setPasswordValidationMessage("The password is required");
    }

    return isEmailEmpty || isPasswordEmpty;
  }, [formValues]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (validateForm()) {
        return;
      }
      const { email, password } = formValues;

      try {
        setIsFetching(true);
        const response = await LoginService({ email, password });

        if (!response.ok) {
          throw response;
        }
      } catch (err: any) {
        const data = await err.json();
        setErrorMessage(data.message);
        setIsOpen(true);
      } finally {
        setIsFetching(false);
      }
    },
    [formValues, validateForm]
  );

  const handleChange = useCallback(
    ({ target: { value, name } }) => {
      setFormValues({ ...formValues, [name]: value });
    },
    [formValues]
  );

  const handleBlurEmail = useCallback(() => {
    if (!validateEmail(formValues.email)) {
      setEmailValidationMessage(
        "The email is invalid. Example: john.doe@mail.com"
      );
      return;
    }

    setEmailValidationMessage("");
  }, [formValues.email]);

  const handleBlurPassword = useCallback(() => {
    if (!validatePassword(formValues.password)) {
      setPasswordValidationMessage(passwordValidationsMsg);
      return;
    }

    setPasswordValidationMessage("");
  }, [formValues.password]);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5">
            Login Page
          </Typography>
          {isFetching && <CircularProgress data-testid="loading-indicator" />}
          <form onSubmit={handleSubmit} className={classes.form} noValidate>
            <TextField
              label="email"
              id="email"
              name="email"
              variant="outlined"
              margin="normal"
              fullWidth
              helperText={emailValidationMessage}
              onChange={handleChange}
              onBlur={handleBlurEmail}
              placeholder="Ingresa tu email"
              value={formValues.email}
              error={!!emailValidationMessage}
            />
            <TextField
              label="password"
              id="password"
              type="password"
              name="password"
              variant="outlined"
              margin="normal"
              fullWidth
              helperText={passwordValidationMessage}
              onChange={handleChange}
              onBlur={handleBlurPassword}
              placeholder="Ingresa tu contraseña"
              value={formValues.password}
              error={!!passwordValidationMessage}
            />
            <Button
              disabled={isFetching}
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Send
            </Button>
          </form>
          <Snackbar
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={isOpen}
            autoHideDuration={6000}
            onClose={handleClose}
            message={errorMessage}
          />
        </div>
      </Container>
    </>
  );
};

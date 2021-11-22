import {
  Button,
  CircularProgress,
  Snackbar,
  TextField,
} from "@material-ui/core";
import React, { useCallback, useState } from "react";
import { httpSuccess, httpUnexpectedError } from "../constants/httpConstants";
import { Login as LoginInterface } from "../interfaces/Login";
import { LoginService } from "./services/auth";

export const initialValues = {
  email: "",
  password: "",
};

const validateEmail = (email: string) => {
  const regex =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

  return regex.test(email);
};
const validatePassword = (password: string) => {
  const passwordRulesRegex = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/;

  return passwordRulesRegex.test(password);
};
export const Login = () => {
  const [emailErrors, setEmailErrors] = useState("");
  const [passwordErrors, setPasswordError] = useState("");

  const [formValues, setFormValues] = useState<LoginInterface>(initialValues);

  const [isSaving, setisSaving] = useState(false);

  const [unexpetedError, setUnexpetedError] = useState("");
  const { email, password } = formValues;

  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!email || !password) {
        setEmailErrors("The email is required");

        setPasswordError("The password is required");
        return;
      }
      setEmailErrors("");
      setPasswordError("");
      setisSaving(true);

      try {
        setisSaving(true);
        const response = await LoginService({ email, password });
        console.log(response);
        if (!response.ok) {
          throw response;
        }
      } catch (err: any) {
        const data = await err.json();
        setUnexpetedError(data.message);
        setIsOpen(true);
      } finally {
        setisSaving(false);
      }
    },
    [email, password]
  );

  const handleChange = useCallback((e) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      [e.target.name]: e.target.value,
    }));
  }, []);
  const handleClose = useCallback((e) => {
    setIsOpen(false);
  }, []);

  const handleBlurEmail = useCallback(
    (e) => {
      if (!validateEmail(email)) {
        setEmailErrors(
          "The email value should contain the proper email format"
        );
        return;
      }
      setEmailErrors("");
    },
    [email]
  );
  const handleBlurPassword = useCallback(
    (e) => {
      if (!validatePassword(password)) {
        setPasswordError(
          "The password input should contain at least: 8 characters, one upper case letter, one number and one special character"
        );
        return;
      }
      setPasswordError("");
    },
    [password]
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {isSaving && <CircularProgress data-testid="loading-indicator" />}

        <h1>Login Page</h1>
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          open={isOpen}
          autoHideDuration={6000}
          onClose={handleClose}
          message={unexpetedError}
        />

        <TextField
          id="email"
          type="email"
          label="email"
          name="email"
          helperText={emailErrors}
          value={email}
          onBlur={handleBlurEmail}
          onChange={handleChange}
        />

        <TextField
          type="password"
          id="password"
          label="password"
          helperText={passwordErrors}
          value={password}
          name="password"
          onBlur={handleBlurPassword}
          onChange={handleChange}
        />
        <Button disabled={isSaving} type="submit">
          Subir Datos
        </Button>
      </form>
    </div>
  );
};

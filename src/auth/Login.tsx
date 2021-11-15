import { Button, TextField } from "@material-ui/core";
import React, { useCallback, useState } from "react";
import { Login as LoginInterface } from "../interfaces/Login";

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
  const passwordRulesRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

  return passwordRulesRegex.test(password);
};
export const Login = () => {
  const [emailErrors, setEmailErrors] = useState("");
  const [passwordErrors, setPasswordError] = useState("");

  const [formValues, setFormValues] = useState<LoginInterface>(initialValues);

  const { email, password } = formValues;

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!email || !password) {
        setEmailErrors("The email is required");

        setPasswordError("The password is required");
        return;
      }
      setEmailErrors("");
      setPasswordError("");
    },
    [email, password]
  );

  const handleChange = useCallback((e) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      [e.target.name]: e.target.value,
    }));
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
          "The password input should contain at least: 8 characters, one upper case  letter, one number and one special character"
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
        <h1>Login Page</h1>
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
        <Button type="submit">Subir Datos</Button>
      </form>
    </div>
  );
};

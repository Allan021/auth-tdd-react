import React from "react";
import { Redirect, Route } from "react-router";

const PrivateRoute = ({
  children,
  path,
  isAuth,
}: {
  children: any;
  path: string;
  isAuth: boolean;
}) => (
  <Route path={path} exact>
    {isAuth ? { children } : <Redirect to="/" />}
  </Route>
);

export default PrivateRoute;

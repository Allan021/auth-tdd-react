import { Redirect, Route, Switch } from "react-router";
import { AdminPage } from "../admin/AdminPage";
import { EmployeePage } from "../admin/EmployeePage ";
import { LoginPage } from "../auth/Login";
import PrivateRoute from "./PrivateRoute";

const AppRouter = () => {
  const isAuth = false;
  return (
    <Switch>
      <Route path="/" exact>
        <LoginPage />
      </Route>
      <PrivateRoute path="/admin" isAuth={isAuth}>
        <AdminPage />
      </PrivateRoute>
      <Route path="/employee" exact>
        {isAuth ? <EmployeePage /> : <Redirect to="/" />}
      </Route>
      <Redirect to="/" />
    </Switch>
  );
};

export default AppRouter;

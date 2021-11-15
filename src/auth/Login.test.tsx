import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Login } from "./Login";
import { setupServer } from "msw/node";
import { handlers } from "../mocks/handlers";

beforeEach(() => render(<Login />));
const server = setupServer(...handlers);

beforeAll(() => {
  // Establish requests interception layer before all tests.
  server.listen();
});
afterAll(() => {
  // Clean up after all tests are done, preventing this
  // interception layer from affecting irrelevant tests.
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});
describe("when the form uis mounted", () => {
  test("There must be a login page. ", () => {
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  test("The login page must have a form with the following fields: email, password and  a submit button", () => {
    expect(screen.getByLabelText("email")).toBeInTheDocument();
    expect(screen.getByLabelText("password")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /subir datos/i })
    ).toBeInTheDocument();
  });
});
describe("When the user submits the form", () => {
  test("If the user leaves empty fields and clicks the submit button, the login page should display required messages as the format: “The [field name] is required” ", () => {
    const btnSubmit = screen.getByRole("button", { name: /subir datos/i });
    expect(
      screen.queryByText(/The email is required/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/The password is required/i)
    ).not.toBeInTheDocument();

    fireEvent.click(btnSubmit);
    expect(screen.queryByText(/The email is required/i)).toBeInTheDocument();
    expect(screen.queryByText(/The password is required/i)).toBeInTheDocument();
  });

  test("When the user submits the form and the fileds are not empty , there must not be error messages", () => {
    const btnSubmit = screen.getByRole("button", { name: /subir datos/i });
    expect(
      screen.queryByText(/The email is required/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/The password is required/i)
    ).not.toBeInTheDocument();

    fireEvent.click(btnSubmit);
    expect(screen.queryByText(/The email is required/i)).toBeInTheDocument();
    expect(screen.queryByText(/The password is required/i)).toBeInTheDocument();
  });
});

describe("The email value should contain the proper email format (the “@”, domain value", () => {
  test("should show an validation message in the email field", async () => {
    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.change(emailInput, {
      target: {
        name: "email",
        value: "invalid",
      },
    });

    fireEvent.blur(emailInput);

    expect(
      screen.queryByText(
        /the email value should contain the proper email format/i
      )
    ).toBeInTheDocument();
  });

  test("should not show an validation message in the email field if the user fill the field properly", () => {
    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.change(emailInput, {
      target: {
        name: "email",
        value: "allan.castro1912@gmail.com",
      },
    });

    fireEvent.blur(emailInput);

    expect(
      screen.queryByText(
        /the email value should contain the proper email format/i
      )
    ).not.toBeInTheDocument();
  });
});
describe("When the user fill the password input", () => {
  test("When the user type an insercure password should show a validation message 'The password input should contain at least: 8 characters, one upper case  letter, one number and one special character'", () => {
    const passwordField = screen.getByLabelText(/password/i);

    fireEvent.change(passwordField, {
      target: {
        name: "password",
        value: "33dff2",
      },
    });

    fireEvent.blur(passwordField);

    expect(
      screen.queryByText(
        /The password input should contain at least: 8 characters, one upper case  letter, one number and one special character/i
      )
    ).toBeInTheDocument();
  });
});

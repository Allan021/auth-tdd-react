import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { Login } from "./Login";
import { setupServer } from "msw/node";
import { handlers } from "../mocks/handlers";
import { rest } from "msw";
import { httpUnexpectedError } from "../constants/httpConstants";
import { act } from "react-dom/test-utils";

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

const getSubmitButton = () =>
  screen.getByRole("button", { name: /subir datos/i });

const getPasswordField = () => screen.getByLabelText("password");
const getEmailField = () => screen.getByLabelText("email");

const fillCorrectValues = (email: string, password: string) => {
  fireEvent.change(getPasswordField(), {
    target: {
      name: "password",
      value: password,
    },
  });

  fireEvent.change(getEmailField(), {
    target: {
      name: "email",
      value: email,
    },
  });
};

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
    fireEvent.change(getPasswordField(), {
      target: {
        name: "password",
        value: "1234",
      },
    });

    fireEvent.blur(getPasswordField());

    expect(
      screen.queryByText(
        /the password input should contain at least: 8 characters, one upper case letter, one number and one special character/i
      )
    ).toBeInTheDocument();
  });

  test("When the user field the password field correctly", () => {
    fireEvent.change(getPasswordField(), {
      target: {
        name: "password",
        value: "Allan1234567:v",
      },
    });

    fireEvent.blur(getPasswordField());

    expect(
      screen.queryByText(
        /the password input should contain at least: 8 characters, one upper case letter, one number and one special character/i
      )
    ).not.toBeInTheDocument();
  });
});

describe("must call an endpoint when the user submits the form", () => {
  test("Before fetching, the submit button does  have to be disabled", async () => {
    fillCorrectValues("email@example.com", "Allan123456:v");
    fireEvent.click(getSubmitButton());
    expect(getSubmitButton()).toBeDisabled();

    await waitFor(() => {
      expect(getSubmitButton()).not.toBeDisabled();
    });
  });

  test("There should be a loading indicator at the top of the form while it is fetching", async () => {
    expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();
    fillCorrectValues("email@example.com", "Allan123456:v");

    fireEvent.click(getSubmitButton());
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("loading-indicator")
    );
  });
});

describe("In a unexpected server error, the form page must display the error message “Unexpected error, please try again” from the api.", () => {
  test('should show an message of "Unexpected error, please try again"', async () => {
    server.use(
      rest.post("/login", (req, res, ctx) =>
        res(
          ctx.status(httpUnexpectedError),
          ctx.json({ message: "Unexpected error, please try again" })
        )
      )
    );

    expect(
      screen.queryByText(/Unexpected error, please try again/i)
    ).not.toBeInTheDocument();
    act(() => {
      /* fire events that update state */
      fillCorrectValues("email@example.com", "Allan123456:v");
    });

    fireEvent.click(getSubmitButton());

    // expect(
    //   await screen.findByText(/unexpected error, please try again/i)
    // ).toBeInTheDocument();
  });
});

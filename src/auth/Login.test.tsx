import {
  screen,
  render,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { setupServer } from "msw/node";
import { RequestParams, rest } from "msw";
import { LoginPage } from "./Login";
import { handlers } from "../mocks/handlers";
import {
  HTTP_INVALID_CREDENTIAL,
  HTTP_SUCCESS_STATUS,
} from "../constants/httpConstants";

const HTTP_UNEXPECTED_ERROR_STATUS = 500;

const passwordValidationMessage =
  "The password must contain at least 8 characters, one upper case letter, one number and one special character";

const getPasswordInput = () => screen.getByLabelText(/password/i);

const getSendButton = () => screen.getByRole("button", { name: /send/i });

interface Login {
  email?: string;
  password?: string;
}

const fillInputs = ({
  email = "john.doe@test.com",
  password = "Aa123456789!@#",
}: Login = {}) => {
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  });
};

const server = setupServer(...handlers);

beforeEach(() => render(<LoginPage />));

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe("when login page is mounted", () => {
  it("must display the login title", () => {
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  it("must have a form with the following fields: email, password and a submit button", () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(getSendButton()).toBeInTheDocument();
  });
});

describe("when the user leaves empty fields and clicks the submit button", () => {
  it('display required messages as the format: "The [field name] is required"', async () => {
    expect(
      screen.queryByText(/the email is required/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/the password is required/i)
    ).not.toBeInTheDocument();

    fireEvent.click(getSendButton());

    expect(screen.getByText(/the email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/the password is required/i)).toBeInTheDocument();

    await waitFor(() => expect(getSendButton()).not.toBeDisabled());
  });
});

describe("when the user fills the fields and clicks the submit button", () => {
  it("must not display the required messages", async () => {
    fillInputs();

    fireEvent.click(getSendButton());

    expect(
      screen.queryByText(/the email is required/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/the password is required/i)
    ).not.toBeInTheDocument();

    await waitFor(() => expect(getSendButton()).not.toBeDisabled());
  });
});

describe("when the user fills and blur the email input with invalid email, and then focus and change with valid value", () => {
  it("must not display a validation message", () => {
    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.change(emailInput, {
      target: { value: "invalid.email" },
    });
    fireEvent.blur(emailInput);

    expect(
      screen.getByText(/the email is invalid. Example: john.doe@mail.com/i)
    ).toBeInTheDocument();

    fireEvent.change(emailInput, {
      target: { value: "john.doe@email.com" },
    });
    fireEvent.blur(emailInput);

    expect(
      screen.queryByText(/the email is invalid. Example: john.doe@mail.com/i)
    ).not.toBeInTheDocument();
  });
});

describe("when the user fills and blur the password input with a value with 7 character length", () => {
  it(`must display the validation message "The password must contain at least 8 characters,
  one upper case letter, one number and one special character"`, () => {
    const passwordSevenLengthVal = "asdfghj";

    fireEvent.change(getPasswordInput(), {
      target: { value: passwordSevenLengthVal },
    });
    fireEvent.blur(getPasswordInput());

    expect(screen.getByText(passwordValidationMessage)).toBeInTheDocument();
  });
});

describe("when the user fills and blur the password input with a value without one upper case character", () => {
  it(`must display the validation message "The password must contain at least 8 characters,
  one upper case letter, one number and one special character"`, () => {
    const passwordWithoutUpperCaseVal = "asdfghj8";

    fireEvent.change(getPasswordInput(), {
      target: { value: passwordWithoutUpperCaseVal },
    });
    fireEvent.blur(getPasswordInput());

    expect(screen.getByText(passwordValidationMessage)).toBeInTheDocument();
  });
});

describe("when the user fills and blur the password input with a value without one number", () => {
  it(`must display the validation message "The password must contain at least 8 characters,
  one upper case letter, one number and one special character"`, () => {
    const passwordWithoutNumb = "asdfghjA";

    fireEvent.change(getPasswordInput(), {
      target: { value: passwordWithoutNumb },
    });
    fireEvent.blur(getPasswordInput());

    expect(screen.getByText(passwordValidationMessage)).toBeInTheDocument();
  });
});

describe(`when the user fills and blur the password input with without one special character and
then change with valid value and blur again`, () => {
  it(`must not display the validation message`, () => {
    const passwordWithoutSpecialChar = "asdfghjA1a";
    const validPassword = "aA1asdasda#";

    fireEvent.change(getPasswordInput(), {
      target: { value: passwordWithoutSpecialChar },
    });
    fireEvent.blur(getPasswordInput());

    expect(screen.getByText(passwordValidationMessage)).toBeInTheDocument();

    fireEvent.change(getPasswordInput(), {
      target: { value: validPassword },
    });
    fireEvent.blur(getPasswordInput());

    expect(
      screen.queryByText(passwordValidationMessage)
    ).not.toBeInTheDocument();
  });
});

describe("when the user submit the login form with valid data", () => {
  it("must disable the submit button while the form page is fetching the data", async () => {
    fillInputs();

    fireEvent.click(getSendButton());

    expect(getSendButton()).toBeDisabled();

    await waitFor(() => expect(getSendButton()).not.toBeDisabled());
  });

  it("must be a loading indicator at the top of the form while it is fetching", async () => {
    expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();

    fillInputs();

    fireEvent.click(getSendButton());

    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("loading-indicator")
    );
  });
});

describe("when the user submit the login form with valid data and there is an unexpected server error", () => {
  it('must display the error message "Unexpected error, please try again" from the api', async () => {
    server.use(
      rest.post("/login", (req, res, ctx) =>
        res(
          ctx.status(HTTP_UNEXPECTED_ERROR_STATUS),
          ctx.json({ message: "Unexpected error, please try again" })
        )
      )
    );

    expect(
      screen.queryByText(/unexpected error, please try again/i)
    ).not.toBeInTheDocument();

    fillInputs();

    fireEvent.click(getSendButton());

    expect(
      await screen.findByText(/unexpected error, please try again/i)
    ).toBeInTheDocument();
  });
});

describe("when the user submit the login form with valid data and there is an invalid credentials error", () => {
  it('must display the error message "The email or password are not correct" from the api', async () => {
    server.use(
      rest.post<Login, any, RequestParams>("/login", (req, res, ctx) => {
        const { email, password } = req.body;

        if (email !== "john.doe@test.com" || password !== "Aa123456789!@#") {
          return res(
            ctx.status(HTTP_INVALID_CREDENTIAL),
            ctx.json({ message: "The email or password are not correct" })
          );
        }
        return res(ctx.status(HTTP_SUCCESS_STATUS));
      })
    );

    expect(
      screen.queryByText(/the email or password are not correct/i)
    ).not.toBeInTheDocument();

    fillInputs({ email: "xd", password: "xd" });
    fireEvent.click(getSendButton());

    expect(
      await screen.findByText(/the email or password are not correct/i)
    ).toBeInTheDocument();
  });

  it('must not display the error message "The email or password are not correct" from the api', async () => {
    server.use(
      rest.post<Login, any, RequestParams>("/login", (req, res, ctx) => {
        const { email, password } = req.body;
        console.log(req.body);

        if (email !== "john.doe@test.com" || password !== "Aa123456789!@#") {
          return res(
            ctx.status(HTTP_INVALID_CREDENTIAL),
            ctx.json({ message: "The email or password are not correct" })
          );
        }
        return res(ctx.status(HTTP_SUCCESS_STATUS));
      })
    );

    expect(
      screen.queryByText(/the email or password are not correct/i)
    ).not.toBeInTheDocument();

    fillInputs();
    fireEvent.click(getSendButton());

    await waitFor(() => {
      expect(
        screen.queryByText(/the email or password are not correct/i)
      ).not.toBeInTheDocument();
    });
  });
});

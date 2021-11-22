interface login {
  email: string;
  password: string;
}
export const LoginService = (formValues: login) =>
  fetch("/login", {
    body: JSON.stringify(formValues),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

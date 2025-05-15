import { sessionService } from "redux-react-session";
import { BASE_URL } from "../constants";

export const loginUser = (payload, navigate, setError, setLoading) => {
  return async () => {
    const url = BASE_URL + "/api/user/login";

    setLoading(true);

    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.token) {
          localStorage.setItem("praid-user", JSON.stringify(data));
          sessionService.saveSession(data).then(() => {
            sessionService.saveUser(data).then(() => {
              navigate("/dashboard");
            });
          });
        } else {
          setError(data?.message || "Invalid Credentials");
        }
      })
      .catch((err) =>
        setError("An error occurred during login. Please try again.")
      )
      .finally(() => setLoading(false));
  };
};

export const registerUser = (
  payload,
  navigate,
  setError,
  setLoading,
  handleContinue
) => {
  return async () => {
    const url = BASE_URL + "/api/user/register";

    setLoading(true);

    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        handleContinue();
      })
      .catch((err) => setError("Something went wrong. Please try again later."))
      .finally(() => setLoading(false));
  };
};

export const logoutUser = (navigate) => {
  return () => {
    localStorage.removeItem("praid-user");
    sessionService.deleteSession();
    sessionService.deleteUser();
    navigate("/");
  };
};

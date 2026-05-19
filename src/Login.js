import React, { useState } from "react";

function Login({ setUser }) {

  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  // =========================
  
  // =========================

  const handleSubmit = async () => {

    // Validation
    if (!username) {

      alert("Username is required");

      return;

    }

    if (!password) {

      alert("Password is required");

      return;

    }

    // =========================
    // LOGIN
    // =========================

    if (isLogin) {

      try {

        const response = await fetch(
  "/api/login",
  {
    method: "POST",
            headers: {

              "Content-Type": "application/json"

            },

            body: JSON.stringify({

              username,

              password

            })

          }
        );

        const data = await response.json();

        // Invalid login
        if (data.message) {

          alert(data.message);

          return;

        }

        // Save user
        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );

        setUser(data);

        alert("Login Successful");

      }

      catch (error) {

        console.log(error);

        alert("Server Error");

      }

    }

    // =========================
    // REGISTER
    // =========================

    else {

      try {

        // Create voter ID
        const voterId =
          "VOTER-" +
          Math.floor(Math.random() * 10000);

        const response = await fetch(
  "/api/register",
  
          {

            method: "POST",

            headers: {

              "Content-Type": "application/json"

            },

            body: JSON.stringify({

              username,

              password,

              voterId

            })

          }
        );

        const data = await response.text();

        alert(data);

        // Clear Inputs
        setUsername("");

        setPassword("");

        // Go to login screen
        setIsLogin(true);

      }

      catch (error) {

        console.log(error);

        alert("Server Error");

      }

    }

  };

  return (

    <div className="row justify-content-center">

      <div className="col-md-5">

        <div className="card login-card shadow-lg p-4">

          <h2 className="text-center text-primary mb-4">

            {isLogin ? "Login" : "Register"}

          </h2>

          {/* Username */}

          <input
            type="text"
            placeholder="Enter Username"
            className="form-control mb-3"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          {/* Password */}

          <input
            type="password"
            placeholder="Enter Password"
            className="form-control mb-3"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {/* Main Button */}

          <button
            className="btn btn-primary w-100 mb-3"
            onClick={handleSubmit}
          >

            {isLogin ? "Login" : "Register"}

          </button>

          {/* Switch Button */}

          <button
            className="btn btn-warning w-100"
            onClick={() =>
              setIsLogin(!isLogin)
            }
          >

            {isLogin
              ? "Create New Account"
              : "Already Have Account"}

          </button>

        </div>

      </div>

    </div>

  );

}

export default Login;
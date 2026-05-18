import React, { useEffect, useState } from "react";

import Login from "./Login";
import Vote from "./Vote";
import Result from "./Result";

function App() {

  // =========================
  // USER STATE
  // =========================

  const [user, setUser] = useState(

    JSON.parse(localStorage.getItem("user"))

  );

  // =========================
  // GLOBAL TIMER
  // =========================

  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {

    let endTime = localStorage.getItem(
      "globalEndTime"
    );

    // Create Global Timer Once
    if (!endTime) {

      endTime = Date.now() + 300000;

      localStorage.setItem(
        "globalEndTime",
        endTime
      );

    }

    const timer = setInterval(() => {

      const remaining = Math.floor(

        (endTime - Date.now()) / 1000

      );

      // Voting Ended
      if (remaining <= 0) {

        setTimeLeft(0);

        clearInterval(timer);

        // Auto Logout
        localStorage.removeItem("user");

        setUser(null);

      }

      else {

        setTimeLeft(remaining);

      }

    }, 1000);

    return () => clearInterval(timer);

  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {

    localStorage.removeItem("user");

    setUser(null);

  };

  // =========================
  // UI
  // =========================

  return (

    <div className="main-bg">

      <div className="container py-5">

        {/* App Title */}

        <h1 className="text-center app-title mb-4">

          Online Voting System

        </h1>

        {/* If User NOT Logged In */}

        {
          !user ? (

            <Login setUser={setUser} />

          ) : (

            <>
            
              {/* Logout Button */}

              <div className="text-center mb-3">

                <button
                  className="btn btn-dark logout-btn"
                  onClick={handleLogout}
                >

                  Logout

                </button>

              </div>

              {/* Voting Active */}

              {
                timeLeft > 0 ? (

                  <Vote timeLeft={timeLeft} />

                ) : (

                  /* Voting Ended */

                  <Result />

                )
              }

            </>
          )
        }

      </div>

    </div>

  );

}

export default App;
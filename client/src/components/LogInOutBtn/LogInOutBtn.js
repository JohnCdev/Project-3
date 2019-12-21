import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./logInOutBtn.css"

export default function LogInOutBtn() {
  const { isAuthenticated } = useContext(AuthContext);
  const authenticationStatus = !isAuthenticated ? (
    <button className="btn my-2 my-sm-0">
      <Link to="/log-in">Log In</Link>
    </button>
  ) : (
      <button className="btn my-2 my-sm-0"
      style={{marginLeft: 10}}>
        <Link to="/log-in">Log Out</Link>
      </button>
    );

  return authenticationStatus;
}
import React from "react";
import { Outlet } from "react-router-dom";

function ProtectedRoute(){
    const isLoggedIn = localStorage.getItem("loggedIn");
    return isLoggedIn === "true" ? <Outlet/>:<Navigate to = "login"/>
    return "route";
}

export default ProtectedRoute;
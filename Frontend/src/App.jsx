import "./App.css";
import Navbar from "./Components/Navbar";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";

import Product from "./Components/Product";
import AddProduct from "./Components/AddProduct";
import UpdateProduct from "./Components/UpdateProduct";
import Logout from "./Components/Logout";
import Profile from "./Components/Profile";
import NotFound from "./Components/NotFound";
import SignUp from "./Components/Signup";
import PrivateCompnent from "./Components/PrivateCompnent";
import Login from "./Components/Login";

const router = createBrowserRouter([
  {
    path: "/signup",
    element: (
      <div>
        <Navbar />
        <SignUp />
      </div>
    ),
  },
  {
    path: "/login",
    element: (
      <div>
        <Navbar />
        <Login />
      </div>
    ),
  },
  {
    path: "/",
    element: (
      <div>
        <Navbar />
        <Product />
      </div>
    ),
  },
  {
    element: <PrivateCompnent />,
    children: [
      {
        path: "/add",
        element: (
          <div>
            <Navbar />
            <AddProduct />
          </div>
        ),
      },
      {
        path: "/update",
        element: (
          <div>
            <Navbar />
            <UpdateProduct />
          </div>
        ),
      },
      {
        path: "/logout",
        element: (
          <div>
            <Navbar />
            <Logout />
          </div>
        ),
      },
      {
        path: "/profile",
        element: (
          <div>
            <Navbar />
            <Profile />
          </div>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <>
      <div>
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;

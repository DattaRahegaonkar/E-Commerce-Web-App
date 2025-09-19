import "./App.css";
import Navbar from "./Components/Navbar";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";

import Product from "./Components/Product";
import ProductDetail from "./Components/ProductDetail";
import AddProduct from "./Components/AddProduct";
import UpdateProduct from "./Components/UpdateProduct";
import Logout from "./Components/Logout";
import Profile from "./Components/Profile";
import NotFound from "./Components/NotFound";
import SignUp from "./Components/Signup";
import PrivateComponent from "./Components/PrivateComponent";
import Login from "./Components/Login";
import Cart from "./Components/Cart";
import Checkout from "./Components/Checkout";
import OrderConfirmation from "./Components/OrderConfirmation";
import OrderHistory from "./Components/OrderHistory";
import PaymentPage from "./Components/PaymentPage";
import AdminDashboard from "./Components/AdminDashboard";

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
    element: <PrivateComponent />,
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
        path: "/product/:id",
        element: (
          <div>
            <Navbar />
            <ProductDetail />
          </div>
        ),
      },
      {
        path: "/update/:id",
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
      {
        path: "/cart",
        element: (
          <div>
            <Navbar />
            <Cart />
          </div>
        ),
      },
      {
        path: "/checkout",
        element: (
          <div>
            <Navbar />
            <Checkout />
          </div>
        ),
      },
      {
        path: "/payment/:orderId",
        element: (
          <div>
            <Navbar />
            <PaymentPage />
          </div>
        ),
      },
      {
        path: "/order-confirmation/:orderId",
        element: (
          <div>
            <Navbar />
            <OrderConfirmation />
          </div>
        ),
      },
      {
        path: "/orders",
        element: (
          <div>
            <Navbar />
            <OrderHistory />
          </div>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <div>
        <Navbar />
        <AdminDashboard />
      </div>
    ),
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

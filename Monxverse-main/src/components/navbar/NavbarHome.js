import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import logoDark from "../../assets/logo.png";
import logoLight from "../../assets/logo_light.png"
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@react-hook/media-query";

const Navbar = () => {
  const navigate = useNavigate();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const logo = prefersDarkMode ? logoDark : logoLight;
  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 sticky top-0 z-20">
      <div className="max-w-screen-xl flex justify-between items-center mx-auto py-4 px-10">
        <p href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src={logo}
            className="h-8 w-8 rounded-full bg-transparent"
            alt="MonkeyMonk Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:dark:text-white">
            MonkeyMonk
          </span>
        </p>
        <p
          className="nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white bg-primary-400"
          onClick={() => navigate("/")}
        >
          Home
        </p>
      </div>
    </nav>
  );
};

export default Navbar;

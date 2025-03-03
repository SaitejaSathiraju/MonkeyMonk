import React, { useRef, useState } from "react";
import logoDark from "../../assets/logo.png";
import logoLight from "../../assets/logo_light.png"
import { useMediaQuery } from "@react-hook/media-query";

const Navbar = () => {
  const navItemRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const logo = prefersDarkMode ? logoDark : logoLight;

  const handleNavItemClick = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const yOffset = -40;
      const y =
        section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setIsMobileMenuOpen(false);
      setActiveItem(sectionId);
    }
  };

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 sticky top-0 z-20">
      <div className=" flex flex-wrap items-center justify-between mx-auto py-4 px-10">
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
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
        <div className="hidden md:block">
          <ul className="font-medium flex flex-col md:flex-row md:space-x-8 rtl:space-x-reverse">
            <li>
              <p
                className={`nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white ${
                  activeItem === "home" ? "bg-primary-400" : ""
                }`}
                onClick={() => handleNavItemClick("home")}
              >
                Home
              </p>
            </li>
            <li>
              <p
                className={`nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white ${
                  activeItem === "about" ? "bg-primary-400" : ""
                }`}
                onClick={() => handleNavItemClick("about")}
              >
                About
              </p>
            </li>
            <li>
              <p
                className={`nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white ${
                  activeItem === "services" ? "bg-primary-400" : ""
                }`}
                onClick={() => handleNavItemClick("services")}
              >
                Services
              </p>
            </li>
            <li>
              <p
                className={`nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white ${
                  activeItem === "contact" ? "bg-primary-400" : ""
                }`}
                onClick={() => handleNavItemClick("contact")}
              >
                Contact
              </p>
            </li>
            <li>
              <p
                className={`nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white ${
                  activeItem === "blogs" ? "bg-primary-400" : ""
                }`}
                onClick={() => handleNavItemClick("blogs")}
              >
                Blog
              </p>
            </li>
          </ul>
        </div>
        {isMobileMenuOpen && (
          <div className="w-full md:hidden">
            <ul className="font-medium flex flex-col p-4 mt-4 text-center">
              <li>
                <p
                  className={`nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white ${
                    activeItem === "home" ? "bg-primary-400" : ""
                  }`}
                  onClick={() => handleNavItemClick("home")}
                >
                  Home
                </p>
              </li>
              <li>
                <p
                  className={`nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white ${
                    activeItem === "about" ? "bg-primary-400" : ""
                  }`}
                  onClick={() => handleNavItemClick("about")}
                >
                  About
                </p>
              </li>
              <li>
                <p
                  className={`nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white ${
                    activeItem === "services" ? "bg-primary-400" : ""
                  }`}
                  onClick={() => handleNavItemClick("services")}
                >
                  Services
                </p>
              </li>
              <li>
                <p
                  className={`nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white ${
                    activeItem === "contact" ? "bg-primary-400" : ""
                  }`}
                  onClick={() => handleNavItemClick("contact")}
                >
                  Contact
                </p>
              </li>
              <li>
                <p
                  className={`nav-item block py-2 px-3 rounded hover:cursor-pointer dark:text-white ${
                    activeItem === "blogs" ? "bg-primary-400" : ""
                  }`}
                  onClick={() => handleNavItemClick("blogs")}
                >
                  Blog
                </p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

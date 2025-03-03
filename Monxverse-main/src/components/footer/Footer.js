import React from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import logoDark from "../../assets/logo.png";
import logoLight from "../../assets/logo_light.png"
import { useMediaQuery } from "@react-hook/media-query";

const Footer = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const logo = prefersDarkMode ? logoDark : logoLight;
  const handleNavItemClick = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const yOffset = -40;
      const y =
        section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  const navigate = useNavigate();
  return (
    <footer className="px-4 divide-y dark:bg-gray-900 dark:text-gray-100">
      <div className="container flex flex-col justify-between py-10 mx-auto space-y-8 lg:flex-row lg:space-y-0">
        <div className="lg:w-1/3">
          <a
            rel="noopener noreferrer"
            href="/"
            className="flex justify-center space-x-3 lg:justify-start"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full">
              <img src={logo} alt="logo" />
            </div>
            <span className="self-center text-2xl font-semibold">
              MonkeyMonk
            </span>
          </a>
        </div>
        <div className="grid grid-cols-2 text-sm gap-x-3 gap-y-8 lg:w-2/3 sm:grid-cols-4">
          <div className="space-y-3">
            <h3 className="tracking-wide uppercase dark:text-gray-50">
              Services
            </h3>
            <ul className="space-y-1">
              <li>
                <p
                  onClick={() => {
                    navigate("/zenora");
                  }}
                  className="cursor-pointer"
                >
                  Plan your trip
                </p>
              </li>
              <li>
                <p
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                  onClick={() => {
                    navigate("/dashboard");
                  }}
                >
                  Post a trip
                </p>
              </li>
              <li>
                <p
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                  onClick={() => {
                    navigate("/dashboard");
                  }}
                >
                  Join a trip
                </p>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="tracking-wide uppercase dark:text-gray-50">
              Company
            </h3>
            <ul className="space-y-1">
              <li>
                <p
                  rel="noopener noreferrer"
                  onClick={() => handleNavItemClick("about")}
                  className="cursor-pointer"
                >
                  About Us
                </p>
              </li>
              <li>
                <p
                  rel="noopener noreferrer"
                  onClick={() => handleNavItemClick("contact")}
                  className="cursor-pointer"
                >
                  Contact Us
                </p>
              </li>
              <li>
                <p
                  rel="noopener noreferrer"
                  onClick={() => handleNavItemClick("blogs")}
                  className="cursor-pointer"
                >
                  Blogs
                </p>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="uppercase dark:text-gray-50">My account</h3>
            <ul className="space-y-1">
              <li>
                <p
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                  onClick={() => {
                    navigate("/profile");
                  }}
                >
                  Change Password
                </p>
              </li>
              <li>
                <p
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                  onClick={() => {
                    navigate("/profile");
                  }}
                >
                  Update Profile
                </p>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="uppercase dark:text-gray-50 social-media">
              Social media
            </div>
            <ul className="flex">
              <li className="icon-content">
                <a
                  rel="noopener noreferrer"
                  href="https://www.linkedin.com/company/monkeymonk-official/?originalSubdomain=in"
                  title="Linkedin"
                  className="flex items-center p-1"
                  data-social="linkedin"
                >
                  <div className="filled"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="bi bi-linkedin"
                    viewBox="0 0 16 16"
                    xmlSpace="preserve"
                  >
                    <path
                      d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>
              </li>
              <li className="icon-content">
                <a
                  rel="noopener noreferrer"
                  href="https://twitter.com/monkeymonk_ai/status/1785327175543185864?s=46&t=Ng18KvTbwSPFxcd3-it4rg"
                  title="Twitter"
                  className="flex items-center p-1"
                  data-social="twitter"
                >
                  <div className="filled"></div>
                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 fill-current"
                  >
                    <path d="M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z"></path>
                  </svg>
                </a>
              </li>
              <li className="icon-content">
                <a
                  href="https://www.instagram.com/monkeymonk.official?igsh=MWluc3kycnFnc2Q2Mw=="
                  aria-label="Instagram"
                  data-social="instagram"
                >
                  <div className="filled"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-instagram"
                    viewBox="0 0 16 16"
                    xmlSpace="preserve"
                  >
                    <path
                      d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>
              </li>
              <li className="icon-content">
                <a
                  href="https://www.youtube.com/@MonkeyMonk.official?themeRefresh=1"
                  aria-label="Youtube"
                  data-social="youtube"
                >
                  <div className="filled"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-youtube"
                    viewBox="0 0 16 16"
                    xmlSpace="preserve"
                  >
                    <path
                      d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="py-6 text-sm text-center dark:text-gray-400">
        © 2023 MonkeyMonk. All rights reserved.
        <p className="text-xs mt-1">
          By using MonkeyMonk, you agree to our{" "}
          <span
            className="cursor-pointer underline"
            onClick={() => {
              navigate("/terms&conditions");
            }}
            target="_blank"
          >
            Terms of Service
          </span>{" "}
          and{" "}
          <span
            className="cursor-pointer underline"
            onClick={() => {
              navigate("/privacypolicy");
            }}
            target="_blank"
          >
            Privacy Policy
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

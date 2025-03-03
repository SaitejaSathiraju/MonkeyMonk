import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { IoIosArrowBack } from "react-icons/io";
import { AiOutlineAppstore } from "react-icons/ai";
import { BsPerson } from "react-icons/bs";
import { HiChat, HiOutlineGlobe } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import { MdMenu } from "react-icons/md";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/authContext";
import logo from "../../assets/logo.png";
import Dialog from "../dialogs/LogoutDialog";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = UserAuth();
  const isTabletMid = useMediaQuery({ query: "(max-width: 768px)" });
  const [open, setOpen] = useState(!isTabletMid);
  const [showDialog, setShowDialog] = useState(false);
  const sidebarRef = useRef();
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(!isTabletMid);
  }, [isTabletMid]);

  useEffect(() => {
    if (isTabletMid) setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const handleCancelDialog = () => {
    setShowDialog(false);
  };

  const handleConfirmDialog = () => {
    handleLogout();
    setShowDialog(false);
  };

  const Nav_animation = {
    open: {
      width: "20vw",
      transition: {
        damping: 40,
      },
    },
    closed: {
      width: "4rem",
      transition: {
        damping: 40,
      },
    },
  };

  return (
    <div className="">
      <div
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 max-h-screen z-[49] bg-black/50 ${
          open ? "block" : "hidden"
        }`}
      ></div>
      <motion.div
        ref={sidebarRef}
        variants={Nav_animation}
        initial={{ width: isTabletMid ? 0 : "20vw" }}
        animate={open ? "open" : "closed"}
        className="bg-white dark:bg-gray-900 dark:text-white text-gray shadow-xl z-[49] overflow-hidden md:relative fixed h-screen"
      >
        <div className="flex items-center gap-2.5 font-medium border-b py-3 border-slate-300 mx-3">
          <img
            src={logo}
            alt=""
            className={`rounded-full bg-black ${
              open
                ? "w-[32px] h-[32px] lg:w-[42px] lg:h-[42px] p-1"
                : "w-[32px] h-[32px]"
            }`}
          />
          {open && (
            <span className="text-xs sm:text-sm lg:text-lg xl:text-xl whitespace-pre">
              MonkeyMonk
            </span>
          )}
        </div>
        <div className="flex flex-col h-full">
          <ul className="whitespace-pre px-2.5 text-[0.9rem] py-5 flex flex-col gap-1 font-medium overflow-x-hidden scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100 md:h-[68%] h-[70%]">
            <li>
              <NavLink to={"/dashboard"} className="link">
                <AiOutlineAppstore size={23} className="min-w-max" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to={"/profile"} className="link">
                <BsPerson size={23} className="min-w-max" />
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink to={"/chat"} className="link">
                <HiChat size={23} className="min-w-max" />
                Chat
              </NavLink>
            </li>
            <li>
              <a href="https://www.monkeymonk.ai/#/zenora" className="link" target="_blank">
                <HiOutlineGlobe size={23} className="min-w-max" />
                Plan a Trip
              </a>
            </li>
            <div className="h-[1px] bg-slate-300 w-full my-2"></div>
            <li onClick={() => setShowDialog(true)}>
              <div className="link">
                <FiLogOut size={23} className="min-w-max" />
                Logout
              </div>
            </li>
          </ul>
        </div>
        <motion.div
          onClick={() => setOpen(!open)}
          animate={
            open ? { x: 0, y: 0, rotate: 0 } : { x: 0, y: 0, rotate: 180 }
          }
          transition={{ duration: 0 }}
          className="absolute bg-slate-400 rounded-full p-2 w-fit h-fit z-50 right-2 bottom-3 cursor-pointer hidden md:block"
        >
          <IoIosArrowBack size={25} />
        </motion.div>
      </motion.div>
      <div className="m-3 md:hidden" onClick={() => setOpen(true)}>
        <MdMenu size={25} />
      </div>
      {showDialog && (
        <Dialog onCancel={handleCancelDialog} onConfirm={handleConfirmDialog} />
      )}
    </div>
  );
};

export default Sidebar;

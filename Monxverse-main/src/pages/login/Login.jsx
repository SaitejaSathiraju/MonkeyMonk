import { useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  getUserByEmail,
} from "firebase/auth";
import { auth, db } from "../../firebase/Firebase";
import { FcGoogle } from "react-icons/fc";
import { IoEye, IoEyeOff } from "react-icons/io5";
import logo from "../../assets/logo.png";
import { collection, getDocs, query, where } from "firebase/firestore";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./Login.css";
import { UserAuth } from "../../context/authContext";

const Login = () => {
  const navigate = useNavigate();
  const { user } = UserAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [resetEmailSent, setResetEmailSent] = useState(false);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      const userExists = !querySnapshot.empty;
      if (userExists) {
        const userDoc = querySnapshot.docs[0].data();
        if (userDoc.isProfileComplete === false) {
          console.log("User's profile is incomplete, redirecting to complete profile page.");
          navigate("/completeProfile");
        }
      } else {
        await signOut(auth);
        navigate("/register");
        setTimeout(() => {
          showToastMessage("User doesn't exist. Please register.");
        }, 1000);
      }      
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
    }
  };

  const showToastMessage = (toastMessage) => {
    toast.error(toastMessage, {
      position: "bottom-right",
    });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    try {
      if (validateForm()) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        if (user) {
          navigate("/completeProfile");
        } else {
          navigate("/register");
        }
        setErrors({});
      }
    } catch (error) {
      console.error("Error logging in user:", error.code, error.message);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setErrors({ authError: "Incorrect username or password." });
      } else {
        setErrors({ authError: "An error occurred. Please try again later." });
      }
      setEmail("");
      setPassword("");
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setResetEmailSent(false)
    if(email){
      try {      
        const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      const userExists = !querySnapshot.empty;
      if (!userExists) {
        showToastMessage("User doesn't exist please register");
      }
       else {
        await sendPasswordResetEmail(auth, email);
        setResetEmailSent(true);
      } 
    }
      catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.error("User not found. Unable to send reset password email.");
        } else {
          console.error("Error sending reset password email:", error.message);
        }
        setResetEmailSent(false);
      }
  
}
     else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const newErrors = {};
      if (!email.trim() || !emailRegex.test(email)) {
        newErrors.email = "Invalid email address";
        setErrors(newErrors);
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const textRef = useRef(null);

  const sentences = [
    "To Travel is to Live !",
    "Travel is the Best education. You learn about Culture, History and yourself.",
    "Travel allows you to escape ordinary and embrace the extraordinary.",
    "Travel Opens your Heart, Broadens your mind, and fills your life with stories to tell.",
    "Travel is the only thing which you can spend that makes you richer.!",
  ];
  let currentSentenceIndex = 0;
  let currentLetterIndex = 0;
  let intervalId;

  useLayoutEffect(() => {
    const animateText = () => {
      intervalId = setInterval(() => {
        const currentSentence = sentences[currentSentenceIndex];
        const currentText = currentSentence.slice(0, currentLetterIndex);
        if (textRef.current) {
          textRef.current.textContent = currentText;
        }

        currentLetterIndex++;

        if (currentLetterIndex > currentSentence.length) {
          clearInterval(intervalId);
          currentLetterIndex = 0;
          currentSentenceIndex = (currentSentenceIndex + 1) % sentences.length;
          setTimeout(animateText, 2000);
        }
      }, 70);
    };

    animateText();

    return () => clearInterval(intervalId);
  }, [textRef.current]);

  if(user?.uid){
    return navigate("/dashboard")
  }

  return (
    <>
      <div className="min-h-screen bg-white text-gray-900 flex justify-center items-center">
        <div className="max-w-screen-xl m-0 sm:m-20 shadow-none sm:rounded-lg flex justify-center flex-1 lg:shadow-xl">
          <div className=" w-full lg:w-1/2 p-6 sm:p-12">
            <div className="text-center w-full flex justify-center items-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full mx-4 p-2">
                <img src={logo} alt="logo" className="" />
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center">
              <h1 className="text-2xl xl:text-3xl font-bold">
                Login for MonkeyMonk
              </h1>
              {errors.authError && (
                <span className="ml-2 text-red-500">{errors.authError}</span>
              )}
              <div className="w-full flex-1 mt-8">
                <form onSubmit={handleSubmit} className="mx-auto">
                  {resetEmailSent && (
                    <span className="ml-2 text-blue-500 font-semibold">
                      Password reset link has been shared to your email
                    </span>
                  )}
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <span className="text-red-500">{errors.email}</span>
                  )}
                  <div className="relative">
                    <input
                      className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div
                      className="absolute top-0 right-0 mt-10 mr-4 cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <IoEye /> : <IoEyeOff />}
                    </div>
                  </div>
                  {errors.password && (
                    <span className="text-red-500">{errors.password}</span>
                  )}
                  <button
                    type="submit"
                    className="mt-5 tracking-wide font-semibold bg-primary-400 text-gray-100 w-full py-4 rounded-lg hover:bg-primary-500 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 4.418 3.582 8 8 8v-4zm14-8a7.962 7.962 0 01-2 5.291V20c4.418 0 8-3.582 8-8h-4zM12 4c-2.209 0-4 1.791-4 4h4V4z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6 -ml-2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <path d="M20 8v6M23 11h-6" />
                        </svg>
                        <span className="ml-3">Sign In</span>
                      </>
                    )}
                  </button>
                  <div>
                    <p
                      className="underline cursor-pointer mt-2"
                      onClick={handleResetPassword}
                    >
                      forgot password?
                    </p>
                  </div>
                </form>

                <div className="my-12 border-b text-center">
                  <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                    Or sign in with Google
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={signInWithGoogle}
                    className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-primary-200 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
                  >
                    <div className="bg-white p-2 rounded-full">
                      <FcGoogle />
                    </div>
                    <span className="ml-4">Sign in with Google</span>
                  </button>
                </div>

                <div className="my-12  text-center">
                  <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                    Don't have an account?
                    <Link
                      to="/register"
                      className=" underline cursor-pointer text-primary-400 ml-2"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 text-center hidden lg:flex login-card justify-center items-center">
            <div className="auth-bg flex justify-center items-center p-4 text-center w-3/4 min-h-32">
              <h3
                className="text-xl md:text-4xl font-bold text-white"
                ref={textRef}
              >
                {" "}
              </h3>
            </div>
          </div>
          <ToastContainer />
        </div>
      </div>
    </>
  );
};

export default Login;

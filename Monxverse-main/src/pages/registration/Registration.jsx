import React, { useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../../firebase/Firebase";
import { doc, setDoc, getDocs, collection, where, query } from "firebase/firestore";

import { FcGoogle } from "react-icons/fc";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import logo from "../../assets/logo.png";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserAuth } from "../../context/authContext";

const Registration = () => {
  const navigate = useNavigate();
  const { user } = UserAuth();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    gender: "",
    DOB: "",
    facebookProfile: "",
    instagramProfile: "",
    twitterProfile: "",
    photoURL: "",
    isProfileComplete: false,
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [signupError, setSignupError] = useState("");
  const [signupGoogleError, setSignupGoogleError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleCheckboxChange = () => {
    if(!termsAccepted){
      setSignupError("");
      setSignupGoogleError("");
    }
    setTermsAccepted(!termsAccepted);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const signUpUser = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await sendEmailVerification(user);
      showToastMessage("Registration successful. Please check your email for verification.", "success");
      return user;
    } catch (error) {
      console.error("Error signing up user:", error.message);
      if (error.code === "auth/email-already-in-use") {
        setSignupError("Email address is already in use.");
      } else if (error.code === "auth/weak-password") {
        setSignupError("Password is too weak.");
      } else {
        setSignupError("An error occurred during sign up.");
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!termsAccepted) {
      setSignupError("Please accept the terms and conditions to sign up.");
      return;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must contain at least 6 characters, one uppercase letter, one digit, and one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    } else {
      setErrors({});
    }

    try {
      const User = await signUpUser(formData.email, formData.password);
      const userId = User.uid;
      const docRef = doc(db, "users", userId);
      await setDoc(docRef, {
        userId: userId,
        email: formData.email,
        username: "",
        firstName: "",
        lastName: "",
        gender: "",
        DOB: "",
        facebookProfile: "",
        twitterProfile: "",
        instagramProfile: "",
        photoURL: "",
        isProfileComplete: false,
      });
      await updateProfile(User, {
        displayName: formData.username,
        photoURL: "",
      });

      await setDoc(doc(db, "userChats", userId), {});
      navigate("/verifyEmail")
    } catch (error) {
      console.error("Error registering user:", error.message);
    }
  };

  const signUpWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        userId: user.uid,
        username: "",
        firstName: "",
        lastName: "",
        email: user.email,
        photoURL: user.photoURL || "",
        bio: "",
        gender: "",
        DOB: "",
        facebookProfile: "",
        instagramProfile: "",
        twitterProfile: "",
        isProfileComplete: false,
      };

      const userDocRef = doc(db, "users", user.uid);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        await signOut(auth);
        navigate("/login")
        setTimeout(() => {
          showToastMessage("User already exists please login.", "error");
        }, 100);
        return;
      }
      await setDoc(userDocRef, userData);

      await setDoc(doc(db, "userChats", user.uid), {});
      showToastMessage("Registration with Google successfully!", "success");
      navigate("/completeProfile");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setSignupError("Email address is already in use.");
      showToastMessage("Error signing up with Google", "error");
    }
  };
  }
  const showToastMessage = (toastMessage, toastType) => {
    if(toastType == "success"){
      toast.success(toastMessage, {
        position: "bottom-right",
      });
    }
    if(toastType == "error"){
      toast.error(toastMessage, {
        position: "bottom-right",
      });
    }
  };

  const textRef = useRef("");

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
    <div className="min-h-screen bg-white text-gray-900 flex justify-center items-center">
      <div className=" max-w-screen-xl m-0 sm:m-20 shadow-none lg:shadow-xl sm:rounded-lg flex justify-center flex-1 flex-row-reverse">
        <div className="w-full lg:w-1/2 xl:w-7/12 p-6 sm:p-12">
          <div className="text-center w-full flex justify-center items-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full mx-4 p-2">
              <img src={logo} alt="logo" className="" />
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center text-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              Sign up for MonkeyMonk
            </h1>
            <div className="w-full flex-1 mt-8">
              <form className="mx-auto max-w-xs" onSubmit={handleSubmit}>
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="text-red-500">{errors.email}</span>
                )}

                <div className="flex justify-end relative">
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={formData.password}
                    name="password"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-0 top-9 mr-4 focus:outline-none"
                  >
                    {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500">{errors.password}</span>
                )}

                <div className="relative flex justify-end">
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-9 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <AiFillEyeInvisible />
                    ) : (
                      <AiFillEye />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-red-500">{errors.confirmPassword}</span>
                )}
                <button className="mt-5 tracking-wide font-semibold bg-primary-400 text-gray-100 w-full py-4 rounded-lg hover:bg-primary-500 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
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
                  <span className="ml-3">Sign Up</span>
                </button>
                {signupError && (
                  <span className="text-red-500 w-3/4">{signupError}</span>
                )}
              </form>
              <div className="my-12 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or sign up with google
                </div>
              </div>
              <div
                className="flex flex-col items-center"
                onClick={() => {
                  if (!termsAccepted) {
                    setSignupGoogleError(
                      "Please accept the terms and conditions to sign up."
                    );
                  } else {
                    signUpWithGoogle();
                  }
                }}
              >
                <button className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-primary-200 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline">
                  <div className="bg-white p-2 rounded-full">
                    <FcGoogle />
                  </div>
                  <span className="ml-4">Sign Up with Google</span>
                </button>
                {signupGoogleError && (
                  <span className="text-red-500 w-full max-w-xs">{signupGoogleError}</span>
                )}
              </div>
              <div className="flex  justify-center my-4 ">
                <input
                  id="checkbox-1"
                  aria-describedby="checkbox-1"
                  type="checkbox"
                  className="bg-gray-50 mt-1 border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded"
                  checked={termsAccepted}
                  onChange={handleCheckboxChange}
                  required
                />
                <label
                  htmlFor="checkbox-1"
                  className="text-sm ml-3 font-medium text-gray-900"
                >
                  I agree to the
                  <span
                    className="text-blue-600 hover:underline ml-1 cursor-pointer"
                    onClick={() => {
                      navigate("/terms&conditions");
                    }}
                  >
                    terms of service
                  </span>{" "}
                  and
                  <p
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={() => {
                      navigate("/privacypolicy");
                    }}
                  >
                    privacy policy
                  </p>
                </label>
              </div>
              <div className="my-12  text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Already have an account?
                  <Link
                    to="/login"
                    className=" underline cursor-pointer text-primary-400 ml-2"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 text-center hidden lg:flex registration-card justify-center items-center">
          <div className="auth-bg w-3/4 flex justify-center items-center p-4 text-center min-h-32">
            <h3
              className="text-xl md:text-4xl font-bold text-white"
              ref={textRef}
            >
              hey
            </h3>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Registration;

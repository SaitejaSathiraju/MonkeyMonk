import React, { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase/Firebase";

import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { UserAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CompleteProfile = () => {
  const defaultProfileImage =
    "https://firebasestorage.googleapis.com/v0/b/monkeymonk-8d654.appspot.com/o/profileImages%2Fdefault_user.jpg?alt=media&token=fd3200cf-e81e-4b27-8528-7307df8d99ab";

  const navigate = useNavigate();
  const { user } = UserAuth();
  const currentUser = user;

  const [profileData, setProfileData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    gender: "",
    DOB: "",
    facebookProfile: "",
    instagramProfile: "",
    twitterProfile: "",
    password: "",
    email: "",
    photoURL: defaultProfileImage,
    isProfileComplete: false,
  });

  const [userData, setUserData] = useState(null);
  const [showOTPdialog, setShowOTPdialog] = useState(false);
  const [mobileVerificationStatus, setMobileVerificationStatus] = useState(false);

  const handleMobileVerificationStatus = (status) => {
    setMobileVerificationStatus(status);
    setShowOTPdialog(false);
  };

  const [errors, setErrors] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    gender: "",
    DOB: "",
  });

  const fetchUserData = async () => {
    try {
      const userQuery = query(
        collection(db, "users"),
        where("userId", "==", currentUser?.uid)
      );
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs.map((doc) => doc.data());
        setUserData(userData[0]);
        setProfileData(userData[0]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  };

  const handleProfileChange = async (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "username") {
      newValue = newValue.toLowerCase();
      newValue = newValue.replace(/[^a-z0-9_]/g, "");
      setErrors({
        ...errors,
        username: "",
      });
    }

    setProfileData({ ...profileData, [name]: newValue });
  };

  const checkUsernameExists =async(username)=>{
    const isUsernameExist = async (username) => {
      if(username){
        try {
          const usersRef = collection(db, "users");
          const userQuery = query(usersRef, where("username", "==", username));
          const querySnapshot = await getDocs(userQuery);
          return !querySnapshot.empty;
        } catch (error) {
          console.error("Error checking username existence:", error.message);
          return false;
        }
      }
    };
    const usernameExists = await isUsernameExist(username);
      if (usernameExists) {
        setErrors({
          ...errors,
          username: "User with this name already exists",
        });
        return;
      }
  }

  const showToastMessage = (toastMessage) => {
    toast.success(toastMessage, {
      position: "bottom-right",
    });
  };

  const submitUserProfile = async (e) => {
    e.preventDefault();
    // if (!mobileVerificationStatus) {
    //   toast.error("Please verify your phone number before submitting.", {
    //     position: "bottom-right",
    //   });
    //   return;
    // }
    const newErrors = {};
    Object.keys(profileData).forEach((key) => {
      if (
        !profileData[key] &&
        key !== "photoURL" &&
        key !== "isProfileComplete" &&
        key !== "email" &&
        key !== "password" &&
        key !== "instagramProfile" &&
        key !== "facebookProfile" &&
        key !== "twitterProfile"
      ) {
        newErrors[key] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } is required`;
      }
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await fetchUserData();
      const profileImage = e.target.elements.profileImage.files[0];

      let imageUrl = defaultProfileImage;

      if (profileImage) {
        const storageRef = ref(
          storage,
          `profileImages/${currentUser?.uid}/${profileImage.name}`
        );
        await uploadBytes(storageRef, profileImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      const updatedUserData = {
        ...userData,
        username: profileData.username,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        gender: profileData.gender,
        bio: profileData.bio,
        DOB: profileData.DOB,
        facebookProfile: profileData.facebookProfile,
        twitterProfile: profileData.twitterProfile,
        instagramProfile: profileData.instagramProfile,
        photoURL: imageUrl,
        isProfileComplete: true,
      };

      const userDocRef = doc(db, "users", currentUser?.uid);
      await updateDoc(userDocRef, updatedUserData);
      showToastMessage("Profile updated successfully.")
      setProfileData({});
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile data:", error.message);
    }
  };

  const handleProfileImageChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevProfileData) => ({
      ...prevProfileData,
      [name]: value,
      photoURL:
        name === "profileImage"
          ? URL.createObjectURL(e.target.files[0])
          : prevProfileData.photoURL,
    }));
  };

  // const handlePhoneChange = (value) => {
  //   setProfileData((prevProfileData) => ({
  //     ...prevProfileData,
  //     phoneNumber: value,
  //   }));
  // };

  const [completeUserData, setCompleteUserData] = useState();

  useEffect(() => {
    const fetchCompleteUserDetails = async () => {
      if (!currentUser?.uid) return;
      const userDocRef = doc(db, "users", currentUser?.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const user = userDocSnap.data();
          setCompleteUserData(user);
          if (user?.isProfileComplete) {
            if(currentUser.emailVerified){
              navigate("/dashboard");
            }
            else{
              navigate("/verifyEmail") 
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    };

    fetchCompleteUserDetails();
  }, [currentUser]);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className=" max-w-screen-xl m-0 md:m-16 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="w-0 lg:w-10 xl:w-15 p-6 sm:p-12 bg-amber-100"></div>

        <form
          onSubmit={submitUserProfile}
          className="lg:w-full w-full p-3 md:p-8 flex lg:flex-row flex-col "
        >
         
          <div className="col-1 lg:w-1/2 w-full p-6 space-y-4">
          <div className="text-xl font-semibold">
            Step 2: Complete your Profile
          </div>
            <div className=" ">
              <div className="  flex justify-center mb-5">
                {profileData.photoURL ? (
                  <div className="h-24 w-24 md:h-32 md:w-32 bg-gray-300 rounded-full ">
                    <img
                      src={profileData.photoURL}
                      alt="Profile"
                      className="h-24 w-24 md:h-32 md:w-32 rounded-full"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 md:h-32 md:w-32 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className=" p-1 rounded-full left-36 flex justify-center items-center">
                <label
                  htmlFor="profileImage"
                  className="cursor-pointer bg-blue-400 p-2 px-4 font-semibold text-white rounded-2xl"
                >
                  Edit Photo
                </label>
                <input
                  type="file"
                  id="profileImage"
                  className="hidden"
                  accept="image/*"
                  name="profileImage"
                  onChange={handleProfileImageChange}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="username"
                className="mt-4 text-sm font-medium text-gray-500"
              >
                Username <span className="text-sm text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                onBlur={(e)=>checkUsernameExists(e.target.value)}
                placeholder="Enter your username"
                className="mt-0 w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="firstName"
                className="mt-4 text-sm font-medium text-gray-500"
              >
                First Name <span className="text-sm text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                placeholder="Enter your first name"
                className="mt-1 w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="mt-4 text-sm font-medium text-gray-500"
              >
                Last Name <span className="text-sm text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                placeholder="Enter your last name"
                className="mt-1 w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName}</p>
              )}
            </div>
            {/* <div>
              <label
                htmlFor="mobileNumber"
                className="mt-4 text-sm font-medium text-gray-500"
              >
                Mobile Number <span className="text-sm text-red-500">*</span>
              </label>
              <div className="w-full my-4 sm:my-0">
                <PhoneInput
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter your mobile number"
                  value={profileData.phoneNumber}
                  defaultCountry="IN"
                  onChange={handlePhoneChange}
                  disabled={mobileVerificationStatus}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
              )}
              {/* {!mobileVerificationStatus && <button
                type="button"
                className="mt-4 bg-blue-500 text-white p-2 rounded"
                onClick={() => setShowOTPdialog(true)}
                disabled={loading}
              >
                Send OTP
              </button>}
            </div> */}
            <div>
              <label
                htmlFor="bio"
                className="mt-4 text-sm font-medium text-gray-500"
              >
                Bio
              </label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself"
                rows={4}
                maxLength={200}
                className="mt-1 w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              ></textarea>
              {errors.bio && (
                <p className="text-red-500 text-sm">{errors.bio}</p>
              )}
              </div>
          </div>
          <div className="col-2 lg:w-1/2 w-full p-6 lg:mt-64 lg:relative space-y-4">
            <div>
              <label
                htmlFor="gender"
                className=" text-sm font-medium text-gray-500"
              >
                Gender <span className="text-sm text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={profileData.gender}
                onChange={handleProfileChange}
                className=" w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm">{errors.gender}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="DOB"
                className="mt-4 text-sm font-medium text-gray-500"
              >
                Date of Birth <span className="text-sm text-red-500">*</span>
              </label>
              <input
                type="date"
                name="DOB"
                value={profileData.DOB}
                onChange={handleProfileChange}
                placeholder="Enter your date of birth"
                className="mt-1 w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                max = '2007-06-29'
              />
              {errors.DOB && (
                <p className="text-red-500 text-sm">{errors.DOB}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="facebook"
                className="mt-4 text-sm font-medium text-gray-500"
              >
                Facebook (optional)
              </label>
              <input
                type="text"
                name="facebookProfile"
                value={profileData.facebookProfile}
                onChange={handleProfileChange}
                placeholder="Enter your Facebook profile URL"
                className="mt-1 w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="instagram"
                className="mt-4 text-sm font-medium text-gray-500"
              >
                Instagram (optional)
              </label>
              <input
                type="text"
                name="instagramProfile"
                value={profileData.instagramProfile}
                onChange={handleProfileChange}
                placeholder="Enter your Instagram profile URL"
                className="mt-1 w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="twitter"
                className=" text-sm font-medium text-gray-500"
              >
                Twitter (optional)
              </label>
              <input
                type="text"
                name="twitterProfile"
                value={profileData.twitterProfile}
                onChange={handleProfileChange}
                placeholder="Enter your Twitter profile URL"
                className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              />
            </div>
            <div className="">
              <button
                type="submit"
                className="mt-8 bg-blue-500 text-white py-4 px-8 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
      {/* {showOTPdialog && <OTPdialog phoneNumber={profileData.phoneNumber} onVerificationStatus={handleMobileVerificationStatus} />} */}
    </div>
  );
};

export default CompleteProfile;

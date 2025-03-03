import React, { useEffect, useState } from "react";

import { auth, db, storage } from "../../firebase/Firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { UserAuth } from "../../context/authContext";

import { useNavigate } from "react-router-dom";
import {
  deleteUser,
  signInWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dialog from "../../components/dialogs/DeleteAccDialog";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = UserAuth();
  const currentUser = user;

  // const [userData, setUserData] = useState({}); 
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // const [isPhoneEnabled, setIsPhoneEnabled] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevProfileData) => ({
      ...prevProfileData,
      [name]: value,
    }));
  };

  const fetchUserData = async () => {
    try {
      const userQuery = query(
        collection(db, "users"),
        where("userId", "==", currentUser?.uid)
      );
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs.map((doc) => doc.data());
        setProfileData(userData[0]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "users", currentUser?.uid), profileData);
      showToastMessage("Profile data updated successfully! ");
    } catch (error) {
      console.error("Error updating user data: ", error);
    }
  };

  const handleProfileImageChange = async (e) => {
    const profileImage = e.target.files[0];
    const storageRef = ref(
      storage,
      `profileImages/${currentUser?.uid}/${profileImage.name}`
    );
    await uploadBytes(storageRef, profileImage);
    const imageUrl = await getDownloadURL(storageRef);
    setProfileData((prevProfileData) => ({
      ...prevProfileData,
      photoURL: imageUrl,
    }));
  };
  const handleRemoveProfilePhoto = () => {
    setProfileData((prevProfileData) => ({
      ...prevProfileData,
      photoURL: "",
    }));
  };

  const showToastMessage = (toastMessage) => {
    toast.success(toastMessage, {
      position: "bottom-right",
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmedPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setPasswordError("");
      await signInWithEmailAndPassword(
        auth,
        auth.currentUser.email,
        currentPassword
      );
      await updatePassword(auth.currentUser, newPassword);
      showToastMessage("password updated successfully !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmedPassword("");
    } catch (error) {
      console.error("Error updating password:", error.message);
      setPasswordError(
        "Failed to update password. Please check your current password and try again."
      );
    }
  };

  const handleCancelDialog = () => {
    setShowDialog(false);
  };

  const handleConfirmDialog = () => {
    handleDelete();
    setShowDialog(false);
  };

  const handleDelete = async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "trips"), where("userId", "==", currentUser?.uid))
      );
      const deletePromises = querySnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });
      await Promise.all(deletePromises);
      await deleteUser(auth.currentUser);
      await deleteDoc(doc(db, "users", currentUser?.uid));

      navigate("/login");
    } catch (error) {
      console.error("Error deleting user and associated trips: ", error);
    }
  };

  return (
    <div id="app-layout" className="overflow-x-hidden flex">
      <div
        id="app-layout-content"
        className="min-h-screen w-full min-w-[100vw] md:min-w-0 [transition:margin_0.25s_ease-out]"
      >
        <div className="p-6">
          <div className="flex items-center mb-4 border-b border-gray-300 pb-4">
            <h1 className="inline-block text-xl font-semibold leading-6">
              General
            </h1>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="mb-lg-0 col-span-1">
              <h4 className="mb-1">General Settings</h4>
              <p className="text-gray-600">Profile configuration settings</p>
            </div>
            <div className="card shadow col-span-3">
              <div className="card-body">
                <div className="mb-6">
                  <h4 className="mb-1">General Settings</h4>
                </div>
                <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                  <div className="flex-1 text-gray-800 font-semibold">
                    <h5 className="mb-0">Avatar</h5>
                  </div>
                  <div className="flex-[3]">
                    <div className="flex items-center ">
                      <div className="me-3 w-28 h-28 border-spacing-1 rounded-full">
                        <img
                          src={profileData.photoURL}
                          className="rounded-full w-full h-full"
                          alt=""
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="profileImage"
                          className="btn gap-x-2 mr-2 bg-white text-gray-800 border-gray-300 hover:text-white hover:bg-gray-700 hover:border-gray-700 active:bg-gray-700 active:border-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        >
                          Change
                        </label>
                        <input
                          type="file"
                          id="profileImage"
                          className="hidden"
                          accept="image/*"
                          name="profileImage"
                          onChange={handleProfileImageChange}
                        />

                        <button
                          type="button"
                          className="btn gap-x-2 bg-white text-gray-800 border-gray-300 disabled:opacity-50 disabled:pointer-events-none hover:text-white hover:bg-gray-700 hover:border-gray-700 active:bg-gray-700 active:border-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300"
                          onClick={handleRemoveProfilePhoto}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <h4 className="mb-1">Basic information</h4>
                  </div>
                  <form onSubmit={handleSaveChanges}>
                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="fullName"
                        className="flex-1 text-gray-800 font-semibold"
                      >
                        Full name
                      </label>
                      <div className="flex-[3] w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                          type="text"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3 disabled:opacity-50 disabled:pointer-events-none"
                          placeholder="First name"
                          id="fullName"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleChange}
                        />
                        <input
                          type="text"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3 disabled:opacity-50 disabled:pointer-events-none"
                          placeholder="Last name"
                          id="lastName"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="bio"
                        className="flex-1 text-gray-800 font-semibold"
                      >
                        Bio
                      </label>
                      <div className="flex-[3] w-full">
                        <textarea
                          name="bio"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3"
                          placeholder="Bio"
                          id="bio"
                          value={profileData.bio}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="email"
                        className="flex-1 text-gray-800 font-semibold"
                      >
                        Email
                      </label>
                      <div className="flex-[3] w-full">
                        <input
                          type="email"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3 disabled:opacity-50 disabled:pointer-events-none"
                          id="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                    </div>
                    {/* <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="phone"
                        className="flex-1 text-gray-800 font-semibold"
                      >
                        Phone
                        <span></span>
                      </label>
                      <div className="flex-[3] w-full">
                        <input
                          type="text"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3 disabled:opacity-50 disabled:pointer-events-none"
                          placeholder="Phone"
                          id="phone"
                          name="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="toggle"
                        className=" flex-1 text-gray-800 font-semibold"
                      >
                        show phone number
                      </label>
                      <div className=" relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input
                          type="checkbox"
                          checked={profileData.showPhoneNumber}
                          name="toggle"
                          id="toggle"
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="toggle"
                          className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                          onClick={() =>
                            setProfileData({
                              ...profileData,
                              showPhoneNumber: !profileData.showPhoneNumber,
                            })
                          }
                        ></label>
                      </div>
                    </div> */}

                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="twitter"
                        className="flex-1 text-gray-800 font-semibold "
                      >
                        Twitter
                      </label>
                      <div className="flex-[3] w-full">
                        <input
                          type="text"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3"
                          placeholder="Enter Twitter URL"
                          id="twitter"
                          name="twitterProfile"
                          value={profileData.twitterProfile}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="instagram"
                        className="flex-1 text-gray-800 font-semibold"
                      >
                        Instagram
                      </label>
                      <div className="flex-[3] w-full">
                        <input
                          type="text"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3"
                          placeholder="Enter Instagram URL"
                          id="instagram"
                          name="instagramProfile"
                          value={profileData.instagramProfile}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="facebook"
                        className="flex-1 text-gray-800 font-semibold"
                      >
                        Facebook
                      </label>
                      <div className="flex-[3] w-full">
                        <input
                          type="text"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3"
                          placeholder="Enter Facebook URL"
                          id="facebook"
                          name="facebookProfile"
                          value={profileData.facebookProfile}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <div className="flex-1 text-gray-800 font-semibold"></div>
                      <div className="flex-[3]">
                        <button
                          type="submit"
                          className="btn bg-primary-400 text-white border-primary-600 hover:bg-primary-500 hover:border-primary-700 active:bg-primary-800 active:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                  <ToastContainer />
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-1">
              <h4 className="mb-1">Passoword Settings</h4>
              <p className="text-gray-600">Add password settings to profile</p>
            </div>
            <div className="card shadow col-span-3">
              <div className="card-body">
                <div>
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-6">
                      <h4 className="mb-1">Change your password</h4>
                    </div>
                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="password"
                        className="flex-1 text-gray-800 font-semibold"
                      >
                        Current password
                      </label>
                      <div className="flex-[3] w-full">
                        <input
                          type="password"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3 disabled:opacity-50 disabled:pointer-events-none"
                          placeholder="Enter Current Password"
                          id="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="newPassword"
                        className="flex-1 text-gray-800 font-semibold"
                      >
                        New password
                      </label>
                      <div className="flex-[3] w-full">
                        <input
                          type="password"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3 disabled:opacity-50 disabled:pointer-events-none"
                          placeholder="Enter New Password"
                          id="newPassword"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <label
                        htmlFor="confirmedPassword"
                        className="flex-1 text-gray-800 font-semibold"
                      >
                        Confirm new password
                      </label>
                      <div className="flex-[3] w-full">
                        <input
                          type="password"
                          className="border border-gray-300 text-gray-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2 px-3 disabled:opacity-50 disabled:pointer-events-none"
                          placeholder="Confirm new password"
                          id="confirmedPassword"
                          required
                          value={confirmedPassword}
                          onChange={(e) => setConfirmedPassword(e.target.value)}
                        />
                        {passwordError && (
                          <p className="text-red-500 text-sm">
                            {passwordError}
                          </p>
                        )}
                      </div>
                    </div>
                    <div></div>
                    <div className="mb-6 inline-flex md:flex md:items-center gap-3 flex-col md:flex-row w-full">
                      <div className="flex-1 text-gray-800 font-semibold"></div>
                      <div className="flex-[3]">
                        <div>
                          <h5 className="mb-1">Password requirements:</h5>
                          <p>Ensure that these requirements are met:</p>
                          <ul className="list-disc list-inside my-4">
                            <li>
                              Minimum 8 characters long the more, the better
                            </li>
                            <li>At least one lowercase character</li>
                            <li>At least one uppercase character</li>
                            <li>
                              At least one number, symbol, or whitespace
                              character
                            </li>
                          </ul>
                        </div>
                        <button
                          type="submit"
                          className="btn bg-primary-400 text-white border-primary-600 hover:bg-primary-500 hover:border-primary-700 active:bg-primary-800 active:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-1">
              <h4 className="mb-1">Delete Account</h4>
              <p className="text-gray-600">Easily set up social media accounts</p>
            </div>
            <div className="card shadow col-span-3">
              <div className="card-body">
                <h4 className="mb-1">Danger Zone</h4>
                <p className="mb-4">
                  Delete any and all content you have, such as articles,
                  comments, your reading list or chat messages. Allow your
                  username to become available to anyone.
                </p>
                <button
                  type="submit"
                  onClick={() => {
                    setShowDialog(true);
                  }}
                  className="btn bg-primary-400 text-white border-primary-600 hover:bg-primary-500 hover:border-primary-700 active:bg-primary-800 active:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
                >
                  Delete Account
                </button>
                {showDialog && (
                  <Dialog
                    onCancel={handleCancelDialog}
                    onConfirm={handleConfirmDialog}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

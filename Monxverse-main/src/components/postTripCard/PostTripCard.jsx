import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { MdDateRange, MdDelete } from "react-icons/md";
import { db } from "../../firebase/Firebase";
import {
  doc,
  getDoc,
  collection,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { UserAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import Dialog from "../dialogs/DeleteTripDialog";

const PostTripCard = ({ trip }) => {
  const navigate = useNavigate();
  const { user } = UserAuth();
  const [currentUser, setCurrentUser] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [tripPartner, setTripPartner] = useState("");

  useEffect(() => {
    const fetchCompleteUserDetails = async () => {
      if (user?.uid) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setCurrentUser(userDocSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      }
    };
    fetchCompleteUserDetails();
  }, [user]);

  useEffect(() => {
    if (trip && trip.userId) {
      const fetchUsername = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", trip.userId));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
            setTripPartner(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      };
      fetchUsername();
    }
  }, [trip]);

  const handleSelect = async () => {
    if (currentUser.userId && tripPartner.userId) {
      const combinedId =
        currentUser.userId > tripPartner.userId
          ? currentUser.userId + tripPartner.userId
          : tripPartner.userId + currentUser.userId;

      try {
        const chatDoc = await getDoc(doc(db, "chats", combinedId));
        if (!chatDoc.exists()) {
          await setDoc(doc(db, "chats", combinedId), { messages: [] });

          await updateDoc(doc(db, "userChats", currentUser.userId), {
            [`${combinedId}.userInfo`]: {
              userId: tripPartner.userId,
              username: tripPartner.username,
              photoURL: tripPartner.photoURL,
            },
            [`${combinedId}.date`]: serverTimestamp(),
          });
          await updateDoc(doc(db, "userChats", tripPartner.userId), {
            [`${combinedId}.userInfo`]: {
              userId: currentUser.userId,
              username: currentUser.username,
              photoURL: currentUser.photoURL,
            },
            [`${combinedId}.date`]: serverTimestamp(),
          });
        }
        navigate("/chat");
      } catch (err) {
        console.error("Error creating or fetching chat document:", err);
      }
    }
  };

  const handleCancelDialog = () => {
    setShowDialog(false);
  };

  const handleConfirmDialog = () => {
    deleteTrip();
    setShowDialog(false);
  };

  const deleteTrip = async () => {
    try {
      const tripRef = doc(db, "trips", trip.id);
      await deleteDoc(tripRef);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting trip: ", error);
    }
  };

  return (
    <>
      <div className="flex flex-col bg-white rounded-xl p-4 shadow-2xl border-t-8 border-primary-400 sm:min-w-[200px] w-full gap-4 min-h-[300px] my-4 relative">
        <div className="flex flex-row">
          <div className="w-10 h-10 rounded-full bg-primary-200">
            <img
              className="w-full h-full rounded-full"
              src={tripPartner.photoURL}
              alt="profilePhoto"
            />
          </div>
          <div className="flex flex-row justify-between w-full items-center">
            <h2 className="font-extrabold mx-5 text-xl">
              {tripPartner.username}
            </h2>
          </div>
          {trip.userId === user.uid && (
            <div
              className="cursor-pointer"
              onClick={() => setShowDialog(true)}
            >
              <MdDelete size={24} className="text-slate-700" />
            </div>
          )}
        </div>
        <div className="items-center w-full flex">
          <div>
            <h2 className="text-xl font-semibold">{trip.from}</h2>
          </div>
          <div className="mx-5 w-full h-[1px] relative flex justify-center items-center border-dashed border border-slate-300">
            <p className="bg-white font-bold px-2">To</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{trip.to}</h2>
          </div>
        </div>
        <div>
          <h4 className="flex items-center text-xl font-semibold">
            <MdDateRange className="mr-2 fill-primary-400" />
            {trip.date}
          </h4>
          <h6>Estimated Days: ({trip.estimatedDays} days)</h6>
        </div>
        <p>{trip.tripDescription}</p>
        <div className="h-[1px] bg-slate-200"></div>
        <div className="flex">
          {trip.tags?.map((tag) => (
            <div
              key={tag}
              className="pill bg-gray-300 rounded-full text-xs px-4 py-1 mr-2 text-black font-bold"
            >
              {tag}
            </div>
          ))}
        </div>
        <div
          onClick={handleSelect}
          className="bg-primary-400 shadow-slate-500 shadow-lg w-[50px] h-[50px] flex justify-center items-center rounded-full absolute z-10 cursor-pointer bottom-3 right-3"
        >
          <FontAwesomeIcon icon={faMessage} className="text-white" size="xl" />
        </div>
      </div>
      {showDialog && (
        <Dialog onCancel={handleCancelDialog} onConfirm={handleConfirmDialog} />
      )}
    </>
  );
};

export default PostTripCard;
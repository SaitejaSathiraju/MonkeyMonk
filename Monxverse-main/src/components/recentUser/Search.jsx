import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase/Firebase";
import { UserAuth } from "../../context/authContext";
import RecentUser from "./RecentUser";
import { IoSearchCircle } from "react-icons/io5";

const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState(null);

  const auth = UserAuth();
  const currentUser = auth.user;
  const [completeUserData, setCompleteUserData] = useState();

  useEffect(() => {
    const fetchCompleteUserDetails = async () => {
      const userDocRef = doc(db, "users", currentUser?.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const user = userDocSnap?.data();
          setCompleteUserData(user);
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    };
    if (currentUser?.uid) {
      fetchCompleteUserDetails();
    }
  }, [currentUser]);


  const handleSearch = async (e) => {
    const searchString = e.target.value.trim().toLowerCase();;

    if (searchString === "") {
      setSuggestedUsers([]);
      setErr("");
      return;
    }

    try {
      const querySnapshot = await getDocs(query(collection(db, "users")));

      const searchResults = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.username.includes(searchString)) {
          searchResults.push(userData);
        }
      });

      if (searchResults.length > 0) {
        setSuggestedUsers(searchResults.slice(0, 5));
        setErr("");
      } else {
        setSuggestedUsers([]);
        setErr("No user found");
      }
    } catch (err) {
      setErr(err);
    }
  };

  const handleSelect = async (user) => {
    setSuggestedUsers([]);
    setErr("");
    const combinedId =
      currentUser?.uid > user.userId
        ? currentUser?.uid + user.userId
        : user.userId + currentUser?.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser?.uid), {
          [combinedId + ".userInfo"]: {
            userId: user.userId,
            username: user.username,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.userId), {
          [combinedId + ".userInfo"]: {
            userId: currentUser?.uid,
            username: completeUserData.username,
            photoURL: completeUserData.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (err) {
    }

    setUser(null);
    setUsername("");
    setErr("");
  };

  return (
    <div className="search bg-white shadow-xl pb-3 ">
      <div className="searchForm mx-1">
        <div className="relative">
          <input
            type="text"
            placeholder="Find a user"
            onChange={(e) => {
              setUsername(e.target.value);
              handleSearch(e);
            }}
            value={username}
            className="w-full px-2 py-3 rounded-full text-lg pl-10 bg-zinc-100"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <IoSearchCircle className="" size={30} />
          </div>
        </div>
      </div>

      {suggestedUsers?.map((user, index) => (
        <>
          <div key={index} onClick={() => handleSelect(user)}>
            <RecentUser
              name={user.username}
              msg=""
              image={user.photoURL}
              id={user.userId}
            />
          </div>
        </>
      ))}

      {!user && err && <div>{err}</div>}
    </div>
  );
};

export default Search;

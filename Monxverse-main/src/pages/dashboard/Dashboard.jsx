import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/Firebase";
import "react-datepicker/dist/react-datepicker.css";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import PostTripCard from "../../components/postTripCard/PostTripCard";
import PostTripForm from "../../components/postTripForm/PostTripForm";
import "./Dashboard.css";
import { UserAuth } from "../../context/authContext";
import { IoPaperPlane } from "react-icons/io5";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const { user } = UserAuth();
  const currentUser = user;

  const [trips, setTrips] = useState([]);
  const [searchSource, setSearchSource] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [modifiedTripsData, setModifiedTripsData] = useState([]);

  const sourceAutoCompleteRef = useRef();
  const destinationAutoCompleteRef = useRef();
  const destinationInputRef = useRef(null);
  const sourceInputRef = useRef(null);

  const filterTrips = (tripsData) => {
    let filteredTrips = tripsData.filter((trip) => {
      let sourceMatch = true;
      let destinationMatch = true;
      let searchByUser = true;

      if (searchSource !== "") {
        sourceMatch = trip.from
          .toLowerCase()
          .includes(searchSource.toLowerCase());
      }

      if (searchDestination !== "") {
        destinationMatch = trip.to
          .toLowerCase()
          .includes(searchDestination.toLowerCase());
      }

      if (searchUser !== "") {
        searchByUser =
          trip.username?.toLowerCase().trim() ===
          searchUser.toLowerCase().trim();
      }
      return sourceMatch && destinationMatch && searchByUser;
    });

    setModifiedTripsData(filteredTrips);
  };

  const fetchTrips = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "trips"));
      const tripsData = [];
      querySnapshot.forEach((doc) => {
        tripsData.push({ id: doc.id, ...doc.data() });
      });
      setTrips(tripsData);
      setModifiedTripsData(tripsData);
    } catch (error) {
      console.error("Error fetching trips: ", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const [showModal, setShowModal] = useState(false);

  function openModal() {
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  const handlePlaceChanged = (field) => {
    const place =
      field === "source"
        ? sourceAutoCompleteRef.current.getPlace()
        : destinationAutoCompleteRef.current.getPlace();
    if (place) {
      if (field === "destination") {
        setSearchDestination(place.name);
      } else if (field === "source") {
        setSearchSource(place.name);
      }
    }
  };

  const clearSelectedOption = (field) => {
    if (field === "destination") {
      setSearchDestination("");
      destinationInputRef.current.value = "";
    } else if (field === "source") {
      setSearchSource("");
      sourceInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const options = {
      fields: ["name", "place_id"],
      types: ["(cities)"],
      sessionToken: new window.google.maps.places.AutocompleteSessionToken(),
    };

    sourceAutoCompleteRef.current = new window.google.maps.places.Autocomplete(
      sourceInputRef.current,
      options
    );
    sourceAutoCompleteRef.current.addListener("place_changed", () =>
      handlePlaceChanged("source")
    );

    destinationAutoCompleteRef.current =
      new window.google.maps.places.Autocomplete(
        destinationInputRef.current,
        options
      );
    destinationAutoCompleteRef.current.addListener("place_changed", () =>
      handlePlaceChanged("destination")
    );
  }, []);

  return (
    <>
      <div className="w-full h-full py-2 md:px-0 px-2">
        <div className="mb-24">
          <div className="banner-img h-72 pb-20 py-2 bg-primary-300 flex flex-col justify-between px-4 rounded-xl">
            <div className="p-3 md:p-4 bg-white max-w-[60rem] mx-auto rounded-2xl w-full flex flex-col sm:flex-row items-center justify-center my-10">
              <div className="w-full sm:py-2 md:mx-2">
                <div className="relative my-2">
                  <input
                    type="text"
                    id="source"
                    name="source"
                    placeholder="source"
                    ref={sourceInputRef}
                    className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-3 md:py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                  />
                  {searchSource ? (
                    <div
                      className="absolute right-4 top-4 text-gray-500 cursor-pointer"
                      onClick={() => clearSelectedOption("source")}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </div>
                  ) : (
                    <div className="absolute right-4 top-4 text-gray-500">
                      <FontAwesomeIcon icon={faSearch} />
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full sm:py-2 md:mx-2">
                <div className="relative my-2">
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    placeholder="destination"
                    ref={destinationInputRef}
                    className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-3 md:py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                  />
                  {searchDestination ? (
                    <div
                      className="absolute right-4 top-4 text-gray-500 cursor-pointer"
                      onClick={() => clearSelectedOption("destination")}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </div>
                  ) : (
                    <div className="absolute right-4 top-4 text-gray-500">
                      <FontAwesomeIcon icon={faSearch} />
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full sm:py-2 md:mx-2">
                <div className="relative my-2">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="search by username.."
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  onClick={() => {
                    filterTrips(trips); // Use the original trips data for filtering
                  }}
                  className="bg-primary-400 text-white font-semibold flex justify-center items-center px-3 py-2 md:px-6 md:py-4 rounded-md focus:outline-none"
                >
                  Search
                </button>
              </div>
            </div>
            <div className="flex justify-start w-full">
              <div className=" ">
                <div
                  onClick={openModal}
                  className="bg-white cursor-pointer py-2 px-4 mb-3 md:py-4 md:px-8 rounded-lg flex items-center text-lg font-medium"
                >
                  Post Trip
                  <IoPaperPlane className="ml-2 text-xl" />
                </div>
                {showModal && <PostTripForm closeModal={closeModal} />}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center items-center mt-[2%] md:mt-[0]">
          <div className="w-full flex flex-col justify-center items-center">
            {modifiedTripsData
              .filter((trip) => new Date(trip.date) > new Date())
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((trip) => (
                <div key={trip.id} className="w-full max-w-[900px]">
                  <PostTripCard trip={trip} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
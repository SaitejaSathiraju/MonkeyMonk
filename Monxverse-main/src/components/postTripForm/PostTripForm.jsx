import Button from "./Button";
import { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/Firebase";
import { UserAuth } from "../../context/authContext";
import "react-datepicker/dist/react-datepicker.css";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import map from "../../assets/map.png";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PostTripForm({ closeModal }) {
  const { user } = UserAuth();
  const currentUser = user;

  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedTripDestination, setSelectedTripDestination] = useState(null);
  const [selectedTripSource, setSelectedTripSource] = useState(null);
  const [tripDescription, setTripDescription] = useState("");
  const [startDate, setStartDate] = useState();
  const [estimatedDays, setEstimatedDays] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState("");
  const [minDate, setMinDate] = useState("");

  const sourceAutoCompleteRef = useRef();
  const destinationAutoCompleteRef = useRef();
  const destinationInputRef = useRef(null);
  const sourceInputRef = useRef(null);


  const [completeUserData , setCompleteUserData] = useState();

  useEffect(() => {
    const fetchCompleteUserDetails = async () => {
      const userDocRef = doc(db, "users", currentUser?.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const user = userDocSnap.data();
          setCompleteUserData(user);
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    };
    fetchCompleteUserDetails();
  }, []);

  const [errors, setErrors] = useState({
    selectedTripSource: "",
    selectedTripDestination: "",
    startDate: "",
    estimatedDays: "",
    tripDescription: "",
    tags: "",
  });

  const handlePlaceChanged = (field) => {
    const place =
      field === "source"
        ? sourceAutoCompleteRef.current.getPlace()
        : destinationAutoCompleteRef.current.getPlace();
    if (place) {
      if (field === "destination") {
        setSelectedDestinationId(place.place_id);
        setSelectedTripDestination(place.name);
      } else if (field === "source") {
        setSelectedSourceId(place.place_id);
        setSelectedTripSource(place.name);
      }
    }
  };

  const clearSelectedOption = (field) => {
    switch (field) {
      case "destination":
        setSelectedDestinationId(null);
        destinationInputRef.current.value = "";
        break;
      case "source":
        setSelectedTripSource(null);
        sourceInputRef.current.value = "";
        break;
      default:
        break;
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEstimatedDaysChange = (e) => {
    setEstimatedDays(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setTripDescription(e.target.value);
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if ((e.key === " " || e.keyCode == 32) && tagInput.trim() !== "") {
      if (tags.length < 5) {
        setTags([...tags, "#" + tagInput.trim()]);
        setTagError("");
      } else {
        setTagError("Maximum 5 tags allowed");
      }
      setTagInput("");
    }
  };

  const handleTagRemove = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
    setTagError("");
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

    return () => {
      const inputRef = sourceInputRef.current;
      if (inputRef) {
        inputRef.removeEventListener("place_changed", handlePlaceChanged);
      }
    };
  }, []);

  useEffect(() => {
    const options = {
      fields: ["name", "place_id"],
      types: ["(cities)"],
      sessionToken: new window.google.maps.places.AutocompleteSessionToken(),
    };

    destinationAutoCompleteRef.current =
      new window.google.maps.places.Autocomplete(
        destinationInputRef.current,
        options
      );
    destinationAutoCompleteRef.current.addListener("place_changed", () =>
      handlePlaceChanged("destination")
    );

    return () => {
      const inputRef = destinationInputRef.current;
      if (inputRef) {
        inputRef.removeEventListener("place_changed", handlePlaceChanged);
      }
    };
  }, []);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date());
  const [tripDesc, setTripDesc] = useState("");

  const showToastMessage = (toastMessage) => {
    toast.success(toastMessage, {
      position: "bottom-right",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentErrors = {};

    if (!selectedTripSource) {
      currentErrors.selectedTripSource = "Please select a source.";
    }
    if (!selectedTripDestination) {
      currentErrors.selectedTripDestination = "Please select a destination.";
    }
    if (!startDate) {
      currentErrors.startDate = "Please select a start date.";
    }
    if (!estimatedDays) {
      currentErrors.estimatedDays = "Please enter estimated days.";
    } else if (isNaN(estimatedDays) || estimatedDays <= 0) {
      currentErrors.estimatedDays =
        "Estimated days must be a number greater or equal to 1";
    }
    if (!tripDescription.trim()) {
      currentErrors.tripDescription = "Please enter a trip description.";
    }

    // Check if errors exist
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      console.error("Errors in form:", errors);
      return;
    }

    try {
      setErrors({});
      const tripData = {
        from: selectedTripSource,
        to: selectedTripDestination,
        date: startDate,
        userId: currentUser?.uid,
        tripDescription: tripDescription,
        tags: tags,
        timestamp: Timestamp.now(),
        estimatedDays: estimatedDays,
        username:completeUserData.username
      };
      await addDoc(collection(db, "trips"), tripData);
      showToastMessage("Trip details added successfully!")
      window.location.reload();
      setFrom("");
      setTo("");
      setDate(new Date());
      setTripDesc("");
      setTags("");
      setEstimatedDays("");
      handleCancel();
    } catch (error) {
      console.error("Error adding trip details: ", error);
    }
  };


  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    setMinDate(formattedDate);
  }, []);
  

  function handleCancel() {
    closeModal();
  }

  function closeModalBgClick(e) {
    if (e.target.id === "modal-bg") {
      closeModal();
    }
  }

  return (
    <div
      id="modal-bg"
      className="absolute  z-50 top-0 left-0 w-screen bg-zinc-700/50 flex flex-col justify-center items-center py-4 sm:py-0 min-h-screen"
      onClick={closeModalBgClick}
    >
      <div className="overflow-x-none max-w-screen-md flex flex-col relative shadow-2xl rounded-3xl sm:p-5 bg-white">
        <div>
          <div className=" flex flex-col justify-center ">
            <div className="p-2">
              <div className="relative px-4 md:mx-0 ">
                <div className="max-w-md  lg:max-w-lg  mx-auto">
                  <div className="flex items-center space-x-5">
                    <div className="h-14 w-14 rounded-full flex flex-shrink-0 justify-center items-center">
                      <img src={map} alt="map" />
                    </div>
                    <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                      <h2 className="leading-relaxed">Post your travel plan</h2>
                      <p className="text-sm text-gray-500 font-normal leading-relaxed">
                        Connect and explore together: Post your travel plan and
                        invite others to join the adventure!
                      </p>
                    </div>
                  </div>
                  {/* <form> */}
                  <div className="divide-y divide-gray-200 ">
                    <div className="py-8 text-base leading-6 text-gray-700 sm:text-lg sm:leading-7">
                      <div className="w-full sm:py-2">
                        <label htmlFor="source">Source:</label>
                        <div className="relative my-2">
                          <input
                            type="text"
                            id="source"
                            name="source"
                            ref={sourceInputRef}
                            className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                          />
                          {selectedTripSource ? (
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
                          {errors.selectedTripSource && (
                            <span className="text-red-500">
                              {errors.selectedTripSource}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full sm:py-2">
                        <label htmlFor="destination">Destination:</label>
                        <div className="relative my-2">
                          <input
                            type="text"
                            id="destination"
                            name="destination"
                            ref={destinationInputRef}
                            className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                          />
                          {selectedTripDestination ? (
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
                        {errors.selectedTripDestination && (
                          <span className="text-red-500">
                            {errors.selectedTripDestination}
                          </span>
                        )}
                      </div>
                      <div className="sm:flex sm:flex-row gap-4">
                        <div className="w-full sm:py-2 sm:w-1/2">
                          <label htmlFor="destination">Start date:</label>
                          <div className="relative my-2">
                            <input
                              type="date"
                              min={minDate}
                              id="startDate"
                              name="startDate"
                              value={startDate}
                              onChange={handleStartDateChange}
                              className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-4 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                            />
                          </div>
                          {errors.startDate && (
                            <span className="text-red-500">
                              {errors.startDate}
                            </span>
                          )}
                        </div>
                        <div className="w-full sm:py-2 sm:w-1/2">
                          <label htmlFor="destination">Estimated Days:</label>
                          <div className="relative my-2">
                            <input
                              type="number"
                              min={1}
                              max={10}
                              id="duration"
                              name="duration"
                              value={estimatedDays}
                              onChange={handleEstimatedDaysChange}
                              placeholder="Enter Duration"
                              className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-4 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                            />
                          </div>
                          {errors.estimatedDays && (
                            <span className="text-red-500">
                              {errors.estimatedDays}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full sm:py-2">
                        <label htmlFor="description">Trip Description:</label>
                        <div className="my-2">
                          <textarea
                            id="description"
                            name="description"
                            value={tripDescription}
                            onChange={handleDescriptionChange}
                            className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                            rows="4"
                          />
                        </div>
                        {errors.tripDescription && (
                          <span className="text-red-500">
                            {errors.tripDescription}
                          </span>
                        )}
                      </div>
                      <div className="w-full sm:py-2">
                        <label htmlFor="tags">Tags:</label>
                        <div className="relative my-2">
                          <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onKeyDown={handleTagInputKeyDown}
                            placeholder="Enter tags (Hit space after each tag)"
                            className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-4 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                          />
                        </div>
                        {tagError && (
                          <p className="text-red-500 text-sm">{tagError}</p>
                        )}
                        <div className="flex flex-wrap">
                          {tags &&
                            tags.map((tag, index) => (
                              <div
                                key={index}
                                className="bg-gray-200 rounded-md px-2 py-1 mr-2 mb-2"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleTagRemove(index)}
                                  className="ml-1 focus:outline-none"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              </div>
                            ))}
                        </div>
                        {errors.tags && (
                          <span className="text-red-500">{errors.tags}</span>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 flex items-center space-x-4">
                      <button
                        className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none bg-slate-200"
                        onClick={handleCancel}
                      >
                        <svg
                          className="w-6 h-6 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary-400 flex justify-center items-center w-full px-4 py-3 rounded-md focus:outline-none"
                        onClick={handleSubmit}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                  {/* </form> */}
                  <ToastContainer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostTripForm;

import React, { useState, useEffect, useRef } from "react";
import { storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { zenoraDb } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faTimes } from "@fortawesome/free-solid-svg-icons";

interface FormData {
  Address: string;
  AddressId: string;
  placeLink: string;
  placeDescription: string;
  placeName: string;
  placeTag: string;
  placeImage: string;
  cityName: string;
  postOption: string;
  id: string;
}

const EditFeaturedPlace = (props: {
  place?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}) => {
  const place_category: string[] = [
    'Amusement Park',
    'Aquarium',
    'Art Gallery',
    'Bowling Alley',
    'Campground',
    'Church',
    'Hindu Temple',
    'Mosque',
    'Museum',
    'Night Club',
    'Park',
    'Place of Worship',
    'RV Park',
    'Shopping Mall',
    'Spa',
    'Synagogue',
    'Tourist Attraction',
    'Zoo',
  ];

  const [imageStatus, setImageStatus] = useState("");
  const [formData, setFormData] = useState<FormData>({
    Address: "",
    AddressId: "",
    placeLink: "",
    placeDescription: "",
    placeName: "",
    placeTag: "",
    placeImage: "",
    cityName: "",
    postOption: "",
    id: "",
  });
  const [showTagsOptions, setshowTagsOptions] = useState<boolean>(false);

  const  containerRef = useRef<any>(null);

  useEffect(() => {
    if (props.place) {
      // Populate form data for editing mode
      setFormData(props.place);
    }
  }, [props.place]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTagSelectChange = (tag: string) => {
    setFormData({
      ...formData,
      placeTag: tag,
    });
    setshowTagsOptions(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0];
    if (!image) {
      alert("Please select an image.");
      return;
    }
    setImageStatus("Uploading...");
    const storageRef = ref(storage, `places_images/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        console.error("Error uploading image: ", error);
        alert("Error uploading image. Please try again later.");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageStatus("Successful");
          setFormData({
            ...formData,
            placeImage: downloadURL,
          });
        });
      }
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setshowTagsOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  const handleFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (props.place) {
      try {
        const placeRef = doc(zenoraDb, "featuredPlaces", props.place.id);
        await setDoc(placeRef, formData, { merge: true });
        props.onSubmit(formData);
        window.location.reload();
      } catch (error) {
        console.error("Error updating place:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 flex flex-col justify-center sm:py-6">
      <div className="relative py-3">
        <div className="relative">
          <div className="">
            <div className="flex items-center space-x-5">
              <div className="block pl-2 font-semibold text-xl text-gray-700 text-center w-full">
                <h1 className="leading-relaxed text-2xl">
                  {props.place ? "Edit Place" : "Add a Place"}
                </h1>
              </div>
            </div>
            <div>
              <form onSubmit={handleFormSubmit}>
                <div className="divide-y divide-gray-200">
                  <div className="py-8 text-base leading-6 text-gray-700 sm:text-lg sm:leading-7">
                    <div className="w-full my-4">
                      <label htmlFor="Address">Address:</label>
                      <input
                        type="text"
                        id="Address"
                        name="Address"
                        value={formData.Address}
                        onChange={handleChange}
                        placeholder="Enter Address"
                        className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                      />
                    </div>
                    <div className="w-full my-4 sm:my-0"  ref={containerRef}>
                      <label htmlFor="trip-days">Place tag:</label>
                      <div className="relative">
                        <button
                          type="button"
                          id="trip-days"
                          name="trip-days"
                          className={`dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent transition-all focus:transition-none text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200 ${
                            formData.placeTag === "" ? "text-gray-400" : "text-black"
                          }`}
                          aria-haspopup="listbox"
                          aria-expanded={showTagsOptions}
                          onClick={() => {
                            setshowTagsOptions(!showTagsOptions);
                          }}
                        >
                          <span className="mr-2">
                            {formData.placeTag || "Relevant tag"}
                          </span>
                          {formData.placeTag ? (
                            <div
                              className="absolute right-4 top-4 text-gray-500 cursor-pointer"
                              onClick={() => setFormData({ ...formData, placeTag: "" })}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </div>
                          ) : (
                            <div className="absolute right-4 top-4 text-gray-500">
                              <FontAwesomeIcon icon={faChevronDown} />
                            </div>
                          )}
                        </button>
                        {showTagsOptions && (
                          <div className="absolute z-10 mt-2 bg-white border rounded-md shadow-lg w-full">
                            <ul className="max-h-60 w-full overflow-auto rounded-md bg-white py-1 px-0 text-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark-app:bg-[#444444] dark-app:text-white sm:text-sm">
                              {place_category.map((option, index) => (
                                <li
                                  key={`headlessui-listbox-option-${index}`}
                                  className={`relative cursor-pointer select-none py-2 pr-4 pl-4 ${
                                    formData.placeTag === option ? "text-blue-500" : ""
                                  } hover:bg-gray-200`}
                                  onClick={() =>
                                    handleTagSelectChange(option)
                                  }
                                >
                                  <span className="block font-normal">
                                    {option}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full my-4">
                      <label htmlFor="placeDescription">
                        Place Description:
                      </label>
                      <textarea
                        id="placeDescription"
                        name="placeDescription"
                        value={formData.placeDescription}
                        onChange={handleChange}
                        placeholder="Enter Place Description"
                        className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                        rows={4}
                      />
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-full my-4">
                        <label htmlFor="placeName">Place Name:</label>
                        <input
                          type="text"
                          id="placeName"
                          name="placeName"
                          value={formData.placeName}
                          onChange={handleChange}
                          placeholder="Enter Place Name"
                          className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                        />
                      </div>
                      <div className="w-full my-4">
                        <label htmlFor="cityName">City Name:</label>
                        <input
                          type="text"
                          id="cityName"
                          name="cityName"
                          value={formData.cityName}
                          onChange={handleChange}
                          placeholder="Enter City Name"
                          className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-full my-4 sm:my-0 mb-4">
                        <label htmlFor="postOption">Post to:</label>
                        <div className="mb-4">
                          <label className="inline-flex items-center mr-4">
                            <input
                              type="radio"
                              value="tripPlan"
                              checked={formData.postOption === "tripPlan"}
                              onChange={() =>
                                setFormData({ ...formData, postOption: "tripPlan" })
                              }
                            />
                            <span className="ml-2">Trip Plan</span>
                          </label>
                          <label className="inline-flex items-center mr-4">
                            <input
                              type="radio"
                              value="featuredPlaces"
                              checked={formData.postOption === "featuredPlaces"}
                              onChange={() =>
                                setFormData({ ...formData, postOption: "featuredPlaces" })
                              }
                            />
                            <span className="ml-2">Featured Places</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              value="both"
                              checked={formData.postOption === "both"}
                              onChange={() =>
                                setFormData({ ...formData, postOption: "both" })
                              }
                            />
                            <span className="ml-2">Both</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="w-full my-4">
                      <label htmlFor="placeImage">Featured Image:</label>
                      <input
                        type="file"
                        id="placeImage"
                        name="placeImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                      />
                      <p
                        className={
                          imageStatus === "Successful"
                            ? "text-green-600"
                            : "text-orange-300"
                        }
                      >
                        {imageStatus}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center space-x-4">
                    <button
                      type="button"
                      className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none"
                      onClick={props.onCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-meta-6 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFeaturedPlace;

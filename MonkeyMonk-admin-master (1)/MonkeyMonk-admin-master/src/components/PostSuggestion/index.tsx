import React, { useState, useRef, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faTimes,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

import { zenoraDb, zenoraStorage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';

declare global {
  interface Window {
    google: any;
  }
}
const PostSuggestion = (props: {
  featurePlaceFormOpen: string | boolean | undefined;
  setFeaturePlaceFormOpen: (arg0: boolean) => void;
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
    'Restaurant',
    'RV Park',
    'Shopping Mall',
    'Spa',
    'Synagogue',
    'Tourist Attraction',
    'Zoo',
  ];

  const [AddressId, setAddressId] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [Address, setAddress] = useState<string | null>(null);
  const [placeLink, setPlaceLink] = useState<string>('');
  const [placeDescription, setPlaceDescription] = useState<string>('');
  const [placeName, setPlaceName] = useState<string>('');
  const [showTagsOptions, setshowTagsOptions] = useState<boolean>(false);
  const [placeTag, setPlaceTag] = useState<string>('');
  const [placeImage, setPlaceImage] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [postOption, setPostOption] = useState<string>('both');

  const autoCompleteRef = useRef<any>(null);
  const addressInputRef = useRef<any>(null);
  const containerRef = useRef<any>(null);

  const handlePlaceChanged = () => {
    const place = autoCompleteRef.current?.getPlace();
    if (place) {
      setAddressId(place.place_id);
      setAddress(place.name);
      const address_components = place.address_components;
      address_components.forEach((component: any) => {
        const types = component.types;
        if (types.includes('locality')) {
          setCityName(component.long_name);
        }
      });
    }
  };

  const clearSelectedAddress = () => {
    setAddressId(null);
    if (addressInputRef.current) {
      addressInputRef.current.value = '';
    }
    setFormSubmitted(false);
  };

  const handleAddressLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceLink(e.target.value);
  };

  const handlePlaceDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setPlaceDescription(e.target.value);
  };

  const handlePlaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceName(e.target.value);
  };

  const handleTagSelectChange = (tag: string) => {
    setPlaceTag(tag);
    setshowTagsOptions(false);
  };

  const handleImageUpload = (e: any) => {
    const image = e.target.files?.[0];
    if (!image) {
      alert('Please select an image.');
      return;
    }
    setImageStatus('Uploading...');
    const storageRef = ref(zenoraStorage, `featured_places_images/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      'state_changed',
      (snapshot) => {},
      (error) => {
        console.error('Error uploading image: ', error);
        alert('Error uploading image. Please try again later.');
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageStatus('Successful');
          setPlaceImage(downloadURL);
        });
      },
    );
  };

  const handlePostOptionChange = (option: string) => {
    setPostOption(option);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = {
        Address,
        AddressId,
        placeLink,
        placeDescription,
        placeName,
        placeTag,
        placeImage,
        cityName,
        postOption
      };
      await addDoc(collection(zenoraDb, 'featuredPlaces'), formData);
      setAddress(null);
      setAddressId(null);
      setPlaceLink('');
      setPlaceDescription('');
      setPlaceName('');
      setPlaceTag('');
      setFormSubmitted(true);
      if (addressInputRef.current) {
        addressInputRef.current.value = '';
      }
      setImageStatus('');
      setCityName('');
      setPostOption('Both');
    } catch (error) {
      console.error('Error adding trip details: ', error);
      alert('Error adding place details. Please try again later.');
    }
    props.setFeaturePlaceFormOpen(false);
  };

  useEffect(() => {
    const options = {
      fields: ['name', 'place_id', 'address_components'],
      sessionToken: new window.google.maps.places.AutocompleteSessionToken(),
    };

    autoCompleteRef.current = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      options,
    );
    autoCompleteRef.current.addListener('place_changed', handlePlaceChanged);

    return () => {
      const inputRef = addressInputRef.current;
      if (inputRef) {
        inputRef.removeEventListener('place_changed', handlePlaceChanged);
      }
    };
  }, []);

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

  return (
    <>
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-2xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
            <div className="max-w-md mx-auto">
              <div className="flex items-center space-x-5">
                <div className="block pl-2 font-semibold text-xl text-gray-700 text-center w-full">
                  <h1 className="leading-relaxed text-2xl">
                    Post suggested place
                  </h1>
                </div>
              </div>
              <div>
                <form onSubmit={handleFormSubmit}>
                  <div className="divide-y divide-gray-200">
                    <div className="py-8 text-base leading-6 text-gray-700 sm:text-lg sm:leading-7">
                      <div className="w-full sm:flex sm:items-center sm:justify-between sm:py-2">
                        <div className="w-full sm:mr-4 mb-4 sm:mb-0">
                          <label htmlFor="placeName">Place Name:</label>
                          <input
                            type="text"
                            id="placeName"
                            name="placeName"
                            value={placeName}
                            placeholder="Enter place name"
                            onChange={handlePlaceNameChange}
                            className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                          />
                        </div>
                        <div className="w-full">
                          <label htmlFor="address">Address:</label>
                          <div className="relative">
                            <input
                              type="text"
                              id="address"
                              name="address"
                              ref={addressInputRef}
                              placeholder="Enter address"
                              className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                            />
                            {Address ? (
                              <div
                                className="absolute right-4 top-4 text-gray-500 cursor-pointer"
                                onClick={clearSelectedAddress}
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
                      </div>
                      <div className="w-full sm:flex sm:items-center sm:justify-between my-4">
                        <div className="w-full sm:mr-4">
                          <label htmlFor="placeLink">Place Link:</label>
                          <input
                            type="text"
                            id="placeLink"
                            name="placeLink"
                            value={placeLink}
                            onChange={handleAddressLinkChange}
                            placeholder="Enter website or maps link"
                            className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-4 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                          />
                        </div>
                        <div className="w-full my-4 sm:my-0" ref={containerRef}>
                          <label htmlFor="trip-days">Place tag:</label>
                          <div className="relative">
                            <button
                              type="button"
                              id="trip-days"
                              name="trip-days"
                              className={`dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent transition-all focus:transition-none text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200 ${
                                placeTag === '' ? 'text-gray-400' : 'text-black'
                              }`}
                              aria-haspopup="listbox"
                              aria-expanded={showTagsOptions}
                              onClick={() => {
                                setshowTagsOptions(!showTagsOptions);
                              }}
                            >
                              <span className="mr-2">
                                {placeTag || 'Relevant tag'}
                              </span>
                              {placeTag ? (
                                <div
                                  className="absolute right-4 top-4 text-gray-500 cursor-pointer"
                                  onClick={() => setPlaceTag('')}
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
                                      className={`relative cursor-pointer select-none py-2 pr-4 pl-4 ${placeTag === option ? 'text-blue-500' : ''} hover:bg-gray-200`}
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
                      </div>
                      <div className="w-full my-4 sm:my-0">
                        <label htmlFor="placeDescription">
                          Place Description:
                        </label>
                        <textarea
                          id="placeDescription"
                          name="placeDescription"
                          value={placeDescription}
                          onChange={handlePlaceDescriptionChange}
                          className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                          rows={4}
                        />
                      </div>
                      <div className="w-full my-4 sm:my-0 mb-4">
                      <label htmlFor="postOption">Post to:</label>
                      <div className='mb-4'>
                        <label className="inline-flex items-center mr-4">
                          <input
                            type="radio"
                            value="tripPlan"
                            checked={postOption === 'tripPlan'}
                            onChange={() => handlePostOptionChange('tripPlan')}
                          />
                          <span className="ml-2">Trip Plan</span>
                        </label>
                        <label className="inline-flex items-center mr-4">
                          <input
                            type="radio"
                            value="featuredPlaces"
                            checked={postOption === 'featuredPlaces'}
                            onChange={() =>
                              handlePostOptionChange('featuredPlaces')
                            }
                          />
                          <span className="ml-2">Featured Places</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            value="both"
                            checked={postOption === 'both'}
                            onChange={() => handlePostOptionChange('both')}
                          />
                          <span className="ml-2">Both</span>
                        </label>
                      </div>
                    </div>
                      <div className="w-full my-4 sm:my-0">
                        <label htmlFor="placeImage">Upload Image:</label>
                        <input
                          id="placeImage"
                          name="placeImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e as any)}
                          className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                        />
                        <p
                          className={
                            imageStatus === 'Successful'
                              ? 'text-green-600'
                              : 'text-orange-300'
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
                        onClick={(e) => {
                          e.stopPropagation();
                          props.setFeaturePlaceFormOpen(false);
                        }}
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
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-meta-6 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                        disabled={postOption != "tripPlan" && !placeImage}
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
    </>
  );
};

export default PostSuggestion;

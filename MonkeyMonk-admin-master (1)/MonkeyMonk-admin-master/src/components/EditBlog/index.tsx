import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { zenoraDb } from '../../firebase';

interface FormData {
  title: string;
  content: string;
  author: string;
  category: string;
  image: string;
  tags: string[];
  priority: number | null;
  id: string;
}

const EditBlog = (props: {
  blog?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}) => {
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState('');
  const [imageStatus, setImageStatus] = useState('');
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const blogPriorities = [1, 2, 3, 4, 5, 6];
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    author: '',
    category: '',
    image: '',
    tags: [],
    priority: null,
    id: '',
  });

  useEffect(() => {
    if (props.blog) {
      // Populate form data for editing mode
      setFormData(props.blog);
    }
  }, [props.blog]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && tagInput.trim() !== '') {
      if (formData.tags.length < 5) {
        setFormData({
          ...formData,
          tags: [...formData.tags, '#' + tagInput.trim()],
        });
        setTagError('');
      } else {
        setTagError('Maximum 5 tags allowed');
      }
      setTagInput('');
    }
  };

  const handleImageUpload = (e: any) => {
    const image = e.target.files?.[0];
    if (!image) {
      alert('Please select an image.');
      return;
    }
    setImageStatus('Uploading...');
    const storageRef = ref(storage, `blogs_images/${image.name}`);
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
          setFormData({
            ...formData,
            image: downloadURL,
          });
        });
      },
    );
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (props.blog) {
      try {
        const blogRef = doc(zenoraDb, 'blogs', props.blog.id);
        await setDoc(blogRef, formData, { merge: true });
        props.onSubmit(formData);
      } catch (error) {
        console.error('Error updating blog:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 flex flex-col justify-center sm:py-6">
      <div className="relative">
        <div className="relative">
          <div className="">
            <div className="flex items-center space-x-5">
              <div className="block pl-2 font-semibold text-xl text-gray-700 text-center w-full">
                <h1 className="leading-relaxed text-2xl">
                  {props.blog ? 'Edit Blog' : 'Post a Blog'}
                </h1>
              </div>
            </div>
            <div>
              <form onSubmit={handleFormSubmit}>
                <div className="divide-y divide-gray-200">
                  <div className="py-8 text-base leading-6 text-gray-700 sm:text-lg sm:leading-7">
                    <div className="w-full my-4">
                      <label htmlFor="title">Title:</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter title"
                        className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-full my-4">
                        <label htmlFor="author">Author:</label>
                        <input
                          type="text"
                          id="author"
                          name="author"
                          value={formData.author}
                          onChange={handleChange}
                          placeholder="Enter author"
                          className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                        />
                      </div>
                      <div className="w-full my-4">
                        <label htmlFor="category">Category:</label>
                        <input
                          type="text"
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          placeholder="Enter category"
                          className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                        />
                      </div>
                    </div>
                    <div className="w-full my-4">
                      <label htmlFor="content">Content:</label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Enter content"
                        className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                        rows={4}
                      />
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-full sm:py-2">
                        <label htmlFor="tags">Tags:</label>
                        <div className="relative my-2">
                          <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagInputKeyDown}
                            placeholder="Enter tags separated by spaces"
                            className="flex-grow text-black dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-4 border-neutral-300 dark-app:border-transparent text-left transition-all focus:outline-none focus:transition-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
                          />
                        </div>
                        {tagError && (
                          <p className="text-red-500 text-sm">{tagError}</p>
                        )}
                        <div className="flex flex-wrap">
                          {formData.tags.map((tag, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-md px-2 py-1 mr-2 mb-2"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  setTagError('');
                                  setFormData({
                                    ...formData,
                                    tags: formData.tags.filter(
                                      (_, i) => i !== index,
                                    ),
                                  });
                                }}
                                className="ml-1 focus:outline-none"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="w-full sm:py-2">
                        <label htmlFor="blog-priority">Blog Priority:</label>
                        <div className="relative my-2">
                          <button
                            type="button"
                            id="blog-priority"
                            name="blog-priority"
                            className={`dark-app:text-white relative w-full cursor-pointer rounded-xl border bg-white py-4 pl-6 leading-tight dark-app:bg-[#444444] pr-10 border-neutral-300 dark-app:border-transparent transition-all focus:transition-none text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200 ${
                              formData.priority == null
                                ? 'text-gray-500'
                                : 'text-black'
                            }`}
                            aria-expanded={showPriorityOptions}
                            onClick={() => {
                              setShowPriorityOptions(!showPriorityOptions);
                            }}
                          >
                            <span className="mr-2">
                              {formData.priority || 'Blog Priority'}
                            </span>
                            {formData.priority ? (
                              <div
                                className="absolute right-4 top-4 text-gray-500 cursor-pointer"
                                onClick={() => setShowPriorityOptions(false)}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </div>
                            ) : (
                              <div className="absolute right-4 top-4 text-gray-500">
                                <FontAwesomeIcon icon={faChevronDown} />
                              </div>
                            )}
                          </button>
                          {showPriorityOptions && (
                            <div className="absolute z-10 mt-2 bg-white border rounded-md shadow-lg w-full">
                              <ul className="max-h-60 w-full overflow-auto rounded-md bg-white py-1 px-0 text-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark-app:bg-[#444444] dark-app:text-white sm:text-sm">
                                {blogPriorities.map((option, index) => (
                                  <li
                                    key={`headlessui-listbox-option-${index}`}
                                    className={`relative cursor-pointer select-none py-2 pr-4 pl-4 ${
                                      formData.priority === option
                                        ? 'text-blue-500'
                                        : ''
                                    } hover:bg-gray-200`}
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        priority: option,
                                      });
                                      setShowPriorityOptions(false);
                                    }}
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
                    <div className="w-full my-4">
                      <label htmlFor="image">Featured Image:</label>
                      <input
                        type="file"
                        id="image"
                        name="image"
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
                        props.onCancel();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-meta-6 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                      disabled={!formData.image}
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

export default EditBlog;

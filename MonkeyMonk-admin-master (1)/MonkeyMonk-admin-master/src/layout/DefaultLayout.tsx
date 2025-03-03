import React, { useState, ReactNode } from 'react';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';
import PostBlog from '../components/PostBlog';
import PostSuggestion from '../components/PostSuggestion';
import { UserAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogFormOpen, setBlogFormOpen] = useState(false);
  const [featurePlaceFormOpen, setFeaturePlaceFormOpen] = useState(false);

  const { user } = UserAuth();
  if (user) {
    return (
      <div className="dark:bg-boxdark-2 dark:text-bodydark">
        <div
          className={`flex h-screen overflow-hidden ${(blogFormOpen || featurePlaceFormOpen) && 'opacity-30'}`}
        >
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Header
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              blogFormOpen={blogFormOpen}
              setBlogFormOpen={setBlogFormOpen}
              featurePlaceFormOpen={featurePlaceFormOpen}
              setFeaturePlaceFormOpen={setFeaturePlaceFormOpen}
            />
            <main className="z-10">
              <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                {children}
              </div>
            </main>
          </div>
        </div>
        {
          <div className="absolute top-0 justify-center items-center mx-auto w-full h-screen overflow-scroll opacity-100">
            {blogFormOpen && (
              <PostBlog
                blogFormOpen={blogFormOpen}
                setBlogFormOpen={setBlogFormOpen}
              />
            )}
            {featurePlaceFormOpen && (
              <PostSuggestion
                featurePlaceFormOpen={featurePlaceFormOpen}
                setFeaturePlaceFormOpen={setFeaturePlaceFormOpen}
              />
            )}
          </div>
        }
      </div>
    );
  } else {
    navigate("/login")
    return <div>Loading...</div>;
  }
};

export default DefaultLayout;

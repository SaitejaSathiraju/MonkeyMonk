import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface Post {
  id: string;
  from: string;
  to: string;
  tags: string[];
  tripDescription: string;
}

const Posts: React.FC = () => {
  const [postsData, setPostsData] = useState<Post[]>([]);
  const [searchItem, setSearchItem] = useState<string>('from');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'trips'));
        const posts: Post[] = [];
        querySnapshot.forEach((doc) => {
          posts.push({ id: doc.id, ...doc.data() } as Post);
        });
        setPostsData(posts);
      } catch (error) {
        console.error('Error fetching posts: ', error);
      }
    };
    fetchPosts();
  }, []);

  const handleSearchItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchItem(e.target.value);
    setSearchQuery('');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredPosts = postsData.filter((post) => {
    const value = post[searchItem as keyof Post];
    if (Array.isArray(value)) {
      return value.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
      return value.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const truncateDescription = (description: string) => {
    return description.split(' ').slice(0, 4).join(' ');
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to permanently delete this Post?');
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'trips', id));
        setPostsData(postsData.filter(Post => Post.id !== id));
      } catch (error) {
        console.error('Error deleting Post: ', error);
      }
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto">
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={searchItem}
            onChange={handleSearchItemChange}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="from">Location From</option>
            <option value="to">Location To</option>
            <option value="tags">Tags</option>
            <option value="tripDescription">Description</option>
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search..."
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div className="shadow overflow-scroll border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location From
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location To
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tags
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map((Post) => (
                <tr key={Post.id}>
                  <td className="px-3 py-4 whitespace-nowrap">
                  <span title={Post.from} className="tooltip">
                      {truncateDescription(Post.from)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                  <span title={Post.to} className="tooltip">
                      {truncateDescription(Post.to)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">{Post.tags.join(', ')}</td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span title={Post.tripDescription} className="tooltip">
                      {truncateDescription(Post.tripDescription)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex">
                      <button
                        type="button"
                        className="text-white bg-meta-7 hover:bg-graydark focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 dark:bg-primary-400 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-600 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(Post.id)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Posts;

import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { zenoraDb } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import EditBlog from '../../components/EditBlog';

interface Blog {
  id: string;
  author: string;
  category: string;
  title: string;
  content: string;
  image: string;
  tags: string[];
  priority: number | null;
}

const Blogs: React.FC = () => {
  const [blogsData, setBlogsData] = useState<Blog[]>([]);
  const [searchItem, setSearchItem] = useState<string>('author');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const querySnapshot = await getDocs(collection(zenoraDb, 'blogs'));
        const blogs: Blog[] = [];
        querySnapshot.forEach((doc) => {
          blogs.push({ id: doc.id, ...doc.data() } as Blog);
        });
        setBlogsData(blogs);
      } catch (error) {
        console.error('Error fetching blogs: ', error);
      }
    };
    fetchBlogs();
  }, []);

  const handleSearchItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchItem(e.target.value);
    setSearchQuery('');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredBlogs = blogsData.filter((blog) => {
    const value = blog[searchItem as keyof Blog];
    if (value === null || value === undefined) {
      return false;
    }
    if (Array.isArray(value)) {
      return value.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    } else {
      return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete this blog?',
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(zenoraDb, 'blogs', id));
        setBlogsData(blogsData.filter((blog) => blog.id !== id));
      } catch (error) {
        console.error('Error deleting blog: ', error);
      }
    }
  };

  const truncateDescription = (description: string) => {
    if (description) {
      return description.split(' ').slice(0, 4).join(' ');
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto">
        {editingBlog ? (
          <EditBlog
            blog={editingBlog}
            onSubmit={(data) => {
              setEditingBlog(null);
            }}
            onCancel={() => setEditingBlog(null)}
          />
        ) : (
          <>
            <div className="flex items-center space-x-4 mb-4">
              <select
                value={searchItem}
                onChange={handleSearchItemChange}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="author">Author</option>
                <option value="category">Category</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
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
                      Priority
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Author
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
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
                  {filteredBlogs.map((blog) => (
                    <tr key={blog.id}>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {blog.priority}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {blog.author}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {blog.category}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span title={blog.title} className="tooltip">
                          {truncateDescription(blog.title)}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex">
                          <button
                            type="button"
                            className="text-white bg-meta-3 hover:bg-graydark focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-1.5 me-2 dark:bg-primary-400 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-600 cursor-pointer"
                            onClick={() => setEditingBlog(blog)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-white bg-meta-7 hover:bg-graydark focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 dark:bg-primary-400 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-600 cursor-pointer"
                            onClick={() => handleDelete(blog.id)}
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
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Blogs;

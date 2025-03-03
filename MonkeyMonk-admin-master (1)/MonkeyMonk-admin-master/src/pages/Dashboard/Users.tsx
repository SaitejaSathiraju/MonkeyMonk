import React, { useEffect, useState, useMemo } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { db, zenoraDb } from '../../firebase';
import { getDocs, collection } from 'firebase/firestore';
import JsonToExcel from '../../components/JsonToExcel';

interface User {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [zenoraUsers, setZenoraUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchItem, setSearchItem] = useState<string>('username');
  const [viewZenoraUsers, setViewZenoraUsers] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async (dbInstance: any, setData: any) => {
      try {
        const querySnapshot = await getDocs(collection(dbInstance, 'users'));
        const usersData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as User,
        );
        setData(usersData);
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchData(db, setUsers);
    fetchData(zenoraDb, setZenoraUsers);
  }, []);

  const filteredUsers = useMemo(() => {
    const dataSource = viewZenoraUsers ? zenoraUsers : users;
    return dataSource.filter((user) => {
      const searchTerms = user[searchItem as keyof User]?.toLowerCase() || '';
      return searchTerms.includes(searchQuery.toLowerCase());
    });
  }, [users, zenoraUsers, searchQuery, searchItem, viewZenoraUsers]);

  const excelData = filteredUsers.map((user) => ({
    username: user.username || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    phoneNumber: user.phoneNumber || '',
  }));

  const handleToggle = () => setViewZenoraUsers(!viewZenoraUsers);

  return (
    <DefaultLayout>
      <div className="mx-auto">
        <div className="flex justify-between flex-col sm:flex-row">
          <div className="flex mb-4 space-x-4">
            <select
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
              disabled={viewZenoraUsers}
            >
              <option value="username">Username</option>
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
              <option value="email">Email</option>
              <option value="phoneNumber">Phone Number</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className='flex flex-row'>
          <label className="flex cursor-pointer select-none items-center">
              Zenora users
              <div className="relative mx-2">
                <input
                  type="checkbox"
                  checked={viewZenoraUsers}
                  onChange={handleToggle}
                  className="sr-only"
                />
                <div className="block h-8 w-14 rounded-full bg-[#E5E7EB]"></div>
                <div
                  className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                    viewZenoraUsers ? 'translate-x-6 bg-primary' : 'translate-x-0'
                  }`}
                ></div>
              </div>
            </label>
            {filteredUsers.length !== 0 && <JsonToExcel data={excelData} />}
          </div>
        </div>
        <div className="shadow overflow-scroll border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {viewZenoraUsers ? (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user: User) => (
                <tr key={user.id}>
                  {viewZenoraUsers ? (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.firstName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.phoneNumber}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Users;

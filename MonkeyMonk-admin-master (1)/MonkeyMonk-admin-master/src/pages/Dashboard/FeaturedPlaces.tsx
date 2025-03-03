import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { zenoraDb } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import EditFeaturedPlace from '../../components/EditFeaturedPlace';

interface FeaturedPlace {
  id: string;
  placeName: string;
  placeTag: string;
  Address: string;
  AddressId: string;
  placeLink: string,
  placeDescription: string,
  placeImage: string,
  cityName: string,
  postOption: string
}

const FeaturedPlaces: React.FC = () => {
  const [featuredPlaces, setFeaturedPlaces] = useState<FeaturedPlace[]>([]);
  const [searchItem, setSearchItem] = useState<string>('placeName');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingFeaturedPlace, setEditingFeaturedPlace] = useState<FeaturedPlace | null>(null);

  useEffect(() => {
    const fetchFeaturedPlaces = async () => {
      try {
        const querySnapshot = await getDocs(collection(zenoraDb, 'featuredPlaces'));
        const featuredPlacesData: FeaturedPlace[] = [];
        querySnapshot.forEach((doc) => {
          featuredPlacesData.push({
            id: doc.id,
            ...doc.data(),
          } as FeaturedPlace);
        });
        setFeaturedPlaces(featuredPlacesData);
      } catch (error) {
        console.error('Error fetching featured places: ', error);
      }
    };
    fetchFeaturedPlaces();
  }, []);

  const handleSearchItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchItem(e.target.value);
    setSearchQuery(''); // Reset search query when item changes
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const truncateDescription = (description: string) => {
    if(description){
      return description.split(' ').slice(0, 4).join(' ');
    }
  };

  const filteredPlaces = featuredPlaces.filter((place) => {
    const value = place[searchItem as keyof FeaturedPlace].toLowerCase();
    return value.includes(searchQuery.toLowerCase());
  });

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this featured place?',
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(zenoraDb, 'featuredPlaces', id));
        setFeaturedPlaces(featuredPlaces.filter((place) => place.id !== id));
      } catch (error) {
        console.error('Error deleting featured place: ', error);
      }
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto">
      {editingFeaturedPlace ? (
          <EditFeaturedPlace
            place={editingFeaturedPlace}
            onSubmit={(data) => {
              setEditingFeaturedPlace(null);
            }}
            onCancel={() => setEditingFeaturedPlace(null)}
          />
        ) : (
          <div>
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={searchItem}
            onChange={handleSearchItemChange}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="placeName">Name</option>
            <option value="placeTag">Category</option>
            <option value="Address">Address</option>
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
                  Name
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
                  Address
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
              {filteredPlaces.map((place) => (
                <tr key={place.id}>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span title={place.placeName} className="tooltip">
                      {truncateDescription(place.placeName)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {place.placeTag}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span title={place.Address} className="tooltip">
                      {truncateDescription(place.Address)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex">
                      <button
                        type="button"
                        className="text-white bg-meta-3 hover:bg-graydark focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-1.5 me-2 dark:bg-primary-400 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-600 cursor-pointer"
                        onClick={() => setEditingFeaturedPlace(place)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-white bg-meta-7 hover:bg-graydark focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 dark:bg-primary-400 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-600 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(place.id);
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
    )}
      </div>
    </DefaultLayout>
  );
};

export default FeaturedPlaces;

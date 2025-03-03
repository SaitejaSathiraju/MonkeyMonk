import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar';
import { UserAuth } from '../../context/authContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "../../firebase/Firebase";


const RootLayout = ({children}) => {
  const navigate = useNavigate();
  const { user } = UserAuth();
  const currentUser = user;

  const [completeUserData , setCompleteUserData] = useState();

  const fetchCompleteUserDetails = async () => {
    const userDocRef = doc(db, "users", currentUser?.uid);
    try {
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const user = userDocSnap.data();
        setCompleteUserData(user);
      }
    } catch (error) {   
    }
  };
    useEffect(() => {
      if(currentUser?.uid)
        fetchCompleteUserDetails();
  }, [currentUser]);

  if (user) {
    if (completeUserData?.isProfileComplete === false) {
      return navigate("/completeProfile");
    } else {
      return (
        <div className="flex">
          <Sidebar />
          <main className="h-screen flex-1 mx-auto overflow-y-scroll md:pl-2 pl-4">
            {children}
          </main>
        </div>
      );
    }
  }  
   
    else{
        return <Navigate to='/login' />
    }
}

export default RootLayout
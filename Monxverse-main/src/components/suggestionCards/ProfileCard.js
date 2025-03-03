import React, { useEffect, useState } from "react";

import "./ProfileCard.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/Firebase";
import { FaFacebook } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { IoLogoTwitter } from "react-icons/io5";

const ProfileCard = ({ user, id }) => {
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    const fetchCompleteUserDetails = async () => {
      try {
        const userDocRef = doc(db, "users", id);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setOtherUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    };
    fetchCompleteUserDetails();
  }, [user]);
  return (
    <>
      {otherUser && (
        <div className="w-full absolute z-40 top-14 border-t-slate-300 border-t-[1px] ">
          <div className="bg-white shadow-xl rounded-lg py-3 px-2 flex justify-center items-center flex-col">
            <div className="photo-wrapper p-2 mx-auto">
              <img
                className="w-32 h-32 rounded-full mx-auto"
                src={otherUser.photoURL}
                alt="John Doe"
              />
            </div>
            <div className="p-2">
              <h3 className="text-center md:text-xl xl:text-4xl text-gray-900 font-medium leading-8 ">
                {otherUser.username}
              </h3>
              <div className="text-center  text-xs font-semibold">
                <div>
                  <p className="xl:text-xl md:text-md py-2  font-bold text-center">
                    Bio
                  </p>
                </div>
                <p>{otherUser.bio}</p>
                {/* <p className="md:px-10">
                  What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the
                  printing and typesetting industry. Lorem Ipsum has been the
                  industry's standard dummy text ever since the 1500s, when an
                  using 'Content here, content here', making it look like
                  readable English. Many desktop publishing packages and web
                  page editors now use Lorem Ipsum as their default model text,
                  and a search for 'lorem ipsum' will uncover many web sites
                  still in their infancy. Various versions have evolved over the
                  years, sometimes by accident, sometimes on purpose (injected
                  humour and the like).
                </p> */}
              </div>
              <table className="text-xs my-3 w-full mx-auto">
                <tbody>
                  <tr>
                    <td className="px-2 py-2  w-1/2 xl:text-xl md:text-md font-bold text-right">
                      Email
                    </td>
                    <td className="px-2 py-2 w-1/2 md:text-lg">
                      {otherUser.email}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2  xl:text-xl md:text-md font-bold w-1/2 text-right">
                      D.O.B
                    </td>
                    <td className="px-2 py-2 w-1/2 md:text-lg ">13/08/2001</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex space-x-4 justify-center items-center">
              {otherUser.facebookProfile && (
                <div className="button facebook">
                  <a
                    href={
                      otherUser?.facebookProfile.startsWith("http")
                        ? otherUser.facebookProfile
                        : `https://${otherUser.facebookProfile}`
                    }
                    target="_blank"
                  >
                    <FaFacebook />
                  </a>
                </div>
              )}
              {otherUser.instagramProfile && (
                <div className="button instagram">
                  <a
                    href={
                      otherUser?.instagramProfile.startsWith("http")
                        ? otherUser.instagramProfile
                        : `https://${otherUser.instagramProfile}`
                    }
                    target="_blank"
                  >
                    <RiInstagramFill />
                  </a>
                </div>
              )}
              {otherUser.twitterProfile && (
                <div className="button twitter">
                  <a
                    href={
                      otherUser?.twitterProfile.startsWith("http")
                        ? otherUser.twitterProfile
                        : `https://${otherUser.twitterProfile}`
                    }
                    target="_blank"
                  >
                    <IoLogoTwitter />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCard;

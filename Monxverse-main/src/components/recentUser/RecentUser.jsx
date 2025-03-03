import React from "react";
import { useState } from "react";
import { useEffect } from "react";

const RecentUser = ({ name, msg, image, date, getMessagesForCount,chatId }) => {
  const [unreadCount, setUnreadCount] = useState(null);
  useEffect(()=>{
    const fetchMessagesCount = async ()=>{
      try {
        const result = await getMessagesForCount(chatId);
        setUnreadCount(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

    }
    fetchMessagesCount();
  },[])

  const messageTime = date
    ? new Date(date.toMillis()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";
  return (
    <div className="flex justify-between border-b border-gray-200 my-4 cursor-pointer p-2 rounded-lg">
      <div className="flex flex-row">
        <div>
          <div className="w-9 h-9 rounded-full bg-white mr-2">
            <img src={image} alt="" className="rounded-full w-full h-full" />
          </div>
        </div>
        <div>
          <h2 className={` ${unreadCount ? "font-bold text-black " : " text-gray-700 text-lg "}`}>{name}</h2>
          <p className={ `text-ellipsis line-clamp-1  ${unreadCount ? "font-bold text-black " : " text-gray-400 "} `}>{msg}</p>
        </div>
      </div>
      <div className="flex flex-col justify-between">
       {  unreadCount>0 &&
          <div className="bg-color-primary w-[26px] h-[26px] rounded-lg flex justify-center items-center ">
          {unreadCount}
        </div>
        }
        <div className="">
          {messageTime}
        </div>
      </div>
    </div>
  );
};

export default RecentUser;

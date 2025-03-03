import { useEffect, useRef } from "react";
import { UserAuth } from "../../context/authContext";

const Message = ({ message }) => {
  const { user } = UserAuth();
  const currentUser = user;
  const ref = useRef();

  const messageTime = new Date(message.date.toMillis()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, 
  });

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  return (
    <div
      ref={ref}
      className={
        message.senderId === currentUser?.uid
          ? `max-w-[75%] bg-[#FCB814] p-2 m-2 rounded-lg text-white px-3`
          : ` bg-[#666563] p-2 m-2 rounded-lg text-white px-3 `
      }
    >
      <div className="messageInfo">
      </div>
      <div className="messageContent">
        <div className=" justify-between">
          <p className="text-lg">{message.text}    
          <sub className="text-xs text-right ml-4 text-gray-100">{messageTime}</sub>
          </p>
        </div>
        {message.img && <img src={message.img} alt="" />}
        <div></div>
      </div>
    </div>
  );
};

export default Message;

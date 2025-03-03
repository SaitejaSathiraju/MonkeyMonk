import React, { useState, useEffect, useContext } from "react";
import MessageCard from "../../components/messageCard/MessageCard";
import { FaCircleInfo } from "react-icons/fa6";
import { IoIosChatbubbles, IoMdSend } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa";
import RecentUser from "../../components/recentUser/RecentUser";
import Search from "../../components/recentUser/Search";
import { UserAuth } from "../../context/authContext";
import { ChatContext } from "../../context/chatContext";
import {
  doc,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  Timestamp,
  updateDoc,
  collection,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebase/Firebase";
import { useMediaQuery } from "react-responsive";
import {} from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import ProfileCard from '../../components/suggestionCards/ProfileCard'

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const isLgScreen = useMediaQuery({ minWidth: 1024 });

  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [msgs, setMsgs] = useState([]);

  const [chats, setChats] = useState({});
  const [selectedChatId, setSelectedChatId] = useState(null);

  const { user } = UserAuth();
  const currentUser = user;
  const { dispatch, data } = useContext(ChatContext);

  const [showOtherUserProfile,setShowOtherUserProfile] = useState(false);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data?.chatId), (doc) => {
      doc.exists();
      doc.exists() && setMsgs(doc.data().messages);
    });

    return () => {
      unSub();
    };
  }, [data.chatId]);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(
        doc(db, "userChats", currentUser?.uid),
        (doc) => {
          setChats(doc.data());
        }
      );
      return () => {
        unsub();
      };
    };

    currentUser?.uid && getChats();
  }, [currentUser?.uid]);

  const handleSelect = async(u) => {
    setSelectedChatId(u.userId);
    setSelectedChat(true);
    if (!isLgScreen) {
      setShowChatList(false);
    }

    const chatRef = doc(db, "chats", data.chatId);
    const chatSnapshot = await getDoc(chatRef);
  
    if (chatSnapshot.exists()) {
      const chatData = chatSnapshot.data();
      const messages = chatData.messages || [];
  
      const updatedMessages = messages.map((message) => {
        if ((message.senderId !== currentUser?.uid )&& !message.readStatus[currentUser?.uid]) {
          return { ...message, readStatus: { ...message.readStatus, [currentUser?.uid]: true } };
        }
        return message;
      });
  
      await updateDoc(chatRef, { messages: updatedMessages });
    }
    dispatch({ type: "CHANGE_USER", payload: u });

  };

  const handleSend = async () => {
    if (img) {
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, img);

      uploadTask.on(
        (error) => {
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: currentUser?.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser?.uid,
          date: Timestamp.now(),
          readStatus: {
            [currentUser?.uid]: true,
            [data.User.userId]: false,
          },
        }),
      });
    }

    await updateDoc(doc(db, "userChats", currentUser?.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.User.userId), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });
    setText("");
    setImg(null);
  };

  const handleBack = () => {
    setSelectedChatId(null);
    setShowChatList(true);
  };

  const groupMessagesByDate = (messages) => {
    const groupedMessages = {};
    messages.forEach((message) => {
      const date = new Date(message.date.toMillis());
      const dateString = date.toDateString();
      if (!groupedMessages[dateString]) {
        groupedMessages[dateString] = [];
      }
      groupedMessages[dateString].push(message);
    });
    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDate(msgs);

 

  const getMessagesForCount = async (chatId) => { 

    try {
      const chatRef = doc(db, "chats", chatId);
      const docSnapshot = await getDoc(chatRef);
  
      if (docSnapshot.exists()) {
        const chatData = docSnapshot.data();
        const messages = chatData.messages || [];
          const unreadMessages = messages.filter((message) => {
          return message.senderId !== currentUser?.uid && !message.readStatus[currentUser?.uid];
        });
        return unreadMessages.length  
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
    return 0; 
  };
  

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1">
        {showChatList && (
          <div className="w-full lg:w-1/4 md:2/4  overflow-y-auto bg-white">
            <div className="p-4 h-20">
              <h1 className="text-xl text-black font-bold">Chats</h1>
            </div>
            <div>
              <Search />
            </div>
            <div className="p-0  ">
              <div className="chats">
                {Object.entries(chats)
                  ?.sort((a, b) => b[1].date - a[1].date)
                  .map( (chat) => {
                    const chatId = chat[0];
                    return (
                      <div
                        className={`userChat my-2 rounded-lg hover:bg-stone-300 ${
                          selectedChatId === chat[1].userInfo.userId
                            ? "bg-white z-50"
                            : ""
                        }`}
                        key={chat[1].userInfo.userId}
                        onClick={() => handleSelect(chat[1].userInfo)}
                      >
                        <RecentUser
                          key={chat[1].id}
                          name={chat[1]?.userInfo.username}
                          msg={chat[1]?.lastMessage?.text}
                          image={chat[1]?.userInfo.photoURL}
                          date={chat[1]?.date}
                          getMessagesForCount = {getMessagesForCount}
                          chatId = {chatId}
                        />

                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
        <div
          className={`w-full lg:w-3/4 md:2/4 h-screen  ${
            showChatList ? "md:block hidden" : "block"
          }`}
        >
          {!selectedChat && (
            <>
              <div className=" h-full flex justify-center items-center bg-gray-200">
                <IoIosChatbubbles className="text-4xl" />
                Select a default User
              </div>
            </>
          )}
          {selectedChat && (
            <>
              <div className="user-full-chat h-full flex flex-col  relative">
                <div className="w-full h-16 p-4 bg-white shadow-lg flex justify-between items-center ">
                  <div className="flex items-center ">
                    <div>
                      <button
                        className="block lg:hidden text-black px-1 mr-2"
                        onClick={handleBack}
                      >
                        <FaArrowLeft className="text-black" />
                      </button>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 mr-4">
                      <img
                        src={data.User.photoURL}
                        alt="profilePhoto"
                        className="w-full h-full rounded-full"
                      />
                    </div>
                    <div onClick={()=>setShowOtherUserProfile((prev => !prev))}  className="hover:underline cursor-pointer">
                      <span className="text-xs sm:text-sm lg:text-lg xl:text-xl whitespace-pre font-semibold">
                        {data.User.username}
                      </span>
                    </div>
                  </div>

                  <div>
                    <FaCircleInfo />
                  </div>
                </div>
                {
                  showOtherUserProfile &&
                  <>
                   {/* <p>{data.User.username}</p> */}
                  <ProfileCard  user={data.User} key={data.User.userId} id={data.User.userId}/>
                  </>
                 
                  // <div className=" max-w-96 w-full  h-96 absolute z-50 top-16">j</div>
                }
                <div className="h-full overflow-y-scroll  px-5 flex flex-col ">
                  {Object.entries(groupedMessages).map(([date, messages]) => (
                    <div key={date}>
                      <div className="h-[1px] bg-stone-200 relative my-5 flex justify-center items-center">
                        <div className="-top-6 bg-gray-100 rounded-full p-1 px-2 absolute text-center my-2 text-lg font-semibold">
                          {date}
                        </div>
                      </div>
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={
                            m.senderId === currentUser?.uid
                              ? `w-full flex justify-end bg-[#]`
                              : `w-full flex  `
                          }
                        >
                          <MessageCard message={m} key={m.id} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="w-full h-[100px] bg-white flex justify-between items-center px-4 py-2">
                  <div className="w-full mx-4">
                    <input
                      type="text"
                      className="w-[100%] px-2 py-3 text-black rounded-lg text-lg"
                      placeholder="Type here..."
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSend();
                        }
                      }}
                      value={text}
                    />
                  </div>
                  <div className="w-[50px] h-[40px] bg-color-primary text-white flex justify-center items-center text-2xl rounded-lg">
                    <button onClick={handleSend}>
                      <IoMdSend />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

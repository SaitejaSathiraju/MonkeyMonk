import { createContext, useReducer,  useEffect } from "react";
import { UserAuth } from './authContext';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { user } = UserAuth();
  const INITIAL_STATE = {
    chatId: "null",
    User: {},
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        return {
          User: action.payload,
          chatId:
            user.uid > action.payload.userId
              ? user.uid + action.payload.userId
              : action.payload.userId + user.uid,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  useEffect(() => {
    if (user && Object.keys(user).length !== 0) {
      dispatch({ type: "CHANGE_USER", payload: user });
    }
  }, [user]);

  return (
    <ChatContext.Provider value={{ data:state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

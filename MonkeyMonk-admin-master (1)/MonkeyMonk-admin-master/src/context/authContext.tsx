import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { loginAuth } from '../firebase';

interface AuthContextType {
  user: string;
  logout: () => void;
  signIn: () => void;
}
const UserContext = createContext({}) ;

export const AuthContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>({});

   const signIn = (email: string, password: string) =>  {
    return signInWithEmailAndPassword(loginAuth, email, password)
   }

  const logout = (): any => {
      return signOut(loginAuth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(loginAuth, (currentUser: any) => {
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{user, logout, signIn}}>
      {children}
    </UserContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(UserContext) as AuthContextType;
};
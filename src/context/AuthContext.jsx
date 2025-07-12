import { useState, useEffect } from "react";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { AuthContext } from "./UseAuth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import toast from "react-hot-toast";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await initializeUser(user);
    });
    
    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const initializeUser = async (user) => {
    setLoading(true);
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userObj = {
            uid: user.uid,
            email: user.email,
            ...userData,
          };
          setCurrentUser(userObj);
          setUserLoggedIn(true);
          
        
        } else {
          toast.error("User profile not found in Firestore, Try again later.");
          setCurrentUser(null);
          setUserLoggedIn(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data. Please try again later.");
        setCurrentUser(null);
        setUserLoggedIn(false);
      }
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }
    setLoading(false);
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const { email, password, ...additionalData } = userData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
    
      const userProfileData = {
        email: user.email,
        ...additionalData,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), userProfileData);

      const userObj = {
        uid: user.uid,
        email: user.email,
        ...userProfileData,
      };

      setCurrentUser(userObj);
      setUserLoggedIn(true);
      
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user details from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userObj = {
          uid: user.uid,
          email: user.email,
          ...userData,
        };
        console.log(userObj);
        setCurrentUser(userObj);
        setUserLoggedIn(true);
        
      } else {
        toast.error("User document not found in Firestore, Try again later.");
        throw new Error("User document not found");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear the local state
      setCurrentUser(null);
      setUserLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    userLoggedIn,
    setCurrentUser,
    signup,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
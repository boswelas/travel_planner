import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initFirebase } from "@/components/firebase";
import GetID from "@/components/getID";
import Layout from "@/components/Layout";

import  '../styles/globals.css';     // Needed for global styles

initFirebase();

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    // Set up Firebase authentication observer
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, [auth]);

  if (user) {
    GetID({ user })
      .then(res => {
        setUserId(res)
      });
  }

  return (
    <Layout user={user}>
      <Component {...pageProps} user={user} userId={userId} />
    </Layout>
  );
}

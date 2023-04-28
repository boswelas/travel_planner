import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initFirebase } from "@/components/firebase";
import Layout from "@/components/Layout";

initFirebase();

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    // Set up Firebase authentication observer
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, [auth]);

  return (
    <Layout user={user}>
      <Component {...pageProps} user={user} />
    </Layout>
  );
}

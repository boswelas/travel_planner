import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from 'firebase/auth';
import { auth } from '../components/firebase';

const provider = new GoogleAuthProvider();

const getToken = async () => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        return token;
    } else {
        return null;
    }
};

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const uid = result.user.uid;
            const email = result.user.email;
            const displayName = result.user.displayName;

            const response = await fetch('https://travel-planner-production.up.railway.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: uid, email: email, displayName: displayName }),
            });
            response.json();
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                console.log('Authentication popup closed by the user');
            } else {
                console.log('Authentication error:', error);
            }
        }
    };


    const logout = async () => {
        setUser(null);
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, getToken }}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};

import Link from "next/link";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();
const auth = getAuth();

const Login = () => {
    const signIn = async () => {
        const result = await signInWithPopup(auth, provider);
        const uid = result.user.uid;

    };

    return (
        <div>
            <Link href="#">
                <span onClick={signIn}>Sign in with Google</span>
            </Link>
        </div>
    );
};

export default Login;

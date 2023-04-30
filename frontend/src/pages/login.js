import Link from "next/link";
import { useRouter } from 'next/router';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();
const auth = getAuth();

const Login = () => {
    const router = useRouter();
    const signIn = async () => {
        const result = await signInWithPopup(auth, provider);
        const email = result.user.email;

        const response = await fetch('https://travel-planner-production.up.railway.app/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });
        response.json()
            .then(data => {
                if (data.user.length == 0) {
                    router.push('/signup');
                }
                router.push('/');
            })
    }


    return (
        <div>
            <Link href="#">
                <span onClick={signIn}>Sign in with Google</span>
            </Link>
        </div>
    );
};

export default Login;

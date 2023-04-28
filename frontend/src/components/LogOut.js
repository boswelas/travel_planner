import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import Link from "next/link";

export default function SignOut() {
    const auth = getAuth();
    const router = useRouter();

    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                // User signed out successfully
                router.push("/");
            })
            .catch((error) => {
                // Handle sign-out errors
                console.error(error);
            });
    };

    return (
        <Link href="/">
            <span onClick={handleSignOut}>Sign out</span>
        </Link>
    );
}

import Link from "next/link";
import styles from '../styles/Layout.module.css'
import SearchBar from "./SearchBar";
import { useAuth } from '@/components/AuthContext.js';



const Header = () => {
    const { user, login, logout } = useAuth();
    return (
        <header>
            <nav className={styles.header}>
                <Link href="/"><div className={styles.logo}>Travel Planner</div></Link>
                <Link href="/trip">My Trips</Link>
                <Link href="/experience">Explore</Link>
                <SearchBar />

                {user ? (
                    <>
                        <div className={styles.WelcomeContainer}>
                            <div>
                                <h4 className={styles.WelcomeMessage}>Welcome {user.displayName}</h4>
                                <Link href="/">
                                    <span className={styles.SignOutLink} onClick={logout}>Sign out</span>
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <Link href="/">
                        <span onClick={login}>Sign In With Google</span>
                    </Link>
                )}
            </nav>
        </header>
    );
}

export default Header;
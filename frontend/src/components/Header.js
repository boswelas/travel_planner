import Link from "next/link";
import styles from '../styles/Layout.module.css'
import SearchBar from "./SearchBar";
import Login from "../pages/login.js";
import LogOut from "./LogOut.js";


const Header = ({ user }) => {

    return (
        <header>
            <nav className={styles.header}>
                <Link href="/"><div className={styles.logo}>Travel Planner</div></Link>
                <Link href="/trips">My Trips</Link>
                <Link href="/experience">Explore</Link>
                <SearchBar />

                {user ? (
                    <div>
                        <h4>Welcome {user.displayName}</h4>
                        <LogOut />
                    </div>
                ) : (
                    <Login />
                )}
            </nav>
        </header>
    );
}

export default Header;
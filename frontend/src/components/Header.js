import Link from "next/link";
import styles from '../styles/Nav.module.css'

const Header = () => {
    return ( 
        <header>
            <nav className={styles.header}>
                <Link href="/"><div className={styles.logo}>Travel Planner</div></Link>
                <Link href="/trips">My Trips</Link>
                <Link href="/experience">Explore</Link>
                <Link href="/login">Login</Link>
                <Link href="/signup">Signup</Link>
            </nav>
        </header>
     );
}
 
export default Header;
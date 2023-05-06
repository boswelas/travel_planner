import Footer from "./Footer";
import Header from "./Header";

import { useRouter } from 'next/router';

import styles from '../styles/Layout.module.css'

const Layout = ({ children, user }) => {

    const router = useRouter();
    const isHomePage = router.pathname === '/';

    const showTopBarIfNotHome = () => {
        // Shows the top bar i
        if (!isHomePage) {
        return ( 
            <div className={styles.top}>
                <Header user={user} />
            </div>
         )}
    }
     
    return (
        <div>
            {showTopBarIfNotHome()}
            <div className={styles.mid}>
                {children}
            </div>
            <div className={styles.bot}>
                <Footer />
            </div>
        </div>
    );
}

export default Layout;
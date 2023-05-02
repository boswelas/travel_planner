import Footer from "./Footer";
import Header from "./Header";

import styles from '../styles/Layout.module.css'

const Layout = ({ children, user }) => {
    return (
        <div>
            <div className={styles.top}>
                <Header user={user} />
            </div>
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
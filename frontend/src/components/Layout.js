import Footer from "./Footer";
import Header from "./Header";


const Layout = ({ children, user }) => {
    return (
        <div>
            <Header user={user} />
            {children}
            <Footer />
        </div>
    );
}

export default Layout;
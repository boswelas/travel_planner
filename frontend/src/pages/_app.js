import { AuthContextProvider } from '../components/AuthContext';
import Layout from "@/components/Layout";
import  '../styles/globals.css';     // Needed for global styles
export default function App({ Component, pageProps }) {
  
  return (
    <AuthContextProvider>
    <Layout>
      <Component {...pageProps} />
    </Layout>
    </AuthContextProvider>

  );
}

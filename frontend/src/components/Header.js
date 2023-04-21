import Link from "next/link";

const Header = () => {
    return ( 
        <nav>
            <div>
                <Link href="/"><h1 className="logo">Travel Planner</h1></Link>
            </div>
            <Link href="/Trips">My Trips</Link>
            <Link href="/explore">Explore</Link>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
        </nav>
     );
}
 
export default Header;
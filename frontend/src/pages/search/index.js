import { useRouter } from "next/router";
import SearchBar from "@/components/SearchBar";

const Search = () => {

    const router = useRouter()
    const query = router.query

    const core = (query) => {

        if (typeof query.search == 'string') {
            // User has input a search
            return (<>
                        <p>Results for {query.search}:</p>
                    </>
            )
        } else {
            // No search params were input
            return (<>
                        <p>Search for an experience below!</p>
                        <SearchBar />
                    </>
            )
        }
    }


    return (
        <>
            <h3>Search Page</h3>

            {core(query)}

        </>
     );
}
 
export default Search;
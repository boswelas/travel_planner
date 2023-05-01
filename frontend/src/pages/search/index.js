import { useRouter } from "next/router";
import SearchBar from "@/components/SearchBar";
import React, { useState, useEffect } from 'react';
import ExpCard from "@/components/ExpCard";
import ExpCardGrid from "@/components/ExpCardGrid";


const Search = () => {

    const router = useRouter()
    const query = router.query
    const [grid, setGrid] = useState([]);

    const PerformSearch = async (query) => {

        const res = await fetch(`https://travel-planner-production.up.railway.app/search?search=${query}`)
        const data = await res.json();

        return data
    }

    const genGrid = (dataArrays) => {

        let temp = <ExpCardGrid data={dataArrays} />

        setGrid(temp)
    }

    useEffect(() => {
        if(!router.isReady) return;

        PerformSearch(query['search'])
        .then((res) => genGrid(res))

    }, [router.isReady])
    
    const core = () => {

        if (typeof query.search == 'string') {
            // User has input a search
            return (<>
                        <h3 class='subheader'>{`Search results for '${query.search}'`}</h3>
                        {grid}
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
            {core(query)}

        </>
     );
}
 
export default Search;
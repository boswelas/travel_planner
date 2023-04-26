import { useRouter } from "next/router";
import SearchBar from "@/components/SearchBar";
import React, { useState, useEffect } from 'react';


const Search = () => {

    const router = useRouter()
    const query = router.query

    const [data, setData] = useState([]);
    const [rows, setRows] = useState([]);

    const PerformSearch = async (query) => {

        const res = await fetch(`http://127.0.0.1:5000/search?search=${query}`)
        const data = await res.json();

        console.log(`URL: http://127.0.0.1:5000/search?search=${query}`)
        console.log(res)
        console.log(data)
        setData(data)
        return data
    }

    const genTable = (dataArrays) => {

        console.log(`Type of data ${typeof dataArrays}`)
        console.log(`dataArrays: ${dataArrays}`)

        const listRows = dataArrays.map((row, index) =>
            <tr key={index}>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
            </tr>
        )

        setRows(listRows)
    }

    useEffect(() => {
        if(!router.isReady) return;

        PerformSearch(query['search'])
        .then((res) => genTable(res))

    }, [router.isReady])
    

    const core = () => {

        if (typeof query.search == 'string') {
            // User has input a search
            return (<>
                        <p>Results for {query.search}:</p>
                        <table>
                        <thead>
                            <tr>
                                <th>Experience</th>
                                <th>City</th>
                                <th>State</th>
                                <th>Country</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                        
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
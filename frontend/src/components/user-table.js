import React, { useState, useEffect } from 'react';

export default function UserTable() {

    const [data, setData] = useState([]);

    async function GetUserData() {
        const response = await fetch("https://travel-planner-production.up.railway.app/user");
        const jsonData = await response.json();
        setData(jsonData.result)
    }

    const listRows = data.map((row, index) =>
        <tr key={index}>
            <td>{row[0]}</td>
            <td>{row[2]}</td>
            <td>{row[3]}</td>
            <td>{row[4]}</td>
        </tr>
    )

    useEffect(() => {
        GetUserData();

    }, [])

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Birthday</th>
                </tr>
            </thead>
            <tbody>
                {listRows}
            </tbody>
        </table>
    )
}
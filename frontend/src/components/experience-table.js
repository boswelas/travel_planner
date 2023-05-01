import React, { useState, useEffect } from 'react';

export default function ExperienceTable() {

    const [data, setData] = useState([]);

    async function GetExperienceData() {
        const response = await fetch("https://travel-planner-production.up.railway.app/experience");
        const jsonData = await response.json();
        setData(jsonData.data)
      }

    const listRows = data.map((row, index) =>
      <tr key={index}>
          <td>{row[0]}</td>
          <td>{row[1]}</td>
          <td>{row[2]}</td>
          <td>{row[3]}</td>
          <td>{row[4]}</td>
          <td>{row[5]}</td>
          <td>{row[6]}</td>
      </tr>
  )

    useEffect(() => {
        GetExperienceData();

    }, [])

    return (
        <table>
            <thead>
                <tr>
                    <th>ExperienceID</th>
                    <th>LocationID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Geo-Location</th>
                    <th>Average Rating</th>
                    <th>UserID</th>
                </tr>
            </thead>
            <tbody>
                {listRows}
            </tbody>
        </table>
    )
}
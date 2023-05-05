import React, { useState } from 'react';
import {v4 as uuidv4} from 'uuid';

const ExperienceForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [geolocation, setGeolocation] = useState([0, 0]);
    const [keywords, setKeywords] = useState('');
    const [image, setImage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // const response = await fetch('https://travel-planner-production.up.railway.app/experience/addNewExperience', {
            const response = await fetch('http://localhost:5001/experience/addNewExperience', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    experience_id: uuidv4(),
                    user_user_id: uuidv4(),
                    location_id: uuidv4(),
                    keyword_id: uuidv4(),
                    title,
                    description,
                    geolocation,
                    keywords: keywords.split(',').map(keyword => keyword.trim()),
                    image,
                }),
            });

            const data = await response.json();
            console.log('New experience added with ID:', data.experience_id);

            window.location.href = `/experience/${data.experience_id}`;

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Create New Experience</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Experience Title:
                    <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>
                <br />
                <label>
                    Description:
                    <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
                </label>
                <br />
                <label>
                    Geolocation (latitude, longitude):
                    <input type="text" value={geolocation[0]} onChange={(event) => setGeolocation([event.target.value, geolocation[1]])} />
                    <input type="text" value={geolocation[1]} onChange={(event) => setGeolocation([geolocation[0], event.target.value])} />
                </label>
                <br />
                <label>
                    Keywords (comma-separated):
                    <input type="text" value={keywords} onChange={(event) => setKeywords(event.target.value)} />
                </label>
                <br />
                <label>
                    Image:
                    <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files[0])} />
                </label>
                <br />
                <br />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default ExperienceForm;




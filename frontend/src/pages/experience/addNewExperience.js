import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Code Citation for firebase image storing:
// URL Accessed: https://firebase.google.com/docs/storage/web/start

// Create a root reference
const storage  = getStorage();

const ExperienceForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [geolocation, setGeolocation] = useState([0, 0]);
    const [keywords, setKeywords] = useState('');
    const [image, setImage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const storageRef = ref(storage, `images/${image.name}`);
        const uploadSnapshot = await uploadBytes(storageRef, image);
        const downloadURL = await getDownloadURL(uploadSnapshot.ref);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('geolocation', JSON.stringify(geolocation.map(parseFloat)));
            formData.append('keywords', JSON.stringify(keywords.split(',').map(keyword => keyword.trim())));
            formData.append('imageURL', downloadURL);


            // const response = await fetch('https://travel-planner-production.up.railway.app/experience/addNewExperience', {
            const response = await fetch('http://localhost:5001/experience/addNewExperience', {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'application/json',
                // },
                body: formData
            });

            const data = await response.json();
            console.log('New experience added with ID:', data.experience_id);

            window.location.href = `/experience/${data.experience_id}`;

        } catch (error) {
            console.error(error);
        }
    };

    const handleClear = () => {
        setTitle('');
        setDescription('');
        setGeolocation([0, 0]);
        setKeywords('');
        setImage(null);
      };      


    
    return (
        <div>
            <h2>Create New Experience</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Experience Title:
                    <input type="text" value={title} required onChange={(event) => setTitle(event.target.value)} />
                </label>
                <br />
                <label>
                    Description:
                    <textarea value={description} required onChange={(event) => setDescription(event.target.value)} />
                </label>
                <br />
                <label>
                    Geolocation (latitude, longitude):
                    <input type="number" value={geolocation[0]} required onChange={(event) => setGeolocation([event.target.value, geolocation[1]])} />
                    <input type="number" value={geolocation[1]} required onChange={(event) => setGeolocation([geolocation[0], event.target.value])} />
                </label>
                <br />
                <label>
                    Keywords (comma-separated):
                    <input type="text" value={keywords} required onChange={(event) => setKeywords(event.target.value)} />
                </label>
                <br />
                <label>
                    Image:
                    <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files[0])} />
                </label>
                <br />
                <br />
                <button type="submit">Submit</button>
                <button type="button" onClick={handleClear}>Clear</button>
                <button type="button" onClick={() => window.history.back()}>Cancel</button>
                
            </form>
        </div>
    );
};

export default ExperienceForm;
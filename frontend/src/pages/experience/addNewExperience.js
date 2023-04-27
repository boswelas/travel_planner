import React, { useState, useEffect } from 'react';

const Experience = () => {
    const [formData, setFormData] = useState({
        experienceID: '',
        locationID: '',
        title: '',
        // location: '',
        description: '',
        geoLocation: '',
        rating: '1',
        userID: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        // e.preventDefault();
        // console.log(formData);
        try {
            const response = await fetch('/experience/addNewExperience', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            console.log(response, 'RESPONSE');
            if (response.ok) {
                window.location.href = '/experience';
            }
        } catch (error) {
            console.error('Error submitting experience:', error);
        }
    }

    return (
    <><h1>Add a new experience!</h1>
    <form onSubmit={handleSubmit}>
            <label htmlFor="experienceID">Experience ID:</label>
            <input type="text" id="experienceID" name="experienceID" value={formData.experienceID} onChange={handleChange}/>
            <label htmlFor="locationID">Location ID:</label>
            <input type="text" id="locationID" name="locationID" value={formData.locationID} onChange={handleChange}/>
            <label htmlFor="title">Experience Title:</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}/>
            {/* <label htmlFor="location">Location:</label>
            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} /> */}
            <label htmlFor="description">Description:</label>
            <input type="text" id="description" name="description" value={formData.description} onChange={handleChange} />
            <label htmlFor="geoLocation">geoLocation:</label>
            <input type="text" id="geoLocation" name="geoLocation" value={formData.geoLocation} onChange={handleChange} />
            <label htmlFor="rating">Rating:</label>
            <select name="rating" id="rating" value={formData.rating} onChange={handleChange}>
                <option value="1">1 star</option>
                <option value="2">2 star</option>
                <option value="3">3 star</option>
                <option value="4">4 star</option>
                <option value="5">5 star</option>
            </select>
            <label htmlFor="userID">UserID:</label>
            <input type="text" id="userID" name="userID" value={formData.userID} onChange={handleChange}/>
            <button type="submit">Submit</button>
            <button type="button" onClick={() => window.history.back()}>Cancel</button>
        </form></>
    )
};
  
export default Experience;

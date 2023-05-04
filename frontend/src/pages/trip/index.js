import React, { useState, useEffect } from 'react';
import TripCardGrid from '@/components/TripCardGrid.js';

const Trip = ({ user, userId }) => {
    const [tripData, setTripData] = useState([]);
    const [showAddTripPopup, setShowAddTripPopup] = useState(false);
    const [newTripTitle, setNewTripTitle] = useState('');

    useEffect(() => {
        const fetchTripData = async () => {
            try {
                const response = await fetch('https://travel-planner-production.up.railway.app/trip', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: userId,
                    }),
                });

                const data = await response.json();
                setTripData(data.trip);
            } catch (error) {
                console.error(error);
            }
        };

        if (user && userId) {
            fetchTripData();
        }
    }, [user, userId]);

    const handleAddTrip = () => {
        setShowAddTripPopup(true);
    };

    const handleAddTripSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5001/addTrip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    name: newTripTitle,
                }),
            });

            const data = await response.json();
            setTripData([...tripData, data.trip]);
            setShowAddTripPopup(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            {user && userId ? (
                <div>
                    <h1>My Trips</h1>
                    <button onClick={handleAddTrip}>Add Trip</button>

                    {showAddTripPopup && (
                        <div>
                            <form onSubmit={handleAddTripSubmit}>
                                <label>
                                    Trip Title:
                                    <input type="text" value={newTripTitle} onChange={(event) => setNewTripTitle(event.target.value)} />
                                </label>
                                <button type="submit">Save</button>
                            </form>
                        </div>
                    )}

                    {tripData.length > 0 ? (
                        <TripCardGrid data={tripData} />
                    ) : (
                        <p>No trips found.</p>
                    )}
                </div>
            ) : (
                <div>
                    <h1>Please Sign In</h1>
                </div>
            )}
        </div>
    );
};

export default Trip;

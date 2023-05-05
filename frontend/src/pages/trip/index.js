import React, { useState, useEffect } from 'react';
import TripCardGrid from '@/components/TripCardGrid.js';
import { useAuth } from '@/components/AuthContext.js';


const Trip = () => {
    const [tripData, setTripData] = useState([]);
    const [showAddTripPopup, setShowAddTripPopup] = useState(false);
    const [newTripTitle, setNewTripTitle] = useState('');
    const { user, getToken } = useAuth();

    useEffect(() => {
        const fetchTripData = async () => {
            try {
                const token = await getToken();
                const response = await fetch('https://travel-planner-production.up.railway.app/trip', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_id: user.uid,
                    }),
                });

                const data = await response.json();
                console.log(data);
                console.log(data.trip);
                if (data.trip === "invalid") {
                    setTripData([]);
                } else {
                    setTripData(data.trip);
                }
            } catch (error) {
                console.error(error);
            };

        }; if (user) { fetchTripData(); };
    }, []);

    const handleAddTrip = () => {
        setShowAddTripPopup(true);
    };

    const handleAddTripSubmit = async (event) => {
        event.preventDefault();
        try {
            const token = await getToken();
            const response = await fetch('https://travel-planner-production.up.railway.app/addTrip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,

                },
                body: JSON.stringify({
                    user_id: user.uid,
                    name: newTripTitle,
                }),
            });

            const data = await response.json();
            setTripData([data.trip]);
            setShowAddTripPopup(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div>
            {!user ? (
                <h1>Please Log In</h1>
            ) : tripData.length === 0 ? (
                <h1>No trips saved.</h1>
            ) : (
                <>
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
                    <TripCardGrid data={tripData} />
                </>)}
        </div>
    )

};

export default Trip;

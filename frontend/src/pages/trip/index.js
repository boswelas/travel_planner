import React, { useState, useEffect } from 'react';
import TripCardGrid from '@/components/TripCardGrid.js';

const Trip = ({ user, userId }) => {
    // fetch trip data and store in state
    const [tripData, setTripData] = useState([]);

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

    return (
        <div>
            {user && userId ? (
                <div>
                    <h1>My Trips</h1>
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

import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import ExpCardGrid from '@/components/ExpCardGrid';
import { useAuth } from '@/components/AuthContext.js';

const TripDetail = () => {
    const router = useRouter();
    const { trip_id, name, user_id } = router.query;
    const [tripDetailData, settripDetailData] = useState([]);
    const { user, getToken } = useAuth();


    useEffect(() => {
        const fetchtripDetailData = async () => {
            try {
                const token = await getToken();
                const response = await fetch('https://travel-planner-production.up.railway.app/tripDetail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        trip_id: trip_id,
                    }),
                });
                const data = await response.json();
                console.log(data.trip);
                if (data.trip === "invalid") {
                    settripDetailData([]);
                } else {
                    settripDetailData(data.trip);
                }

            } catch (error) {
                console.error(error);
            }
        };

        if (trip_id) {
            fetchtripDetailData();
        }
    }, [trip_id]);

    return (
        <div>
            {tripDetailData.length === 0 ? (
                <p>No experiences to show.</p>
            ) : (
                <>
                    <h1>{name}</h1>
                    <ExpCardGrid data={tripDetailData} fromTrip={true} trip_id={trip_id} />
                </>
            )}
        </div>
    );

};

export default TripDetail;

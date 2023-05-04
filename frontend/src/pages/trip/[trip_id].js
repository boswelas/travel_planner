import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import ExpCardGrid from '@/components/ExpCardGrid';

const TripDetail = ({ userId }) => {
    const router = useRouter();
    const { trip_id, name, user_id } = router.query;
    const [tripDetailData, settripDetailData] = useState([]);

    useEffect(() => {
        const fetchtripDetailData = async () => {
            try {
                const response = await fetch('https://travel-planner-production.up.railway.app/tripDetail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        trip_id: trip_id,
                    }),
                });

                const data = await response.json();
                settripDetailData(data.trip);
                console.log(tripDetailData);
            } catch (error) {
                console.error(error);
            }
        };

        if (trip_id) {
            fetchtripDetailData();
        }
    }, [trip_id]);




    if (userId == user_id) {
        return (
            <div>
                <h1>{name}</h1>
                <ExpCardGrid data={tripDetailData} />
            </div>
        );
    }
    return (
        <div>
            <h1>Unauthorized</h1>

        </div>)
}

export default TripDetail;

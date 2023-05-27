export const handleDeleteFromTrip = async (experience_id, trip_id) => {

    try {
        const response = await fetch('https://travel-planner-production.up.railway.app/deleteExperienceFromTrip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trip_id: trip_id,
                experience_id: experience_id,
            }),
        });

        const data = await response.json();
        window.location.reload();
    } catch (error) {
        console.error(error);
        return null;
    }
};
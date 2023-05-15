const handleDeleteFromTrip = async (event) => {
    event.preventDefault();
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
    }
};

export default handleDeleteFromTrip;
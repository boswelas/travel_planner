

export const addUserRating = async (getToken, experience_id, rating) => {

    const token = await getToken();

    try {
        const response = await fetch('https://travel-planner-production.up.railway.app/addUserRating', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                experience_id,
                rating
            }),
        });

        const data = await response.json();
        return data
    } catch (error) {
        console.error(error);
        return null;
    }
};

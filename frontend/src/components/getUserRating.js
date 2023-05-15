

export const handleGetRating = async (getToken, experience_id) => {

  const token = await getToken();

  try {
    const response = await fetch('http://127.0.0.1:5001/getUserRating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        experience_id,
      }),
    });

    const data = await response.json();
    return data.rating;
  } catch (error) {
    console.error(error);
    return null;
  }
};

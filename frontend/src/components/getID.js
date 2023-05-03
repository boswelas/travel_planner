const GetID = ({ user }) => {
    if (user) {
        const email = user.email;
        return fetch("https://travel-planner-production.up.railway.app/GetID", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                return data.user[0][0];
                // do something with the response data
            })
            .catch((error) => {
                console.error(error);
                // handle the error
            });
    }
};

export default GetID;

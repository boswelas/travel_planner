import { useState } from "react";
import { useRouter } from 'next/router';

const SignUp = ({ user }) => {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthday, setBirthday] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Make POST request to database
        const response = await fetch("https://travel-planner-production.up.railway.app/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: user.email,
                firstName: firstName,
                lastName: lastName,
                birthday: birthday,
            }),
        });

        // Check if the response is successful
        if (response.status === 200) {
            // Redirect to homepage
            router.push('/');
        }
    };

    return (
        <div>
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    First Name:
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Last Name:
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Birthday:
                    <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                    />
                </label>
                <br />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default SignUp;

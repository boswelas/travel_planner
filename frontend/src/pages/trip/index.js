// Modal adapted from Material-UI: https://mui.com/material-ui/react-modal/
import React, { useState, useEffect } from 'react';
import TripCardGrid from '@/components/TripCardGrid.js';
import { useAuth } from '@/components/AuthContext.js';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: '#fff', // Set the desired background color here
    border: '2px solid #000',
    boxShadow: '24px',
    p: 4
};

const Trip = () => {
    const [tripData, setTripData] = useState([]);
    const [showAddTripPopup, setShowAddTripPopup] = useState(false);
    const [newTripTitle, setNewTripTitle] = useState('');
    const { user, getToken } = useAuth();

    useEffect(() => {
        const fetchTripData = async () => {
            try {
                const token = await getToken();
                const response = await fetch(
                    'https://travel-planner-production.up.railway.app/trip',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            user_id: user.uid,
                        }),
                    }
                );

                const data = await response.json();
                console.log(data);
                console.log(data.trip);
                if (data.trip === 'invalid') {
                    setTripData([]);
                } else {
                    setTripData(data.trip);
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (user) {
            fetchTripData();
        }
    }, []);

    const handleAddTrip = () => {
        setShowAddTripPopup(true);
    };

    const handleCloseAddTrip = () => {
        setShowAddTripPopup(false);
        setNewTripTitle('');
    };

    const handleAddTripSubmit = async (event) => {
        event.preventDefault();
        try {
            const token = await getToken();
            const response = await fetch(
                'https://travel-planner-production.up.railway.app/addTrip',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_id: user.uid,
                        name: newTripTitle,
                    }),
                }
            );

            const data = await response.json();
            setTripData([data.trip]);
            handleCloseAddTrip();
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            {!user ? (
                <h1>Please Log In</h1>
            ) : (
                <>
                    <h1>My Trips</h1>

                    <button onClick={handleAddTrip}>New Trip</button>

                    <Modal
                        open={showAddTripPopup}
                        onClose={handleCloseAddTrip}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                    >
                        <div style={style}>
                            <Typography variant="h6" component="h2" id="modal-title">
                                Add New Trip
                            </Typography>
                            <form onSubmit={handleAddTripSubmit} style={{ border: 'none' }}>
                                <label>
                                    Trip Name:
                                    <input
                                        type=" text"
                                        value={newTripTitle}
                                        onChange={(event) =>
                                            setNewTripTitle(event.target.value)
                                        }
                                    />
                                </label>
                                <div>
                                    <Button type="submit">Save</Button>
                                    <Button onClick={handleCloseAddTrip}>Cancel</Button>
                                </div>
                            </form>
                        </div>
                    </Modal>
                    <div style={{ marginTop: '16px' }}>

                        <TripCardGrid data={tripData} />
                    </div>
                </>
            )}
        </div>
    );
};

export default Trip;


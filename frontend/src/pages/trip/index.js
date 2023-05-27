// Modal adapted from Material-UI: https://mui.com/material-ui/react-modal/
import React, { useState, useEffect } from 'react';
import TripCardGrid from '@/components/TripCardGrid.js';
import { useAuth } from '@/components/AuthContext.js';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import styles from '@/styles/Trip.module.css';
import Link from 'next/link'



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

    function getRandomIndex() {
        return Math.floor(Math.random() * 6);
    }

    const handleAddTripSubmit = async (event) => {
        event.preventDefault();
        try {
            const randomIndex = getRandomIndex(0, 5);
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
                        background_photo: randomIndex
                    }),
                }
            );

            const data = await response.json();
            console.log(tripData);
            console.log(data.trip);
            setTripData(data.trip);
            handleCloseAddTrip();
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
                    <p className={styles.CardLink}>
                        <Link href="#" onClick={handleAddTrip} className={styles.AddNewTripButton}>
                            Create New Trip
                        </Link>
                    </p>
                    
                    <Modal
                        open={showAddTripPopup}
                        onClose={handleCloseAddTrip}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                    >
                        <div className={styles.Modal}>
                            <Typography variant="h6" component="h2" id="modal-title" style={{ marginTop: 30 }}>
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
                                        } required
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


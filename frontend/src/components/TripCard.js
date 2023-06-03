// Dialog adapted from Material-UI: https://mui.com/material-ui/react-dialog/
import styles from '../styles/TripCard.module.css';
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext.js';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EditIcon from '@mui/icons-material/Edit';
import Link from 'next/link';



const TripCard = ({ props }) => {
    const [trip_id, user_id, name, background_photo] = props;
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedName, setUpdatedName] = useState(name);
    const { user, getToken } = useAuth();

    const handleViewButtonClick = () => {
        const updatedTripName = updatedName !== name ? updatedName : name;
        window.location.href = `/trip/${trip_id}?name=${encodeURIComponent(
            updatedTripName
        )}&user_id=${user_id}`;
    };

    const handleDeleteClick = () => {
        setOpenConfirmation(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await fetch(
                'https://travel-planner-production.up.railway.app/deleteTrip',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        trip_id: trip_id,
                        user_id: user_id,
                    }),
                }
            );

            const data = await response.json();
            window.location.reload();

        } catch (error) {
            console.error(error);
        }
    };

    const handleCancelDelete = () => {
        setOpenConfirmation(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            const token = await getToken();
            const response = await fetch('https://travel-planner-production.up.railway.app/updateTripName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    trip_id: trip_id,
                    name: updatedName,
                }),
            });

            const data = await response.json();
            setUpdatedName(updatedName);
        } catch (error) {
            console.error(error);
        }
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setUpdatedName(name);
    };

    const handleNameChange = (event) => {
        setUpdatedName(event.target.value);
    };

    return (
        <div className={styles.Card} style={{ backgroundImage: `url('/images/trip_background/${background_photo}.png')` }}>
            <div className={styles.CardContent}>
                <div className={styles.CardTitle}>
                    {isEditing ? (
                        <>
                            <input
                                className={styles.NameInput}
                                type="text"
                                value={updatedName}
                                onChange={handleNameChange}
                            />
                            <div className={styles.ButtonGroup} >
                                <Button onClick={handleSaveClick} style={{ color: 'white' }}>Save</Button>
                                <Button onClick={handleCancelClick} style={{ color: 'white' }}>Cancel</Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className={styles.Title}>{updatedName}</h3>
                            <div className={styles.EditIconContainer}>
                                <EditIcon className={styles.EditIcon} onClick={handleEditClick} />
                            </div>
                        </>
                    )}
                </div>
            </div>
            <p className={styles.CardLink}>
                <Link href="#" onClick={handleViewButtonClick} className={styles.ViewTripButton}>
                    View More
                </Link>
            </p>

            <p className={styles.CardLink}>
                <Link href="#" onClick={handleDeleteClick} className={styles.DeleteTripButton}>
                    Delete
                </Link>
            </p>

            <Dialog
                open={openConfirmation}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Are you sure you want to delete this trip?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Your trip will be gone forever.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDelete} autoFocus>
                        OK
                    </Button>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TripCard;

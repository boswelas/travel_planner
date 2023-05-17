import styles from '../styles/TripCard.module.css';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';

const TripCard = ({ props }) => {
    const [trip_id, user_id, name, background_photo] = props;
    const [openConfirmation, setOpenConfirmation] = useState(false);

    const handleButtonClick = () => {
        window.location.href = `/trip/${trip_id}?name=${name}&user_id=${user_id}`;
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

    return (
        <div className={styles.Card} style={{ backgroundImage: `url('/images/trip_background/${background_photo}.png')` }}>
            <div className={styles.CardTitle}>
                <h3 >{name}</h3>
            </div>
            <button className={styles.ViewMore} onClick={handleButtonClick}>
                <span>View</span>
            </button>
            <div className={styles.DeleteButton}>
                <IconButton onClick={handleDeleteClick}>
                    <DeleteIcon style={{ fontSize: '36px', color: 'white' }} />
                </IconButton>
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
        </div>
    );
};

export default TripCard;

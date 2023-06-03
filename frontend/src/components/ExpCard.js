import styles from '../styles/ExpCard.module.css';
import React, { useState, useEffect } from 'react';
import { Rating } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import AddToTripDropdown from '../pages/trip/addExperienceToTrip';
import { handleGetRating } from '../components/getUserRating'
import { addUserRating } from '../components/addUserRating';
import { handleDeleteFromTrip } from '../components/deleteFromTrip';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const ExpCard = ({ props, showViewMore = true, showBackButton = false, fromTrip, trip_id }) => {
    const router = useRouter();
    const { user, getToken } = useAuth();
    const { experience_id, title, city, state, country, avg_rating, description, keywords, geolocation, img_url } = props;
    const [userRating, setUserRating] = useState(0);
    const [openConfirmation, setOpenConfirmation] = useState(false);

    const handleDeleteClick = () => {
        setOpenConfirmation(true);
    };

    const handleCancelDelete = () => {
        setOpenConfirmation(false);
    };

    const handleConfirmDelete = () => {
        setOpenConfirmation(false);
    };

    useEffect(() => {
        if (!user) {
            setUserRating(avg_rating);
        } else {
            if (!router.isFallback) {
                const fetchData = async () => {
                    const rating = await handleGetRating(getToken, experience_id);
                    setUserRating(rating || 0);
                };

                fetchData();
            }
        }
    }, [router.isFallback, user, avg_rating, getToken, experience_id]);

    const handleRatingChange = (event, newValue) => {
        addUserRating(getToken, experience_id, newValue);
        setUserRating(newValue);
    };

    return (
        <div className={styles.Card}>
            <div className={styles.AddToTripButton}>
                {user && !fromTrip && (
                    <AddToTripDropdown experience_id={experience_id} />
                )}
            </div>

            <h3 className={styles.CardTitle}>
                <a href={`/experience/${experience_id}`}>{title}</a>
            </h3>

            <p className={styles.CardLocation}>
                {city !== "Unknown" ? city + ", " : ""}
                {state !== "Unknown" ? state + ", " : ""}
                {country !== "Unknown" ? country : ""}
            </p>

            <p className={styles.CardRating}>
                <Rating name="rating" value={userRating} onChange={handleRatingChange} readOnly={!user} precision={0.5} />
                {avg_rating && <span>{avg_rating}/5 average</span>}
            </p>




            <div className={styles.Photo}>
                <img className={styles.Image} src={img_url} alt={title} />
            </div>

            {showViewMore && (
                <p className={styles.CardLink}>
                    <Link href={`/experience/${experience_id}`}>
                        View More
                    </Link>
                </p>
            )}

            {showBackButton && (
                <p className={styles.CardLink}>
                    <Link href="#" onClick={() => router.back()}>
                        Go Back
                    </Link>
                </p>
            )}


            {fromTrip && (
                <p className={styles.CardLink}>
                    <Link href="#"
                        onClick={handleDeleteClick}
                        className={styles.DeleteExpButton}>
                        Delete
                    </Link>
                </p>
            )}
            <Dialog
                open={openConfirmation}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Are you sure you want to delete this experience?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Once you delete, it cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={(event) => { handleDeleteFromTrip(experience_id, trip_id) }} autoFocus>
                        OK
                    </Button>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                </DialogActions>
            </Dialog>

        </div>
    );
}

export default ExpCard;
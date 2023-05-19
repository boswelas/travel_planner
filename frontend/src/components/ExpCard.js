import styles from '../styles/ExpCard.module.css';
import React, { useState, useEffect, useRef } from 'react';
import { Rating } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import AddToTripDropdown from '../pages/trip/addExperienceToTrip';
import { handleGetRating } from '../components/getUserRating'
import { addUserRating } from '../components/addUserRating';
import handleDeleteFromTrip from './deleteFromTrip';
import { useRouter } from 'next/router';



const ExpCard = ({ props, showViewMore = true, showBackButton = false, fromTrip, trip_id }) => {
    const router = useRouter();
    const { user, getToken } = useAuth();
    const { experience_id, title, city, state, country, avg_rating, description, keywords, geolocation, img_url } = props
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const rating = await handleGetRating(getToken, experience_id);
            setUserRating(rating || 0);
            console.log(rating);
        };

        fetchData();
    }, []);

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

            <p className={styles.CardRating}>
                <Rating name="rating" value={userRating} onChange={handleRatingChange} /> {avg_rating}
            </p>

            <p className={styles.CardDescription}>
                {description}
            </p>

            {
                showViewMore && (
                    <p className={styles.CardLink}>
                        <Link href={`/experience/${experience_id}`}>
                            View More
                        </Link>
                    </p>
                )
            }

            {
                showBackButton && (
                    <p className={styles.CardLink}>
                        <Link href="#" onClick={() => router.back()}>
                            Go Back
                        </Link>
                    </p>
                )
            }

            <p className={styles.CardLocation}>
                {city}, {state}, {country}
            </p>

            <p className={styles.CardLocation}>{geolocation}</p>

            <div className={styles.Photo}>
                <img className={styles.Image} src={img_url} alt={title} />
            </div>
            {
                fromTrip && (
                    <button onClick={(event) => { handleDeleteFromTrip(event) }}>Delete</button>
                )
            }
            <p className={styles.CardKeywords}>Keywords: {keywords}</p>
        </div >

    );
}

export default ExpCard;
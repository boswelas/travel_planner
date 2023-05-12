import styles from '../styles/ExpCard.module.css';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import AddToTripDropdown from '../pages/trip/addExperienceToTrip';

const ExpCard = ({ props, showViewMore = true, showBackButton = false, fromTrip, trip_id }) => {
    const { user } = useAuth();
    console.log(user);
    const { experience_id, title, city, state, country, rating, avg_rating, description, keywords, geolocation } = props

    const handleDeleteFromTrip = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('https://travel-planner-production.up.railway.app/deleteExperienceFromTrip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trip_id: trip_id,
                    experience_id: experience_id,
                }),
            });

            const data = await response.json();
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={styles.Card}>
            <h3 className={styles.CardTitle}>
                <a href={`/experience/${experience_id}`}>{title}</a>
            </h3>
            {user && !fromTrip ? (AddToTripDropdown({ experience_id })) : <></>}
            <p className={styles.CardDescription}>
                {description}
            </p>

            {showViewMore && (
                <p className={styles.CardLink}>
                    <Link href={`/experience/${experience_id}`}>
                        View More
                    </Link>
                </p>
            )}

            {showBackButton && (
                <p className={styles.CardLink}>
                    <Link href="javascript:history.back()">
                        Go Back
                    </Link>
                </p>
            )}

            <p className={styles.CardRating}>

                {rating || avg_rating} / 5
            </p>

            <p className={styles.CardLocation}>
                {city}, {state}, {country}
            </p>

            <p className={styles.CardLocation}>{geolocation}</p>

            <div className={styles.Photo}>
                Photo
            </div>
            {fromTrip && (
                <button onClick={(event) => { handleDeleteFromTrip(event) }}>Delete</button>
            )}
            <p className={styles.CardKeywords}>Keywords: {keywords}</p>
        </div>
        
    );
}

export default ExpCard;
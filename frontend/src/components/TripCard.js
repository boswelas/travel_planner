import styles from '../styles/TripCard.module.css'
import Link from 'next/link';


const TripCard = ({ props }) => {
    const [trip_id, user_id, name] = props;

    const handleDeleteTrip = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5001/deleteTrip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trip_id: trip_id,
                    user_id: user_id
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
                {name}
            </h3>
            <p className={styles.CardLink}>
                <Link href={{
                    pathname: `/trip/${trip_id}`,
                    query: { name, user_id }
                }} as={`/trip/${trip_id}`}>
                    <span>View More</span>
                </Link>
            </p>
            <div>
                <button onClick={handleDeleteTrip}>Delete Trip</button>
            </div>
        </div>
    );
}

export default TripCard;


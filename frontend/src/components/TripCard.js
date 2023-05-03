import styles from '../styles/TripCard.module.css'
import Link from 'next/link';


const TripCard = ({ props }) => {
    const [trip_id, user_id, name] = props;


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
        </div>
    );
}

export default TripCard;


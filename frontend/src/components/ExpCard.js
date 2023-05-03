import styles from '../styles/ExpCard.module.css';
import Link from 'next/link';

const ExpCard = ({props, showViewMore = true }) => {

    const {experience_id, title, city, state, country, rating, avg_rating, description } = props

    return (
        <div className={styles.Card}>
            <h3 className={styles.CardTitle}>
                <a href={`/experience/${experience_id}`}>{title}</a>
            </h3>
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

            <p className={styles.CardRating}>
                {rating || avg_rating} / 5
            </p>
            {/* <p className={styles.UserName}>
                From: Username
            </p> */}
            <p className={styles.CardLocation}>
                {city}, {state}, {country}
            </p>
            <div className={styles.Photo}>
                Photo
            </div>
        </div>
     );
}
 
export default ExpCard;
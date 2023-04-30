import styles from '../styles/ExpCard.module.css'

const ExpCard = ({props}) => {

    const {id, title, city, state, country, rating, description } = props

    return (
        <div className={styles.Card}>
            <h3 className={styles.CardTitle}>
                <a href={`/experience/${id}`}>{title}</a>
            </h3>
            <p className={styles.CardDescription}>
                {description}
            </p>
            <p className={styles.CardLink}>
                <a href={`/experience/${id}`}>View More</a>
            </p>
            <p className={styles.CardRating}>
                {rating} / 5
            </p>
            <p className={styles.UserName}>
                From: Username
            </p>
            <div className={styles.Photo}>
                Photo
            </div>
        </div>
     );
}
 
export default ExpCard;
import styles from '../styles/ExpCard.module.css'
import ExpCard from './ExpCard';

const ExpCardGrid = ({ data, fromTrip, trip_id }) => {

    const listRows = data.map((row, index) =>
        <div key={index}>
            <ExpCard props={row} fromTrip={fromTrip} trip_id={trip_id}/>
        </div>
    )

    return (
        <div className={styles.CardGrid}>
            {listRows}
        </div>
    );
}

export default ExpCardGrid;
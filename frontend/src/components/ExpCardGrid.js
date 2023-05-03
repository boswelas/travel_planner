import styles from '../styles/ExpCard.module.css'
import ExpCard from './ExpCard';

const ExpCardGrid = ({ data }) => {

    const listRows = data.map((row, index) =>
        <div key={index}>
            <ExpCard props={row} />
        </div>
    )

    return (
        <div className={styles.CardGrid}>
            {listRows}
        </div>
    );
}

export default ExpCardGrid;
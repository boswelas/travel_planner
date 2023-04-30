import styles from '../styles/ExpCard.module.css'
import ExpCard from './ExpCard';

const ExpCardGrid = ( {data} ) => {

    const listRows = data.map((row) =>
        <ExpCard props={row} />
    )

    return ( 
        <div className={styles.CardGrid}>
            {listRows}
        </div>
     );
}
 
export default ExpCardGrid;
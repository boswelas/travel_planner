import styles from '../styles/TripCard.module.css';
import TripCard from './TripCard';

const TripCardGrid = ({ data }) => {
  const cardList = data.map((cardData, index) => (
    <div key={index} className={styles.Container}>
      <TripCard props={cardData} />
    </div>
  ));

  return <div className={styles.CardGrid}>{cardList}</div>;
};

export default TripCardGrid;

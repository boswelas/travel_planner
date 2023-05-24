import styles from '../../styles/ExpCard.module.css';
import Link from 'next/link'

import ExpCardGrid from '@/components/ExpCardGrid';

export async function getServerSideProps() {
    const res = await fetch('https://travel-planner-production.up.railway.app/experience');
//     const res = await fetch('http://127.0.0.1:5001/experience');
    const data = await res.json();

    return {
        props: {
            experience: data.data,
        },
    };
}

const Experience = ({ experience }) => {
    const genGrid = (dataArrays) => {
        let temp = <ExpCardGrid data = {dataArrays}/>
        return temp;
    }

    let grid = genGrid(experience);

    return (
        <div>
            <h1>Experiences</h1>
            <p className={styles.CardLink}>
            <Link href="/experience/addNewExperience" className={styles.AddNewExpButton}>
                Create New Experience
            </Link>
            </p>
            {grid}
        </div>
    )
}

export default Experience;

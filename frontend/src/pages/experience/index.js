import styles from '../../styles/ExpCard.module.css';
import Link from 'next/link'

import ExpCard from '@/components/ExpCard'

export async function getServerSideProps() {
    const res = await fetch('https://travel-planner-production.up.railway.app/experience');
//     const res = await fetch('http://127.0.0.1:5001/experience');
    const data = await res.json();
    console.log(data.data, 'DATA')

    return {
        props: {
            experience: data.data,
        },
    };
}

const Experience = ({ experience }) => {
    return (
        <div>
            <h1>Experiences</h1>
            <p className={styles.CardLink}>
                <Link href="/experience/addNewExperience">
                    Add New Experience
                </Link>
            </p>
            {experience.map((experience) => (
                <ExpCard key={experience.experience_id} props={experience} />
            ))}

        </div>
    )
}

export default Experience;

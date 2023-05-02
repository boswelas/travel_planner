import Link from 'next/link'

import ExpCard from '@/components/ExpCard'

export async function getServerSideProps() {
    const res = await fetch('https://travel-planner-production.up.railway.app/experience');
    const data = await res.json();

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
            {experience.map((experience) => (
                <ExpCard key={experience.experience_id} props={experience} />
            ))}
        </div>
    )
}

export default Experience;
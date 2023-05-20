import { useRouter } from 'next/router';
import ExpCard from '@/components/ExpCard';
import MapFrame from '@/components/MapFrame';

export async function getServerSideProps(context) {
    const { id } = context.params;
    const res = await fetch(`https://travel-planner-production.up.railway.app/experience/${id}`);
    const data = await res.json();

    return {
        props: {
            experience: data.data,
        },
    };
}

const ExperienceDetail = ({ experience }) => {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{experience.title}</h1>
            <ExpCard props={experience} showViewMore={false} showBackButton={true} />

            <div>
                <MapFrame />
            </div>
        </div>
    );
};

export default ExperienceDetail;

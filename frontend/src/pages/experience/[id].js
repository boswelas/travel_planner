import { useRouter } from 'next/router';
import ExpCard from '@/components/ExpCard';
import MapFrame from '@/components/MapFrame';

export async function getServerSideProps(context) {
    const { id } = context.params;
    const res = await fetch(`https://travel-planner-production.up.railway.app/experience/${id}`);
    // const res = await fetch(`http://127.0.0.1:5001/experience/${id}`);
    const data = await res.json();

    return {
        props: {
            experience: data.data,
        },
    };
}


const ExperienceDetail = ({ experience }) => {
    const router = useRouter();
    
    const coordinates = experience.geolocation
        .slice(1, -1)
        .split(',')
        .map(coord => parseFloat(coord.trim()));


    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{experience.title}</h1>
            <ExpCard props={experience} showViewMore={false} showBackButton={true} />
            <MapFrame coordinates={coordinates}/>

        </div>
    );
};

export default ExperienceDetail;

import { useRouter } from 'next/router';

const TripDetail = () => {

    const { trip_id } = useRouter().query;

    return (
        <div>
            <h1>Trip Detail for Trip ID: {trip_id}</h1>
        </div>
    );
}


export default TripDetail;

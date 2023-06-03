import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import styles from '@/styles/ExpDetail.module.css'
import MapFrame from '@/components/MapFrame';
import { handleGetRating } from '@/components/getUserRating'
import { addUserRating } from '@/components/addUserRating';
import { Rating } from '@mui/material';
import { useAuth } from '@/components/AuthContext';
import PlaceIcon from '@mui/icons-material/Place';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

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
    const { user, getToken } = useAuth();
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        if (!user) {
            setUserRating(experience.avg_rating);
        } else {
            if (!router.isFallback) {
                const fetchData = async () => {
                    const rating = await handleGetRating(getToken, experience.experience_id);
                    setUserRating(rating || 0);
                };

                fetchData();
            }
        }
    }, [router.isFallback, user, experience.avg_rating, getToken, experience.experience_id]);


    const handleRatingChange = (event, newValue) => {

        addUserRating(getToken, experience.experience_id, newValue);
        setUserRating(newValue);
    };

    const generateMap = () => {

        console.log("experience.geolocation")
        console.log(experience.geolocation)

        if (experience.geolocation === null | experience.geolocation === undefined | experience.geolocation === '') {
            return
        }

        const coordinates = experience.geolocation
            .slice(1, -1)
            .split(',')
            .map(coord => parseFloat(coord.trim()));

        return <MapFrame coordinates={coordinates} />
    };

    return (
        <div>
            <div className={styles.TitleRatingContainer}>
                <h1 className={styles.Header}>{experience.title}</h1>
                <div className={styles.Rating}>
                    <Rating name="rating" value={userRating} onChange={handleRatingChange} readOnly={!user} precision={0.5} />
                    {experience.avg_rating && <span>{experience.avg_rating}/5 average</span>}
                </div>
            </div>
            <div className={styles.Container}>
                <PlaceIcon style={{ fontSize: '18px' }} />
                <div className={styles.Location}>
                    {experience.city !== "Unknown" ? experience.city + ", " : ""}
                    {experience.state !== "Unknown" ? experience.state + ", " : ""}
                    {experience.country !== "Unknown" ? experience.country : ""}
                </div>
                <GpsFixedIcon style={{ fontSize: '18px' }} />
                <div className={styles.Geolocation}>{experience.geolocation}</div>
            </div>

            <div className={styles.ImageMapContainer}>
                <div className={styles.ImageContainer} >
                    <img className={styles.Photo} src={experience.img_url} alt={experience.title} />
                </div>
                <div className={styles.MapContainer}>
                    {generateMap()}
                </div>
            </div>
            <div><h3 className={styles.DescriptionTitle}>Description</h3></div>
            <p className={styles.Description}>{experience.description}</p>
            <div className={styles.Keywords}><strong style={{ fontWeight: 'bold' }}>Keywords: </strong> {experience.keywords}</div>

        </div>
    );
};

export default ExperienceDetail;

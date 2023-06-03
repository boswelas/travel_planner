import { React } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap } from 'react-leaflet/hooks'
import { Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import styles from '../../styles/ExpMap.module.css';

const ExpMap = ({ coordinates }) => {

    let icon = L.icon({
        iconUrl: "/images/marker-icon.png",
        iconSize: [28, 46],
        iconAnchor: [17, 46]
    });

    return (
        <MapContainer className={styles.mapframe} center={coordinates} zoom={10} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coordinates} icon={icon}>
            </Marker >
        </MapContainer>
    );
}

export default ExpMap

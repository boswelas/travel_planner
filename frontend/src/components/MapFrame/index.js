import dynamic from "next/dynamic";

// Big thanks to "cmon yeba": https://www.youtube.com/watch?v=Ody2U-fJ580

const MapFrame = dynamic(() => import('./ExpMap'), {
    ssr: false
})

export default MapFrame
import Link from 'next/link'
import ExperienceTable from '@/components/experience-table'

const Experience = () => {
    return (
        <><div>
            <h1>Welcome to the Experience default</h1>
            <ExperienceTable />
            <Link href="/experience/addNewExperience">Add New Experience</Link>
        </div></>

    )
};
  
export default Experience;
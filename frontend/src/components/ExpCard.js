const ExpCard = ({props}) => {

    const {id, title, city, state, country, rating, description } = props

    return (
        <div className="Card">
            <p className="CardTitle">
                {title}
            </p>
            <p className="CardDescription">
                {description}
            </p>
            <p>
                View More
            </p>
            <p>
                {rating}
            </p>
            <p>
                User name
            </p>
            <p>
                Photo!
            </p>
        </div>
     );
}
 
export default ExpCard;
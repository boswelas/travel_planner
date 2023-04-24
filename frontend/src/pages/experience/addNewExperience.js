const Experience = () => {
    return (
    <><h1>This is the page to add new experiences!</h1>
    <form action="/" method="post">
            <label for="title">Experience Title:</label>
            <input type="text" id="title" name="title"/>
            <label for="location">Location:</label>
            <input type="geolocation" id="location" name="location" />
            <label for="description">Description:</label>
            <input type="text" id="description" name="description" />
            <label for="rating">Rating:</label>
            <select name="rating" id="rating">
                <option value="1">1 star</option>
                <option value="2">2 star</option>
                <option value="3">3 star</option>
                <option value="4">4 star</option>
                <option value="5">5 star</option>
            </select>
            <button type="submit">Submit</button>
            <button type="cancel">Cancel</button>
        </form></>
    )
};
  
export default Experience;
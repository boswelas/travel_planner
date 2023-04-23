import styles from '../styles/SearchBar.module.css'

const SearchBar = () => {
    return ( 
        <>
            <form className={styles.SearchBar} action="/search">
                <input className={styles.SearchBar}
                    type="text"
                    id="search_id"
                    name="search"
                    placeholder='Search'
                    required
                />

                {/* <button className={styles.SearchBar} type="submit">
                    Search
                </button> */}
            </form>
        </>
     );
}
 
export default SearchBar;
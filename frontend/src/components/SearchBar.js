import styles from '../styles/SearchBar.module.css'

const SearchBar = () => {
    return ( 
        <>
            <form className={styles.SearchBar} action="/search">

                <div className={styles.SearchContainer}>
                    <input
                        className={styles.SearchInput}
                        type="text"
                        id="search_id"
                        name="search"
                        placeholder="Search"
                        required
                    />

                    <button className={styles.SearchButton} type="submit">
                    Search
                    </button>
                </div>
            </form>
        </>
     );
}
 
export default SearchBar;
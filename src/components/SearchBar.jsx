import { useSearch } from '../context/useSearch.js'
import { ClearIcon, SearchIcon } from './Icons.jsx'

export default function SearchBar({ className = '' }) {
  const { query, setQuery, commitSearch, clearSearch } = useSearch()

  const handleSubmit = (e) => {
    e.preventDefault()
    commitSearch()
  }

  return (
    <form
      className={`search-bar${className ? ` ${className}` : ''}`}
      role="search"
      onSubmit={handleSubmit}
    >
      <SearchIcon />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, brands, specifications…"
        aria-label="Search products"
        autoComplete="off"
        spellCheck="false"
      />
      {query && (
        <button
          type="button"
          className="search-clear"
          aria-label="Clear search"
          onClick={clearSearch}
        >
          <ClearIcon />
        </button>
      )}
    </form>
  )
}

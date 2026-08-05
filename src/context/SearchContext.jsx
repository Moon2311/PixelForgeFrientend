import { useEffect, useState } from 'react'
import { SearchContext } from './searchContext.js'

export function SearchProvider({ children }) {
  const [query, setQuery] = useState('')
  const [term, setTerm] = useState('')

  // Debounce: commit the trimmed query 400ms after the last keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm((prev) => {
        const next = query.trim()
        return prev === next ? prev : next
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  // Commit immediately (e.g. on Enter). Dedupes against the current term.
  const commitSearch = (value = query) => {
    const next = value.trim()
    setTerm((prev) => (prev === next ? prev : next))
  }

  const clearSearch = () => {
    setQuery('')
    setTerm('')
  }

  return (
    <SearchContext.Provider value={{ query, setQuery, term, commitSearch, clearSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

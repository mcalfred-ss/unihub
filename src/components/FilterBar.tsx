import React from 'react'

type Props = {
  query: string
  setQuery: (v: string) => void
  year: string
  setYear: (v: string) => void
  level: string
  setLevel: (v: string) => void
}

export default function FilterBar({ query, setQuery, year, setYear, level, setLevel }: Props) {
  return (
    <div className="filters-bar flex gap-3 items-center p-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input rounded px-3 py-2 border"
        placeholder="Search by program name, filename..."
      />
      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="rounded px-3 py-2 border"
      >
        <option value="">All years</option>
        <option>2024</option>
        <option>2023</option>
        <option>2022</option>
      </select>
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="rounded px-3 py-2 border"
      >
        <option value="">All levels</option>
        <option>100</option>
        <option>200</option>
        <option>300</option>
      </select>
    </div>
  )
}


"use client"

import { useState } from "react"
import "../styles/style.css"

export default function Results({ data, setData }) {
  const [activeTab, setActiveTab] = useState("table")
  
  // Extract data from the provided format
  const { sql, columns, rows } = data
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }
  
  // Format column names for display
  const formatColumnName = (column) => {
    return column
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div>
      {/* Navbar */}
      <header className="header">
        <div className="header-container">
          <h1 className="logo">
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">Retail Explorer</span>
          </h1>
          <button className="menu-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Results Hero */}
      <section className="hero results-hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h2 className="hero-title">Query Results</h2>
          <div className="query-display">
            <div className="sql-query">
              <h3 className="sql-query-title">SQL Query</h3>
              <pre className="sql-query-code">{sql}</pre>
            </div>
            <button onClick={() => {
              setData("");
            }} className="new-search-button">
              New Search
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="section results-section">
        <div className="section-header">
          <div className="section-icon">📊</div>
          <h3 className="section-title">Results</h3>
          <div className="results-count">{rows.length} customers found</div>
        </div>

        <div className="results-tabs">
          <button
            className={`tab-button ${activeTab === "table" ? "active" : ""}`}
            onClick={() => setActiveTab("table")}
          >
            Table View
          </button>
          <button
            className={`tab-button ${activeTab === "cards" ? "active" : ""}`}
            onClick={() => setActiveTab("cards")}
          >
            Card View
          </button>
        </div>

        {activeTab === "table" ? (
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{formatColumnName(column)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        {columns[cellIndex] === "total_spent" ? formatCurrency(cell) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "cards" ? (
          <div className="results-cards">
            {rows.map((row, index) => (
              <div key={index} className="result-card">
                {columns.map((column, colIndex) => (
                  <div key={column} className="result-card-item">
                    <span className="result-card-label">{formatColumnName(column)}:</span>
                    <span className="result-card-value">
                      {column === "total_spent" ? formatCurrency(row[colIndex]) : row[colIndex]}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="chart-container">
            <div className="chart">
              {rows.map((row, index) => (
                <div key={index} className="chart-bar-container">
                  <div className="chart-label">Customer {row[0]}</div>
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ 
                        width: `${(row[1] / rows[0][1]) * 100}%`,
                        backgroundColor: `hsl(${210 + index * 15}, 80%, 60%)`
                      }}
                    ></div>
                    <span className="chart-value">{formatCurrency(row[1])}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p className="footer-copyright">© {new Date().getFullYear()} Retail Explorer. All rights reserved.</p>
          <div className="footer-links">
            <a href="#" className="footer-link">
              Privacy Policy
            </a>
            <a href="#" className="footer-link">
              Terms of Service
            </a>
            <a href="#" className="footer-link">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

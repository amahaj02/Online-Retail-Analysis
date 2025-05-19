
import { useState } from "react"
import "../styles/style.css"
import Results from "./Results";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf(
  {
    duration: 3000,
    position: {
      x: 'center',
      y: 'top'
    },
  }
);

export default function Home() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState("");

  function handleSubmit(){
    fetch("http://localhost:8000/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({query})
    })
    .then(async (res) => {
      const response = await res.json();
      console.log(response);
      if (response.error) {
        notyf.error('Some error occurred.');
        return;
      }
      setData(response);
    })
    .catch(err => {
      console.error(err);
      notyf.error('Some error occurred.');
    })
  }

  return (
    <>
      {data ? <Results data={data} setData={setData} /> : 
    <div>
      {/* Navbar */}
      <header className="header">
        <div className="header-container">
          <h1 className="logo">
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">Retail Explorer</span>
          </h1>
          <nav className="nav">
              <ul className="nav-list">
                {["Home", "Dataset", "Tech Stack", "About"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(" ", "-")}`} className="nav-link">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            
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

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h2 className="hero-title">Ask Anything About the Dataset</h2>
          <p className="hero-subtitle">Explore retail data insights using AI + SQL + PostgreSQL</p>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }} className="search-form">
            <div className="search-container">
              <div className="search-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about the dataset..."
                className="search-input"
              />
            </div>
            <button type="submit" className="search-button">
              Ask
            </button>
          </form>
        </div>
      </section>

      {/* Dataset Section */}
      <section id="dataset" className="section">
        <div className="section-header">
          <div className="section-icon">📄</div>
          <h3 className="section-title">Dataset Description</h3>
        </div>
        <p className="section-description">
          This dataset contains historical sales data from an online retail store. Below are the main tables used in
          this analysis:
        </p>
        <div className="section-content grid grid-cols-1 grid-cols-2">
          {[
            { name: "customers", columns: "(customer_id, country)" },
            { name: "products", columns: "(product_id, description, unit_price)" },
            { name: "invoices", columns: "(invoice_id, invoice_date)" },
            { name: "invoice_items", columns: "(invoice_id, product_id, customer_id, quantity)" },
          ].map((table) => (
            <div key={table.name} className="card">
              <h4 className="card-title">{table.name}</h4>
              <p className="card-text">{table.columns}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="section">
        <div className="section-header">
          <div className="section-icon">🧠</div>
          <h3 className="section-title">What We Used</h3>
        </div>
        <div className="section-content">
          <ul className="badge-list">
            {[
              { name: "PostgreSQL", icon: "🐘" },
              { name: "FastAPI", icon: "⚡" },
              { name: "Groq API", icon: "🤖" },
              { name: "Vite + React + Tailwind", icon: "⚛️" },
            ].map((tech) => (
              <li key={tech.name}>
                <span className="badge">
                  <span>{tech.icon}</span> {tech.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="section-header">
          <div className="section-icon">👋</div>
          <h3 className="section-title">About This Project</h3>
        </div>
        <div className="section-content">
          <div className="about-card">
            <p className="about-text">
              Built by Aarav Mahajan as a hands-on project to combine AI with relational data systems. The code is
              open-source and available on{" "}
              <a
                href="https://github.com/amahaj02/Online-Retail-Analysis"
                className="github-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
                <svg
                  className="github-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  ></path>
                </svg>
              </a>
              .
            </p>
            <p>Explore retail data patterns, customer behavior, and sales trends through natural language queries.</p>
          </div>
        </div>
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
    }
    </>
  )
}

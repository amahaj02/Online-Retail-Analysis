
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
    fetch(`${import.meta.env.VITE_BACKEND_URL}`, {
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
            <span className="logo-icon"></span>
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
          This dataset captures all transactions made between December 1, 2010, and December 9, 2011, for a UK-based online retail store specializing in unique, all-occasion gift items. The store primarily serves wholesale customers and operates without a physical storefront. 
          
          {" "}
          <a
                href="https://huggingface.co/datasets/aarav912/online-retail"
                className="github-link"
                target="_blank"
                rel="noopener noreferrer"
              >Click here</a> for the dataset, hosted on HuggingFace.
          <br></br>
          Below are the main tables used in this analysis:
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
          
                 <div className="col-span-1 md:col-span-2 mt-4">
                <div className="font-semibold mb-2 text-white">Example Queries:</div>
                <ul className="example-queries">
                  <li className="query-item">
                    <span className="query-bullet">•</span>
                    <span className="query-text"> What are the top selling products?</span>
                  </li>
                  <li className="query-item">
                    <span className="query-bullet">•</span>
                    <span className="query-text"> What are the top 5 countries by revenue?</span>
                  </li>
                  <li className="query-item">
                    <span className="query-bullet">•</span>
                    <span className="query-text"> Give a list of the top spending customers</span>
                  </li>
                  <li className="query-item">
                    <span className="query-bullet">•</span>
                    <span className="query-text"> What is the average order value?</span>
                  </li>
                </ul>
              </div>
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
              <em>Retail Explorer</em> is an interactive web app that lets users explore a real-world retail transactions dataset using natural language. Instead of writing SQL queries manually, users can ask questions in plain English — like <em>"Which products sold the most in July?"</em> — and get answers instantly.
            </p>
            <p className="about-text">
              In the backend, the app uses Groq API to convert natural language into SQL, which is then executed on a PostgreSQL database. The backend is powered by FastAPI, and the frontend is built with React, Tailwind CSS, and ShadCN UI, ensuring fast performance and a responsive interface.
            </p>
            <p className="about-text">
              The goal of this project is to make relational data exploration easier and more intuitive — blending the abilities of SQL with the flexibility of AI.
            </p>
          </div>
        </div>
      </section>     
      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          
          <div className="footer-links">
            <a href="#" className="footer-link">
              Contact Us!
            </a>
          </div>
          
          <div className="contributors-contact">
            <div className="contributor-contact">
              <p className="contributor-name">Aarav Mahajan</p>
              <div className="social-links">
                <a href="mailto:mahajanaarav2020@gmail.com" target="_blank" className="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </a>
                <a href="https://linkedin.com/in/amahaj02" target="_blank" className="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="https://instagram.com/aarav.mahajan.912" target="_blank" className="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="contributor-contact">
              <p className="contributor-name">Siraaj Singh</p>
              <div className="social-links">
                <a href="mailto:siraajsmonga@gmail.com" className="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </a>
                <a href="https://linkedin.com/in/smonga001" target="_blank" className="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="https://instagram.com/siraajsmonga" target="_blank" className="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    }
    </>
  )
}
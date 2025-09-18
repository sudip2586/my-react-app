// src/App.js
import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  const fetchProduct = async () => {
    setError("");
    setProduct(null);
    if (!input) return setError("Paste an Amazon product URL (or product ID) first.");
    setLoading(true);

    try {
      const resp = await fetch(`/api/price?url=${encodeURIComponent(input)}`);
      const json = await resp.json();
      if (!resp.ok || !json.success) {
        // show the provider's raw message if available
        const msg = json?.error || (json?.raw && JSON.stringify(json.raw).slice(0, 300)) || "Failed to fetch product";
        throw new Error(msg);
      }
      setProduct(json.result);
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">Track and Shop</div>
          <div className="top-actions">
            <button className="icon-btn" title="profile">◐</button>
            <button className="icon-btn" title="search">🔍</button>
          </div>
        </div>
        <div className="search-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste Amazon product URL (or product ID)"
            className="search-input"
          />
          <button className="search-btn" onClick={fetchProduct}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <h1>Today's Deals</h1>
          <p className="sub">Quick way to track price across platforms — Amazon ready, Flipkart coming soon.</p>
        </section>

        <section className="results">
          {error && <div className="notice error">Error: {error}</div>}

          {!product && !error && !loading && (
            <div className="placeholder">
              <div className="ph-card">
                <div className="ph-img" />
                <div className="ph-body">
                  <div className="ph-line" />
                  <div className="ph-line short" />
                </div>
              </div>
              <p className="hint">Paste a product URL and click Search to show product details here.</p>
            </div>
          )}

          {product && (
            <div className="product-card">
              <div className="card-left">
                {product.image ? (
                  <img src={product.image} alt={product.title} className="product-image" />
                ) : (
                  <div className="no-image">No image</div>
                )}
                <div className="track-actions">
                  <a className="btn-primary" href={product.url || "#"} target="_blank" rel="noreferrer">
                    View on Source
                  </a>
                  <button className="btn-outline" onClick={() => setShowRaw((s) => !s)}>
                    {showRaw ? "Hide" : "Raw JSON"}
                  </button>
                </div>
              </div>

              <div className="card-right">
                <h2 className="title">{product.title ?? "No title found"}</h2>
                <div className="price-row">
                  <div className="price">{product.price ?? "Price not found"}</div>
                  <div className="badge">Deal</div>
                </div>

                <p className="meta">Source: {product.url ? new URL(product.url).hostname : "unknown"}</p>

                {showRaw && (
                  <pre className="raw">
                    {JSON.stringify(product.raw ?? product, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="flipkart-section">
          <h3>Flipkart (placeholder)</h3>
          <p>Flipkart integration will be plugged in later (affiliate key). UI is ready.</p>
        </section>
      </main>

      <footer className="footer">
        <div>© Param Zone</div>
        <div className="small-links">
          <a href="#">About</a> · <a href="#">Contact</a> · <a href="#">Privacy</a>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from "react";

function App() {
  const [product, setProduct] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.priceapi.com/v2/jobs?token=NSQSPVHGRJTTMEBVKKMBGTEDZVMEYOJURWGUZUUOZSHANEEECOONOREDOCGKXVMH&source=amazon&country=in&topic=product_and_offers&key=ean&values=${encodeURIComponent(
          product
        )}`
      );
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setResult({ error: "Failed to fetch product details." });
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>Param Zone – Price Tracker</h1>
      <input
        type="text"
        placeholder="Enter Product ID / Name"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
        style={{ padding: "8px", width: "250px", marginRight: "10px" }}
      />
      <button onClick={fetchData} style={{ padding: "8px 16px" }}>
        Search
      </button>

      {loading && <p>Loading...</p>}

      {result && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "10px",
            marginTop: "20px",
            borderRadius: "6px",
            maxWidth: "600px",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
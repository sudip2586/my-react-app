// src/App.js
import React, { useMemo, useState } from "react";
import {
  Search,
  Bell,
  User,
  TrendingUp,
  Filter,
  Star,
  Smartphone,
  Gamepad2,
  Watch,
  Monitor,
  Home,
  Package,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ---------------- CONFIG ---------------- */
const PLATFORMS = ["amazon", "flipkart", "meesho"];
const PLATFORM_LABEL = {
  amazon: "Amazon",
  flipkart: "Flipkart",
  meesho: "Meesho",
};
const PLATFORM_COLOR = {
  amazon: "#3b82f6",
  flipkart: "#22c55e",
  meesho: "#f59e0b",
};

const AFFILIATE = {
  amazonTag: "yourtag-21",
  flipkartTag: "affid_yourtag",
  meeshoTag: "yourtag",
  buildUrl: (platform, rawUrl) => {
    if (!rawUrl) return rawUrl;
    switch (platform) {
      case "amazon":
        return rawUrl.includes("?")
          ? `${rawUrl}&tag=${AFFILIATE.amazonTag}`
          : `${rawUrl}?tag=${AFFILIATE.amazonTag}`;
      case "flipkart":
        return rawUrl.includes("?")
          ? `${rawUrl}&affid=${AFFILIATE.flipkartTag}`
          : `${rawUrl}?affid=${AFFILIATE.flipkartTag}`;
      case "meesho":
        return rawUrl;
      default:
        return rawUrl;
    }
  },
};

/* ---------------- MOCK DATA HELPERS ---------------- */
function prng(seed) {
  let x = Math.sin(seed) * 10000;
  return function () {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
}

function genHistory(days, base, volatility = 0.05, seed = 1) {
  const rand = prng(seed);
  const out = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const drift = (rand() - 0.5) * volatility * base;
    const seasonal = Math.sin(i / 5) * 0.02 * base;
    const price = Math.max(200, Math.round(base + drift + seasonal));
    out.push({ date: d.toISOString().slice(0, 10), price });
  }
  return out;
}

const CATALOG = [
  {
    id: "p1",
    title: "Wireless Headphones",
    rating: 4.5,
    reviews: 12345,
    category: "Electronics",
    badge: "50% OFF",
    discount: 30,
    platforms: [
      {
        platform: "amazon",
        currentPrice: 4599,
        url: "https://www.amazon.in/dp/example-headphones",
        history: genHistory(365, 5600, 0.08, 1),
      },
      {
        platform: "flipkart",
        currentPrice: 4699,
        url: "https://www.flipkart.com/item/example-headphones",
        history: genHistory(365, 5400, 0.07, 2),
      },
      {
        platform: "meesho",
        currentPrice: 4499,
        url: "https://www.meesho.com/item/example-headphones",
        history: genHistory(365, 5200, 0.09, 3),
      },
    ],
  },
  {
    id: "p2",
    title: "Smart Watch",
    rating: 4.2,
    reviews: 8400,
    category: "Wearables",
    discount: 20,
    platforms: [
      {
        platform: "amazon",
        currentPrice: 3999,
        url: "https://www.amazon.in/dp/example-smartwatch",
        history: genHistory(365, 4800, 0.06, 4),
      },
      {
        platform: "flipkart",
        currentPrice: 4199,
        url: "https://www.flipkart.com/item/example-smartwatch",
        history: genHistory(365, 4700, 0.05, 5),
      },
      {
        platform: "meesho",
        currentPrice: 3899,
        url: "https://www.meesho.com/item/example-smartwatch",
        history: genHistory(365, 4600, 0.07, 6),
      },
    ],
  },
  {
    id: "p3",
    title: "Wireless Controller",
    rating: 4.6,
    reviews: 5600,
    category: "Gaming",
    platforms: [
      {
        platform: "amazon",
        currentPrice: 2599,
        url: "https://www.amazon.in/dp/example-controller",
        history: genHistory(365, 3000, 0.08, 7),
      },
      {
        platform: "flipkart",
        currentPrice: 2699,
        url: "https://www.flipkart.com/item/example-controller",
        history: genHistory(365, 2900, 0.06, 8),
      },
      {
        platform: "meesho",
        currentPrice: 2499,
        url: "https://www.meesho.com/item/example-controller",
        history: genHistory(365, 2800, 0.07, 9),
      },
    ],
  },
];

const currency = (n) => `₹${n.toLocaleString()}`;

function clampHistory(data, rangeDays) {
  if (rangeDays >= data.length) return data;
  return data.slice(data.length - rangeDays);
}

function productLowestPrice(p) {
  return Math.min(...p.platforms.map((pl) => pl.currentPrice));
}

/* ---------------- UI SMALL HELPERS (no external CSS required) ---------------- */
function Card({ className = "", children, ...rest }) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-[0_6px_18px_rgba(16,24,40,0.06)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        border: "1px solid #e6e6e6",
        background: active ? "#2563eb" : "#fff",
        color: active ? "#fff" : "#333",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Badge({ color = "#10b981", children }) {
  return (
    <span
      style={{
        backgroundColor: color,
        color: "#fff",
        padding: "3px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

/* ---------------- HEADER ---------------- */
function Header({ onSearch }) {
  const [q, setQ] = useState("");
  return (
    <div style={{ background: "#2563eb", color: "#fff", padding: 16, borderRadius: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>TrackNshop</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Bell />
          <User />
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: 8, borderRadius: 12 }}>
        <Search style={{ color: "#a3a3a3" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch(q);
          }}
        />
        <button
          onClick={() => onSearch(q)}
          style={{ background: "#2563eb", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8 }}
        >
          <Filter style={{ width: 14, height: 14 }} /> Go
        </button>
      </div>
    </div>
  );
}

/* ---------------- Category strip ---------------- */
const CATEGORIES = [
  { name: "Electronics", icon: <Smartphone /> },
  { name: "Gaming", icon: <Gamepad2 /> },
  { name: "Wearables", icon: <Watch /> },
  { name: "Monitors", icon: <Monitor /> },
  { name: "Home", icon: <Package /> },
  { name: "All", icon: <Home /> },
];

function CategoryStrip({ active, setActive }) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
      {CATEGORIES.map((c) => (
        <Chip key={c.name} active={active === c.name} onClick={() => setActive(c.name)}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {c.icon}
            {c.name}
          </span>
        </Chip>
      ))}
    </div>
  );
}

/* ---------------- DealCard ---------------- */
function GradientImage({ label }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 140, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
      {label ? <div style={{ position: "absolute", right: 8, top: 8 }}><Badge color="#f59e0b">{label}</Badge></div> : null}
    </div>
  );
}

function DealCard({ product, onCompare }) {
  const lowest = productLowestPrice(product);
  return (
    <Card className="p-3" style={{ padding: 12 }}>
      <GradientImage label={product.badge} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{product.title}</div>
          <div style={{ fontSize: 13, color: "#6b7280", display: "flex", gap: 6, alignItems: "center" }}>
            <Star style={{ color: "#fbbf24" }} /> {product.rating} • {product.reviews.toLocaleString()} reviews
          </div>
        </div>
        {product.discount ? <Badge>{product.discount}% OFF</Badge> : null}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{currency(lowest)}</div>
        <button onClick={() => onCompare(product)} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8 }}>
          <TrendingUp /> Compare
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>Best price across stores right now.</div>
    </Card>
  );
}

/* ---------------- PriceComparePanel ---------------- */
function PriceComparePanel({ product, onClose }) {
  const [range, setRange] = useState(365);
  const [active, setActive] = useState({ amazon: true, flipkart: true, meesho: true });

  const series = useMemo(() => {
    if (!product) return [];
    return product.platforms.map((pl) => ({
      platform: pl.platform,
      color: PLATFORM_COLOR[pl.platform],
      data: clampHistory(pl.history, range).map((h) => ({ date: h.date, [pl.platform]: h.price })),
    }));
  }, [product, range]);

  const merged = useMemo(() => {
    const map = new Map();
    series.forEach((s) => {
      s.data.forEach((d) => {
        const prev = map.get(d.date) || { date: d.date };
        map.set(d.date, { ...prev, ...d });
      });
    });
    return Array.from(map.values());
  }, [series]);

  if (!product) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", width: "95%", maxWidth: 1000, borderRadius: 16, padding: 16, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{product.title}</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Compare prices across stores</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#555" }}>Close</button>
        </div>

        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[15, 30, 90, 180, 365, 730].map((r) => (
            <Chip key={r} active={range === r} onClick={() => setRange(r)}>{r === 15 ? "15d" : r === 30 ? "1m" : r === 90 ? "3m" : r === 180 ? "6m" : r === 365 ? "1y" : "2y"}</Chip>
          ))}
        </div>

        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PLATFORMS.map((p) => (
            <button key={p} onClick={() => setActive((a) => ({ ...a, [p]: !a[p] }))} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: active[p] ? "#fff" : "#f3f4f6" }}>
              <span style={{ display: "inline-block", width: 12, height: 12, background: PLATFORM_COLOR[p], borderRadius: 4, marginRight: 8 }}></span>
              {PLATFORM_LABEL[p]}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 12, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={merged} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value, name) => [currency(Number(value)), PLATFORM_LABEL[name] || name]} />
              <Legend />
              {PLATFORMS.filter((p) => active[p]).map((p) => (
                <Line key={p} type="monotone" dataKey={p} stroke={PLATFORM_COLOR[p]} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          {product.platforms.map((pl) => (
            <Card key={pl.platform} style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600 }}>{PLATFORM_LABEL[pl.platform]}</div>
                <div style={{ width: 12, height: 12, background: PLATFORM_COLOR[pl.platform], borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{currency(pl.currentPrice)}</div>
              <button onClick={() => window.open(AFFILIATE.buildUrl(pl.platform, pl.url), "_blank")} style={{ marginTop: 12, background: "#2563eb", color: "#fff", padding: "8px 12px", borderRadius: 8, border: "none" }}>
                Buy on {PLATFORM_LABEL[pl.platform]}
              </button>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>Tip: toggle platforms and change ranges. Prices are demo data.</div>
      </div>
    </div>
  );
}

/* ---------------- MAIN APP ---------------- */
export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  const products = useMemo(() => {
    return CATALOG.filter((p) => {
      const qok = !query || p.title.toLowerCase().includes(query.toLowerCase());
      const cok = category === "All" || p.category === category;
      return qok && cok;
    });
  }, [query, category]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", padding: 12 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Header onSearch={setQuery} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 12 }}>
          <div>
            <Card style={{ padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>Today's Deals</div>
                  <div style={{ color: "#6b7280", marginTop: 6 }}>Curated value-for-money picks updated daily</div>
                  <button style={{ marginTop: 12, padding: "8px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8 }}>Track Price</button>
                </div>
                <div>
                  <div style={{ width: "100%", height: 80, borderRadius: 12, background: "linear-gradient(135deg,#60a5fa,#2563eb)" }} />
                </div>
              </div>
            </Card>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Quick Categories</div>
              <CategoryStrip active={category} setActive={setCategory} />
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 18, marginBottom: 8 }}>Featured Deals</div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              {products.map((p) => (
                <DealCard key={p.id} product={p} onCompare={setSelected} />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {products.slice(0, 2).map((p) => (
              <Card key={p.id + "side"} style={{ padding: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 80, height: 64, borderRadius: 8, background: "linear-gradient(135deg,#60a5fa,#2563eb)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>{currency(productLowestPrice(p))}</div>
                  </div>
                  <button onClick={() => setSelected(p)} style={{ padding: "8px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8 }}>View</button>
                </div>
              </Card>
            ))}

            <Card style={{ padding: 12 }}>
              <div style={{ fontWeight: 700 }}>About</div>
              <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
                TrackNshop helps you compare prices across Amazon, Flipkart, and Meesho quickly. Click a store to buy via our affiliate links and support the site.
              </p>
            </Card>
          </div>
        </div>

        <footer style={{ marginTop: 18, color: "#6b7280", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>© {new Date().getFullYear()} TrackNshop</div>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
            <a href="#">App Download</a>
          </div>
        </footer>
      </div>

      {selected && <PriceComparePanel product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
import React, { useMemo, useState } from "react"; import { Search, Bell, User, ShoppingCart, TrendingUp, Filter, Star, Tag, Smartphone, Gamepad2, Watch, Monitor, Home, Package } from "lucide-react"; import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";

/**

TrackNshop — MVP React app


---

Goals:

Mobile-first, clean UI inspired by the mock you shared


Price comparison across Amazon / Flipkart / Meesho (mock data now)


Interactive chart with range selector + per-platform toggles


Easily extensible, readable code with clear sections & comments


Ready to port to React Native / Expo later (view logic is decoupled)


How to extend later:

Replace MOCK.fetchProductHistory with a real API (or adapters per store)


Replace AFFILIATE.buildUrl() with your real tracking IDs


Lift product state into a global store if you add routing (Zustand/Redux)


For PWA/mobile app: wrap with VitePWA or port views to React Native */



/***************************** CONFIG *****************************/ const PLATFORMS = ["amazon", "flipkart", "meesho"] as const; const PLATFORM_LABEL: Record<string, string> = { amazon: "Amazon", flipkart: "Flipkart", meesho: "Meesho", }; const PLATFORM_COLOR: Record<string, string> = { amazon: "#3b82f6", // blue flipkart: "#22c55e", // green meesho: "#f59e0b", // amber };

// Put your affiliate tags here later const AFFILIATE = { amazonTag: "yourtag-21", flipkartTag: "affid_yourtag", meeshoTag: "yourtag", buildUrl: (platform: string, rawUrl: string) => { switch (platform) { case "amazon": return rawUrl.includes("?") ? ${rawUrl}&tag=${AFFILIATE.amazonTag} : ${rawUrl}?tag=${AFFILIATE.amazonTag}; case "flipkart": return rawUrl.includes("?") ? ${rawUrl}&affid=${AFFILIATE.flipkartTag} : ${rawUrl}?affid=${AFFILIATE.flipkartTag}; case "meesho": // Placeholder — adjust when you have Meesho's format return rawUrl; default: return rawUrl; } }, };

/***************************** MOCK DATA *****************************/ // Deterministic pseudo-random for stable demo function prng(seed: number) { let x = Math.sin(seed) * 10000; return () => { x = Math.sin(x) * 10000; return x - Math.floor(x); }; }

function genHistory(days: number, base: number, volatility = 0.05, seed = 1) { const rand = prng(seed); const out: { date: string; price: number }[] = []; const now = new Date(); for (let i = days - 1; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); const drift = (rand() - 0.5) * volatility * base; const seasonal = Math.sin(i / 5) * 0.02 * base; const price = Math.max(200, Math.round(base + drift + seasonal)); out.push({ date: d.toISOString().slice(0, 10), price }); } return out; }

export type PlatformPrice = { platform: typeof PLATFORMS[number]; currentPrice: number; url: string; // raw product url (affiliate attached at click time) history: { date: string; price: number }[]; };

export type Product = { id: string; title: string; rating: number; reviews: number; category: string; image: string; // can be remote or base64; using gradient card instead for demo badge?: string; // e.g., "50% OFF" discount?: number; // e.g., 20 means 20% OFF platforms: PlatformPrice[]; };

// Lightweight catalog with three sample products const CATALOG: Product[] = [ { id: "p1", title: "Wireless Headphones", rating: 4.5, reviews: 12345, category: "Electronics", image: "", badge: "50% OFF", discount: 30, platforms: [ { platform: "amazon", currentPrice: 4599, url: "https://www.amazon.in/dp/example-headphones", history: genHistory(365, 5600, 0.08, 1), }, { platform: "flipkart", currentPrice: 4699, url: "https://www.flipkart.com/item/example-headphones", history: genHistory(365, 5400, 0.07, 2), }, { platform: "meesho", currentPrice: 4499, url: "https://www.meesho.com/item/example-headphones", history: genHistory(365, 5200, 0.09, 3), }, ], }, { id: "p2", title: "Smart Watch", rating: 4.2, reviews: 8400, category: "Wearables", image: "", discount: 20, platforms: [ { platform: "amazon", currentPrice: 3999, url: "https://www.amazon.in/dp/example-smartwatch", history: genHistory(365, 4800, 0.06, 4), }, { platform: "flipkart", currentPrice: 4199, url: "https://www.flipkart.com/item/example-smartwatch", history: genHistory(365, 4700, 0.05, 5), }, { platform: "meesho", currentPrice: 3899, url: "https://www.meesho.com/item/example-smartwatch", history: genHistory(365, 4600, 0.07, 6), }, ], }, { id: "p3", title: "Wireless Controller", rating: 4.6, reviews: 5600, category: "Gaming", image: "", platforms: [ { platform: "amazon", currentPrice: 2599, url: "https://www.amazon.in/dp/example-controller", history: genHistory(365, 3000, 0.08, 7), }, { platform: "flipkart", currentPrice: 2699, url: "https://www.flipkart.com/item/example-controller", history: genHistory(365, 2900, 0.06, 8), }, { platform: "meesho", currentPrice: 2499, url: "https://www.meesho.com/item/example-controller", history: genHistory(365, 2800, 0.07, 9), }, ], }, ];

/***************************** UTILITIES *****************************/ const currency = (n: number) => ₹${n.toLocaleString()};

function clampHistory( data: { date: string; price: number }[], rangeDays: number ) { if (rangeDays >= data.length) return data; return data.slice(data.length - rangeDays); }

function productLowestPrice(p: Product) { return Math.min(...p.platforms.map((pl) => pl.currentPrice)); }

/***************************** UI PRIMITIVES *****************************/ const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", children, ...rest }) => (

  <div
    className={`rounded-2xl bg-white shadow-[0_6px_18px_rgba(16,24,40,0.06)] ${className}`}
    {...rest}
  >
    {children}
  </div>
);const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => ( <button onClick={onClick} className={px-3 py-1 rounded-full border text-sm transition-colors ${ active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300" }}

> 

{children}

  </button>
);const Badge: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = "#10b981", children, }) => ( <span style={{ backgroundColor: color, color: "#fff" }} className="px-2 py-0.5 rounded-full text-xs font-medium"

> 

{children}

  </span>
);/***************************** HEADER *****************************/ function Header({ onSearch }: { onSearch: (q: string) => void }) { const [q, setQ] = useState(""); return ( <div className="bg-blue-600 text-white rounded-3xl p-4 md:p-6 mb-4 md:mb-6"> <div className="flex items-center justify-between gap-3"> <h1 className="text-xl md:text-2xl font-semibold">TrackNshop</h1> <div className="flex gap-3"> <Bell className="w-5 h-5 opacity-90" /> <User className="w-5 h-5 opacity-90" /> </div> </div> <div className="mt-4 flex items-center gap-2 bg-white rounded-xl px-3 py-2 text-gray-700"> <Search className="w-5 h-5 text-gray-400" /> <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="flex-1 outline-none bg-transparent text-sm" onKeyDown={(e) => { if (e.key === "Enter") onSearch(q); }} /> <button onClick={() => onSearch(q)} className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg" > <Filter className="w-4 h-4" /> Go </button> </div> </div> ); }

/***************************** CATEGORY STRIP *****************************/ const CATEGORIES = [ { name: "Electronics", icon: <Smartphone className="w-5 h-5" /> }, { name: "Gaming", icon: <Gamepad2 className="w-5 h-5" /> }, { name: "Wearables", icon: <Watch className="w-5 h-5" /> }, { name: "Monitors", icon: <Monitor className="w-5 h-5" /> }, { name: "Home", icon: <Home className="w-5 h-5" /> }, { name: "All", icon: <Package className="w-5 h-5" /> }, ];

function CategoryStrip({ active, setActive, }: { active: string; setActive: (c: string) => void; }) { return ( <div className="flex gap-2 overflow-x-auto pb-2"> {CATEGORIES.map((c) => ( <Chip key={c.name} active={active === c.name} onClick={() => setActive(c.name)} > <span className="inline-flex items-center gap-2">{c.icon}{c.name}</span> </Chip> ))} </div> ); }

/***************************** DEAL CARD *****************************/ function GradientImage({ label }: { label?: string }) { return ( <div className="relative w-full h-36 md:h-40 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700"> {label ? ( <div className="absolute top-2 right-2"> <Badge color="#f59e0b">{label}</Badge> </div> ) : null} </div> ); }

function DealCard({ product, onCompare, }: { product: Product; onCompare: (p: Product) => void; }) { const lowest = productLowestPrice(product); return ( <Card className="p-3 flex flex-col gap-3"> <GradientImage label={product.badge} /> <div className="flex items-start justify-between gap-3"> <div className="flex-1"> <div className="font-medium">{product.title}</div> <div className="text-xs text-gray-500 flex items-center gap-1"> <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {product.rating} • {product.reviews.toLocaleString()} reviews </div> </div> {product.discount ? ( <Badge>{product.discount}% OFF</Badge> ) : null} </div> <div className="flex items-center justify-between"> <div className="text-lg font-semibold">{currency(lowest)}</div> <button onClick={() => onCompare(product)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-2" > <TrendingUp className="w-4 h-4" /> Compare </button> </div> <div className="text-xs text-gray-500">Best price across stores right now.</div> </Card> ); }

/***************************** COMPARE PANEL *****************************/ function PriceComparePanel({ product, onClose, }: { product: Product | null; onClose: () => void; }) { const [range, setRange] = useState<15 | 30 | 90 | 180 | 365 | 730>(365); const [active, setActive] = useState<Record<string, boolean>>({ amazon: true, flipkart: true, meesho: true, });

const series = useMemo(() => { if (!product) return [] as any[]; return product.platforms.map((pl) => ({ platform: pl.platform, color: PLATFORM_COLOR[pl.platform], data: clampHistory(pl.history, range).map((h) => ({ date: h.date, [pl.platform]: h.price, })), })); }, [product, range]);

// Merge series by date for Recharts (one object per date, keys per platform) const merged = useMemo(() => { const map = new Map<string, any>(); series.forEach((s) => { s.data.forEach((d) => { const prev = map.get(d.date) || { date: d.date }; map.set(d.date, { ...prev, ...d }); }); }); return Array.from(map.values()); }, [series]);

if (!product) return null; return ( <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"> <div className="bg-white w-full md:max-w-3xl rounded-t-3xl md:rounded-3xl p-4 md:p-6 max-h-[90vh] overflow-auto"> <div className="flex items-start justify-between gap-3"> <div> <div className="text-lg font-semibold">{product.title}</div> <div className="text-sm text-gray-500">Compare prices across stores</div> </div> <button onClick={onClose} className="text-gray-600">Close</button> </div>

{/* Range selector */}
    <div className="mt-4 flex flex-wrap gap-2">
      {[15, 30, 90, 180, 365, 730].map((r) => (
        <Chip key={r} active={range === r} onClick={() => setRange(r as any)}>
          {r === 15 ? "15d" : r === 30 ? "1m" : r === 90 ? "3m" : r === 180 ? "6m" : r === 365 ? "1y" : "2y"}
        </Chip>
      ))}
    </div>

    {/* Legend toggles */}
    <div className="mt-3 flex flex-wrap gap-2 items-center">
      {PLATFORMS.map((p) => (
        <button
          key={p}
          onClick={() => setActive((a) => ({ ...a, [p]: !a[p] }))}
          className={`px-2 py-1 rounded-md border text-xs flex items-center gap-2 ${
            active[p]
              ? "bg-white border-gray-300"
              : "bg-gray-100 border-gray-200 opacity-60"
          }`}
        >
          <span
            className="inline-block w-3 h-3 rounded"
            style={{ background: PLATFORM_COLOR[p] }}
          />
          {PLATFORM_LABEL[p]}
        </button>
      ))}
    </div>

    {/* Chart */}
    <div className="mt-4 h-60 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: any, name: string) => [currency(Number(value)), PLATFORM_LABEL[name] || name]} />
          <Legend />
          {PLATFORMS.filter((p) => active[p]).map((p) => (
            <Line key={p} type="monotone" dataKey={p} stroke={PLATFORM_COLOR[p]} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Current offers */}
    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      {product.platforms.map((pl) => (
        <Card key={pl.platform} className="p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">{PLATFORM_LABEL[pl.platform]}</div>
            <span
              className="inline-block w-3 h-3 rounded"
              style={{ background: PLATFORM_COLOR[pl.platform] }}
            />
          </div>
          <div className="text-xl font-semibold">{currency(pl.currentPrice)}</div>
          <button
            onClick={() => window.open(AFFILIATE.buildUrl(pl.platform, pl.url), "_blank")}
            className="mt-auto px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
          >
            Buy on {PLATFORM_LABEL[pl.platform]}
          </button>
        </Card>
      ))}
    </div>

    <div className="mt-3 text-xs text-gray-500">
      Tip: tap lines in the legend to toggle; change range above. Prices are demo data.
    </div>
  </div>
</div>

); }

/***************************** MAIN APP *****************************/ export default function App() { const [query, setQuery] = useState(""); const [category, setCategory] = useState("All"); const [selected, setSelected] = useState<Product | null>(null);

const products = useMemo(() => { return CATALOG.filter((p) => { const qok = !query || p.title.toLowerCase().includes(query.toLowerCase()); const cok = category === "All" || p.category === category; return qok && cok; }); }, [query, category]);

return ( <div className="min-h-screen bg-slate-50 text-slate-900 p-3 md:p-6"> <div className="max-w-6xl mx-auto"> <Header onSearch={setQuery} />

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left column: hero + categories */}
      <div className="md:col-span-2 space-y-4">
        <Card className="p-4 md:p-6">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="col-span-2">
              <div className="text-2xl font-semibold">Today's Deals</div>
              <div className="text-gray-600 text-sm mt-1">Curated value-for-money picks updated daily</div>
              <button className="mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Track Price</button>
            </div>
            <div>
              <div className="w-full h-24 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600" />
            </div>
          </div>
        </Card>

        <div>
          <div className="text-lg font-semibold mb-2">Quick Categories</div>
          <CategoryStrip active={category} setActive={setCategory} />
        </div>

        <div className="text-lg font-semibold mt-6 mb-2">Featured Deals</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p) => (
            <DealCard key={p.id} product={p} onCompare={setSelected} />
          ))}
        </div>
      </div>

      {/* Right column: side cards */}
      <div className="space-y-4">
        {products.slice(0, 2).map((p) => (
          <Card key={p.id + "side"} className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-20 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600" />
              <div className="flex-1">
                <div className="font-medium line-clamp-2">{p.title}</div>
                <div className="text-sm text-gray-500">{currency(productLowestPrice(p))}</div>
              </div>
              <button
                onClick={() => setSelected(p)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm"
              >
                View
              </button>
            </div>
          </Card>
        ))}

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">About</div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            TrackNshop helps you compare prices across Amazon, Flipkart, and Meesho quickly. Click a store to buy via our affiliate links and support the site.
          </p>
        </Card>
      </div>
    </div>

    <footer className="mt-8 text-xs text-gray-500 flex flex-wrap items-center gap-4 justify-between">
      <div>© {new Date().getFullYear()} TrackNshop</div>
      <div className="flex gap-3">
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">Contact</a>
        <a href="#" className="hover:underline">App Download</a>
      </div>
    </footer>
  </div>

  {/* Mobile Bottom Nav */}
  <nav className="fixed bottom-3 inset-x-0 mx-auto max-w-md bg-white shadow-lg rounded-2xl px-6 py-2 flex items-center justify-between md:hidden">
    <div className="flex flex-col items-center text-blue-600"><Home className="w-5 h-5" /><span className="text-[11px]">Home</span></div>
    <div className="flex flex-col items-center text-gray-500"><Tag className="w-5 h-5" /><span className="text-[11px]">Categories</span></div>
    <div className="flex flex-col items-center text-gray-500"><TrendingUp className="w-5 h-5" /><span className="text-[11px]">Tracked</span></div>
    <div className="flex flex-col items-center text-gray-500"><User className="w-5 h-5" /><span className="text-[11px]">Profile</span></div>
  </nav>

  {/* Compare panel */}
  {selected && (
    <PriceComparePanel product={selected} onClose={() => setSelected(null)} />
  )}
</div>

); }


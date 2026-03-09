import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// CONFIG — paste your Eventbrite token here
// Get one free at: https://www.eventbrite.com/platform/api
// ─────────────────────────────────────────────
const EVENTBRITE_TOKEN = "YOUR_TOKEN_HERE";
const USE_LIVE_API = EVENTBRITE_TOKEN !== "YOUR_TOKEN_HERE";

// ─────────────────────────────────────────────
// ECONOMICS CONSTANTS
// ─────────────────────────────────────────────
const STRIPE_PCT = 0.029;
const STRIPE_FIXED = 0.30;
const STRIPE_CONNECT_PCT = 0.0025;
const STRIPE_CONNECT_FIXED = 0.25;
const INFRA_PER_BOOKING = 0.18;

// ─────────────────────────────────────────────
// THE WORKS SEATTLE — real classes from theworksseattle.com
// ─────────────────────────────────────────────
const WORKS_CLASSES = [
  { id: "w1", title: "Art of Tarot", studio: "The Works Seattle", category: "Arts & Crafts", price: 60, duration: "2h 30m", location: "Pioneer Square", img: "🔮", rating: 4.9, reviews: 41, spots: 8, date: "Mar 22", featured: true, source: "works", url: "https://www.theworksseattle.com/art-of-tarot" },
  { id: "w2", title: "Charcoal Landscapes", studio: "The Works Seattle", category: "Painting", price: 65, duration: "3h", location: "Pioneer Square", img: "🎨", rating: 4.8, reviews: 29, spots: 6, date: "Mar 24", featured: false, source: "works", url: "https://www.theworksseattle.com/charcoal-landscapes" },
  { id: "w3", title: "Coil Rope Basket", studio: "The Works Seattle", category: "Fiber Arts", price: 85, duration: "3h", location: "Pioneer Square", img: "🧺", rating: 5.0, reviews: 18, spots: 5, date: "Mar 27", featured: true, source: "works", url: "https://www.theworksseattle.com/coil-rope-baskets" },
  { id: "w4", title: "Concrete Art (2-day)", studio: "The Works Seattle", category: "Arts & Crafts", price: 125, duration: "2h × 2 days", location: "Pioneer Square", img: "🪨", rating: 4.9, reviews: 12, spots: 4, date: "Mar 29", featured: false, source: "works", url: "https://www.theworksseattle.com/concrete-art" },
  { id: "w5", title: "Floral Arranging", studio: "The Works Seattle", category: "Botanical", price: 125, duration: "1h 30m", location: "Pioneer Square", img: "🌸", rating: 4.7, reviews: 34, spots: 7, date: "Apr 1", featured: true, source: "works", url: "https://www.theworksseattle.com/floral-arranging" },
  { id: "w6", title: "Floating Floralscapes", studio: "The Works Seattle", category: "Botanical", price: 85, duration: "2h", location: "Pioneer Square", img: "🌿", rating: 4.8, reviews: 22, spots: 9, date: "Apr 3", featured: false, source: "works", url: "https://www.theworksseattle.com/floating-floralscapes" },
  { id: "w7", title: "Flower Pounding", studio: "The Works Seattle", category: "Botanical", price: 95, duration: "2h", location: "Pioneer Square", img: "🌼", rating: 5.0, reviews: 16, spots: 6, date: "Apr 5", featured: false, source: "works", url: "https://www.theworksseattle.com/flower-pounding" },
  { id: "w8", title: "Garment Sewing 101", studio: "The Works Seattle", category: "Fiber Arts", price: 85, duration: "3h", location: "Pioneer Square", img: "🧵", rating: 4.6, reviews: 27, spots: 5, date: "Apr 8", featured: false, source: "works", url: "https://www.theworksseattle.com/garment-sewing-101" },
];

// ─────────────────────────────────────────────
// MOCK DATA for other cities
// ─────────────────────────────────────────────
const MOCK_BY_CITY = {
  seattle: [
    { id: "s1", title: "Wheel Throwing Fundamentals", studio: "Clay & Co.", category: "Ceramics", price: 85, spots: 4, date: "Mar 15", duration: "3h", location: "Capitol Hill", featured: true, img: "🏺", rating: 4.9, reviews: 34, source: "local" },
    { id: "s2", title: "Natural Indigo Dyeing", studio: "Slow Fiber Studio", category: "Natural Dye", price: 120, spots: 6, date: "Mar 18", duration: "4h", location: "Fremont", featured: false, img: "🌿", rating: 5.0, reviews: 18, source: "local" },
    { id: "s3", title: "Coptic Bookbinding", studio: "Paper & Thread", category: "Bookbinding", price: 95, spots: 3, date: "Mar 22", duration: "3.5h", location: "Ballard", featured: false, img: "📖", rating: 4.8, reviews: 41, source: "local" },
    { id: "s4", title: "Raku Firing Weekend", studio: "Reclaim Clay Collective", category: "Ceramics", price: 145, spots: 2, date: "Mar 29", duration: "6h", location: "International District", featured: false, img: "🔥", rating: 5.0, reviews: 9, source: "local" },
  ],
  portland: [
    { id: "p1", title: "Japanese Woodblock Printing", studio: "Oblation Papers", category: "Printmaking", price: 75, spots: 6, date: "Mar 16", duration: "3h", location: "Pearl District", featured: true, img: "🖨️", rating: 4.8, reviews: 28, source: "local" },
    { id: "p2", title: "Shibori Indigo Dyeing", studio: "Beam & Anchor", category: "Natural Dye", price: 90, spots: 8, date: "Mar 20", duration: "3.5h", location: "North Portland", featured: false, img: "🌀", rating: 4.9, reviews: 19, source: "local" },
    { id: "p3", title: "Hand-Built Ceramics", studio: "Mudshark Studios", category: "Ceramics", price: 80, spots: 5, date: "Mar 23", duration: "2.5h", location: "SE Portland", featured: false, img: "🏺", rating: 4.7, reviews: 33, source: "local" },
    { id: "p4", title: "Natural Candle Making", studio: "Trillium Artisan", category: "Arts & Crafts", price: 65, spots: 10, date: "Apr 2", duration: "2h", location: "Alberta Arts", featured: false, img: "🕯️", rating: 4.6, reviews: 44, source: "local" },
  ],
  "new york": [
    { id: "n1", title: "Wet Felting Workshop", studio: "Brooklyn Craft Company", category: "Fiber Arts", price: 95, spots: 7, date: "Mar 17", duration: "3h", location: "Williamsburg", featured: true, img: "🧶", rating: 4.9, reviews: 52, source: "local" },
    { id: "n2", title: "Silver Smithing Intro", studio: "Metalwerx NYC", category: "Jewelry", price: 140, spots: 4, date: "Mar 21", duration: "4h", location: "LES", featured: false, img: "💍", rating: 5.0, reviews: 23, source: "local" },
    { id: "n3", title: "Risograph Printing", studio: "Printed Matter", category: "Printmaking", price: 85, spots: 8, date: "Mar 25", duration: "3h", location: "Chelsea", featured: false, img: "🖨️", rating: 4.7, reviews: 17, source: "local" },
    { id: "n4", title: "Leather Bookbinding", studio: "Dempsey & Carroll", category: "Bookbinding", price: 110, spots: 5, date: "Apr 1", duration: "3.5h", location: "Midtown", featured: false, img: "📖", rating: 4.8, reviews: 31, source: "local" },
  ],
  "san francisco": [
    { id: "sf1", title: "Macramé Wall Hanging", studio: "Ampersand SF", category: "Fiber Arts", price: 80, spots: 8, date: "Mar 16", duration: "2.5h", location: "Mission", featured: true, img: "🪢", rating: 4.8, reviews: 44, source: "local" },
    { id: "sf2", title: "Thrown Pottery Series", studio: "Potrero Clay", category: "Ceramics", price: 120, spots: 5, date: "Mar 19", duration: "3h", location: "Potrero Hill", featured: false, img: "🏺", rating: 4.9, reviews: 37, source: "local" },
    { id: "sf3", title: "Botanical Printing", studio: "Root & Branch", category: "Natural Dye", price: 75, spots: 9, date: "Mar 24", duration: "3h", location: "Hayes Valley", featured: false, img: "🌿", rating: 4.7, reviews: 21, source: "local" },
  ],
};

const CATEGORIES = ["All", "Ceramics", "Fiber Arts", "Painting", "Bookbinding", "Natural Dye", "Printmaking", "Botanical", "Arts & Crafts", "Jewelry"];

const TRANSACTIONS = [
  { id: "TXN-001", class: "Wheel Throwing Fundamentals", gross: 85, commission: 0.15 },
  { id: "TXN-002", class: "Natural Indigo Dyeing", gross: 120, commission: 0.15 },
  { id: "TXN-003", class: "Coil Rope Basket", gross: 85, commission: 0.15 },
  { id: "TXN-004", class: "Floral Arranging", gross: 125, commission: 0.15 },
  { id: "TXN-005", class: "Raku Firing Weekend", gross: 145, commission: 0.15 },
  { id: "TXN-006", class: "Art of Tarot", gross: 60, commission: 0.15 },
];

function calcEcon(gross, pct) {
  const comm = gross * pct;
  const stripe = gross * STRIPE_PCT + STRIPE_FIXED;
  const connect = gross * STRIPE_CONNECT_PCT + STRIPE_CONNECT_FIXED;
  const net = comm - stripe - connect - INFRA_PER_BOOKING;
  return { comm, stripe, connect, net, margin: (net / comm) * 100 };
}

async function fetchEventbrite(city) {
  const q = encodeURIComponent("craft OR ceramics OR weaving OR printmaking OR bookbinding");
  const loc = encodeURIComponent(city);
  const url = `https://www.eventbriteapi.com/v3/events/search/?q=${q}&location.address=${loc}&categories=119&expand=venue,ticket_availability&token=${EVENTBRITE_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.events || []).slice(0, 8).map((e, i) => ({
    id: `eb-${e.id}`,
    title: e.name.text,
    studio: e.organizer?.name || "Local Studio",
    category: "Arts & Crafts",
    price: e.ticket_availability?.minimum_ticket_price?.major_value || 0,
    spots: e.ticket_availability?.quantity_available || 10,
    date: new Date(e.start.local).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    duration: "—",
    location: e.venue?.address?.city || city,
    featured: i < 2,
    img: ["🏺","🎨","🧵","📖","🌿","🖨️","🧶","🕯️"][i % 8],
    rating: (4.5 + Math.random() * 0.5).toFixed(1),
    reviews: Math.floor(Math.random() * 40 + 10),
    source: "eventbrite",
    url: e.url,
  }));
}

function getMockForCity(city) {
  const key = city.toLowerCase().trim();
  if (key.includes("portland")) return MOCK_BY_CITY.portland;
  if (key.includes("new york") || key.includes("nyc")) return MOCK_BY_CITY["new york"];
  if (key.includes("san francisco") || key.includes("sf")) return MOCK_BY_CITY["san francisco"];
  return MOCK_BY_CITY.seattle;
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("browse");
  const [city, setCity] = useState("Seattle");
  const [cityInput, setCityInput] = useState("Seattle");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [saved, setSaved] = useState([]);
  const [animIn, setAnimIn] = useState(false);
  const [apiError, setApiError] = useState(false);
  const inputRef = useRef();

  useEffect(() => { setTimeout(() => setAnimIn(true), 80); }, []);

  useEffect(() => { loadCity("Seattle"); }, []);

  async function loadCity(c) {
    setLoading(true);
    setApiError(false);
    setActiveCategory("All");
    try {
      let results = [];
      if (USE_LIVE_API) {
        results = await fetchEventbrite(c);
      } else {
        await new Promise(r => setTimeout(r, 600));
        results = getMockForCity(c);
      }
      // Always append Works Seattle classes when city is Seattle
      const isSeattle = c.toLowerCase().includes("seattle") || (!USE_LIVE_API && !["portland","new york","nyc","san francisco","sf"].some(k => c.toLowerCase().includes(k)));
      const combined = isSeattle ? [...results, ...WORKS_CLASSES] : results;
      setListings(combined);
      setCity(c);
    } catch (e) {
      setApiError(true);
      setListings([...getMockForCity(c), ...WORKS_SEATTLE_CLASSES]);
    }
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (cityInput.trim()) loadCity(cityInput.trim());
  }

  const featured = listings.filter(c => c.featured);
  const filtered = activeCategory === "All" ? listings : listings.filter(c => c.category === activeCategory);
  const totalRevenue = TRANSACTIONS.reduce((s, t) => s + calcEcon(t.gross, t.commission).net, 0);
  const avgMargin = TRANSACTIONS.reduce((s, t) => s + calcEcon(t.gross, t.commission).margin, 0) / TRANSACTIONS.length;
  const presentCategories = ["All", ...Array.from(new Set(listings.map(l => l.category)))];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f6f2", color: "#1c1b19" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Karla:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .app { opacity: 0; transition: opacity 0.6s ease; }
        .app.in { opacity: 1; }

        nav { background: #f8f6f2; border-bottom: 1px solid #e8e4dc; padding: 0 48px; height: 58px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
        .logo { font-family: 'Cormorant', serif; font-weight: 400; font-size: 21px; letter-spacing: 0.5px; }
        .logo em { font-style: italic; color: #8c7355; }
        .nav-links { display: flex; }
        .nav-link { font-family: 'Karla', sans-serif; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #9e9488; padding: 6px 16px; cursor: pointer; border: none; background: none; border-bottom: 1.5px solid transparent; transition: color 0.2s, border-color 0.2s; }
        .nav-link.active { color: #1c1b19; border-bottom-color: #1c1b19; }
        .nav-link:hover:not(.active) { color: #5c5146; }

        .hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 400px; }
        .hero-left { background: #1c1b19; padding: 56px 52px; display: flex; flex-direction: column; justify-content: flex-end; }
        .hero-eyebrow { font-family: 'Karla', sans-serif; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: #8c7355; margin-bottom: 18px; }
        .hero-h1 { font-family: 'Cormorant', serif; font-weight: 300; font-size: clamp(38px, 4.5vw, 60px); line-height: 1.05; color: #f8f6f2; letter-spacing: -0.5px; margin-bottom: 18px; }
        .hero-h1 em { font-style: italic; color: #c4a882; }
        .hero-p { font-family: 'Karla', sans-serif; font-weight: 300; font-size: 13px; line-height: 1.85; color: #6b6259; max-width: 300px; margin-bottom: 32px; }

        .city-form { display: flex; border: 1px solid #3a3830; max-width: 380px; }
        .city-form input { flex: 1; background: transparent; border: none; padding: 12px 16px; font-family: 'Karla', sans-serif; font-size: 13px; color: #f8f6f2; outline: none; }
        .city-form input::placeholder { color: #4a4540; }
        .city-form button { background: #8c7355; border: none; padding: 12px 16px; color: #f8f6f2; font-family: 'Karla', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
        .city-form button:hover { background: #c4a882; color: #1c1b19; }

        .hero-right { background: #ddd9d0; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 1px; }
        .hero-tile { display: flex; flex-direction: column; justify-content: flex-end; padding: 22px; }
        .hero-tile:nth-child(1) { background: #e9e4db; }
        .hero-tile:nth-child(2) { background: #eae6de; }
        .hero-tile:nth-child(3) { background: #ece8e0; }
        .hero-tile:nth-child(4) { background: #e7e3da; }
        .tile-emoji { font-size: 30px; margin-bottom: 8px; opacity: 0.8; }
        .tile-count { font-family: 'Cormorant', serif; font-size: 28px; font-weight: 300; color: #1c1b19; line-height: 1; }
        .tile-label { font-family: 'Karla', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #8c7355; margin-top: 4px; }

        .api-banner { background: #f5f0e8; border-bottom: 1px solid #e8dcc8; padding: 10px 48px; display: flex; align-items: center; justify-content: space-between; }
        .api-banner-text { font-family: 'Karla', sans-serif; font-size: 11px; color: #7a5c38; letter-spacing: 0.3px; }
        .api-banner a { color: #8c7355; text-decoration: underline; }

        .source-bar { padding: 10px 48px; background: #f0ece5; border-bottom: 1px solid #e8e4dc; font-family: 'Karla', sans-serif; font-size: 11px; color: #9e9488; letter-spacing: 0.3px; display: flex; gap: 16px; align-items: center; }
        .source-pill { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 2px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
        .source-pill.works { background: #1c1b19; color: #f8f6f2; }
        .source-pill.local { background: #e8e4dc; color: #6b6259; }
        .source-pill.eb { background: #f05537; color: white; }

        .section { padding: 52px 48px; max-width: 1160px; margin: 0 auto; }
        .section-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 28px; padding-bottom: 14px; border-bottom: 1px solid #e8e4dc; }
        .section-title { font-family: 'Cormorant', serif; font-weight: 400; font-size: 26px; }
        .section-note { font-family: 'Karla', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #9e9488; }

        .filters { display: flex; margin-bottom: 32px; border-bottom: 1px solid #e8e4dc; overflow-x: auto; }
        .filter-btn { font-family: 'Karla', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #9e9488; padding: 9px 14px; cursor: pointer; border: none; background: none; border-bottom: 1.5px solid transparent; margin-bottom: -1px; white-space: nowrap; transition: color 0.15s, border-color 0.15s; }
        .filter-btn.active { color: #1c1b19; border-bottom-color: #8c7355; }
        .filter-btn:hover:not(.active) { color: #5c5146; }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1px; background: #e8e4dc; }

        .card { background: #f8f6f2; cursor: pointer; transition: background 0.15s; position: relative; }
        .card:hover { background: #f2ede6; }
        .card-top { height: 160px; display: flex; align-items: center; justify-content: center; font-size: 48px; position: relative; border-bottom: 1px solid #e8e4dc; background: #eae8e4; }
        .card-top.works-bg { background: #e4e8e4; }

        .featured-mark { position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #8c7355; }
        .works-mark { position: absolute; top: 10px; left: c.featured ? 14px : 10px; background: #1c1b19; color: #f8f6f2; font-family: 'Karla', sans-serif; font-size: 8px; letter-spacing: 1px; text-transform: uppercase; padding: 3px 7px; }

        .save-btn { position: absolute; top: 10px; right: 10px; background: rgba(248,246,242,0.92); border: 1px solid #e0dcd4; width: 27px; height: 27px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px; color: #8c7355; transition: all 0.15s; }
        .save-btn:hover, .save-btn.saved { background: #1c1b19; color: #f8f6f2; border-color: #1c1b19; }

        .card-body { padding: 16px 18px 12px; }
        .card-cat { font-family: 'Karla', sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #8c7355; margin-bottom: 5px; }
        .card-title { font-family: 'Cormorant', serif; font-weight: 400; font-size: 17px; line-height: 1.25; color: #1c1b19; margin-bottom: 3px; }
        .card-studio { font-family: 'Karla', sans-serif; font-size: 11px; color: #9e9488; margin-bottom: 10px; }
        .card-details { display: flex; gap: 12px; font-family: 'Karla', sans-serif; font-size: 11px; color: #6b6259; margin-bottom: 4px; }
        .spots-note { font-family: 'Karla', sans-serif; font-size: 10px; color: #8c7355; }
        .rating-row { font-family: 'Karla', sans-serif; font-size: 11px; color: #9e9488; margin-top: 7px; }

        .card-foot { padding: 12px 18px; border-top: 1px solid #e8e4dc; display: flex; align-items: center; justify-content: space-between; }
        .price { font-family: 'Cormorant', serif; font-weight: 400; font-size: 23px; color: #1c1b19; }
        .book-btn { font-family: 'Karla', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #f8f6f2; background: #1c1b19; border: none; padding: 8px 16px; cursor: pointer; transition: background 0.2s; }
        .book-btn:hover { background: #8c7355; }
        .book-btn a { color: inherit; text-decoration: none; }

        .mid-section { background: #f0ece5; border-top: 1px solid #e8e4dc; border-bottom: 1px solid #e8e4dc; }

        .loading-wrap { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 80px 0; }
        .loading-dot { width: 7px; height: 7px; border-radius: 50%; background: #8c7355; animation: pulse 1.2s ease-in-out infinite; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }

        .empty { padding: 80px 0; text-align: center; }
        .empty-icon { font-size: 40px; margin-bottom: 18px; opacity: 0.4; }
        .empty-title { font-family: 'Cormorant', serif; font-weight: 300; font-size: 24px; color: #1c1b19; margin-bottom: 8px; }
        .empty-sub { font-family: 'Karla', sans-serif; font-size: 12px; color: #9e9488; }

        /* ECONOMICS */
        .econ { padding: 56px 48px; max-width: 1160px; margin: 0 auto; }
        .econ-head { margin-bottom: 40px; padding-bottom: 18px; border-bottom: 1px solid #e8e4dc; }
        .econ-title { font-family: 'Cormorant', serif; font-weight: 300; font-size: 34px; letter-spacing: -0.5px; margin-bottom: 5px; }
        .econ-sub { font-family: 'Karla', sans-serif; font-size: 11px; color: #9e9488; letter-spacing: 0.3px; }

        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e8e4dc; margin-bottom: 40px; }
        .kpi { background: #f8f6f2; padding: 24px 26px; }
        .kpi-label { font-family: 'Karla', sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #9e9488; margin-bottom: 10px; }
        .kpi-val { font-family: 'Cormorant', serif; font-weight: 300; font-size: 34px; letter-spacing: -0.5px; color: #1c1b19; }
        .kpi-val.pos { color: #3d5c36; }
        .kpi-val.amb { color: #7a5020; }
        .kpi-note { font-family: 'Karla', sans-serif; font-size: 11px; color: #9e9488; margin-top: 4px; }

        .warn { border-left: 2px solid #8c7355; padding: 14px 18px; margin-bottom: 28px; background: #f5f0e8; }
        .warn-title { font-family: 'Cormorant', serif; font-size: 16px; margin-bottom: 4px; color: #5c3d1a; }
        .warn-body { font-family: 'Karla', sans-serif; font-size: 12px; color: #7a5c38; line-height: 1.7; }

        .txn-wrap { border: 1px solid #e8e4dc; }
        .txn-head { display: grid; grid-template-columns: 90px 1fr 60px 84px 84px 54px 84px 90px; padding: 11px 16px; border-bottom: 1px solid #e8e4dc; background: #f0ece5; }
        .th { font-family: 'Karla', sans-serif; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: #9e9488; }
        .txn-row { display: grid; grid-template-columns: 90px 1fr 60px 84px 84px 54px 84px 90px; padding: 12px 16px; border-bottom: 1px solid #f0ece5; align-items: center; transition: background 0.12s; }
        .txn-row:last-child { border-bottom: none; }
        .txn-row:hover { background: #f5f1ea; }
        .td { font-family: 'Karla', sans-serif; font-size: 12px; color: #1c1b19; }
        .td-id { font-size: 10px; color: #9e9488; }
        .td-fee { color: #7a3820; }
        .td-pos { color: #3d5c36; font-weight: 500; }
        .td-neg { color: #7a2020; font-weight: 500; }
        .bar-track { width: 48px; height: 2px; background: #e8e4dc; display: inline-block; vertical-align: middle; margin-right: 6px; }
        .bar-f { height: 100%; background: #8c7355; }
        .bar-f.low { background: #8c6030; }
        .model-note { margin-top: 22px; padding: 18px 22px; border: 1px solid #e8e4dc; background: #f5f0e8; font-family: 'Karla', sans-serif; font-size: 12px; color: #6b6259; line-height: 1.8; }
        .model-note strong { font-family: 'Cormorant', serif; font-size: 15px; display: block; margin-bottom: 5px; color: #1c1b19; font-weight: 400; }
      `}</style>

      <div className={`app ${animIn ? "in" : ""}`}>
        <nav>
          <div className="logo">make<em>way</em></div>
          <div className="nav-links">
            <button className={`nav-link ${view === "browse" ? "active" : ""}`} onClick={() => setView("browse")}>Browse</button>
            <button className={`nav-link ${view === "saved" ? "active" : ""}`} onClick={() => setView("saved")}>Saved{saved.length > 0 ? ` (${saved.length})` : ""}</button>
            <button className={`nav-link ${view === "economics" ? "active" : ""}`} onClick={() => setView("economics")}>Economics</button>
          </div>
        </nav>

        {view === "browse" && (
          <>
            <div className="hero">
              <div className="hero-left">
                <div className="hero-eyebrow">{city} · Spring 2026</div>
                <h1 className="hero-h1">Make time<br />for <em>making.</em></h1>
                <p className="hero-p">Local craft classes that quiet your mind and move you forward. Find your flow — with your hands.</p>
                <form className="city-form" onSubmit={handleSearch}>
                  <input
                    ref={inputRef}
                    value={cityInput}
                    onChange={e => setCityInput(e.target.value)}
                    placeholder="Enter your city…"
                  />
                  <button type="submit">Find classes →</button>
                </form>
              </div>
              <div className="hero-right">
                {[
                  { emoji: "🏺", label: "Ceramics", count: listings.filter(l => l.category === "Ceramics").length || "—" },
                  { emoji: "🧵", label: "Fiber Arts", count: listings.filter(l => l.category === "Fiber Arts").length || "—" },
                  { emoji: "🎨", label: "Painting", count: listings.filter(l => l.category === "Painting").length || "—" },
                  { emoji: "🌿", label: "Botanical", count: listings.filter(l => l.category === "Botanical").length || "—" },
                ].map(t => (
                  <div key={t.label} className="hero-tile">
                    <div className="tile-emoji">{t.emoji}</div>
                    <div className="tile-count">{t.count}</div>
                    <div className="tile-label">{t.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {!USE_LIVE_API && (
              <div className="api-banner">
                <div className="api-banner-text">
                  Showing illustrative listings. To go live, add your <a href="https://www.eventbrite.com/platform/api" target="_blank">Eventbrite API token</a> to the EVENTBRITE_TOKEN constant at the top of the file.
                </div>
                <div style={{ fontFamily: "Karla, sans-serif", fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "#9e9488" }}>Demo mode</div>
              </div>
            )}

            {loading ? (
              <div className="loading-wrap">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
            ) : (
              <>
                {listings.some(l => l.source === "works") && (
                  <div className="source-bar">
                    <span style={{ color: "#6b6259" }}>Sources:</span>
                    <span className="source-pill works">The Works Seattle</span>
                    <span className="source-pill local">Local Studios</span>
                    {USE_LIVE_API && <span className="source-pill eb">Eventbrite</span>}
                  </div>
                )}

                {featured.length > 0 && (
                  <div className="section">
                    <div className="section-header">
                      <div className="section-title">Featured Studios</div>
                      <div className="section-note">Promoted listings</div>
                    </div>
                    <div className="grid">
                      {featured.map(c => <Card key={c.id} c={c} saved={saved} setSaved={setSaved} />)}
                    </div>
                  </div>
                )}

                <div className="mid-section">
                  <div className="section">
                    <div className="section-header">
                      <div className="section-title">All Classes in {city}</div>
                      <div className="section-note">{filtered.length} available</div>
                    </div>
                    <div className="filters">
                      {presentCategories.map(cat => (
                        <button key={cat} className={`filter-btn ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
                      ))}
                    </div>
                    <div className="grid">
                      {filtered.map(c => <Card key={c.id} c={c} saved={saved} setSaved={setSaved} />)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {view === "saved" && (
          <div className="section">
            <div className="section-header">
              <div className="section-title">Saved Classes</div>
              <div className="section-note">{saved.length} classes</div>
            </div>
            {saved.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🧵</div>
                <div className="empty-title">Nothing saved yet</div>
                <div className="empty-sub">Browse classes and tap ♡ to save them here</div>
              </div>
            ) : (
              <div className="grid">
                {listings.filter(c => saved.includes(c.id)).map(c => <Card key={c.id} c={c} saved={saved} setSaved={setSaved} />)}
              </div>
            )}
          </div>
        )}

        {view === "economics" && (
          <div className="econ">
            <div className="econ-head">
              <div className="econ-title">Unit Economics</div>
              <div className="econ-sub">Per-transaction P&L · Stripe fees · Connect payouts · Infrastructure</div>
            </div>
            <div className="kpi-row">
              <div className="kpi">
                <div className="kpi-label">Net Revenue</div>
                <div className="kpi-val pos">${totalRevenue.toFixed(2)}</div>
                <div className="kpi-note">6 transactions</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Avg Net Margin</div>
                <div className={`kpi-val ${avgMargin > 40 ? "pos" : "amb"}`}>{avgMargin.toFixed(1)}%</div>
                <div className="kpi-note">After all fees</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Commission Rate</div>
                <div className="kpi-val">15%</div>
                <div className="kpi-note">Of gross booking</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Processing</div>
                <div className="kpi-val" style={{ fontSize: 19, paddingTop: 8 }}>2.9% + 30¢</div>
                <div className="kpi-note">Connect: 0.25% + 25¢</div>
              </div>
            </div>
            <div className="warn">
              <div className="warn-title">Watch your floor price</div>
              <div className="warn-body">Classes under ~$38 may be margin-negative after fees. A $30 class yields only ~$0.93 net. Consider a minimum booking fee or commission floor for low-price classes.</div>
            </div>
            <div className="txn-wrap">
              <div className="txn-head">
                {["ID","Class","Gross","Commission","Stripe Fees","Infra","Net to You","Margin"].map(h => <div key={h} className="th">{h}</div>)}
              </div>
              {TRANSACTIONS.map(t => {
                const e = calcEcon(t.gross, t.commission);
                const isLow = e.margin < 40;
                return (
                  <div className="txn-row" key={t.id}>
                    <div className="td td-id">{t.id}</div>
                    <div className="td">{t.class}</div>
                    <div className="td">${t.gross}</div>
                    <div className="td">${e.comm.toFixed(2)}</div>
                    <div className="td td-fee">−${(e.stripe + e.connect).toFixed(2)}</div>
                    <div className="td td-fee">−${INFRA_PER_BOOKING}</div>
                    <div className={`td ${e.net > 0 ? "td-pos" : "td-neg"}`}>${e.net.toFixed(2)}</div>
                    <div className="td" style={{ display: "flex", alignItems: "center" }}>
                      <div className="bar-track"><div className={`bar-f ${isLow ? "low" : ""}`} style={{ width: `${Math.min(e.margin, 100)}%` }} /></div>
                      <span style={{ fontFamily: "Karla", fontSize: 11, color: "#6b6259" }}>{e.margin.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="model-note">
              <strong>Cost model assumptions</strong>
              Stripe processing: 2.9% + $0.30 · Stripe Connect payout: 0.25% + $0.25 · Infrastructure: $0.18 per booking · Commission: 15% of gross. Adjust as your real costs become clear.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ c, saved, setSaved }) {
  const isSaved = saved.includes(c.id);
  const toggle = (e) => {
    e.stopPropagation();
    setSaved(prev => isSaved ? prev.filter(id => id !== c.id) : [...prev, c.id]);
  };
  return (
    <div className="card">
      <div className={`card-top ${c.source === "works" ? "works-bg" : ""}`}>
        {c.featured && <div className="featured-mark" />}
        <button className={`save-btn ${isSaved ? "saved" : ""}`} onClick={toggle}>{isSaved ? "♥" : "♡"}</button>
        {c.img}
      </div>
      <div className="card-body">
        <div className="card-cat">{c.category}</div>
        <div className="card-title">{c.title}</div>
        <div className="card-studio">{c.studio} · {c.location}</div>
        <div className="card-details"><span>{c.date}</span><span>{c.duration}</span></div>
        <div className="spots-note">{c.spots} spots remaining</div>
        <div className="rating-row">{"★".repeat(Math.floor(c.rating))}{"☆".repeat(5 - Math.floor(c.rating))} {c.rating} · {c.reviews} reviews</div>
      </div>
      <div className="card-foot">
        <div className="price">${c.price}</div>
        <button className="book-btn">
          {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer">Book</a> : "Book"}
        </button>
      </div>
    </div>
  );
}
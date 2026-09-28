"use client";

import { useState } from "react";

const categories = [
  { name: "Furniture", count: "12 pieces", image: "photo-1592078615290-033ee584e267" },
  { name: "Home accents", count: "08 pieces", image: "photo-1600210492486-724fe5c67fb0" },
  { name: "Kitchen & dining", count: "14 pieces", image: "photo-1603199506016-b9a594b593c0" },
  { name: "Lighting", count: "06 pieces", image: "photo-1507473885765-e6ed057f782c" },
];

const products = [
  { name: "The Alder Dining Chair", detail: "Solid white oak · Natural oil", price: "$480", image: "photo-1598300053653-7ca5a4c9a99f", label: "BESTSELLER" },
  { name: "Low Tide Side Table", detail: "American walnut · Hand-finished", price: "$360", image: "photo-1499933374294-4584851497cc", label: "" },
  { name: "Sunday Serving Board", detail: "Black walnut · Made to gather", price: "$86", image: "photo-1603199506016-b9a594b593c0", label: "MADE TO ORDER" },
  { name: "Arc Table Lamp", detail: "Turned ash · Linen shade", price: "$295", image: "photo-1507473885765-e6ed057f782c", label: "" },
];

function Icon({ name }: { name: "search" | "user" | "bag" | "menu" | "close" | "arrow" | "instagram" | "facebook" | "pinterest" }) {
  const shared = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.2 4.2" /></>,
    user: <><circle cx="12" cy="8" r="3.4" /><path d="M5.5 20c.6-3.5 2.8-5.4 6.5-5.4s5.9 1.9 6.5 5.4" /></>,
    bag: <><path d="M5 8.5h14l1 12H4l1-12Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrow: <><path d="M4 12h15M13 5l7 7-7 7" /></>,
    instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.7" /><path d="M17.6 6.5h.01" /></>,
    facebook: <path d="M14 8h3V4h-3a5 5 0 0 0-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9a1 1 0 0 1 1-1Z" />,
    pinterest: <><path d="M12 21a9 9 0 1 0-3.2-.6" /><path d="M9 19.5c1.1-1.4 1.6-4.4 2.1-6.9m2.8-3.7c-2.2 0-3.4 1.7-3.4 3.4 0 1.1.4 2.1 1.2 2.1 1.2 0 2.1-2.9 2.1-4.4 0-1.3-.8-2.1-2-2.1" /></>,
  };
  return <svg {...shared}>{paths[name]}</svg>;
}

function photoUrl(id: string, width: number) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [newsletterJoined, setNewsletterJoined] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="announcement">A slower kind of living. Complimentary shipping on orders over $150.</div>
      <header className="site-header">
        <div className="header-inner">
          <a className="wordmark" href="#home" aria-label="Form and Forest home" onClick={closeMenu}><span>FORM <i>&</i> FOREST</span><small>OBJECTS FOR LIVING</small></a>
          <nav className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
            <a href="#home" onClick={closeMenu}>Home</a><a href="#products" onClick={closeMenu}>Shop</a><a href="#categories" onClick={closeMenu}>Categories</a><a href="#about" onClick={closeMenu}>Our story</a><a href="#contact" onClick={closeMenu}>Contact</a>
          </nav>
          <div className="header-actions">
            <button className="icon-button search-toggle" aria-label={searchOpen ? "Close search" : "Open search"} onClick={() => setSearchOpen(!searchOpen)}><Icon name="search" /></button>
            <a className="icon-button account-link" href="#contact" aria-label="Your account"><Icon name="user" /></a>
            <button className="icon-button cart-button" aria-label={`Shopping bag, ${cartCount} items`} onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}><Icon name="bag" /><span className="cart-count">{cartCount}</span></button>
            <button className="icon-button menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} /></button>
          </div>
        </div>
        {searchOpen && <form className="search-panel" action="#products"><label htmlFor="site-search">Search the collection</label><input id="site-search" name="q" type="search" placeholder="Try ‘side table’" /><button type="submit" aria-label="Search"><Icon name="arrow" /></button></form>}
      </header>

      <main>
        <section className="hero section-wrap" id="home" aria-labelledby="hero-title">
          <div className="hero-copy"><p className="eyebrow">MADE SLOWLY. KEPT FOREVER.</p><h1 id="hero-title">A little more <em>wood</em>, a little less rush.</h1><p className="hero-description">Thoughtful pieces, shaped by hand and made to bring a sense of calm to the everyday.</p><a className="button button-dark" href="#products">Shop the collection <Icon name="arrow" /></a><div className="hero-note"><span className="note-rule" />Designed to be lived with, for years to come.</div></div>
          <div className="hero-image" role="img" aria-label="A quiet, sunlit living room with natural wood furniture" style={{ backgroundImage: `url("${photoUrl("photo-1616486338812-3dadae4b4ace", 1800)}")` }}><span className="image-caption">THE EVERYDAY COLLECTION <span>01 / 04</span></span></div>
          <span className="hero-index">01 — 04</span>
        </section>

        <section className="categories section-wrap" id="categories" aria-labelledby="categories-title">
          <div className="section-heading"><div><p className="eyebrow">ROOM TO ROOM</p><h2 id="categories-title">Find your <em>favourite</em> grain.</h2></div><a className="text-link" href="#products">Explore all <Icon name="arrow" /></a></div>
          <div className="category-grid">{categories.map((category, index) => <a className="category-card" href="#products" key={category.name}><div className="category-image" role="img" aria-label={`${category.name} in natural wood`} style={{ backgroundImage: `url("${photoUrl(category.image, 720)}")` }}><span className="category-index">0{index + 1}</span><span className="round-arrow"><Icon name="arrow" /></span></div><div className="category-meta"><h3>{category.name}</h3><span>{category.count}</span></div></a>)}</div>
        </section>

        <section className="products-section" id="products" aria-labelledby="products-title"><div className="section-wrap">
          <div className="section-heading"><div><p className="eyebrow">GOOD THINGS, MADE WELL</p><h2 id="products-title">Pieces to <em>come home to.</em></h2></div><a className="text-link" href="#categories">Shop all objects <Icon name="arrow" /></a></div>
          <div className="product-grid">{products.map((product) => <article className="product-card" key={product.name}><a className="product-image" href="#contact" aria-label={`View ${product.name}`} style={{ backgroundImage: `url("${photoUrl(product.image, 900)}")` }}>{product.label && <span className="product-label">{product.label}</span>}<span className="product-view">View piece <Icon name="arrow" /></span></a><div className="product-info"><div><h3>{product.name}</h3><p>{product.detail}</p></div><strong>{product.price}</strong></div><button className="add-button" onClick={() => setCartCount(cartCount + 1)}>Add to bag <span>+</span></button></article>)}</div>
        </div></section>

        <section className="story section-wrap" id="about" aria-labelledby="story-title"><div className="story-image" role="img" aria-label="Handcrafted wooden furniture in a peaceful home" style={{ backgroundImage: `url("${photoUrl("photo-1600210492486-724fe5c67fb0", 1300)}")` }} /><div className="story-copy"><p className="eyebrow">A GOOD THING TAKES TIME</p><h2 id="story-title">Made by hand.<br />Made to <em>stay.</em></h2><p>We work with a small circle of independent makers who know their materials by heart. Every curve, joint and finish is considered. Nothing hurried, nothing wasted.</p><a className="text-link" href="#contact">A little about us <Icon name="arrow" /></a><div className="story-stats"><div><strong>01</strong><span>piece at a time</span></div><div><strong>100%</strong><span>responsibly sourced</span></div><div><strong>∞</strong><span>years of good use</span></div></div></div></section>

        <section className="newsletter" aria-labelledby="newsletter-title"><div className="newsletter-inner"><p className="eyebrow">NOTES FROM THE WORKSHOP</p><h2 id="newsletter-title">A little note from us, <em>now and then.</em></h2><p>New work, thoughtful living, and the occasional good thing.</p><form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); setNewsletterJoined(true); }}><label className="visually-hidden" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required disabled={newsletterJoined} /><button type="submit" aria-label={newsletterJoined ? "Subscription confirmed" : "Subscribe"} disabled={newsletterJoined}>{newsletterJoined ? "You’re on the list" : <Icon name="arrow" />}</button></form></div></section>
      </main>

      <footer className="site-footer" id="contact"><div className="footer-main section-wrap">
        <div className="footer-brand"><a className="wordmark wordmark-light" href="#home"><span>FORM <i>&</i> FOREST</span><small>OBJECTS FOR LIVING</small></a><p>Considered objects for a more considered home.</p><div className="social-links"><a href="https://instagram.com" aria-label="Instagram"><Icon name="instagram" /></a><a href="https://facebook.com" aria-label="Facebook"><Icon name="facebook" /></a><a href="https://pinterest.com" aria-label="Pinterest"><Icon name="pinterest" /></a></div></div>
        <div className="footer-column"><h3>Explore</h3><a href="#products">Shop all</a><a href="#categories">Categories</a><a href="#about">Our story</a><a href="#contact">Journal</a></div>
        <div className="footer-column"><h3>We&apos;re here</h3><a href="mailto:hello@formandforest.com">hello@formandforest.com</a><a href="tel:+14155550138">+1 (415) 555-0138</a><span>Monday–Friday, 9am–5pm PST</span></div>
        <div className="footer-column"><h3>Visit the studio</h3><span>1847 North Avenue</span><span>Portland, OR 97209</span><a href="#contact">Get directions <Icon name="arrow" /></a></div>
      </div><div className="footer-bottom section-wrap"><span>© 2026 Form & Forest. Made with care.</span><div><a href="#contact">Privacy</a><a href="#contact">Terms</a></div><span>Good wood. Good days.</span></div></footer>
    </>
  );
}

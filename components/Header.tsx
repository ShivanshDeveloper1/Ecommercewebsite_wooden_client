"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import Icon from "@/components/Icon";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="announcement">A slower kind of living. Complimentary shipping on orders over $150.</div>
      <header className="site-header">
        <div className="header-inner">
         <Link href="/" className="wordmark wordmark-light">
  <img
    src="/logo.png"
    alt="OudArs"
    className="h-8 w-auto object-contain sm:h-9 md:h-10"
  />
</Link>

          <nav className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
            <Link href="/" onClick={closeMenu}>Home</Link><Link href="/products" onClick={closeMenu}>Shop</Link><Link href="/products" onClick={closeMenu}>Categories</Link><Link href="/#about" onClick={closeMenu}>Our story</Link><Link href="/#contact" onClick={closeMenu}>Contact</Link>
          </nav>
          <div className="header-actions">
            <button className="icon-button search-toggle" aria-label={searchOpen ? "Close search" : "Open search"} onClick={() => setSearchOpen(!searchOpen)}><Icon name="search" /></button>
            <Link className="icon-button account-link" href="/#contact" aria-label="Your account"><Icon name="user" /></Link>
            <Link className="icon-button cart-button" href="/cart" aria-label={`Shopping bag, ${itemCount} items`}><Icon name="bag" /><span className="cart-count">{itemCount}</span></Link>
            <button className="icon-button menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} /></button>
          </div>
        </div>
        {searchOpen && <form className="search-panel" action="/products"><label htmlFor="site-search">Search the collection</label><input id="site-search" name="q" type="search" placeholder="Try ‘side table’" /><button type="submit" aria-label="Search"><Icon name="arrow" /></button></form>}
      </header>
    </>
  );
}

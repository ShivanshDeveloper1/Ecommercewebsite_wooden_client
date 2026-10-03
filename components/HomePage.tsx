"use client";

import { useState } from "react";
import CategoryCard from "@/components/CategoryCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import ProductCard from "@/components/ProductCard";
import TestimonialSection from "@/components/TestimonialSection";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

type ProductCardItem = Product & { label?: string };

export default function HomePage({ categories, products, categoryCounts }: {
  categories: Category[];
  products: ProductCardItem[];
  categoryCounts: Record<string, number>;
}) {
  const [newsletterJoined, setNewsletterJoined] = useState(false);

  return (
    <>
      <Header />
      <main>
        <section className="hero section-wrap" id="home" aria-labelledby="hero-title">
          <div className="hero-copy"><p className="eyebrow">MADE SLOWLY. KEPT FOREVER.</p><h1 id="hero-title">A little more <em>wood</em>, a little less rush.</h1><p className="hero-description">Thoughtful pieces, shaped by hand and made to bring a sense of calm to the everyday.</p><a className="button button-dark" href="#products">Shop the collection <Icon name="arrow" /></a><div className="hero-note"><span className="note-rule" />Designed to be lived with, for years to come.</div></div>
          <div className="hero-image" role="img" aria-label="A quiet, sunlit living room with natural wood furniture" style={{ backgroundImage: "url(\"https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=85\")" }}><span className="image-caption">THE EVERYDAY COLLECTION <span>01 / 04</span></span></div>
          <span className="hero-index">01 — 04</span>
        </section>

        <section className="categories section-wrap" id="categories" aria-labelledby="categories-title">
          <div className="section-heading"><div><p className="eyebrow">ROOM TO ROOM</p><h2 id="categories-title">Find your <em>favourite</em> grain.</h2></div><a className="text-link" href="#products">Explore all <Icon name="arrow" /></a></div>
          {categories.length ? <div className="category-grid">{categories.map((category, index) => <CategoryCard category={category} index={index} itemCount={categoryCounts[category.slug] ?? 0} key={category.slug} />)}</div> : <p className="text-sm text-(--muted)">New categories are on their way.</p>}
        </section>

        <section className="products-section" id="products" aria-labelledby="products-title"><div className="section-wrap">
          <div className="section-heading"><div><p className="eyebrow">GOOD THINGS, MADE WELL</p><h2 id="products-title">Pieces to <em>come home to.</em></h2></div><a className="text-link" href="#categories">Shop all objects <Icon name="arrow" /></a></div>
          {products.length ? <div className="product-grid">{products.map((product) => <ProductCard product={product} key={product.slug} />)}</div> : <p className="text-sm text-(--muted)">Featured pieces are coming soon.</p>}
        </div></section>

        <section className="story section-wrap" id="about" aria-labelledby="story-title"><div className="story-image" role="img" aria-label="Handcrafted wooden furniture in a peaceful home" style={{ backgroundImage: "url(\"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1300&q=85\")" }} /><div className="story-copy"><p className="eyebrow">A GOOD THING TAKES TIME</p><h2 id="story-title">Made by hand.<br />Made to <em>stay.</em></h2><p>We work with a small circle of independent makers who know their materials by heart. Every curve, joint and finish is considered. Nothing hurried, nothing wasted.</p><a className="text-link" href="#contact">A little about us <Icon name="arrow" /></a><div className="story-stats"><div><strong>01</strong><span>piece at a time</span></div><div><strong>100%</strong><span>responsibly sourced</span></div><div><strong>∞</strong><span>years of good use</span></div></div></div></section>

        <TestimonialSection testimonials={[]} />

        <section className="newsletter" aria-labelledby="newsletter-title"><div className="newsletter-inner"><p className="eyebrow">NOTES FROM THE WORKSHOP</p><h2 id="newsletter-title">A little note from us, <em>now and then.</em></h2><p>New work, thoughtful living, and the occasional good thing.</p><form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); setNewsletterJoined(true); }}><label className="visually-hidden" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required disabled={newsletterJoined} /><button type="submit" aria-label={newsletterJoined ? "Subscription confirmed" : "Subscribe"} disabled={newsletterJoined}>{newsletterJoined ? "You’re on the list" : <Icon name="arrow" />}</button></form></div></section>
      </main>
      <Footer />
    </>
  );
}

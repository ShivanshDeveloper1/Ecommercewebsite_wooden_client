"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryCard from "@/components/CategoryCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import ProductCard from "@/components/ProductCard";
import TestimonialSection from "@/components/TestimonialSection";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";
import Image from "next/image";

type ProductCardItem = Product & { label?: string };

// Animation variants for smooth scroll reveals
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

export default function HomePage({
  categories,
  products,
  categoryCounts,
}: {
  categories: Category[];
  products: ProductCardItem[];
  categoryCounts: Record<string, number>;
}) {
  const [newsletterJoined, setNewsletterJoined] = useState(false);

  // Contact form state
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <>
      <Header/>
      <main>
               <div className="relative w-full overflow-hidden">
  <Image
    src="/work.png"
    alt="Featured banner"
    width={1920}
    height={600}
    className="h-[220px] w-full object-cover sm:h-[320px] lg:h-[420px] py-1"
    priority
  />
</div>
        {/* HERO SECTION */}
        <section className="hero section-wrap" id="home" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">MADE SLOWLY. KEPT FOREVER.</p>
            <h1 id="hero-title">
              A little more <em>wood</em>, a little less rush.
            </h1>
            <p className="hero-description">
              Thoughtful pieces, shaped by hand and made to bring a sense of calm to the everyday.
            </p>
            <a className="button button-dark" href="#products">
              Shop the collection <Icon name="arrow"/>
            </a>
            <div className="hero-note">
              <span className="note-rule" />
              Designed to be lived with, for years to come.
            </div>
          </div>
          <div
            className="hero-image"
            role="img"
            aria-label="A quiet, sunlit living room with natural wood furniture"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=85")',
            }}
          >
            <span className="image-caption">
              THE EVERYDAY COLLECTION <span>01 / 04</span>
            </span>
          </div>
          <span className="hero-index">01 — 04</span>
        </section>

 

        {/* CATEGORIES SECTION */}
        <section className="categories section-wrap" id="categories" aria-labelledby="categories-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ROOM TO ROOM</p>
              <h2 id="categories-title">
                Find your <em>favourite</em> grain.
              </h2>
            </div>
            <a className="text-link" href="#products">
              Explore all <Icon name="arrow"/>
            </a>
          </div>
         {categories.length ? (
  <div className="category-grid">
    {categories.map((category, index) => (
      <CategoryCard
        category={category}
        index={index}
        itemCount={categoryCounts[category.slug] ?? 0}
        key={category.slug}
      />
    ))}
            </div>
          ) : (
            <p className="text-sm text-(--muted)">New categories are on their way.</p>
          )}
        </section>

        {/* PRODUCTS SECTION */}
        <section className="products-section" id="products" aria-labelledby="products-title">
          <div className="section-wrap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">GOOD THINGS, MADE WELL</p>
                <h2 id="products-title">
                  Pieces to <em>come home to.</em>
                </h2>
              </div>
              <a className="text-link" href="#categories">
                Shop all objects <Icon name="arrow"/>
              </a>
            </div>
            {products.length ? (
              <div className="product-grid">
                {products.map((product) => (
             <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-(--muted)">Featured pieces are coming soon.</p>
            )}
          </div>
        </section>

        {/* STORY / ABOUT SECTION */}
        <section className="story section-wrap" id="about" aria-labelledby="story-title">
          <div
            className="story-image"
            role="img"
            aria-label="Handcrafted wooden furniture in a peaceful home"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1300&q=85")',
            }}
          />
          <div className="story-copy">
            <p className="eyebrow">A GOOD THING TAKES TIME</p>
            <h2 id="story-title">
              Made by hand.
              <br />
              Made to <em>stay.</em>
            </h2>
            <p>
              We work with a small circle of independent makers who know their materials by heart.
              Every curve, joint and finish is considered. Nothing hurried, nothing wasted.
            </p>
            <a className="text-link" href="#contact">
              Get in touch with us <Icon name="arrow"/>
            </a>
            <div className="story-stats">
              <div>
                <strong>01</strong>
                <span>piece at a time</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>responsibly sourced</span>
              </div>
              <div>
                <strong>∞</strong>
                <span>years of good use</span>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
    <TestimonialSection testimonials={[]} />
        {/* --- AWESOME CONTACT SECTION --- */}
        <section
          className="contact-section border-t border-stone-200/60 bg-[#FDFBF7] py-20 md:py-28"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="section-wrap max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
            >
              {/* Left Column: Info & Details */}
              <motion.div variants={fadeInUp} className="lg:col-span-5 space-y-8">
                <div>
                  <p className="eyebrow text-amber-900/70 font-mono tracking-widest text-xs uppercase mb-3">
                    TALK TO THE WORKSHOP
                  </p>
                  <h2 id="contact-title" className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight">
                    Let’s start a <em>conversation.</em>
                  </h2>
                  <p className="mt-4 text-stone-600 leading-relaxed text-base md:text-lg">
                    Whether you have questions about custom dimensions, material sourcing, or an active order, we’re here to help.
                  </p>
                </div>

                {/* Direct Contact Cards */}
                <div className="space-y-4 pt-2">
                  {/* Phone Card */}
                  <motion.div
                    whileHover={{ scale: 1.01, x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-5 rounded-2xl bg-white/80 border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-800 group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-stone-400">Direct Phone</p>
                        <a
                          href="tel:+919458829385"
                          className="text-lg font-medium text-stone-900 hover:text-amber-900 transition-colors"
                        >
                          +91 94588 29385
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy("+919458829385", "phone")}
                      className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-all"
                      title="Copy phone number"
                    >
                      {copiedField === "phone" ? "Copied!" : "Copy"}
                    </button>
                  </motion.div>

                  {/* Email Card */}
                  <motion.div
                    whileHover={{ scale: 1.01, x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-5 rounded-2xl bg-white/80 border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-800 group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-stone-400">Email Inquiry</p>
                        <a
                          href="mailto:info@oudars.com"
                          className="text-lg font-medium text-stone-900 hover:text-amber-900 transition-colors"
                        >
                          info@oudars.com
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy("info@oudars.com", "email")}
                      className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-all"
                      title="Copy email address"
                    >
                      {copiedField === "email" ? "Copied!" : "Copy"}
                    </button>
                  </motion.div>
                </div>

                {/* Additional Note / Hours */}
                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Workshop Open: Mon – Sat (9am - 7pm IST)
                  </span>
                  <span>Response within 24h</span>
                </div>
              </motion.div>

              {/* Right Column: Interactive Contact Form */}
              <motion.div
                variants={fadeInUp}
                className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl border border-stone-200/80 shadow-xl shadow-stone-200/30 relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {!contactSubmitted ? (
                    <motion.form
                      key="contact-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                      onSubmit={handleContactSubmit}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                            Your Name *
                          </label>
                          <input
                            id="name"
                            required
                            type="text"
                            placeholder="e.g. Eleanor Vance"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                            Email Address *
                          </label>
                          <input
                            id="email"
                            required
                            type="email"
                            placeholder="e.g. eleanor@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                          Inquiry Type
                        </label>
                        <select
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white transition-all text-sm"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Custom Woodwork Commission">Custom Woodwork Commission</option>
                          <option value="Order Status & Delivery">Order Status & Delivery</option>
                          <option value="Trade & Interior Designers">Trade & Interior Designers</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                          Your Message *
                        </label>
                        <textarea
                          id="message"
                          required
                          rows={4}
                          placeholder="Tell us about your project or inquiry..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white transition-all text-sm resize-none"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-4 rounded-xl bg-stone-900 text-stone-5 font-medium text-sm hover:bg-stone-800 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-stone-900/10"
                      >
                        <span>Send Message</span>
                        <Icon name="arrow"/>
                      </motion.button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success-message"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="py-12 text-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-stone-100 text-stone-900 rounded-full flex items-center justify-center mx-auto text-2xl">
                        ✓
                      </div>
                      <h3 className="text-2xl font-serif text-stone-900">Message Received</h3>
                      <p className="text-stone-600 text-sm max-w-sm mx-auto">
                        Thank you for reaching out, {formData.name || "friend"}. We’ll review your inquiry and get back to you shortly at{" "}
                        <span className="font-semibold text-stone-800">{formData.email}</span>.
                      </p>
                      <button
                        onClick={() => {
                          setContactSubmitted(false);
                          setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
                        }}
                        className="text-xs font-mono uppercase tracking-wider text-stone-500 hover:text-stone-900 underline underline-offset-4 pt-4 inline-block transition-colors"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* NEWSLETTER SECTION */}
        <section className="newsletter" aria-labelledby="newsletter-title">
          <div className="newsletter-inner">
            <p className="eyebrow">NOTES FROM THE WORKSHOP</p>
            <h2 id="newsletter-title">
              A little note from us, <em>now and then.</em>
            </h2>
            <p>New work, thoughtful living, and the occasional good thing.</p>
            <form
              className="newsletter-form"
              onSubmit={(event) => {
                event.preventDefault();
                setNewsletterJoined(true);
              }}
            >
              <label className="visually-hidden" htmlFor="newsletter-email">
                Your email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Your email address"
                required
                disabled={newsletterJoined}
              />
              <button
                type="submit"
                aria-label={newsletterJoined ? "Subscription confirmed" : "Subscribe"}
                disabled={newsletterJoined}
              >
                {newsletterJoined ? "You’re on the list" : <Icon name="arrow"/>}
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer/>
    </>
  );
}
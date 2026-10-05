import Icon from "@/components/Icon";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <PageContainer className="footer-main">
        <div className="footer-brand">
         <Link href="/" className="wordmark wordmark-light">
  <img
    src="/logm.jpg"
    alt="OudArs"
    className="h-12 w-auto object-contain"
  />
</Link>
          
          
          
          
          <p>Considered objects for a more considered home.</p><div className="social-links"><a href="https://www.instagram.com/oudars" aria-label="Instagram"><Icon name="instagram" /></a><a href="https://www.facebook.com/oudarsofficial" aria-label="Facebook"><Icon name="facebook" /></a><a href="https://www.youtube.com/@oudars?si=simrj0dUz2ya1CsJ" aria-label="youtube"><Icon name="pinterest" /></a></div></div>
        <div className="footer-column"><h3>Explore</h3><Link href="/products">Shop all</Link><Link href="/products">Categories</Link><Link href="/#about">Our story</Link><Link href="/#about">Journal</Link></div>
        <div className="footer-column"><h3>We&apos;re here</h3><a href="mailto:hello@formandforest.com">hello@formandforest.com</a><a href="tel:+14155550138">+1 (415) 555-0138</a><span>Monday–Friday, 9am–5pm PST</span></div>
        <div className="footer-column"><h3>Visit the studio</h3><span>1847 North Avenue</span><span>Portland, OR 97209</span><Link href="/#contact">Get directions <Icon name="arrow" /></Link></div>
      </PageContainer>
      <PageContainer className="footer-bottom"><span>© 2026 OudArs. Made with care.</span><div><Link href="/#contact">Privacy</Link><Link href="/#contact">Terms</Link></div><span>Good wood. Good days.</span></PageContainer>
    </footer>
  );
}

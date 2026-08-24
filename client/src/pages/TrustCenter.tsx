import React, { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, CircleHelp, HeartHandshake, Instagram, LockKeyhole, MapPin, PackageCheck, ShieldCheck, Sparkles, Truck, MessageCircle, RotateCcw } from "lucide-react";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { trpc } from "@/lib/trpc";
import { BrandLogo } from "@/components/BrandLogo";

const faqItems = [
  ["How long does a handmade order take?", "Ready-to-ship pieces are prepared within 2–4 business days. Made-to-order and custom pieces are confirmed with an individual studio timeline before work begins."],
  ["Can I return my order?", "If something arrives damaged or not as expected, contact the studio within 7 days of delivery. We’ll review the order with care and outline the best next step."],
  ["How are custom pieces handled?", "Custom work begins with a studio conversation. Once your direction, timing and quote are confirmed, a dedicated commission place is reserved for your piece."],
  ["Will reviews be shown on the site?", "Yes—once genuine post-purchase feedback is received and verified, it can be shared with its verified-purchase marker. No reviews are published before then."],
];

export default function TrustCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingMessage, setTrackingMessage] = useState("");
  const trackingRequest = trpc.support.requestTracking.useMutation({
    onSuccess: () => setTrackingMessage("Your request is with the studio team. We’ll respond through your order contact channel."),
    onError: (error) => setTrackingMessage(error.message || "We couldn’t send that tracking request. Please try again."),
  });

  const requestTracking = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orderNumber.trim()) {
      setTrackingMessage("Please enter your order number to request an update.");
      return;
    }
    trackingRequest.mutate({ orderNumber: orderNumber.trim() });
  };

  return <div className="trust-page">
    <header className="shop-header"><a href="/" className="shop-home-link" aria-label="DIPIZ CREATION home"><BrandLogo variant="shop" /></a><nav><a href="/">Home</a><a href="/shop">Shop</a><a href="/#collections">Collections</a><a href="/custom">Custom Creation</a><a href="/care" aria-current="page">Care</a></nav><div className="shop-header-actions"><a href="/shop#wishlist" aria-label="Wishlist"><HeartHandshake size={18} /></a></div></header>
    <main>
      <section className="trust-hero section-shell"><div><p className="eyebrow"><Sparkles size={13} /> The DIPIZ care studio</p><h1>Thoughtful, from<br /><em>studio to doorstep.</em></h1><p>Every detail is made to feel clear, calm and cared for—from a secure checkout to the moment your piece finds its place.</p><a href="#support" className="button button-primary">Explore customer care <ArrowRight size={17} /></a></div><div className="trust-hero__card"><div className="trust-hero__seal"><CheckCircle2 size={24} /><span>Handmade with care</span></div><div className="trust-hero__route"><i /><i /><i /><i /></div><p>Studio made<br />Beautifully packed<br />Safely delivered</p></div></section>

      <section className="trust-signals section-shell"><article><LockKeyhole size={19} /><h3>Secure checkout</h3><p>Checkout-enabled pieces hand off to Shopify’s secure checkout flow.</p></article><article><ShieldCheck size={19} /><h3>Verified purchase</h3><p>Genuine customer feedback is only shared after a confirmed purchase.</p></article><article><PackageCheck size={19} /><h3>Order care</h3><p>Each order is checked, wrapped and prepared individually by the studio.</p></article></section>

      <section id="support" className="support-section section-shell"><div className="section-heading split-heading"><div><p className="eyebrow">Customer support</p><h2>Small questions,<br /><em>clear answers.</em></h2></div><p className="section-intro">The studio keeps support personal and uncomplicated. Choose the route that feels easiest.</p></div><div className="support-grid"><div className="track-card"><MapPin size={20} /><p className="eyebrow">Order tracking</p><h3>Where is my order?</h3><p>Enter your order number and we’ll send a request directly to the studio for a status update.</p><form onSubmit={requestTracking}><label className="sr-only" htmlFor="order-number">Order number</label><input id="order-number" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="Order number" /><button disabled={trackingRequest.isPending} aria-label="Request order tracking"><ArrowRight size={16} /></button></form>{trackingMessage && <p className="tracking-message" aria-live="polite"><CheckCircle2 size={14} /> {trackingMessage}</p>}</div><a className="whatsapp-card" href="https://wa.me/?text=Hello%20DIPIZ%20CREATION%2C%20I%20would%20love%20some%20help%20with%20my%20order." target="_blank" rel="noreferrer"><MessageCircle size={21} /><p className="eyebrow">WhatsApp support</p><h3>Speak with the studio.</h3><p>Send a short note and we’ll continue with a thoughtful, human response.</p><span>Open WhatsApp <ArrowRight size={16} /></span></a></div></section>

      <section className="care-grid-section"><div className="section-shell"><div className="care-grid"><article><Truck size={20} /><p className="eyebrow">Shipping information</p><h3>Made with time in mind.</h3><p>Ready pieces leave the studio in 2–4 business days. Commission and made-to-order timing is confirmed before each piece begins.</p></article><article><RotateCcw size={20} /><p className="eyebrow">Returns &amp; refunds</p><h3>Care if something isn’t right.</h3><p>If a piece arrives damaged or different from what was confirmed, contact the studio within 7 days so we can review and help.</p></article><article><LockKeyhole size={20} /><p className="eyebrow">Secure checkout</p><h3>A clear, protected finish.</h3><p>Checkout-enabled products use the Shopify checkout handoff. Your payment details are never stored inside DIPIZ CREATION.</p></article></div></div></section>

      <section className="faq-section section-shell"><div className="section-heading"><p className="eyebrow"><CircleHelp size={13} /> Frequently asked questions</p><h2>Care, clearly <em>explained.</em></h2></div><div className="faq-list">{faqItems.map(([question, answer], index) => <article key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>{question}<ChevronDown size={17} className={openFaq === index ? "is-rotated" : ""} /></button>{openFaq === index && <p>{answer}</p>}</article>)}</div></section>

      <section className="customer-evidence section-shell"><div className="customer-evidence__copy"><p className="eyebrow">Customer reviews &amp; gallery</p><h2>A place for<br /><em>real stories.</em></h2><p>Verified customer reviews and customer-shared photos will appear here as permissioned feedback is received. This keeps the studio’s proof as honest as the work itself.</p><div className="verified-label"><ShieldCheck size={15} /> Verified purchase feedback only</div></div><div className="customer-evidence__tiles"><div><span>Reviews</span><strong>Awaiting first verified collector notes</strong></div><div><span>Customer gallery</span><strong>Shared pieces will arrive here, with permission</strong></div></div></section>

      <section className="story-process-section"><div className="section-shell"><div className="story-process-heading"><p className="eyebrow"><Instagram size={13} /> Behind the scenes</p><h2>The beauty is<br />in the <em>making.</em></h2><p>From a table scattered with colour studies to the final wrap of a finished piece, the studio is a slow, material-led practice.</p></div><div className="story-process-gallery"><div className="story-process-tile tile-clay"><span>Clay</span></div><div className="story-process-tile tile-resin"><span>Resin</span></div><div className="story-process-tile tile-wrap"><span>Wrapped with care</span></div></div><a href="/#story" className="text-link">Read our story <ArrowRight size={16} /></a></div></section>
    </main>
    <footer className="trust-footer section-shell"><a href="/"><ArrowLeft size={15} /> Return to DIPIZ CREATION</a><span>Made by hand. Supported with care.</span></footer>
    <MobileBottomNav active="home" />
  </div>;
}

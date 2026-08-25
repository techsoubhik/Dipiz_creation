import React, { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Instagram,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { DIPIZ_INSTAGRAM_HANDLE, DIPIZ_INSTAGRAM_URL } from "@/lib/socialLinks";
import { dipizBrandAssets } from "@/lib/brandAssets";
import { calculateBagTotal, products, type BagItem, type Product } from "@/lib/storefrontData";

const heroImage = dipizBrandAssets.hero;

function ProductArtwork({ product }: { product: Product }) {
  return (
    <div className={`artwork ${product.artClass}`} aria-hidden="true">
      <span className="artwork-foil" />
      <span className="artwork-mark mark-one" />
      <span className="artwork-mark mark-two" />
      <span className="artwork-mark mark-three" />
    </div>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bag, setBag] = useState<BagItem[]>([]);
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const bagCount = bag.reduce((count, item) => count + item.quantity, 0);
  const bagTotal = useMemo(() => calculateBagTotal(bag), [bag]);

  const addToBag = (product: Product) => {
    setBag((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setSelectedProduct(null);
    setIsBagOpen(true);
  };

  const updateQuantity = (id: number, direction: 1 | -1) => {
    setBag((current) => current
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + direction } : item)
      .filter((item) => item.quantity > 0));
  };

  const submitNewsletter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterMessage(email ? "You’re on the studio list. Thank you." : "Please enter your email address.");
    if (email) setEmail("");
  };

  return (
    <div className="site-shell">
      <div className="announcement-bar">Complimentary delivery on orders over $120 <span>·</span> Made in small, intentional batches</div>

      <header className="site-header">
        <button className="icon-button mobile-menu" onClick={() => setIsMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        <a href="#top" className="logo-link" aria-label="DIPIZ CREATION home"><BrandLogo /></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#top">Home</a>
          <a href="/shop">Shop</a>
          <a href="#collections">Collections</a>
          <a href="/custom">Custom Creation</a>
          <a href="#story">About</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button desktop-search" aria-label="Search the collection"><Search size={19} /></button>
          <button className="icon-button desktop-search" onClick={() => setSelectedProduct(products[0])} aria-label="View wishlist"><Heart size={18} /></button>
          <button className="bag-button" onClick={() => setIsBagOpen(true)} aria-label={`Open shopping bag with ${bagCount} items`}>
            <ShoppingBag size={19} />
            <span className="bag-count">{bagCount}</span>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy reveal-up">
            <p className="eyebrow"><Sparkles size={13} /> Art &amp; design, softly composed</p>
            <h1 id="hero-title">Art, <em>Made<br />Personal.</em></h1>
            <p className="hero-description">Original art, thoughtful paper goods and soulful design pieces for the moments you want to make entirely your own.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="/shop">Shop collection <ArrowDownRight size={17} /></a>
              <a className="text-link" href="/custom">Create something custom <span>↗</span></a>
            </div>
          </div>
          <div className="hero-visual reveal-scale">
            <div className="hero-arch">
              <img src={heroImage} alt="An editorial still life of handmade art materials and ivory ceramic forms" />
            </div>
            <div className="hero-note">Made for slow, beautiful<br />everyday moments</div>
            <div className="hero-brand" aria-label="DIPIZ CREATION brand mark"><BrandLogo variant="hero" /></div>
          </div>
        </section>

        <section id="collections" className="collections-section section-shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Discover the collections</p>
              <h2>For the spaces<br />you <em>hold dear.</em></h2>
            </div>
            <p className="section-intro">Small visual stories designed to be collected, gifted and lived with.</p>
          </div>
          <div className="collection-grid">
            <a href="#new" className="collection-card collection-card--paper">
              <div className="collection-art"><div className="paper-stack"><i /><i /><i /></div></div>
              <div className="collection-card__footer"><span>Paper &amp; Prints</span><ArrowRight size={17} /></div>
            </a>
            <a href="#new" className="collection-card collection-card--objects">
              <div className="collection-art"><div className="vessel vessel-one" /><div className="vessel vessel-two" /><div className="vessel vessel-three" /></div>
              <div className="collection-card__footer"><span>Artful Objects</span><ArrowRight size={17} /></div>
            </a>
            <a href="#new" className="collection-card collection-card--gifts">
              <div className="collection-art"><div className="gift-box"><i /><b /></div></div>
              <div className="collection-card__footer"><span>Gifts with Feeling</span><ArrowRight size={17} /></div>
            </a>
          </div>
        </section>

        <section id="shop" className="featured-section section-shell">
          <div className="section-heading featured-heading">
            <div>
              <p className="eyebrow">Best sellers</p>
              <h2>Most <em>loved</em> by the studio.</h2>
            </div>
            <a className="text-link" href="/shop">Shop all pieces <ChevronRight size={17} /></a>
          </div>
          <div className="product-grid">
            {products.map((product, index) => (
              <article className="product-card" key={product.id}>
                <button className="product-image" onClick={() => setSelectedProduct(product)} aria-label={`Quick view ${product.name}`}>
                  <ProductArtwork product={product} />
                  <span className="product-tag">{index === 0 ? "New arrival" : product.accent}</span>
                  <span className="quick-view"><Search size={15} /> Quick view</span>
                </button>
                <div className="product-card__copy">
                  <div><h3>{product.name}</h3><p>{product.edition}</p></div>
                  <strong>${product.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="arrivals-section section-shell" aria-labelledby="arrivals-title">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">New arrivals</p>
              <h2 id="arrivals-title">Fresh from the <em>atelier.</em></h2>
            </div>
            <a className="text-link" href="#shop">See what’s new <ArrowRight size={17} /></a>
          </div>
          <div className="arrival-grid">
            {products.slice(1).map((product) => (
              <button className="arrival-card" key={product.id} onClick={() => setSelectedProduct(product)}>
                <div className={`arrival-card__art ${product.artClass}`}><ProductArtwork product={product} /></div>
                <div><span>Just arrived</span><h3>{product.name}</h3><p>{product.edition}</p></div>
              </button>
            ))}
          </div>
        </section>

        <section className="gift-section">
          <div className="gift-section__image"><ProductArtwork product={products[3]} /></div>
          <div className="gift-section__copy section-shell">
            <p className="eyebrow">Gift collection</p>
            <h2>Give something<br /><em>with feeling.</em></h2>
            <p>Thoughtful art objects and small paper treasures, chosen to mark a moment and keep it close.</p>
            <a className="button button-light" href="#shop">Shop meaningful gifts <ArrowRight size={17} /></a>
          </div>
        </section>

        <section id="custom" className="custom-section section-shell">
          <div className="custom-card">
            <div className="custom-card__copy">
              <p className="eyebrow">Custom creation</p>
              <h2>Your idea,<br /><em>made tangible.</em></h2>
              <p>For gifting, occasions and the spaces you love, the studio offers a small number of custom art and design commissions each season.</p>
              <a className="button button-primary" href="/custom">Begin a custom piece <ArrowRight size={17} /></a>
            </div>
            <div className="custom-card__visual" aria-hidden="true"><div className="custom-paper custom-paper--one" /><div className="custom-paper custom-paper--two" /><div className="custom-paper custom-paper--three" /><span>DC</span></div>
          </div>
        </section>

        <section id="story" className="story-section">
          <div className="story-image"><img src={heroImage} alt="A calm handcrafted studio still life" /></div>
          <div className="story-copy section-shell">
            <p className="eyebrow">Behind the art</p>
            <h2>Made with a <em>gentle eye</em> for detail.</h2>
            <p>Each piece begins with a feeling: the warmth of gathered paper, the softness of a painted petal, or the small joy of an object made by hand.</p>
            <p>Our studio works in limited runs, with considered materials and an enduring point of view. Nothing rushed. Everything chosen.</p>
            <a href="#newsletter" className="button button-light">About our practice <ArrowRight size={17} /></a>
          </div>
        </section>

        <section className="reviews-section section-shell" aria-labelledby="reviews-title">
          <div className="reviews-heading">
            <div><p className="eyebrow">Customer reviews</p><h2 id="reviews-title">A place for <em>collector notes.</em></h2></div>
            <div className="reviews-mark"><Star size={15} /><span>Verified reviews will appear here as they’re received.</span></div>
          </div>
          <div className="reviews-empty">
            <div className="reviews-empty__seal">DC</div>
            <p>The collection is just beginning its journey. When pieces find their homes, verified customer reflections will be shared here.</p>
          </div>
        </section>

        <section className="studio-note section-shell">
          <div className="quote-mark">“</div>
          <blockquote>For the thoughtful giver,<br />the sentimental soul, <em>the beautifully at home.</em></blockquote>
          <p>— A note from the DIPIZ CREATION studio</p>
        </section>

        <section className="instagram-section section-shell" aria-labelledby="instagram-title">
          <div className="instagram-heading"><div><p className="eyebrow"><Instagram size={13} /> Studio on Instagram</p><h2 id="instagram-title">Follow the <em>process.</em></h2></div><a className="text-link" href={DIPIZ_INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label={`Open ${DIPIZ_INSTAGRAM_HANDLE} on Instagram`}>{DIPIZ_INSTAGRAM_HANDLE} <ArrowRight size={17} /></a></div>
          <div className="instagram-grid" aria-label="DIPIZ CREATION studio gallery">
            <div className="instagram-tile instagram-tile--one"><ProductArtwork product={products[0]} /></div>
            <div className="instagram-tile instagram-tile--two"><div className="studio-vase" /></div>
            <div className="instagram-tile instagram-tile--three"><ProductArtwork product={products[2]} /></div>
            <div className="instagram-tile instagram-tile--four"><div className="studio-paper"><i /><i /><i /></div></div>
            <div className="instagram-tile instagram-tile--five"><ProductArtwork product={products[3]} /></div>
          </div>
          <a className="instagram-follow" href={DIPIZ_INSTAGRAM_URL} target="_blank" rel="noreferrer"><Instagram size={16} /> Follow {DIPIZ_INSTAGRAM_HANDLE} on Instagram <ArrowRight size={16} /></a>
        </section>

        <section id="newsletter" className="newsletter-section">
          <div className="newsletter-orb orb-one" /><div className="newsletter-orb orb-two" />
          <div className="newsletter-content">
            <p className="eyebrow">A little note from us</p>
            <h2>Stay close to<br /><em>what’s blooming.</em></h2>
            <p>First looks at fresh pieces, quiet studio moments and thoughtful gifting ideas, delivered softly.</p>
            <form onSubmit={submitNewsletter} className="newsletter-form">
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Your email address" />
              <button type="submit" aria-label="Join the studio list"><ArrowRight size={19} /></button>
            </form>
            {newsletterMessage && <p className="newsletter-message"><Check size={14} /> {newsletterMessage}</p>}
          </div>
        </section>
      </main>

      <footer className="site-footer section-shell">
        <BrandLogo variant="home-compact" />
        <p>Handmade art &amp; design for more considered everyday living.</p>
        <div className="footer-links"><a href="/shop">Shop</a><a href="#story">Studio</a><a href="/care">Care</a><a href={DIPIZ_INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a></div>
        <span>© {new Date().getFullYear()} DIPIZ CREATION</span>
      </footer>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="menu-sheet">
          <SheetTitle className="sr-only">DIPIZ CREATION menu</SheetTitle>
          <SheetDescription className="sr-only">Navigate through the DIPIZ CREATION storefront.</SheetDescription>
          <BrandLogo variant="home-compact" />
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {[["Home", "#top"], ["Shop", "/shop"], ["Collections", "#collections"], ["Custom Creation", "/custom"], ["About", "#story"], ["Studio notes", "#newsletter"]].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setIsMenuOpen(false)}>{label}<ArrowRight size={19} /></a>
            ))}
          </nav>
          <div className="mobile-utility-links">
            <button onClick={() => { setIsMenuOpen(false); setSelectedProduct(products[0]); }}><Search size={16} /> Search the collection</button>
            <button onClick={() => { setIsMenuOpen(false); setSelectedProduct(products[0]); }}><Heart size={16} /> Wishlist</button>
            <button onClick={() => { setIsMenuOpen(false); setIsBagOpen(true); }}><ShoppingBag size={16} /> Shopping bag <span>{bagCount}</span></button>
          </div>
          <div className="menu-sheet__bottom"><p>Made slowly in limited batches.</p><span>Art &amp; Design</span></div>
        </SheetContent>
      </Sheet>

      <Sheet open={isBagOpen} onOpenChange={setIsBagOpen}>
        <SheetContent side="right" className="bag-sheet">
          <SheetTitle>Your bag <span>({bagCount})</span></SheetTitle>
          <SheetDescription>Pieces collected for your everyday ritual.</SheetDescription>
          {bag.length === 0 ? (
            <div className="bag-empty"><ShoppingBag size={26} /><p>Your bag is ready for something beautiful.</p><button className="button button-primary" onClick={() => { setIsBagOpen(false); document.querySelector("#new")?.scrollIntoView({ behavior: "smooth" }); }}>Browse the collection</button></div>
          ) : (
            <div className="bag-content">
              <div className="bag-items">{bag.map((item) => <div className="bag-item" key={item.id}><div className={`bag-item__art ${item.artClass}`}><ProductArtwork product={item} /></div><div className="bag-item__copy"><h3>{item.name}</h3><p>${item.price}</p><div className="quantity-control"><button onClick={() => updateQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}><Plus size={13} /></button></div></div></div>)}</div>
              <div className="bag-summary"><div><span>Subtotal</span><strong>${bagTotal}</strong></div><button className="button button-primary" onClick={() => setNewsletterMessage("Your bag is saved. Checkout can be connected when your commerce provider is ready.")}>Continue to checkout <ArrowRight size={17} /></button></div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {selectedProduct && (
        <div className="quick-view-overlay" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
          <button className="quick-view-backdrop" onClick={() => setSelectedProduct(null)} aria-label="Close quick view" />
          <div className="quick-view-panel">
            <button className="close-quick-view" onClick={() => setSelectedProduct(null)} aria-label="Close quick view"><X size={18} /></button>
            <div className="quick-view-art"><ProductArtwork product={selectedProduct} /></div>
            <div className="quick-view-copy"><p className="eyebrow">{selectedProduct.accent} collection</p><h2 id="quick-view-title">{selectedProduct.name}</h2><p>{selectedProduct.edition}</p><strong>${selectedProduct.price}</strong><p className="quick-view-detail">Created in a limited studio run with a focus on tactile detail and a softly expressive palette.</p><button className="button button-primary" onClick={() => addToBag(selectedProduct)}>Add to bag <ShoppingBag size={17} /></button><button className="save-button"><Heart size={16} /> Save for later</button></div>
          </div>
        </div>
      )}
      <MobileBottomNav active="home" />
    </div>
  );
}

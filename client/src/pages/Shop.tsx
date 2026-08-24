import React, { useMemo, useState } from "react";
import { ArrowRight, Check, Heart, Search, ShoppingBag, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { calculateBagTotal, filterProducts, productCategories, products, type BagItem, type PriceFilter, type Product, type ProductCategory, type SortOption } from "@/lib/storefrontData";
import { addProductToLocalBag, toggleWishlistItem } from "@/lib/shoppingState";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BrandLogo } from "@/components/BrandLogo";

function ProductArtwork({ product, variant = 0 }: { product: Product; variant?: number }) {
  return <div className={`artwork ${product.artClass} product-art-variant-${variant}`} aria-hidden="true"><span className="artwork-foil" /><span className="artwork-mark mark-one" /><span className="artwork-mark mark-two" /><span className="artwork-mark mark-three" /></div>;
}

export default function Shop() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [price, setPrice] = useState<PriceFilter>("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [bag, setBag] = useState<BagItem[]>([]);
  const [notice, setNotice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visibleProducts = useMemo(() => filterProducts({ query, category, price, sort }), [query, category, price, sort]);
  const bagCount = bag.reduce((count, item) => count + item.quantity, 0);
  const bagTotal = calculateBagTotal(bag);
  const addToBag = (product: Product, message = "Added to your bag") => {
    setBag((current) => addProductToLocalBag(current, product));
    setNotice(`${product.name} · ${message}`);
  };
  const toggleWishlist = (id: number) => setWishlist((current) => toggleWishlistItem(current, id));

  return <div className="shop-page">
    <header className="shop-header">
      <a href="/" className="shop-home-link" aria-label="DIPIZ CREATION home"><BrandLogo variant="shop" /></a>
      <nav><a href="/">Home</a><a href="/shop" aria-current="page">Shop</a><a href="/#collections">Collections</a><a href="/custom">Custom Creation</a><a href="/#story">About</a></nav>
      <div className="shop-header-actions"><a href="/shop#search" aria-label="Search products"><Search size={18} /></a><a href="#shop-wishlist" aria-label={`Wishlist with ${wishlist.size} saved items`}><Heart size={18} /><span>{wishlist.size}</span></a><a href="#shop-cart" aria-label={`Shopping bag with ${bagCount} items`}><ShoppingBag size={18} /><span>{bagCount}</span></a></div>
    </header>

    <main>
      <section className="shop-hero section-shell"><p className="eyebrow"><Sparkles size={13} /> The DIPIZ collection</p><h1>Pieces to keep,<br /><em>gift and gather.</em></h1><p>Handmade art and thoughtful objects for small celebrations, sentimental spaces and everyday beauty.</p></section>

      <section id="search" className="shop-browser section-shell" aria-label="Browse products">
        <div className="shop-browser__top"><div><p className="eyebrow">Shop all art &amp; design</p><h2>Find your <em>piece.</em></h2></div><p className="shop-count">{visibleProducts.length} pieces available</p></div>
        <div className="shop-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search art, materials and gift ideas" aria-label="Search the shop" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}</div>
        <div className="filter-toolbar">
          <div className="filter-categories" aria-label="Product categories"><button className={category === "All" ? "is-active" : ""} onClick={() => setCategory("All")}>All pieces</button>{productCategories.map((item) => <button key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <button className="mobile-filter-trigger" onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal size={16} /> Filters</button>
        </div>
        <div className={`shop-controls ${filtersOpen ? "is-open" : ""}`}>
          <label>Price<select value={price} onChange={(event) => setPrice(event.target.value as PriceFilter)}><option>All</option><option>Under $50</option><option>$50 – $100</option><option>$100 – $175</option><option>$175+</option></select></label>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="newest">Newest</option><option value="best-selling">Best Selling</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option></select></label>
        </div>
        {notice && <div className="shop-notice"><Check size={14} /> {notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
        {visibleProducts.length ? <div className="shop-product-grid">{visibleProducts.map((product, index) => <article className="shop-product-card" key={product.id}>
          <div className="shop-product-card__image"><a href={`/product/${product.id}`} aria-label={`View ${product.name}`}><ProductArtwork product={product} variant={index % 3} /></a><span className="shop-product-card__badge">{product.isNew ? "New" : product.accent}</span><button className={wishlist.has(product.id) ? "wishlist-button is-saved" : "wishlist-button"} onClick={() => toggleWishlist(product.id)} aria-label={`Save ${product.name} to wishlist`} aria-pressed={wishlist.has(product.id)}><Heart size={16} fill={wishlist.has(product.id) ? "currentColor" : "none"} /></button><button className="quick-add" onClick={() => product.checkoutHandle ? addToBag(product, "quick added") : setNotice(`${product.name} is a made-to-order studio piece. Explore its details to enquire.`)}>{product.checkoutHandle ? <>Quick Add <ShoppingBag size={14} /></> : "View commission"}</button></div>
          <div className="shop-product-card__info"><div><span>{product.category}</span><h3>{product.name}</h3><p>{product.edition}</p><small>Not yet rated · review after purchase</small></div><strong>${product.price}</strong></div>
          <div className="shop-product-card__actions"><button className="card-add-button" onClick={() => product.checkoutHandle ? addToBag(product) : setNotice(`${product.name} is made to order. Open the product page to enquire.`)}>{product.checkoutHandle ? "Add to Cart" : "Request piece"}</button><a href={`/product/${product.id}`}>{product.checkoutHandle ? <>Buy Now <ArrowRight size={14} /></> : <>View details <ArrowRight size={14} /></>}</a></div>
        </article>)}</div> : <div className="shop-empty"><p>No pieces match those filters just now.</p><button onClick={() => { setQuery(""); setCategory("All"); setPrice("All"); }}>Clear filters</button></div>}
      </section>
      <section id="shop-wishlist" className="shop-utility-section section-shell" aria-labelledby="wishlist-heading"><div><p className="eyebrow">Wishlist</p><h2 id="wishlist-heading">Pieces you’re<br /><em>keeping close.</em></h2></div>{wishlist.size ? <div className="shop-utility-list">{products.filter((product) => wishlist.has(product.id)).map((product) => <a href={`/product/${product.id}`} key={product.id}><span className={`mini-art ${product.artClass}`}><ProductArtwork product={product} /></span><span><strong>{product.name}</strong><small>{product.edition}</small></span><ArrowRight size={16} /></a>)}</div> : <div className="shop-utility-empty"><Heart size={20} /><p>Save a piece from the collection and it will appear here for this visit.</p><a className="text-link" href="#search">Browse the collection <ArrowRight size={15} /></a></div>}</section>
      <section id="shop-cart" className="shop-utility-section shop-cart-section section-shell" aria-labelledby="cart-heading"><div><p className="eyebrow">Shopping bag</p><h2 id="cart-heading">Your calm<br /><em>little collection.</em></h2></div>{bagCount ? <div className="shop-utility-list">{bag.map((item) => <div key={item.id}><span className={`mini-art ${item.artClass}`}><ProductArtwork product={item} /></span><span><strong>{item.name} × {item.quantity}</strong><small>${item.price * item.quantity}</small></span></div>)}<div className="shop-cart-total"><span>Subtotal</span><strong>${bagTotal}</strong></div></div> : <div className="shop-utility-empty"><ShoppingBag size={20} /><p>Your bag is ready when you find something beautiful.</p><a className="text-link" href="#search">Shop pieces <ArrowRight size={15} /></a></div>}</section>
    </main>
    <MobileBottomNav active="shop" />
  </div>;
}

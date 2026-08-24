import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Minus, Plus, Ruler, ShieldCheck, ShoppingBag, Sparkles, Star, Truck } from "lucide-react";
import { getProductById, products, type Product } from "@/lib/storefrontData";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { useRoute } from "wouter";

function ProductArtwork({ product, variant = 0 }: { product: Product; variant?: number }) {
  return <div className={`artwork ${product.artClass} product-art-variant-${variant}`} aria-hidden="true"><span className="artwork-foil" /><span className="artwork-mark mark-one" /><span className="artwork-mark mark-two" /><span className="artwork-mark mark-three" /></div>;
}

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const product = getProductById(Number(params?.id));
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [openDetail, setOpenDetail] = useState<"care" | "shipping" | null>(null);
  const liveHandle = product?.checkoutHandle ?? null;
  const { data: liveProduct } = trpc.commerce.products.byHandle.useQuery(
    { handle: liveHandle ?? "blush-reverie" },
    { enabled: Boolean(liveHandle) }
  );
  const { addItem, itemCount } = useCart();

  const related = useMemo(() => product ? products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3) : [], [product]);
  if (!product) return <div className="product-not-found"><a href="/shop"><ArrowLeft size={16} /> Return to shop</a><h1>This piece has found another path.</h1></div>;
  const addToBag = async (intent: "cart" | "buy") => {
    const variant = liveProduct?.variants[0];
    if (!variant) {
      setNotice("This made-to-order piece is being prepared for online checkout. Please join the studio list for availability.");
      return;
    }
    const cart = await addItem(variant.id, quantity);
    if (intent === "buy" && cart?.checkoutUrl) {
      window.open(cart.checkoutUrl, "_blank", "noopener,noreferrer");
      setNotice("Opening secure Shopify checkout in a new tab.");
      return;
    }
    setNotice(`${quantity} ${product.name}${quantity > 1 ? " pieces" : ""} added to your bag.`);
  };

  return <div className="product-page">
    <header className="shop-header"><a href="/" className="shop-home-link" aria-label="DIPIZ CREATION home"><BrandLogo variant="shop" /></a><nav><a href="/">Home</a><a href="/shop">Shop</a><a href="/#collections">Collections</a><a href="/custom">Custom Creation</a><a href="/#story">About</a></nav><div className="shop-header-actions"><button onClick={() => setSaved((current) => !current)} aria-label="Save to wishlist" aria-pressed={saved}><Heart size={18} fill={saved ? "currentColor" : "none"} /><span>{saved ? 1 : 0}</span></button><button onClick={() => setNotice(itemCount ? `${itemCount} item${itemCount === 1 ? "" : "s"} currently in your Shopify bag.` : "Your bag is ready for something beautiful.")} aria-label="Open shopping bag"><ShoppingBag size={18} /><span>{itemCount}</span></button></div></header>
    <main className="product-detail section-shell">
      <a className="back-to-shop" href="/shop"><ArrowLeft size={15} /> Back to the collection</a>
      <div className="product-detail__layout">
        <div className="detail-gallery"><div className="detail-thumbs">{[0, 1, 2].map((image) => <button key={image} onClick={() => setActiveImage(image)} className={activeImage === image ? "is-active" : ""} aria-label={`View product image ${image + 1}`}><ProductArtwork product={product} variant={image} /></button>)}</div><button className={zoomed ? "detail-gallery__stage is-zoomed" : "detail-gallery__stage"} onClick={() => setZoomed((current) => !current)} aria-label="Toggle image zoom"><ProductArtwork product={product} variant={activeImage} /><span>{zoomed ? "Tap to zoom out" : "Tap image to zoom"}</span></button></div>
        <div className="product-detail__info"><p className="eyebrow"><Sparkles size={13} /> {product.category}</p><h1>{product.name}</h1><p className="product-detail__edition">{product.edition}</p><div className="product-detail__rating"><Star size={15} /><span>Not yet rated</span><small>Be the first to review after purchase</small></div><p className="product-detail__price">${product.price}</p><p className="product-detail__description">{product.description}</p><div className="availability"><Check size={15} /> {product.availability}</div><div className="quantity-select"><span>Quantity</span><div><button onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Decrease quantity"><Minus size={14} /></button><strong>{quantity}</strong><button onClick={() => setQuantity((current) => current + 1)} aria-label="Increase quantity"><Plus size={14} /></button></div></div><div className="product-detail__actions">{liveHandle ? <><button onClick={() => addToBag("cart")} className="button button-primary">Add to Cart <ShoppingBag size={17} /></button><button onClick={() => addToBag("buy")} className="buy-now">Buy Now <ArrowRight size={17} /></button></> : <a href="/#custom" className="button button-primary">Enquire about this custom piece <ArrowRight size={17} /></a>}</div>{notice && <div className="detail-notice"><Check size={14} /> {notice}</div>}
          <div className="detail-facts"><div><Ruler size={17} /><span><b>Dimensions</b>{product.dimensions}</span></div><div><ShieldCheck size={17} /><span><b>Materials</b>{product.materials}</span></div><div><Truck size={17} /><span><b>Shipping</b>{product.shipping}</span></div></div>
          <div className="detail-accordions"><button onClick={() => setOpenDetail(openDetail === "care" ? null : "care")}>Care instructions <ChevronDown size={17} className={openDetail === "care" ? "is-rotated" : ""} /></button>{openDetail === "care" && <p>{product.care}</p>}<button onClick={() => setOpenDetail(openDetail === "shipping" ? null : "shipping")}>Shipping information <ChevronDown size={17} className={openDetail === "shipping" ? "is-rotated" : ""} /></button>{openDetail === "shipping" && <p>{product.shipping}</p>}</div>
        </div>
      </div>
      <section className="related-products"><div className="section-heading"><p className="eyebrow">You may also love</p><h2>Related <em>pieces.</em></h2></div><div className="related-products__grid">{related.length ? related.map((item, index) => <a href={`/product/${item.id}`} key={item.id} className="related-product"><div><ProductArtwork product={item} variant={index} /></div><span>{item.category}</span><h3>{item.name}</h3><p>${item.price}</p></a>) : <a href="/shop" className="related-product related-product--browse">Explore all art &amp; design <ArrowRight size={17} /></a>}</div></section>
    </main>
    <MobileBottomNav active="shop" />
  </div>;
}

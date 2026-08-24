import React from "react";
import { Heart, Home, ShoppingBag, Store } from "lucide-react";

export function MobileBottomNav({ active, onNavigate }: { active: "home" | "shop" | "wishlist" | "cart"; onNavigate?: (href: string) => void }) {
  const links = [
    { label: "Home", href: "/", icon: Home, key: "home" },
    { label: "Shop", href: "/shop", icon: Store, key: "shop" },
    { label: "Wishlist", href: "/shop#shop-wishlist", icon: Heart, key: "wishlist" },
    { label: "Cart", href: "/shop#shop-cart", icon: ShoppingBag, key: "cart" },
  ] as const;

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
    const hash = href.split("#")[1];
    if (hash) document.getElementById(hash)?.scrollIntoView?.({ block: "start" });
    onNavigate?.(href);
  };

  return <nav className="mobile-bottom-nav" aria-label="Mobile store navigation">{links.map(({ label, href, icon: Icon, key }) => <a key={key} href={href} onClick={(event) => navigate(event, href)} className={active === key ? "is-active" : ""} aria-current={active === key ? "page" : undefined}><Icon size={18} /><span>{label}</span></a>)}</nav>;
}

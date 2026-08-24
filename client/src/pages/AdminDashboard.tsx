import React, { useMemo, useState } from "react";
import {
  Bell,
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Crown,
  HeartHandshake,
  Layers3,
  LockKeyhole,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { BrandLogo } from "@/components/BrandLogo";
import "./AdminDashboard.css";
import "./AdminDashboardExtras.css";

type AdminTab = "overview" | "orders" | "custom" | "products" | "customers" | "operations";

const orderStatusLabels = {
  new: "New",
  confirmed: "Confirmed",
  processing: "Processing",
  preparing: "Handmade / Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
} as const;

const customStatusLabels = {
  new: "New Request",
  discussing: "Discussing",
  confirmed: "Confirmed",
  creating: "Creating",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;

type OrderStatus = keyof typeof orderStatusLabels;
type CustomStatus = keyof typeof customStatusLabels;

function formatMoney(value: string | number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function AdminLogin() {
  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <BrandLogo variant="admin-auth" />
        <div className="admin-auth-card__icon"><LockKeyhole size={24} /></div>
        <p className="eyebrow">Private studio access</p>
        <h1>Admin<br /><em>workspace.</em></h1>
        <p>This area is private. Sign in with the approved project owner account to manage orders and commissions.</p>
        <button className="button button-primary" onClick={startLogin}>Secure sign in <ChevronRight size={17} /></button>
      </div>
    </div>
  );
}

function AdminRestricted({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <div className="admin-auth-card__icon"><ShieldCheck size={24} /></div>
        <p className="eyebrow">Private studio access</p>
        <h1>Access<br /><em>restricted.</em></h1>
        <p>This account is signed in but has not been approved for private studio management.</p>
        <button className="button button-primary" onClick={onSignOut}>Sign out <ChevronRight size={17} /></button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [workflowFeedback, setWorkflowFeedback] = useState("");
  const isAdmin = user?.role === "admin";

  const dashboard = trpc.admin.dashboard.useQuery(undefined, { enabled: isAdmin, refetchInterval: 30_000 });
  const orders = trpc.admin.orders.list.useQuery(undefined, { enabled: isAdmin });
  const customOrders = trpc.admin.customOrders.list.useQuery(undefined, { enabled: isAdmin });
  const customers = trpc.admin.customers.useQuery(undefined, { enabled: isAdmin });
  const operations = trpc.admin.operations.useQuery(undefined, { enabled: isAdmin });
  const products = trpc.commerce.products.list.useQuery(undefined, { enabled: isAdmin });
  const orderDetail = trpc.admin.orders.byId.useQuery(
    { id: selectedOrderId ?? 0 },
    { enabled: isAdmin && selectedOrderId !== null },
  );
  const utils = trpc.useUtils();
  const updateOrderStatus = trpc.admin.orders.updateStatus.useMutation({
    onMutate: () => setWorkflowFeedback("Saving order status…"),
    onSuccess: () => {
      setWorkflowFeedback("Order status saved.");
      utils.admin.dashboard.invalidate();
      utils.admin.orders.list.invalidate();
      if (selectedOrderId) utils.admin.orders.byId.invalidate({ id: selectedOrderId });
    },
    onError: () => setWorkflowFeedback("Order update could not be saved. Please try again."),
  });
  const updateCustomOrder = trpc.admin.customOrders.update.useMutation({
    onMutate: () => setWorkflowFeedback("Saving custom-request update…"),
    onSuccess: () => {
      setWorkflowFeedback("Custom-request update saved.");
      utils.admin.dashboard.invalidate();
      utils.admin.customOrders.list.invalidate();
    },
    onError: () => setWorkflowFeedback("Custom-request update could not be saved. Please try again."),
  });
  const markRead = trpc.admin.notifications.markRead.useMutation({
    onSuccess: () => utils.admin.dashboard.invalidate(),
  });

  const filteredOrders = useMemo(() => {
    return (orders.data ?? []).filter((order) => {
      const searchText = [order.orderNumber, order.customerName, order.customerEmail, order.customerPhone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (!query || searchText.includes(query.toLowerCase())) && (statusFilter === "all" || order.orderStatus === statusFilter);
    });
  }, [orders.data, query, statusFilter]);

  if (loading) return <div className="admin-loading"><div className="admin-loading__mark">DC</div><span>Opening the studio desk…</span></div>;
  if (!isAuthenticated) return <AdminLogin />;
  if (!isAdmin) return <AdminRestricted onSignOut={() => logout()} />;

  const tabs: { key: AdminTab; label: string; icon: typeof Layers3 }[] = [
    { key: "overview", label: "Overview", icon: Layers3 },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "custom", label: "Custom", icon: Sparkles },
    { key: "products", label: "Products", icon: Boxes },
    { key: "customers", label: "Customers", icon: Users },
    { key: "operations", label: "Operations", icon: ClipboardList },
  ];
  const notificationCount = dashboard.data?.notifications.filter((item) => !item.isRead).length ?? 0;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="admin-logo-link" aria-label="DIPIZ CREATION storefront"><BrandLogo variant="admin" /></a>
        <div className="admin-owner"><Crown size={15} /><span>Studio owner</span></div>
        <nav aria-label="Administration navigation">
          {tabs.map(({ key, label, icon: Icon }) => <button key={key} className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}><Icon size={17} />{label}</button>)}
        </nav>
        <div className="admin-sidebar__footer"><a href="/">View storefront <ChevronRight size={14} /></a><button onClick={() => logout()}>Sign out</button></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div><p className="eyebrow">DIPIZ CREATION / PRIVATE</p><h1>{tabs.find((item) => item.key === tab)?.label}</h1></div>
          <div className="admin-topbar__actions">
            <button className="admin-bell" onClick={() => setTab("overview")} aria-label="View new order notifications"><Bell size={18} />{notificationCount ? <span>{notificationCount}</span> : null}</button>
            <div className="admin-profile"><span>{user?.name?.slice(0, 1).toUpperCase() || "D"}</span><div><strong>{user?.name || "Studio owner"}</strong><small>Owner account</small></div></div>
          </div>
        </header>

        {workflowFeedback && <p className="admin-workflow-feedback" role="status">{workflowFeedback}</p>}
        {tab === "overview" && <Overview dashboard={dashboard.data} onOrders={() => setTab("orders")} onSelectOrder={(id) => { setSelectedOrderId(id); setTab("orders"); }} onRead={(id) => markRead.mutate({ id })} />}
        {tab === "orders" && <OrdersTab query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} orders={filteredOrders} onSelect={setSelectedOrderId} />}
        {tab === "custom" && <CustomOrdersTab customOrders={customOrders.data ?? []} isSaving={updateCustomOrder.isPending} onUpdate={(id, status, notes) => updateCustomOrder.mutate({ id, status, internalNotes: notes })} />}
        {tab === "products" && <ProductsTab products={products.data ?? []} loading={products.isLoading} error={products.isError ? "Catalog connection is unavailable right now." : ""} />}
        {tab === "customers" && <CustomersTab customers={customers.data ?? []} />}
        {tab === "operations" && <OperationsTab data={operations.data} loading={operations.isLoading} error={operations.isError ? "Private operations data is unavailable right now." : ""} />}

        {selectedOrderId && <OrderDetailsDrawer order={orderDetail.data} isSaving={updateOrderStatus.isPending} onClose={() => setSelectedOrderId(null)} onUpdateStatus={(id, status) => updateOrderStatus.mutate({ id, status })} />}
      </main>
    </div>
  );
}

function Overview({ dashboard, onOrders, onSelectOrder, onRead }: { dashboard: any; onOrders: () => void; onSelectOrder: (id: number) => void; onRead: (id: number) => void }) {
  const summary = dashboard?.summary;
  return <section className="admin-overview">
    <div className="admin-summary-grid">
      <article><span>Total sales</span><strong>{formatMoney(summary?.totalSales ?? 0)}</strong><small>Checkout-enabled orders</small></article>
      <article><span>Total orders</span><strong>{summary?.totalOrders ?? 0}</strong><small>{summary?.newOrders ?? 0} awaiting confirmation</small></article>
      <article><span>In progress</span><strong>{summary?.processingOrders ?? 0}</strong><small>Processing + handmade</small></article>
      <article><span>Custom requests</span><strong>{summary?.customOrders ?? 0}</strong><small>Open studio commissions</small></article>
    </div>
    <div className="admin-content-grid">
      <section className="admin-panel admin-recent-orders">
        <div className="admin-panel__heading"><div><p className="eyebrow">Order management</p><h2>New and recent orders</h2></div><button onClick={onOrders}>View all <ChevronRight size={15} /></button></div>
        {dashboard?.recentOrders.length ? <div className="admin-order-list">{dashboard.recentOrders.map((order: any) => <button key={order.id} onClick={() => onSelectOrder(order.id)}><span className="status-dot status-dot--new" /><span><strong>#{order.orderNumber}</strong><small>{order.customerName}</small></span><em>{formatMoney(order.finalTotal, order.currencyCode)}</em><i>{orderStatusLabels[order.orderStatus as OrderStatus]}</i></button>)}</div> : <Empty icon={<ShoppingBag size={21} />} title="No orders yet" text="New Shopify orders will appear here once the store is claimed and synchronization is configured." />}
      </section>
      <section className="admin-panel admin-notification-panel">
        <div className="admin-panel__heading"><div><p className="eyebrow">New order notifications</p><h2>Studio inbox</h2></div><Bell size={17} /></div>
        {dashboard?.notifications.length ? <div className="admin-notifications">{dashboard.notifications.map((note: any) => <button key={note.id} className={note.isRead ? "is-read" : ""} onClick={() => !note.isRead && onRead(note.id)}><span><CheckCircle2 size={15} /></span><div><strong>{note.headline}</strong><p>{note.body}</p></div></button>)}</div> : <Empty compact icon={<Bell size={20} />} text="New order and commission notices will arrive here." />}
      </section>
    </div>
    <section className="admin-process-strip"><div><span>1</span><p>New<br />order</p></div><i /><div><span>2</span><p>Confirm<br />details</p></div><i /><div><span>3</span><p>Handmade<br />preparing</p></div><i /><div><span>4</span><p>Shipped &amp;<br />delivered</p></div></section>
  </section>;
}

function OrdersTab({ query, setQuery, statusFilter, setStatusFilter, orders, onSelect }: { query: string; setQuery: (value: string) => void; statusFilter: "all" | OrderStatus; setStatusFilter: (value: "all" | OrderStatus) => void; orders: { id: number; orderNumber: string; customerName: string; customerEmail: string | null; customerPhone: string | null; finalTotal: string; currencyCode: string; paymentStatus: string; orderStatus: string; createdAt: Date }[]; onSelect: (id: number) => void }) {
  return <section className="admin-tab-content"><div className="admin-toolbar"><div className="admin-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, email or phone" /></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | OrderStatus)}><option value="all">All order statuses</option>{Object.entries(orderStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div><section className="admin-panel admin-table-panel"><div className="admin-table admin-order-table"><div className="admin-table__header"><span>Order</span><span>Customer</span><span>Amount</span><span>Payment</span><span>Status</span><span /></div>{orders.length ? orders.map((order) => <button className="admin-table__row" key={order.id} onClick={() => onSelect(order.id)}><span><strong>#{order.orderNumber}</strong><small>{new Date(order.createdAt).toLocaleDateString()}</small></span><span><strong>{order.customerName}</strong><small>{order.customerPhone || order.customerEmail || "—"}</small></span><span>{formatMoney(order.finalTotal, order.currencyCode)}</span><span className={`payment-pill payment-pill--${order.paymentStatus}`}>{order.paymentStatus.replace("_", " ")}</span><span className={`status-pill status-pill--${order.orderStatus}`}>{orderStatusLabels[order.orderStatus as OrderStatus]}</span><ChevronRight size={16} /></button>) : <Empty icon={<ClipboardList size={22} />} title="No matching orders" text="Try a different search or wait for a Shopify order to sync." />}</div></section></section>;
}

function CustomOrdersTab({ customOrders, isSaving, onUpdate }: { customOrders: { id: number; name: string; whatsapp: string; productType: string; occasion: string; budget: string; requiredDate: string; adminStatus: string; internalNotes: string | null }[]; isSaving: boolean; onUpdate: (id: number, status: CustomStatus, notes?: string) => void }) {
  const [notes, setNotes] = useState<Record<number, string>>({});
  return <section className="admin-tab-content"><section className="admin-panel admin-table-panel"><div className="admin-panel__heading"><div><p className="eyebrow">Commission requests</p><h2>Custom Creation desk</h2></div><Sparkles size={18} /></div><div className="admin-custom-list">{customOrders.length ? customOrders.map((order) => {
    const note = notes[order.id] ?? order.internalNotes ?? "";
    return <article className="admin-custom-request" key={order.id}><div className="admin-custom-request__summary"><span><strong>{order.name}</strong><small>{order.whatsapp}</small></span><span><strong>{order.productType}</strong><small>{order.occasion}</small></span><span><strong>{order.budget}</strong><small>Required {order.requiredDate}</small></span><select disabled={isSaving} value={order.adminStatus} onChange={(event) => onUpdate(order.id, event.target.value as CustomStatus, note)}>{Object.entries(customStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div><div className="admin-custom-request__notes"><label htmlFor={`custom-note-${order.id}`}>Private studio note</label><textarea disabled={isSaving} id={`custom-note-${order.id}`} value={note} onChange={(event) => setNotes((current) => ({ ...current, [order.id]: event.target.value }))} placeholder="Add design notes, material choices or follow-up details…" /><button disabled={isSaving} className="button button-light" onClick={() => onUpdate(order.id, order.adminStatus as CustomStatus, note)}>{isSaving ? "Saving…" : "Save note"} <CheckCircle2 size={15} /></button></div></article>;
  }) : <Empty icon={<Sparkles size={22} />} title="No custom requests yet" text="Submitted Custom Creation forms will appear here securely." />}</div></section></section>;
}

function ProductsTab({ products, loading, error }: { products: any[]; loading: boolean; error: string }) {
  const catalog = loading ? <section className="admin-panel"><Empty icon={<Boxes size={22} />} title="Loading catalog" text="Fetching your published Shopify pieces…" /></section> : error ? <section className="admin-panel"><Empty icon={<Boxes size={22} />} title="Catalog unavailable" text={error} /></section> : products.length === 0 ? <section className="admin-panel"><Empty icon={<Boxes size={22} />} title="Catalog is empty" text="Published Shopify pieces will appear here as soon as they are available to the storefront." /></section> : <section className="admin-catalog-grid">{products.map((product) => <article className="admin-catalog-card" key={product.id}><div className="admin-catalog-card__image">{product.images?.[0] ? <img src={product.images[0].url} alt="" /> : <Boxes size={21} />}</div><div><p>{product.productType || "DIPIZ collection"}</p><h3>{product.title}</h3><span>{formatMoney(product.priceRange.min.amount, product.priceRange.min.currencyCode)} · {product.variants?.[0]?.availableForSale ? "Available" : "Unavailable"}</span></div></article>)}</section>;
  return <section className="admin-tab-content"><section className="admin-panel admin-product-readiness"><div><p className="eyebrow">Product &amp; inventory management</p><h2>Connected catalog<br /><em>management.</em></h2><p>The live Shopify storefront catalog is visible below. Product pricing, inventory and media editing becomes available once the Shopify store is claimed and its secure admin event configuration is enabled.</p></div><div className="admin-readiness-list"><span><CheckCircle2 size={16} /> Private dashboard is ready</span><span><CheckCircle2 size={16} /> Live storefront catalog visible</span><span><PackageCheck size={16} /> Claim store to enable price and inventory operations</span></div></section>{catalog}</section>;
}

function CustomersTab({ customers }: { customers: { id: number; name: string; email: string | null; phone: string | null; orderCount: number; totalSpent: string; latestOrderAt: Date | null }[] }) {
  return <section className="admin-tab-content"><section className="admin-panel admin-table-panel"><div className="admin-panel__heading"><div><p className="eyebrow">Customer management</p><h2>Customer summaries</h2></div><HeartHandshake size={18} /></div><div className="admin-table admin-customer-table"><div className="admin-table__header"><span>Customer</span><span>Contact</span><span>Orders</span><span>Total spent</span><span>Latest order</span></div>{customers.length ? customers.map((customer) => <div className="admin-table__row" key={customer.id}><span>{customer.name}</span><span>{customer.phone || customer.email || "—"}</span><span>{customer.orderCount}</span><span>{formatMoney(customer.totalSpent)}</span><span>{customer.latestOrderAt ? new Date(customer.latestOrderAt).toLocaleDateString() : "—"}</span></div>) : <Empty icon={<Users size={22} />} title="No customer records yet" text="Customer summaries are created from synced orders and stay private to the studio." />}</div></section></section>;
}

function OperationsTab({ data, loading, error }: { data: any; loading: boolean; error: string }) {
  if (loading) return <section className="admin-tab-content"><section className="admin-panel"><Empty icon={<ClipboardList size={22} />} title="Loading operations" text="Preparing private sales, inventory, and synchronization data…" /></section></section>;
  if (error) return <section className="admin-tab-content"><section className="admin-panel"><Empty icon={<ClipboardList size={22} />} title="Operations unavailable" text={error} /></section></section>;

  const sales = data?.sales;
  const inventory = data?.inventory ?? [];
  const syncStates = data?.syncStates ?? [];
  return <section className="admin-tab-content admin-operations">
    <section className="admin-panel admin-operations__intro"><div><p className="eyebrow">Private studio operations</p><h2>Sales, inventory<br /><em>&amp; sync readiness.</em></h2><p>These figures use only orders and inventory snapshots already saved in the private studio database. No projected sales, stock, or Shopify activity is shown.</p></div><div className="admin-readiness-list"><span><CheckCircle2 size={16} /> Owner-only operations data</span><span><PackageCheck size={16} /> Inventory remains read-only until store claim</span><span><ShieldCheck size={16} /> Automatic order sync is not active yet</span></div></section>
    <section className="admin-operations__section"><div className="admin-panel__heading"><div><p className="eyebrow">Sales reporting</p><h2>Sales performance</h2></div></div><div className="admin-summary-grid admin-sales-grid"><article><span>Recognized sales</span><strong>{formatMoney(sales?.totalSales ?? 0, sales?.currencyCode ?? "INR")}</strong><small>Excludes cancelled and refunded orders</small></article><article><span>Orders</span><strong>{sales?.totalOrders ?? 0}</strong><small>Saved private order records</small></article><article><span>Paid orders</span><strong>{sales?.paidOrders ?? 0}</strong><small>Paid or partially paid</small></article><article><span>Average order</span><strong>{formatMoney(sales?.averageOrderValue ?? 0, sales?.currencyCode ?? "INR")}</strong><small>Across recognized orders</small></article></div>{sales?.totalOrders ? null : <section className="admin-panel admin-operations__empty"><Empty compact icon={<ShoppingBag size={20} />} title="No sales data yet" text="Sales figures will become available after genuine Shopify orders synchronize." /></section>}</section>
    <section className="admin-operations__section admin-panel admin-table-panel"><div className="admin-panel__heading"><div><p className="eyebrow">Inventory snapshots</p><h2>Stock readiness</h2></div><PackageCheck size={18} /></div>{inventory.length ? <div className="admin-table admin-inventory-table"><div className="admin-table__header"><span>Piece</span><span>Stock</span><span>Availability</span><span>Last update</span></div>{inventory.map((item: any) => <div key={item.id} className="admin-table__row"><span>{item.title}</span><span>{item.stock}</span><span className={item.outOfStock ? "status-pill status-pill--cancelled" : "status-pill status-pill--delivered"}>{item.outOfStock ? "Out of stock" : "Available"}</span><span>{new Date(item.updatedAt).toLocaleString()}</span></div>)}</div> : <Empty icon={<Boxes size={22} />} title="No inventory snapshot yet" text="Inventory will appear here only after the claimed Shopify store has a verified synchronization source." />}</section>
    <section className="admin-operations__section admin-panel admin-table-panel"><div className="admin-panel__heading"><div><p className="eyebrow">Synchronization health</p><h2>Connection status</h2></div><ShieldCheck size={18} /></div>{syncStates.length ? <div className="admin-sync-list">{syncStates.map((state: any) => <article key={state.syncKey}><strong>{state.syncKey}</strong><span>{state.lastWebhookAt ? `Latest event ${new Date(state.lastWebhookAt).toLocaleString()}` : "No verified webhook event recorded"}</span><span>{state.lastSyncAt ? `Last reconciliation ${new Date(state.lastSyncAt).toLocaleString()}` : "No reconciliation recorded"}</span>{state.lastError ? <p>{state.lastError}</p> : null}</article>)}</div> : <Empty icon={<ShieldCheck size={22} />} title="Synchronization is awaiting setup" text="Claim the Shopify store and provide the secure webhook configuration before automatic order events or reconciliation can begin." />}</section>
  </section>;
}

function OrderDetailsDrawer({ order, isSaving, onClose, onUpdateStatus }: { order: { order: any; items: any[]; timeline: any[] } | undefined; isSaving: boolean; onClose: () => void; onUpdateStatus: (id: number, status: OrderStatus) => void }) {
  if (!order) return <section className="admin-drawer" role="dialog" aria-modal="true" aria-label="Order details"><button className="admin-drawer__backdrop" onClick={onClose} aria-label="Close order details" /><div className="admin-drawer__panel"><Empty compact text="Loading order details…" /></div></section>;
  return <section className="admin-drawer" role="dialog" aria-modal="true" aria-label="Order details"><button className="admin-drawer__backdrop" onClick={onClose} aria-label="Close order details" /><div className="admin-drawer__panel"><button className="admin-drawer__close" onClick={onClose}><X size={18} /></button><p className="eyebrow">Order #{order.order.orderNumber}</p><h2>{order.order.customerName}</h2><div className="admin-detail-meta"><span>{order.order.customerPhone || "No phone provided"}</span><span>{order.order.customerEmail || "No email provided"}</span></div><div className="admin-detail-section"><h3>Delivery address</h3><p>{order.order.deliveryAddress || "Address supplied securely at checkout."}</p></div><div className="admin-detail-section"><h3>Ordered pieces</h3>{order.items.map((item) => <div className="admin-line-item" key={item.id}><span><strong>{item.productTitle}</strong><small>{item.variantTitle || "Handmade piece"} · Qty {item.quantity}</small></span><b>{formatMoney(Number(item.unitPrice) * item.quantity, order.order.currencyCode)}</b></div>)}</div><div className="admin-detail-totals"><span>Subtotal <b>{formatMoney(order.order.subtotal, order.order.currencyCode)}</b></span><span>Shipping <b>{formatMoney(order.order.shippingCharge, order.order.currencyCode)}</b></span><span>Discount <b>−{formatMoney(order.order.discountAmount, order.order.currencyCode)}</b></span><strong>Final total <b>{formatMoney(order.order.finalTotal, order.order.currencyCode)}</b></strong></div><div className="admin-detail-section"><h3>Update order status</h3><select disabled={isSaving} value={order.order.orderStatus} onChange={(event) => onUpdateStatus(order.order.id, event.target.value as OrderStatus)}>{Object.entries(orderStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{isSaving && <p className="admin-saving-copy">Saving status…</p>}</div><div className="admin-detail-section"><h3>Order timeline</h3><div className="admin-timeline">{order.timeline.map((event) => <div key={event.id}><span /><p><strong>{orderStatusLabels[event.status as OrderStatus] || event.status}</strong><small>{event.note || "Status updated by studio"} · {new Date(event.occurredAt).toLocaleString()}</small></p></div>)}</div></div></div></section>;
}

function Empty({ icon, title, text, compact = false }: { icon?: React.ReactNode; title?: string; text: string; compact?: boolean }) {
  return <div className={`admin-empty${compact ? " admin-empty--compact" : ""}`}>{icon}{title && <h3>{title}</h3>}<p>{text}</p></div>;
}

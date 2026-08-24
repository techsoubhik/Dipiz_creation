import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Heart, ImagePlus, Palette, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BrandLogo } from "@/components/BrandLogo";

type CustomFormData = {
  name: string;
  whatsapp: string;
  occasion: string;
  productType: string;
  colorStyle: string;
  budget: string;
  requiredDate: string;
  referenceName: string;
  message: string;
};

const initialForm: CustomFormData = {
  name: "",
  whatsapp: "",
  occasion: "",
  productType: "",
  colorStyle: "",
  budget: "",
  requiredDate: "",
  referenceName: "",
  message: "",
};

const steps = ["Name", "WhatsApp", "Occasion", "Product", "Style", "Budget", "Date", "Reference", "Message"];

async function encodeReferenceImage(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The reference image could not be read."));
    reader.readAsDataURL(file);
  });
  return dataUrl.split(",")[1] ?? "";
}

export default function CustomCreation() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CustomFormData>(initialForm);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const submitOrder = trpc.customOrders.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (submissionError) => setError(submissionError.message || "The studio note could not be sent. Please try again."),
  });

  const update = (key: keyof CustomFormData, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const requiredFields: (keyof CustomFormData | null)[] = ["name", "whatsapp", "occasion", "productType", "colorStyle", "budget", "requiredDate", null, "message"];
  const labels = ["your name", "a WhatsApp number", "the occasion", "a creation type", "a colour or style direction", "a budget", "a required date", null, "a short message"];
  const next = () => {
    const key = requiredFields[step];
    if (key && !form[key].trim()) {
      setError(`Please share ${labels[step]} before continuing.`);
      return;
    }
    setError("");
    if (step === steps.length - 1) return void submit();
    setStep((current) => current + 1);
  };

  const submit = async () => {
    try {
      setError("");
      if (referenceFile && referenceFile.size > 5 * 1024 * 1024) {
        setError("Reference images must be smaller than 5 MB.");
        return;
      }
      const referenceImage = referenceFile ? {
        name: referenceFile.name,
        mimeType: referenceFile.type as "image/jpeg" | "image/png" | "image/webp",
        base64: await encodeReferenceImage(referenceFile),
      } : null;
      submitOrder.mutate({ ...form, referenceImage });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "The studio note could not be sent. Please try again.");
    }
  };

  const renderStep = () => {
    if (step === 0) return <><label htmlFor="custom-name">Your name</label><input id="custom-name" autoComplete="name" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="How shall the studio greet you?" /></>;
    if (step === 1) return <><label htmlFor="custom-whatsapp">WhatsApp number</label><input id="custom-whatsapp" type="tel" autoComplete="tel" value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} placeholder="Include country code" /></>;
    if (step === 2) return <><label htmlFor="custom-occasion">What are we creating for?</label><input id="custom-occasion" value={form.occasion} onChange={(event) => update("occasion", event.target.value)} placeholder="A birthday, a home, a quiet keepsake…" /></>;
    if (step === 3) return <><span className="form-label">Choose a creation type</span><div className="custom-choice-grid">{["Custom Clay Jewellery", "Custom Resin Art", "Custom Bottle Art", "Personalized Gifts"].map((item) => <button type="button" key={item} className={form.productType === item ? "is-selected" : ""} onClick={() => update("productType", item)}>{item}</button>)}</div></>;
    if (step === 4) return <><label htmlFor="custom-style">Colour and style direction</label><textarea id="custom-style" value={form.colorStyle} onChange={(event) => update("colorStyle", event.target.value)} placeholder="Tell us about colours, textures, mood, or a feeling you want the piece to hold." /></>;
    if (step === 5) return <><span className="form-label">Your considered budget</span><div className="custom-choice-grid custom-choice-grid--budget">{["Under $75", "$75 – $125", "$125 – $200", "$200+"].map((item) => <button type="button" key={item} className={form.budget === item ? "is-selected" : ""} onClick={() => update("budget", item)}>{item}</button>)}</div></>;
    if (step === 6) return <><label htmlFor="custom-date">When do you need it?</label><input id="custom-date" type="date" value={form.requiredDate} onChange={(event) => update("requiredDate", event.target.value)} /></>;
    if (step === 7) return <><label htmlFor="custom-reference">Upload a reference image <small>(optional)</small></label><label className="reference-upload" htmlFor="custom-reference"><ImagePlus size={23} /><span>{form.referenceName || "Choose an image, colour palette or saved inspiration"}</span><small>JPG, PNG or WEBP · max 5 MB</small></label><input id="custom-reference" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0] ?? null; setReferenceFile(file); update("referenceName", file?.name ?? ""); }} /></>;
    return <><label htmlFor="custom-message">A final note for the studio</label><textarea id="custom-message" value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="Share anything else you’d like us to know. The more feeling, the better." /></>;
  };

  return <div className="custom-page">
    <header className="shop-header"><a href="/" className="shop-home-link" aria-label="DIPIZ CREATION home"><BrandLogo variant="shop" /></a><nav><a href="/">Home</a><a href="/shop">Shop</a><a href="/#collections">Collections</a><a href="/custom" aria-current="page">Custom Creation</a><a href="/#story">About</a></nav><div className="shop-header-actions"><a href="/shop" aria-label="Browse shop"><Heart size={18} /></a></div></header>
    <main>
      <section className="custom-hero section-shell"><div className="custom-hero__copy"><p className="eyebrow"><Sparkles size={13} /> The DIPIZ commission studio</p><h1>Made Just<br /><em>For You.</em></h1><p>Turn your idea into a one-of-a-kind handmade creation. A quiet collaboration between your story and the studio’s hands.</p><a href="#custom-order" className="button button-primary">Begin your idea <ArrowRight size={17} /></a></div><div className="custom-hero__art" aria-hidden="true"><div className="custom-hero__shape shape-one" /><div className="custom-hero__shape shape-two" /><div className="custom-hero__shape shape-three" /><span>DC</span></div></section>

      <section className="custom-types section-shell"><div className="section-heading split-heading"><div><p className="eyebrow">What we can make together</p><h2>A piece with <em>your story</em> in it.</h2></div><p className="section-intro">From a colour remembered to a name you want to hold close, every commission begins with something personal.</p></div><div className="custom-types__grid">{[["Custom Clay Jewellery", "A small wearable form shaped around your colours, energy and everyday ritual."], ["Custom Resin Art", "Layered keepsakes with depth, glow and expressive colour."], ["Custom Bottle Art", "A treasured object reimagined with paint, texture and a new point of view."], ["Personalized Gifts", "Meaningful paper and object pieces made for one particular person."]].map(([title, text], index) => <a href="#custom-order" className="custom-type-card" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p><ArrowRight size={17} /></a>)}</div></section>

      <section className="custom-process"><div className="section-shell"><div className="custom-process__heading"><p className="eyebrow">A gentle collaboration</p><h2>From a small idea<br />to a <em>lasting object.</em></h2></div><div className="process-grid">{[["01", "Idea", "You bring a memory, mood or beginning."], ["02", "Design", "We translate the feeling into a considered direction."], ["03", "Handmade", "Your piece takes form slowly, with intention."], ["04", "Delivered", "A one-of-a-kind creation arrives ready to keep."]].map(([number, title, text]) => <article key={number}><span>{number}</span><div className="process-orbit" /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section id="custom-order" className="custom-order-section section-shell"><div className="custom-order-intro"><p className="eyebrow">Start a conversation</p><h2>Tell us what<br /><em>you’re dreaming of.</em></h2><p>This is a quiet first step, not a commitment. The studio will return to you on WhatsApp with availability, a thoughtful direction and next steps.</p><div className="custom-order-intro__note"><Palette size={17} /><span>Each commission is considered individually and made in a limited number of studio places.</span></div></div><div className="custom-form-card">{submitted ? <div className="custom-form-success"><div><Check size={23} /></div><p className="eyebrow">Your idea is on its way</p><h3>Thank you, {form.name}.</h3><p>Your custom creation note is safely with the studio. We’ll continue the conversation on WhatsApp soon.</p><button className="text-link" onClick={() => { setForm(initialForm); setReferenceFile(null); setStep(0); setSubmitted(false); }}>Start another idea <ArrowRight size={16} /></button></div> : <><div className="custom-form-card__top"><div><span>Step {step + 1} of {steps.length}</span><strong>{steps[step]}</strong></div><div className="form-progress"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div></div><div className="custom-form-field">{renderStep()}</div>{error && <p className="custom-form-error" role="alert">{error}</p>}<div className="custom-form-actions">{step > 0 ? <button type="button" className="form-back" onClick={() => { setError(""); setStep((current) => current - 1); }}><ChevronLeft size={17} /> Back</button> : <span />}<button type="button" className="button button-primary" disabled={submitOrder.isPending} onClick={next}>{step === steps.length - 1 ? (submitOrder.isPending ? "Sending your note…" : "Start My Custom Order") : <>Continue <ArrowRight size={16} /></>}</button></div></>}</div></section>
    </main>
    <footer className="custom-footer section-shell"><a href="/"><ArrowLeft size={15} /> Return to DIPIZ CREATION</a><span>Handmade slowly, made to mean more.</span></footer>
    <MobileBottomNav active="home" />
  </div>;
}

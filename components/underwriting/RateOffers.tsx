"use client";

import { useState } from "react";
import {
  dtiForPayment,
  OFFER_TERMS,
  offerApr,
  offerPayment,
  type RateKind,
  type RateProduct,
} from "@/lib/calculations/rates";
import { money, percent } from "@/lib/format";
import type { Application } from "@/lib/types";

type SelectRate = (patch: {
  requestedTerm: number;
  requestedRateType: RateKind;
  income: Application["income"];
}) => void;

const PRODUCTS: { id: RateProduct; label: string }[] = [
  { id: "immediate", label: "Immediate" },
  { id: "fixed", label: "Fixed" },
  { id: "interest-only", label: "Interest Only" },
  { id: "deferred", label: "Deferred" },
];

export function RateOffers({
  application,
  readOnly,
  onSelect,
}: {
  application: Application;
  readOnly: boolean;
  onSelect: SelectRate;
}) {
  const [product, setProduct] = useState<RateProduct>("immediate");

  return (
    <section className="bg-white">
      <nav
        className="flex gap-md overflow-x-auto border-b border-gray-light bg-white px-sm pt-sm"
        aria-label="Rate products"
      >
        {PRODUCTS.map((item) => {
          const active = item.id === product;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setProduct(item.id)}
              className={
                active
                  ? "-mb-px shrink-0 border-b-2 border-primary px-xs pb-[17px] pt-sm text-sm whitespace-nowrap text-primary"
                  : "-mb-px shrink-0 border-b-2 border-transparent px-xs pb-md pt-sm text-sm whitespace-nowrap text-gray-medium hover:text-primary"
              }
            >
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="flex flex-col gap-xl p-md">
        <OfferGroup
          title="Fixed Rates"
          kind="Fixed"
          product={product}
          application={application}
          readOnly={readOnly}
          onSelect={onSelect}
        />
        {product === "fixed" ? null : (
          <OfferGroup
            title="Variable Rates"
            kind="Variable"
            product={product}
            application={application}
            readOnly={readOnly}
            onSelect={onSelect}
          />
        )}
      </div>
    </section>
  );
}

function OfferGroup({
  title,
  kind,
  product,
  application,
  readOnly,
  onSelect,
}: {
  title: string;
  kind: RateKind;
  product: RateProduct;
  application: Application;
  readOnly: boolean;
  onSelect: SelectRate;
}) {
  return (
    <div className="flex flex-col gap-sm">
      <p className="text-base">
        <span className="font-semibold text-black">{title} </span>
        <span className="text-gray-dark">( See TERMS and CONDITIONS below )</span>
      </p>
      <div className="flex flex-col gap-xs">
        <div className="grid grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center bg-gray-lightest text-sm font-semibold text-black">
          <div className="h-11" />
          <div className="h-11 px-xl py-sm">Term</div>
          <div className="h-11 px-xl py-sm">Monthly Payment</div>
          <div className="h-11 px-xl py-sm">Interest Rate/APR</div>
          <div className="h-11" />
        </div>
        {OFFER_TERMS.map((term) => (
          <OfferRow
            key={`${kind}-${term.months}`}
            kind={kind}
            term={term}
            product={product}
            application={application}
            readOnly={readOnly}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function OfferRow({
  kind,
  term,
  product,
  application,
  readOnly,
  onSelect,
}: {
  kind: RateKind;
  term: (typeof OFFER_TERMS)[number];
  product: RateProduct;
  application: Application;
  readOnly: boolean;
  onSelect: SelectRate;
}) {
  const [open, setOpen] = useState(false);
  const apr = offerApr(kind, term.months);
  const payment = offerPayment(application, kind, term.months, product);
  const selected =
    application.requestedRateType === kind && application.requestedTerm === term.months;
  const dti = dtiForPayment(application, payment);

  function choose() {
    if (readOnly || payment == null) return;
    onSelect({
      requestedTerm: term.months,
      requestedRateType: kind,
      income: { ...application.income, estimatedNewPayment: payment },
    });
  }

  return (
    <div
      className={`overflow-hidden rounded-xs border ${
        selected ? "border-success bg-success-bg" : "border-gray-light bg-white"
      }`}
    >
      <div className="grid min-h-[68px] grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center py-sm">
        <div className="flex items-center px-xl">
          {selected ? <CheckCircle /> : <span className="size-7" />}
        </div>
        <button
          type="button"
          disabled={readOnly}
          onClick={choose}
          className="col-span-3 grid grid-cols-3 items-center text-left disabled:cursor-default"
        >
          <span className="px-xl py-sm text-sm font-semibold text-black">{term.years} Years</span>
          <span className="px-xl py-sm text-sm font-semibold text-black">
            {payment == null ? "-" : money(payment)}
          </span>
          <span className="px-xl py-sm text-sm font-semibold text-black">
            {apr == null ? "-" : percent(apr)}
          </span>
        </button>
        <div className="px-xl py-sm">
          <button
            type="button"
            onClick={() => setOpen((next) => !next)}
            className="inline-flex items-center gap-[12px] text-sm text-primary"
            aria-expanded={open}
          >
            View details
            <ChevronIcon open={open} />
          </button>
        </div>
      </div>
      {open ? (
        <div className="grid grid-cols-2 gap-md border-t border-gray-light px-xl py-md text-sm text-gray-dark sm:grid-cols-4">
          <Detail label="Term" value={`${term.months} months`} />
          <Detail label="Product" value={productLabel(product)} />
          <Detail label="DTI" value={dti == null ? "-" : percent(dti)} />
          <Detail label="Rate type" value={kind} />
        </div>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-medium">{label}</p>
      <p className="text-charcoal">{value}</p>
    </div>
  );
}

function productLabel(product: RateProduct) {
  if (product === "interest-only") return "Interest Only";
  if (product === "deferred") return "Deferred";
  if (product === "fixed") return "Fixed";
  return "Immediate";
}

function CheckCircle() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="12" fill="#278a27" />
      <path
        d="M8.5 14.2l3.4 3.4 7.2-7.6"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      className={open ? "rotate-180" : ""}
    >
      <path
        d="M8 11l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

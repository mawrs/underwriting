"use client";

import { useState, type ReactNode } from "react";
import { hydrateCalculator } from "@/lib/calculations/income";
import { money } from "@/lib/format";
import type { Application, ApplicationPatch, IncomeCalculator, IncomeWorksheet } from "@/lib/types";

type CalcRow = keyof IncomeCalculator;

const CURRENT_YEAR = new Date().getFullYear();
const PRIOR_YEAR = CURRENT_YEAR - 1;

export function IncomeCalculatorPanel({
  application,
  readOnly,
  onChange,
}: {
  application: Application;
  readOnly: boolean;
  onChange: (patch: ApplicationPatch) => void;
}) {
  const income = application.income;
  const calc = hydrateCalculator(income);

  function patchCalc(nextCalc: IncomeCalculator, row: CalcRow) {
    onChange({ income: syncWorksheet(income, nextCalc, row) });
  }

  function setField(row: CalcRow, value: number) {
    patchCalc({ ...calc, [row]: value }, row);
  }

  const ytdPerPeriod = calc.ytdPeriods ? calc.ytdGross / calc.ytdPeriods : null;
  const ytdAnnual =
    ytdPerPeriod != null && calc.ytdAnnualPeriods ? ytdPerPeriod * calc.ytdAnnualPeriods : null;
  const ytdMonthly = ytdAnnual != null ? ytdAnnual / 12 : null;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <CalcRow label="Annual">
          <InputCell
            label="Gross Pay $"
            value={calc.annual}
            moneyPrefix
            readOnly={readOnly}
            onChange={(value) => setField("annual", value)}
          />
          <ConstCell label="Divided by" value="12" />
          <ResultCell value={calc.annual / 12} tone="final" />
        </CalcRow>

        <CalcRow label="Monthly">
          <InputCell
            label="Gross Pay $"
            value={calc.monthly}
            moneyPrefix
            readOnly={readOnly}
            onChange={(value) => setField("monthly", value)}
          />
          <ConstCell label="X" value="12" />
          <ResultCell value={calc.monthly * 12} tone="mid" />
          <ConstCell label="Divided by" value="12" />
          <ResultCell value={calc.monthly} tone="final" />
        </CalcRow>

        <CalcRow label="Semi Monthly">
          <InputCell
            label="Gross Pay $"
            value={calc.semiMonthly}
            moneyPrefix
            readOnly={readOnly}
            onChange={(value) => setField("semiMonthly", value)}
          />
          <ConstCell label="X" value="24" />
          <ResultCell value={calc.semiMonthly * 24} tone="mid" />
          <ConstCell label="Divided by" value="12" />
          <ResultCell value={(calc.semiMonthly * 24) / 12} tone="final" />
        </CalcRow>

        <CalcRow label="Biweekly">
          <InputCell
            label="Gross Pay $"
            value={calc.biweekly}
            moneyPrefix
            readOnly={readOnly}
            onChange={(value) => setField("biweekly", value)}
          />
          <ConstCell label="X" value="26" />
          <ResultCell value={calc.biweekly * 26} tone="mid" />
          <ConstCell label="Divided by" value="12" />
          <ResultCell value={(calc.biweekly * 26) / 12} tone="final" />
        </CalcRow>

        <CalcRow label="Weekly">
          <InputCell
            label="Gross Pay $"
            value={calc.weekly}
            moneyPrefix
            readOnly={readOnly}
            onChange={(value) => setField("weekly", value)}
          />
          <ConstCell label="X" value="52" />
          <ResultCell value={calc.weekly * 52} tone="mid" />
          <ConstCell label="Divided by" value="12" />
          <ResultCell value={(calc.weekly * 52) / 12} tone="final" />
        </CalcRow>

        <CalcRow label="Hourly">
          <InputCell
            label="Gross Pay $"
            value={calc.hourlyRate}
            moneyPrefix
            readOnly={readOnly}
            onChange={(value) => setField("hourlyRate", value)}
          />
          <InputCell
            label="X (Hours)"
            value={calc.hourlyHours}
            readOnly={readOnly}
            onChange={(value) => setField("hourlyHours", value)}
          />
          <ResultCell value={calc.hourlyRate * calc.hourlyHours} tone="mid" />
          <ConstCell label="X" value="52" />
          <ResultCell value={calc.hourlyRate * calc.hourlyHours * 52} tone="mid" />
          <ConstCell label="Divided by" value="12" />
          <ResultCell value={(calc.hourlyRate * calc.hourlyHours * 52) / 12} tone="final" />
        </CalcRow>

        <CalcRow label="YTD Regular Income">
          <InputCell
            label="Gross Pay $"
            value={calc.ytdGross}
            moneyPrefix
            readOnly={readOnly}
            onChange={(value) => setField("ytdGross", value)}
          />
          <InputCell
            label="Divided by (PP)"
            value={calc.ytdPeriods}
            readOnly={readOnly}
            onChange={(value) => setField("ytdPeriods", value)}
          />
          <ResultCell value={ytdPerPeriod} tone="mid" />
          <InputCell
            label="X (PP)"
            value={calc.ytdAnnualPeriods}
            readOnly={readOnly}
            onChange={(value) => setField("ytdAnnualPeriods", value)}
          />
          <ResultCell value={ytdAnnual} tone="mid" />
          <ConstCell label="Divided by" value="12" />
          <ResultCell value={ytdMonthly} tone="final" />
        </CalcRow>

        <CalcRow label={String(CURRENT_YEAR)}>
          <InputCell
            label="Gross Pay $"
            value={calc.yearCurrent}
            moneyPrefix
            readOnly={readOnly}
            onChange={(value) => setField("yearCurrent", value)}
          />
          <ConstCell label="Divided by" value="12" />
          <ResultCell value={calc.yearCurrent / 12} tone="final" />
        </CalcRow>

        <CalcRow label={String(PRIOR_YEAR)}>
          <InputCell
            label="Gross Pay $"
            value={calc.yearPrior}
            moneyPrefix
            readOnly={readOnly}
            onChange={(value) => setField("yearPrior", value)}
          />
          <ConstCell label="Divided by" value="12" />
          <ResultCell value={calc.yearPrior / 12} tone="final" />
        </CalcRow>
      </div>
    </div>
  );
}

function syncWorksheet(
  income: IncomeWorksheet,
  calculator: IncomeCalculator,
  row: CalcRow,
): IncomeWorksheet {
  const next = { ...income, calculator };
  switch (row) {
    case "annual":
      return { ...next, selectedFrequency: "annual", grossPay: calculator.annual };
    case "monthly":
      return { ...next, selectedFrequency: "monthly", grossPay: calculator.monthly };
    case "semiMonthly":
      return { ...next, selectedFrequency: "semi-monthly", grossPay: calculator.semiMonthly };
    case "biweekly":
      return { ...next, selectedFrequency: "biweekly", grossPay: calculator.biweekly };
    case "weekly":
      return { ...next, selectedFrequency: "weekly", grossPay: calculator.weekly };
    case "hourlyRate":
    case "hourlyHours":
      return {
        ...next,
        selectedFrequency: "hourly",
        grossPay: calculator.hourlyRate,
        hours: calculator.hourlyHours,
      };
    case "ytdGross":
    case "ytdPeriods":
    case "ytdAnnualPeriods":
      return {
        ...next,
        selectedFrequency: "ytd",
        grossPay: calculator.ytdGross,
        payPeriods: calculator.ytdPeriods,
      };
    case "yearCurrent":
      return { ...next, selectedFrequency: "annual", grossPay: calculator.yearCurrent };
    case "yearPrior":
      return {
        ...next,
        selectedFrequency: "annual",
        grossPay: calculator.yearPrior,
        priorYearIncome: calculator.yearPrior,
      };
  }
}

function CalcRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-md border-b border-[#f0eef1] px-md py-[14px]">
      <div className="flex w-[200px] shrink-0 items-center pt-xl">
        <p className="text-sm font-semibold whitespace-nowrap text-black">{label}</p>
      </div>
      <div className="flex items-end gap-3">{children}</div>
    </div>
  );
}

function InputCell({
  label,
  value,
  moneyPrefix = false,
  readOnly,
  onChange,
}: {
  label: string;
  value: number;
  moneyPrefix?: boolean;
  readOnly: boolean;
  onChange: (value: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const empty = !value;
  const display = focused ? draft : value.toFixed(2);

  return (
    <div className="flex min-w-[128px] flex-col items-start gap-xs">
      <p className="text-xs whitespace-nowrap text-gray-medium">{label}</p>
      <div className="flex h-[34px] items-center rounded-xs border border-gray-light bg-[#fffdf3] px-[10px]">
        {moneyPrefix ? <span className="pr-[2px] text-[13px] text-gray-medium">$</span> : null}
        <input
          type="text"
          inputMode="decimal"
          readOnly={readOnly}
          aria-label={label}
          className={`h-[19.5px] w-[130px] bg-transparent text-[13px] outline-none ${
            !focused && empty ? "text-[#bcbcc0]" : "text-gray-dark"
          }`}
          value={display}
          onFocus={() => {
            setFocused(true);
            setDraft(empty ? "" : String(value));
          }}
          onBlur={() => {
            setFocused(false);
            const parsed = Number.parseFloat(draft);
            onChange(Number.isFinite(parsed) ? parsed : 0);
          }}
          onChange={(event) => {
            const next = event.target.value;
            if (next !== "" && !/^\d*\.?\d*$/.test(next)) return;
            setDraft(next);
            const parsed = Number.parseFloat(next);
            onChange(Number.isFinite(parsed) ? parsed : 0);
          }}
        />
      </div>
    </div>
  );
}

function ConstCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-[92px] flex-col items-start gap-xs">
      <p className="text-xs whitespace-nowrap text-gray-medium">{label}</p>
      <div className="flex h-[34px] w-[92px] items-center justify-center rounded-xs border border-[#eeecef] bg-[#f7f7f8]">
        <p className="text-[13px] font-semibold text-gray-dark">{value}</p>
      </div>
    </div>
  );
}

function ResultCell({ value, tone }: { value: number | null; tone: "mid" | "final" }) {
  const dashed = value == null;
  return (
    <div className="flex min-w-[128px] flex-col items-start gap-xs">
      <p className="text-xs text-gray-medium">=</p>
      <div
        className={
          tone === "final"
            ? "flex h-[34px] w-[128px] items-center justify-end rounded-xs border border-[#bcdcef] bg-[#eaf3fa] px-[10px]"
            : "flex h-[34px] w-[128px] items-center justify-end rounded-xs border border-[#efe3e7] bg-[#faf6f7] px-[10px]"
        }
      >
        <p
          className={
            tone === "final"
              ? "text-[13px] font-semibold whitespace-nowrap text-primary"
              : "text-[13px] font-semibold whitespace-nowrap text-gray-dark"
          }
        >
          {dashed ? "—" : money(value)}
        </p>
      </div>
    </div>
  );
}

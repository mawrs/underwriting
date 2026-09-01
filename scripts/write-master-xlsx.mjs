import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const out = join(dirname(fileURLToPath(import.meta.url)), "../public/workbook/ELFI-UW-Master.xlsx");

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([
    ["ELFI Underwriting Calculator"],
    ["Master template — make a copy before entering file data. Do not type in the master."],
    [],
    ["Income"],
    ["Gross pay per period", "", "Frequency", "biweekly"],
    ["Hours (hourly only)"],
    ["Monthly income"],
    ["Stated annual income"],
    ["Annualized verified"],
    ["Variance"],
    [],
    ["DTI"],
    ["Housing payment"],
    ["Remaining monthly debt"],
    ["Estimated new payment"],
    ["Qualifying monthly debt"],
    ["DTI"],
  ]),
  "Calculator",
);
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([
    ["Application cross-check"],
    ["Enter LOS values here. Compare against the file in the other window."],
    [],
    ["Loan ID", "", "Product"],
    ["Borrower name", "", "FICO"],
    ["Date of birth", "", "Filing status"],
    ["Email", "", "Employment"],
    ["Permanent address", "", "Living arrangement"],
    ["School", "", "Highest degree"],
    ["Loan amount", "", "Requested term"],
    ["Cosigner", "", "Cosigner name"],
    ["Cosigner email"],
  ]),
  "Application",
);
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([
    ["Selected loan payoffs"],
    ["Type creditor, identifier, account, balance, and address from the servicer statement."],
    [],
    ["Adj creditor", "Loan identifier", "Account number", "Adj balance", "Lender address", "Payoff type"],
    ...Array.from({ length: 10 }, () => ["", "", "", "", "", ""]),
    [],
    ["Total amount to be paid off"],
  ]),
  "Payoffs",
);
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([
    ["Underwriter observations"],
    [],
    ["Income"],
    ["Credit / FICO"],
    ["Degree"],
    ["Documentation"],
    ["Payoff"],
    ["General"],
  ]),
  "Notes",
);
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([
    ["ELFI Underwriting Master"],
    ["This file is the read-only master. Make a copy before entering file data."],
    ["Download the completed working copy as XLS and PDF, then upload it back to the loan file."],
  ]),
  "About",
);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(XLSX.write(wb, { bookType: "xlsx", type: "array" })));
console.log(out);

# Underwriting prototype

This is an **educational prototype**, not a production underwriting system. It exists to walk through a student-loan refinance review flow in the browser.

All applicant names, account numbers, credit figures, and other identifiers in the seed data are **pseudonymized**. They are invented or altered for teaching purposes and do not represent real people, accounts, or loans.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). It redirects to the pre-review queue.

## Workflow

1. Open a file from **Pre-review queue**
2. Work the tabs: student-loan payoffs, application review, documents, underwriting, credit-report liabilities, and rates
3. Add comments from **Notes** in the file header
4. On **Completion**, download the workbook, finish it in Excel (split view), and upload the completed sheet
5. Submit to **Senior queue**
6. Senior underwriter reviews pre-filled data, edits as needed, then approves or returns

Review state stays in this browser (`localStorage`) and is never sent to a live LOS or customer. Use **Reset demo data** in the Casey Morrow profile menu to restore the seed file for Elena Voss (`2084417`).

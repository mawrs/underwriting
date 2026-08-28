# Underwriting prototype

Lean Next.js workspace for the student-loan refinance underwriting flow.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). It redirects to the pre-review queue.

## Workflow

1. Open a file from **Pre-review queue**
2. Review documents (KYC, credit, degree, pay stubs)
3. Confirm loan payoffs and Sallie Mae discrepancies
4. Enter income, debt trades, and DTI inputs
5. Add official notes
6. Download XLS/PDF and submit to **Senior queue**
7. Senior underwriter reviews pre-filled data, edits as needed, then approves or returns

Review state is stored in the browser (`localStorage`). Use **Reset demo data** in the John Doe profile menu to restore the seed file for Madeline Prusinowski (`1411011`).

"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApplication, useStore } from "@/lib/store";
import { canSubmitToSenior } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { NotesModal } from "@/components/application/NotesModal";

export function FileActions({ id }: { id: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const senior = pathname.startsWith("/senior-queue");
  const basePath = senior ? `/senior-queue/${id}` : `/applications/${id}`;
  const { application } = useApplication(id);
  const { submitToSenior, completeSeniorReview, updateApplication } = useStore();
  const [notesOpen, setNotesOpen] = useState(false);

  if (!application) return null;

  return (
    <div className="flex items-center gap-sm">
      <Button variant="secondary" onClick={() => setNotesOpen(true)}>
        Notes
      </Button>
      <NotesModal
        open={notesOpen}
        value={application.fileNotes}
        updatedAt={application.fileNotesUpdatedAt}
        onChange={(fileNotes, touch) =>
          updateApplication(id, {
            fileNotes,
            ...(touch ? { fileNotesUpdatedAt: new Date().toISOString() } : {}),
          })
        }
        onClose={() => setNotesOpen(false)}
      />
      <Dropdown
        align="right"
        trigger={
          <Button>
            {senior ? "Complete Review" : "Submit for Approval"}
            <ChevronDownIcon />
          </Button>
        }
      >
        {({ close }) =>
          senior ? (
            <>
              <DropdownItem
                onClick={() => {
                  completeSeniorReview(id, "approve");
                  close();
                  router.push("/senior-queue");
                }}
              >
                Complete second-level review
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  completeSeniorReview(id, "return-to-uw");
                  close();
                  router.push("/queue");
                }}
              >
                Return to underwriter
              </DropdownItem>
            </>
          ) : (
            <>
              <DropdownItem
                disabled={!canSubmitToSenior(application)}
                onClick={() => {
                  if (!canSubmitToSenior(application)) {
                    router.push(`${basePath}/submit`);
                    close();
                    return;
                  }
                  submitToSenior(id);
                  close();
                  router.push(application.decision === "needs-docs" ? "/queue" : "/senior-queue");
                }}
              >
                Submit for Approval
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  updateApplication(id, { decision: "needs-docs" });
                  close();
                  router.push(`${basePath}/submit`);
                }}
              >
                Needs documentation
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  close();
                  router.push(`${basePath}/submit`);
                }}
              >
                Open completion checklist
              </DropdownItem>
            </>
          )
        }
      </Dropdown>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

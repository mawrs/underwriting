"use client";

import { useFileWorkspace } from "@/components/application/file-context";
import { StageIntro } from "@/components/application/StageIntro";
import { NotesPanel } from "@/components/notes/NotesPanel";
import { useApplication } from "@/lib/store";

export function NotesPage() {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;

  return (
    <div>
      <StageIntro
        title="Official notes"
        lede="Your observations on the record. These print into the PDF and are what the senior underwriter reads first."
      />
      <NotesPanel
        application={application}
        readOnly={readOnly}
        onChange={(notes) => updateApplication(id, { notes })}
      />
    </div>
  );
}

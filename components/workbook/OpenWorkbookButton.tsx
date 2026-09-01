"use client";

export function OpenWorkbookButton({
  id,
  variant = "link",
}: {
  id: string;
  variant?: "link" | "button";
}) {
  function open() {
    window.open(
      `/workbook/${id}`,
      `elfi-workbook-${id}`,
      "noopener,noreferrer,width=1280,height=860",
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className={
        variant === "button"
          ? "uw-btn-primary"
          : "inline-flex items-center gap-xs text-sm text-gray-medium hover:text-primary"
      }
    >
      Master workbook
      {variant === "link" ? (
        <span aria-hidden className="text-xs">
          ↗
        </span>
      ) : null}
    </button>
  );
}

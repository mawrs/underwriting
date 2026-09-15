import type { ReactNode } from "react";

export function StageIntro({
  title,
  lede,
  action,
  children,
}: {
  title: string;
  lede?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="bg-white">
      <div className="uw-card-header">
        <h1 className="text-lg text-black">{title}</h1>
        {action}
      </div>
      <div className="p-md">
        {lede ? <p className="mb-md max-w-[62ch] text-sm text-gray-medium">{lede}</p> : null}
        {children}
      </div>
    </div>
  );
}

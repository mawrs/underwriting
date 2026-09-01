export function StageIntro({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="border-b border-gray-light bg-gray-extra-light px-xl py-md">
        <h1 className="text-lg text-black">{title}</h1>
      </div>
      <div className="p-lg">
        {lede ? <p className="mb-md max-w-[62ch] text-sm text-gray-medium">{lede}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function StageIntro({
  title,
  lede,
}: {
  title: string;
  lede: string;
}) {
  return (
    <div className="mb-lg">
      <h1 className="text-lg font-semibold text-navy">{title}</h1>
      <p className="mt-xs max-w-[62ch] text-sm text-gray-medium">{lede}</p>
    </div>
  );
}

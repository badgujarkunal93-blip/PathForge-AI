function cellColor(count) {
  if (count >= 4) return '#00D4FF';
  if (count >= 2) return 'rgba(0,212,255,0.6)';
  if (count >= 1) return 'rgba(0,212,255,0.2)';
  return '#1a1f2e';
}

export default function ActivityGrid({ data = [] }) {
  return (
    <section data-aos="fade-up">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-textPrimary">
          Daily Activity
        </h2>
        <span className="text-sm text-textMuted">52 weeks</span>
      </div>
      <div className="overflow-x-auto rounded-card border border-[rgba(0,212,255,0.15)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-[12px]">
        <div
          className="grid w-max grid-flow-col gap-1"
          style={{
            gridTemplateRows: 'repeat(7, 10px)',
            gridAutoColumns: '10px',
          }}
        >
          {data.map((item) => (
            <div
              key={item.date}
              title={`${item.date}: ${item.count} milestone${item.count === 1 ? '' : 's'}`}
              className="h-2.5 w-2.5 rounded-[3px] transition hover:ring-2 hover:ring-cyan"
              style={{ backgroundColor: cellColor(item.count) }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

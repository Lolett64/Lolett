interface ShopTrustBarProps {
  items: { title: string; desc: string }[];
}

export function ShopTrustBar({ items }: ShopTrustBarProps) {
  return (
    <section className="border-t border-[#d9d0c0] py-14">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={i}>
              <div className="mx-auto mb-3 h-px w-8 bg-[#1B0B94]" />
              <p className="text-sm font-bold text-[#1e1610]">{item.title}</p>
              <p className="mt-1 text-xs font-medium text-[#6a5f55]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

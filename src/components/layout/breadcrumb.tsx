import Link from "next/link";

interface BreadcrumbItem {
  href?: string;
  label: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, idx) => (
          <li key={`${item.label}-${idx}`} className="inline-flex items-center gap-2">
            {item.href ? <Link href={item.href} className="hover:text-foreground">{item.label}</Link> : <span>{item.label}</span>}
            {idx < items.length - 1 ? <span>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

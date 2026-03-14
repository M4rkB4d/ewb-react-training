// src/components/layout/PageSection.tsx
interface PageSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function PageSection({ title, description, children }: PageSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && (
        <p className="mt-1 text-muted-fg">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default PageSection;

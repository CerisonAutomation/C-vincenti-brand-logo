import Layout from '@/components/Layout';
import { usePage } from '@/lib/content';

export default function OwnersResults() {
  const { data } = usePage('owners_results');
  return (
    <Layout>
      <section className="py-16 satin-glow">
        <div className="section-container">
          {data?.title && <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">{data.title}</h1>}
          {data?.description && <p className="text-muted-foreground max-w-2xl leading-relaxed">{data.description}</p>}
          {data?.sections?.map((s, i) => (
            <div key={s.id || i} className="mt-12">
              {s.heading && <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">{s.heading}</h2>}
              {s.body && <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

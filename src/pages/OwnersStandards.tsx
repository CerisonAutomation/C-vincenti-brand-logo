import Layout from '@/components/Layout';
import { usePage } from '@/lib/content';

export default function OwnersStandards() {
  const { data } = usePage('owners_standards');
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
              {s.items && s.items.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  {s.items.map((item, j) => (
                    <div key={j} className="satin-surface rounded-lg p-5 satin-glow">
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

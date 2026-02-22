import Layout from '@/components/Layout';
import { useLegal } from '@/lib/content';

export default function TermsPage() {
  const { data } = useLegal('terms');
  return (
    <Layout>
      <section className="py-16">
        <div className="section-container max-w-3xl">
          <p className="micro-type text-primary mb-3">Legal</p>
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
            {data?.title || 'Terms of Service'}
          </h1>
          {data?.lastUpdated && (
            <p className="text-xs text-muted-foreground mb-8">Last updated: {data.lastUpdated}</p>
          )}
          {data?.content && (
            <div className="prose-custom">
              {data.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-4">{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

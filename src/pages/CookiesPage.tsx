import Layout from '@/components/Layout';
import { useLegal, type CookieTableEntry } from '@/lib/content';
import { openCookieSettings } from '@/components/CookieConsentBanner';

export default function CookiesPage() {
  const { data } = useLegal('cookies');
  const cookies = data?.cookieTable || [];

  return (
    <Layout>
      <section className="py-16">
        <div className="section-container max-w-3xl">
          <p className="micro-type text-primary mb-3">Legal</p>
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
            {data?.title || 'Cookie Policy'}
          </h1>

          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            You can manage your cookie preferences at any time.
          </p>
          <button
            onClick={openCookieSettings}
            className="px-5 py-2.5 text-sm font-semibold border border-border text-foreground rounded hover:border-primary hover:text-primary transition-colors mb-10"
          >
            Manage Cookie Settings
          </button>

          {cookies.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">Provider</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">Purpose</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">Expiry</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {cookies.map((c: CookieTableEntry, i: number) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 px-2 text-foreground">{c.name}</td>
                      <td className="py-2 px-2 text-muted-foreground">{c.provider}</td>
                      <td className="py-2 px-2 text-muted-foreground">{c.purpose}</td>
                      <td className="py-2 px-2 text-muted-foreground">{c.expiry}</td>
                      <td className="py-2 px-2 text-muted-foreground">{c.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

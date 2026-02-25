import { useState } from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Users, MapPin, MessageSquare, Download, Loader2, AlertCircle } from 'lucide-react';
import { useAdminReservations } from '@/hooks/admin-hooks';

interface Reservation {
  id: string;
  guest: string;
  email: string;
  phone: string;
  property: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
  status: string;
  payment: string;
}

export default function ReservationsPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [viewRes, setViewRes] = useState<Reservation | null>(null);

  const { data: resData, isLoading } = useAdminReservations();

  const today = new Date().toISOString().split('T')[0] || '';
  const reservations = (resData?.reservations || []).map((r: any): Reservation => ({
    id: r._id,
    guest: r.guest?.name || 'Unknown',
    email: r.guest?.email || '',
    phone: r.guest?.phone || '',
    property: r.listing?.title || 'Property',
    checkIn: r.checkInDate,
    checkOut: r.checkOutDate,
    guests: r.guest?.guestNumber || 1,
    nights: Math.ceil((new Date(r.checkOutDate).getTime() - new Date(r.checkInDate).getTime()) / (1000 * 60 * 60 * 24)),
    total: r.totalPrice || 0,
    status: r.status || 'confirmed',
    payment: r.paymentStatus || 'pending',
  }));

  const filtered = reservations.filter((r: Reservation) => {
    const isUpcoming = today ? r.checkIn >= today : false;
    const matchTab = tab === 'all' || (tab === 'upcoming' && isUpcoming) || (tab === 'past' && !isUpcoming);
    const matchSearch = r.guest.toLowerCase().includes(search.toLowerCase()) || r.property.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total: reservations.length,
    upcoming: today ? reservations.filter((r: Reservation) => r.checkIn >= today).length : 0,
    thisMonth: reservations.filter((r: Reservation) => r.checkIn.startsWith(new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'))).length,
    revenue: reservations.reduce((s: number, r: Reservation) => s + r.total, 0),
  };

  if (!import.meta.env['VITE_GUESTY_ADMIN_CLIENT_ID']) {
    return (
      <Layout>
        <section className="py-16">
          <div className="section-container">
            <Card className="p-8 border-yellow-200 bg-yellow-50">
              <div className="flex gap-3"><AlertCircle className="text-yellow-700" /><div><p className="font-semibold text-yellow-900">Guesty Admin not configured</p><p className="text-sm text-yellow-800">Add VITE_GUESTY_ADMIN_CLIENT_ID to .env</p></div></div>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 sm:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">Reservations</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage confirmed bookings (synced from Guesty)</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, icon: '🏠', color: 'from-blue-500/20 to-blue-500/0' },
              { label: 'Upcoming', value: stats.upcoming, icon: '📅', color: 'from-green-500/20 to-green-500/0' },
              { label: 'This Month', value: stats.thisMonth, icon: '📊', color: 'from-purple-500/20 to-purple-500/0' },
              { label: 'Revenue', value: `€${(stats.revenue / 1000).toFixed(1)}k`, icon: '💰', color: 'from-amber-500/20 to-amber-500/0' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className={`bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border/50`}>
                <p className="text-2xl sm:text-3xl mb-1">{stat.icon}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <Input placeholder="Search by guest or property..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 h-10 sm:h-11 text-sm" />
          </div>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 h-10">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All ({reservations.length})</TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming ({stats.upcoming})</TabsTrigger>
              <TabsTrigger value="past" className="text-xs sm:text-sm">Past ({reservations.filter((r: Reservation) => r.checkIn < today!).length})</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin mr-2" /> Loading...</div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filtered.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">No reservations found</Card>
              ) : (
                filtered.map((res: Reservation, i: number) => (
                  <motion.div key={res.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-4 sm:p-6 border-border/50 hover:shadow-lg transition-all">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-6">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">{res.property}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{res.id}</p>
                          <p className="text-sm font-medium mb-2">{res.guest}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1"><MapPin size={12} /> {res.checkIn}</div>
                            <div className="flex items-center gap-1"><Users size={12} /> {res.guests}</div>
                            <div className="flex items-center gap-1"><Calendar size={12} /> {res.nights}n</div>
                            <div>{res.email}</div>
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <p className="text-xs text-muted-foreground mb-1">Total</p>
                          <p className="text-2xl font-bold text-primary mb-2">€{res.total}</p>
                          <div className="flex gap-2 mb-2 text-xs">
                            <Badge className="bg-green-500/20 text-green-700">✓ Confirmed</Badge>
                            <Badge className={res.payment === 'paid' ? 'bg-blue-500/20 text-blue-700' : 'bg-yellow-500/20 text-yellow-700'}>{res.payment}</Badge>
                          </div>
                        </div>

                        <div className="sm:col-span-3 flex flex-col gap-2">
                          <Button size="sm" onClick={() => setViewRes(res)} variant="outline" className="h-9 text-xs">Details</Button>
                          <Button size="sm" variant="outline" className="h-9 text-xs"><MessageSquare size={13} /></Button>
                          <Button size="sm" variant="outline" className="h-9 text-xs"><Download size={13} /></Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!viewRes} onOpenChange={() => setViewRes(null)}>
        <DialogContent className="max-w-2xl p-4 sm:p-6">
          <DialogHeader><DialogTitle>Reservation Details</DialogTitle></DialogHeader>
          {viewRes && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div><label className="text-xs text-muted-foreground">Property</label><p className="font-semibold">{viewRes.property}</p></div>
                <div><label className="text-xs text-muted-foreground">ID</label><p className="font-semibold text-xs">{viewRes.id}</p></div>
                <div><label className="text-xs text-muted-foreground">Guest</label><p className="font-semibold">{viewRes.guest}</p></div>
                <div><label className="text-xs text-muted-foreground">Phone</label><p className="font-semibold">{viewRes.phone}</p></div>
                <div><label className="text-xs text-muted-foreground">Check In</label><p className="font-semibold">{viewRes.checkIn}</p></div>
                <div><label className="text-xs text-muted-foreground">Check Out</label><p className="font-semibold">{viewRes.checkOut}</p></div>
                <div><label className="text-xs text-muted-foreground">Guests</label><p className="font-semibold">{viewRes.guests}</p></div>
                <div><label className="text-xs text-muted-foreground">Nights</label><p className="font-semibold">{viewRes.nights}</p></div>
              </div>
              <div className="border-t pt-4 bg-muted/50 p-4 rounded-lg text-sm">
                <div className="flex justify-between mb-2"><span>Nightly</span><strong>€{Math.round(viewRes.total / viewRes.nights)}</strong></div>
                <div className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span className="text-lg text-primary">€{viewRes.total}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

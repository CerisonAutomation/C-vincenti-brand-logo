import { useState } from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Mail, Phone, Eye, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { useAdminQuotes, useConfirmReservation, useRejectReservation, useSendMessage } from '@/hooks/admin-hooks';
import { toast } from 'sonner';

interface Quote {
  id: string;
  guest: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
  nightly: number;
  status: string;
  created: string;
  listing: string;
}

export default function QuotesPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewQuote, setViewQuote] = useState<Quote | null>(null);
  const [messageModal, setMessageModal] = useState(false);
  const [message, setMessage] = useState('');

  const { data: quotesData, isLoading } = useAdminQuotes();
  const confirmMutation = useConfirmReservation();
  const rejectMutation = useRejectReservation();
  const sendMutation = useSendMessage();

  const quotes = (quotesData?.reservations || []).map((q: any): Quote => ({
    id: q._id,
    guest: q.guest?.name || 'Unknown',
    email: q.guest?.email || '',
    phone: q.guest?.phone || '',
    checkIn: q.checkInDate,
    checkOut: q.checkOutDate,
    guests: q.guest?.guestNumber || 1,
    nights: Math.ceil((new Date(q.checkOutDate).getTime() - new Date(q.checkInDate).getTime()) / (1000 * 60 * 60 * 24)),
    total: q.totalPrice || 0,
    nightly: Math.round((q.totalPrice || 0) / (Math.ceil((new Date(q.checkOutDate).getTime() - new Date(q.checkInDate).getTime()) / (1000 * 60 * 60 * 24)) || 1)),
    status: q.status || 'quoted',
    created: q.createdAt,
    listing: q.listing?.title || 'Property',
  }));

  const filtered = quotes.filter((q: Quote) => {
    const matchFilter = filter === 'all' || q.status === filter;
    const matchSearch = q.guest.toLowerCase().includes(search.toLowerCase()) || q.email.includes(search) || q.id.includes(search);
    return matchFilter && matchSearch;
  });

  const stats = {
    total: quotes.length,
    pending: quotes.filter((q: Quote) => q.status === 'quoted').length,
    confirmed: quotes.filter((q: Quote) => q.status === 'confirmed').length,
    revenue: quotes.filter((q: Quote) => q.status === 'confirmed').reduce((s: number, q: Quote) => s + q.total, 0),
  };

  const handleConfirm = async (id: string) => {
    try {
      await confirmMutation.mutateAsync(id);
      toast.success('Quote confirmed');
    } catch (err) {
      toast.error('Failed to confirm');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync(id);
      toast.success('Quote rejected');
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  const handleSendMessage = async () => {
    if (!viewQuote || !message.trim()) return;
    try {
      await sendMutation.mutateAsync({ reservationId: viewQuote.id, message });
      toast.success('Message sent');
      setMessage('');
      setMessageModal(false);
    } catch (err) {
      toast.error('Failed to send message');
    }
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
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">Booking Quotes</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage guest inquiries (synced from Guesty)</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, icon: '📋', color: 'from-blue-500/20 to-blue-500/0' },
              { label: 'Pending', value: stats.pending, icon: '⏳', color: 'from-yellow-500/20 to-yellow-500/0' },
              { label: 'Confirmed', value: stats.confirmed, icon: '✓', color: 'from-green-500/20 to-green-500/0' },
              { label: 'Revenue', value: `€${(stats.revenue / 1000).toFixed(1)}k`, icon: '💰', color: 'from-purple-500/20 to-purple-500/0' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className={`bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border/50`}>
                <p className="text-2xl sm:text-3xl mb-1">{stat.icon}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 h-10 sm:h-11 text-sm" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-40 h-10 sm:h-11 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="quoted">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin mr-2" /> Loading...</div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filtered.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">No quotes found</Card>
              ) : (
                filtered.map((q: Quote, i: number) => (
                  <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-4 sm:p-6 border-border/50 hover:shadow-lg transition-all">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-6">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">{q.guest}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{q.id} · {q.listing}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1"><Mail size={12} /> {q.email}</div>
                            <div className="flex items-center gap-1"><Phone size={12} /> {q.phone}</div>
                            <div className="flex items-center gap-1"><Calendar size={12} /> {q.checkIn}</div>
                            <div>{q.guests} guests · {q.nights} nights</div>
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <p className="text-xs text-muted-foreground mb-1">Total</p>
                          <p className="text-2xl font-bold text-primary mb-1">€{q.total}</p>
                          <p className="text-xs text-muted-foreground mb-2">€{q.nightly}/night</p>
                          <Badge className={`text-xs ${q.status === 'confirmed' ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}`}>
                            {q.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                          </Badge>
                        </div>

                        <div className="sm:col-span-3 flex flex-col gap-2">
                          <Button size="sm" variant="outline" onClick={() => setViewQuote(q)} className="h-9 text-xs"><Eye size={13} /></Button>
                          {q.status === 'quoted' && (
                            <>
                              <Button size="sm" className="h-9 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleConfirm(q.id)} disabled={confirmMutation.isPending}>Confirm</Button>
                              <Button size="sm" variant="outline" onClick={() => handleReject(q.id)} disabled={rejectMutation.isPending} className="h-9 text-xs">Reject</Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" onClick={() => { setViewQuote(q); setMessageModal(true); }} className="h-9 text-xs"><MessageSquare size={13} /></Button>
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

      <Dialog open={!!viewQuote && !messageModal} onOpenChange={() => setViewQuote(null)}>
        <DialogContent className="max-w-2xl p-4 sm:p-6">
          <DialogHeader><DialogTitle>Quote Details</DialogTitle></DialogHeader>
          {viewQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div><label className="text-xs text-muted-foreground">Guest</label><p className="font-semibold">{viewQuote.guest}</p></div>
                <div><label className="text-xs text-muted-foreground">ID</label><p className="font-semibold text-xs">{viewQuote.id}</p></div>
                <div><label className="text-xs text-muted-foreground">Email</label><p className="font-semibold text-xs truncate">{viewQuote.email}</p></div>
                <div><label className="text-xs text-muted-foreground">Phone</label><p className="font-semibold">{viewQuote.phone}</p></div>
                <div><label className="text-xs text-muted-foreground">Check In</label><p className="font-semibold">{viewQuote.checkIn}</p></div>
                <div><label className="text-xs text-muted-foreground">Check Out</label><p className="font-semibold">{viewQuote.checkOut}</p></div>
                <div><label className="text-xs text-muted-foreground">Guests</label><p className="font-semibold">{viewQuote.guests}</p></div>
                <div><label className="text-xs text-muted-foreground">Nights</label><p className="font-semibold">{viewQuote.nights}</p></div>
              </div>
              <div className="border-t pt-4 bg-muted/50 p-4 rounded-lg text-sm">
                <div className="flex justify-between mb-2"><span>Nightly</span><strong>€{viewQuote.nightly}</strong></div>
                <div className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span className="text-lg text-primary">€{viewQuote.total}</span></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewQuote(null)}>Close</Button>
                {viewQuote.status === 'quoted' && <Button className="bg-green-600 hover:bg-green-700" onClick={() => { handleConfirm(viewQuote.id); setViewQuote(null); }}>Confirm Quote</Button>}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={messageModal} onOpenChange={setMessageModal}>
        <DialogContent className="max-w-xl p-4 sm:p-6">
          <DialogHeader><DialogTitle>Send Message to {viewQuote?.guest}</DialogTitle></DialogHeader>
          <Textarea placeholder="Type your message..." value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-24" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageModal(false)}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={sendMutation.isPending || !message.trim()}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

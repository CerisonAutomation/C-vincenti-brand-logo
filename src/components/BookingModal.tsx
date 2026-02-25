import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { MALTA_LOCALITIES } from '@/lib/malta-localities';
import { format, addDays } from 'date-fns';
import { useCreateQuote } from '@/lib/guesty/hooks';
import { toast } from 'sonner';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
}

export function BookingModal({ isOpen, onClose, defaultLocation }: BookingModalProps) {
  const [step, setStep] = useState<'search' | 'guest' | 'confirm'>('search');
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    location: defaultLocation || '',
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    guests: 2,
    name: '',
    email: '',
    phone: '',
    requests: '',
  });

  const [quote, setQuote] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const createQuote = useCreateQuote();

  const handleLocationChange = (val: string) => {
    setForm(prev => ({ ...prev, location: val }));
    if (!val) {
      setSuggestions([]);
      return;
    }
    const input = val.toLowerCase();
    setSuggestions(MALTA_LOCALITIES.filter(loc =>
      loc.toLowerCase().includes(input) || input.includes(loc.split(' ')[0].toLowerCase())
    ).slice(0, 8));
  };

  const handleNext = async () => {
    if (step === 'search') {
      if (!form.location || !form.checkIn || !form.checkOut) {
        toast.error('Fill in all search fields');
        return;
      }
      setStep('guest');
    } else if (step === 'guest') {
      if (!form.name || !form.email || !form.phone) {
        toast.error('Fill in guest details');
        return;
      }
      await submitQuote();
    }
  };

  const submitQuote = async () => {
    try {
      setLoading(true);
      const nights = Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24));
      const result = await createQuote.mutateAsync({
        listingId: 'auto-detect',
        checkInDate: form.checkIn,
        checkOutDate: form.checkOut,
        guests: form.guests,
        guestName: form.name,
        guestEmail: form.email,
        guestPhone: form.phone,
        specialRequests: form.requests,
      });
      setQuote({ ...result, nights });
      setStep('confirm');
      toast.success('Quote created!');
    } catch (err) {
      toast.error('Failed to create quote');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('search');
    setForm({ location: defaultLocation || '', checkIn: format(new Date(), 'yyyy-MM-dd'), checkOut: format(addDays(new Date(), 3), 'yyyy-MM-dd'), guests: 2, name: '', email: '', phone: '', requests: '' });
    setQuote(null);
    setSuggestions([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {step === 'search' && '🏖️ Find Your Perfect Stay'}
              {step === 'guest' && '👤 Guest Information'}
              {step === 'confirm' && '✅ Quote Ready'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {step === 'search' && (
            <>
              <div>
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2"><MapPin size={14} className="text-primary" /> Where?</Label>
                <Input placeholder="e.g., Sliema, Valletta..." value={form.location} onChange={(e) => handleLocationChange(e.target.value)} className="mb-2" />
                {suggestions.length > 0 && (
                  <div className="bg-muted rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                    {suggestions.map(loc => (
                      <button key={loc} onClick={() => { setForm(prev => ({ ...prev, location: loc })); setSuggestions([]); }} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-primary/10">📍 {loc}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold mb-2 flex items-center gap-2"><Calendar size={14} className="text-primary" /> Check In</Label><Input type="date" value={form.checkIn} onChange={(e) => setForm(prev => ({ ...prev, checkIn: e.target.value }))} min={format(new Date(), 'yyyy-MM-dd')} /></div>
                <div><Label className="text-sm font-semibold mb-2 flex items-center gap-2"><Calendar size={14} className="text-primary" /> Check Out</Label><Input type="date" value={form.checkOut} onChange={(e) => setForm(prev => ({ ...prev, checkOut: e.target.value }))} min={format(addDays(new Date(form.checkIn), 1), 'yyyy-MM-dd')} /></div>
              </div>

              <div><Label className="text-sm font-semibold mb-2 flex items-center gap-2"><Users size={14} className="text-primary" /> Guests</Label><Select value={form.guests.toString()} onValueChange={(v) => setForm(prev => ({ ...prev, guests: parseInt(v) }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4,5,6,8,10].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}</SelectContent></Select></div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex gap-3 items-start"><AlertCircle size={16} className="text-primary mt-0.5 flex-shrink-0" /><p className="text-xs text-muted-foreground">Free cancellation up to 7 days. Secure checkout.</p></div>
            </>
          )}

          {step === 'guest' && (
            <>
              <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm">
                <p className="text-xs text-muted-foreground mb-3">Search Summary</p>
                <div className="grid grid-cols-2 gap-3"><div><span className="text-muted-foreground">Location:</span> <strong>{form.location}</strong></div><div><span className="text-muted-foreground">Dates:</span> <strong>{form.checkIn} → {form.checkOut}</strong></div><div><span className="text-muted-foreground">Guests:</span> <strong>{form.guests}</strong></div></div>
              </div>

              <div><Label className="text-sm font-semibold mb-1">Full Name *</Label><Input placeholder="John Doe" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div><Label className="text-sm font-semibold mb-1">Email *</Label><Input type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} /></div>
              <div><Label className="text-sm font-semibold mb-1">Phone *</Label><Input type="tel" placeholder="+356 1234 5678" value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} /></div>
              <div><Label className="text-sm font-semibold mb-1">Special Requests</Label><Input placeholder="Early check-in, crib, etc." value={form.requests} onChange={(e) => setForm(prev => ({ ...prev, requests: e.target.value }))} /></div>
            </>
          )}

          {step === 'confirm' && quote && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4"><p className="text-green-800 font-semibold mb-1">✓ Quote Created!</p><p className="text-sm text-green-700">ID: {quote.id}</p></div>
              <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between text-sm"><span>Nightly</span><strong>€{quote.nightly || 150}</strong></div>
                <div className="flex justify-between text-sm"><span>{quote.nights || 3} nights</span><strong>€{quote.total || 450}</strong></div>
                <div className="border-t pt-3 flex justify-between text-base font-semibold"><span>Total</span><span className="text-primary text-lg">€{quote.total || 450}</span></div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4"><p className="text-sm text-muted-foreground">✓ Confirmation sent to <strong>{form.email}</strong></p><p className="text-xs text-muted-foreground mt-2">Valid for 48 hours</p></div>
            </>
          )}

          <div className="flex gap-3 pt-6 border-t">
            <Button variant="outline" onClick={step === 'search' ? handleClose : () => setStep(step === 'guest' ? 'search' : 'guest')} className="flex-1">{step === 'search' ? 'Cancel' : 'Back'}</Button>
            {step !== 'confirm' && (
              <Button onClick={handleNext} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
                {loading ? <><Loader2 size={14} className="mr-2 animate-spin" /> Processing...</> : <>{step === 'search' ? 'Next' : 'Get Quote'} <ChevronRight size={16} className="ml-2" /></>}
              </Button>
            )}
            {step === 'confirm' && (
              <Button onClick={handleClose} className="flex-1 bg-primary hover:bg-primary/90">Done</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * GUESTY INTEGRATION DDD/CQRS ENTERPRISE ARCHITECTURE
 *
 * Domain-Driven Design with Command Query Responsibility Segregation:
 * - Domain entities and value objects
 * - Domain services and repositories
 * - Command and query handlers
 * - Event sourcing and CQRS patterns
 * - Domain events and event handlers
 * - Aggregate roots and domain invariants
 */

// ── Domain Core ──

// Value Objects
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (!currency) throw new Error('Currency is required');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

export class DateRange {
  constructor(
    public readonly start: Date,
    public readonly end: Date
  ) {
    if (start >= end) {
      throw new Error('Start date must be before end date');
    }
  }

  get nights(): number {
    return Math.ceil((this.end.getTime() - this.start.getTime()) / (1000 * 60 * 60 * 24));
  }

  overlaps(other: DateRange): boolean {
    return this.start < other.end && this.end > other.start;
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }
}

export class GuestCount {
  constructor(
    public readonly adults: number,
    public readonly children: number = 0,
    public readonly infants: number = 0
  ) {
    if (adults < 1) throw new Error('At least one adult is required');
    if (adults + children + infants < 1) throw new Error('Total guests must be at least 1');
  }

  get total(): number {
    return this.adults + this.children + this.infants;
  }
}

export class Address {
  constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly state: string | null,
    public readonly country: string,
    public readonly postalCode: string | null,
    public readonly latitude: number | null,
    public readonly longitude: number | null
  ) {}

  get fullAddress(): string {
    return [this.street, this.city, this.state, this.country, this.postalCode]
      .filter(Boolean)
      .join(', ');
  }
}

// Domain Entities
export class Property {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly address: Address,
    public readonly propertyType: string,
    public readonly bedrooms: number,
    public readonly bathrooms: number,
    public readonly maxOccupancy: number,
    public readonly amenities: string[],
    public readonly images: PropertyImage[],
    public readonly pricing: PropertyPricing,
    public readonly availability: PropertyAvailability,
    public readonly host: Host,
    public readonly policies: PropertyPolicies
  ) {}

  canAccommodate(guests: GuestCount): boolean {
    return guests.total <= this.maxOccupancy;
  }

  isAvailableFor(dateRange: DateRange): boolean {
    return this.availability.isAvailableFor(dateRange);
  }

  calculatePrice(dateRange: DateRange, guests: GuestCount): Money {
    return this.pricing.calculateTotal(dateRange, guests);
  }
}

export class PropertyImage {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly thumbnailUrl: string,
    public readonly caption: string | null,
    public readonly sortOrder: number
  ) {}
}

export class PropertyPricing {
  constructor(
    public readonly basePrice: Money,
    public readonly cleaningFee: Money | null,
    public readonly securityDeposit: Money | null,
    public readonly weeklyDiscount: number,
    public readonly monthlyDiscount: number,
    public readonly extraPersonFee: Money | null
  ) {}

  calculateTotal(dateRange: DateRange, guests: GuestCount): Money {
    let total = this.basePrice.multiply(dateRange.nights);

    // Apply discounts
    if (dateRange.nights >= 30) {
      total = total.multiply(1 - this.monthlyDiscount / 100);
    } else if (dateRange.nights >= 7) {
      total = total.multiply(1 - this.weeklyDiscount / 100);
    }

    // Add fees
    if (this.cleaningFee) {
      total = total.add(this.cleaningFee);
    }

    // Extra person fees
    if (this.extraPersonFee && guests.total > 2) {
      const extraGuests = guests.total - 2;
      total = total.add(this.extraPersonFee.multiply(extraGuests));
    }

    return total;
  }
}

export class PropertyAvailability {
  constructor(
    public readonly calendar: AvailabilityCalendar[]
  ) {}

  isAvailableFor(dateRange: DateRange): boolean {
    for (const block of this.calendar) {
      if (block.dateRange.overlaps(dateRange) && !block.available) {
        return false;
      }
    }
    return true;
  }

  getNextAvailableDate(): Date | null {
    const sortedBlocks = this.calendar
      .filter(block => block.available)
      .sort((a, b) => a.dateRange.start.getTime() - b.dateRange.start.getTime());

    return sortedBlocks.length > 0 ? sortedBlocks[0].dateRange.start : null;
  }
}

export class AvailabilityCalendar {
  constructor(
    public readonly dateRange: DateRange,
    public readonly available: boolean,
    public readonly price: Money | null,
    public readonly minimumStay: number | null,
    public readonly note: string | null
  ) {}
}

export class Host {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly profileImage: string | null,
    public readonly responseRate: number,
    public readonly responseTime: string,
    public readonly isSuperhost: boolean,
    public readonly languages: string[]
  ) {}
}

export class PropertyPolicies {
  constructor(
    public readonly checkInTime: string,
    public readonly checkOutTime: string,
    public readonly cancellationPolicy: string,
    public readonly smokingAllowed: boolean,
    public readonly petsAllowed: boolean,
    public readonly partiesAllowed: boolean,
    public readonly additionalRules: string[]
  ) {}
}

// Aggregate Root: Booking
export class Booking {
  private _status: BookingStatus;
  private _events: DomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly guest: Guest,
    public readonly property: Property,
    public readonly dateRange: DateRange,
    public readonly guests: GuestCount,
    public readonly pricing: BookingPricing,
    status: BookingStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this._status = status;
  }

  get status(): BookingStatus {
    return this._status;
  }

  get events(): ReadonlyArray<DomainEvent> {
    return [...this._events];
  }

  confirm(): void {
    if (this._status !== BookingStatus.PENDING) {
      throw new Error('Only pending bookings can be confirmed');
    }

    this._status = BookingStatus.CONFIRMED;
    this.addEvent(new BookingConfirmedEvent(this.id, new Date()));
  }

  cancel(reason?: string): void {
    if (this._status === BookingStatus.CANCELLED || this._status === BookingStatus.COMPLETED) {
      throw new Error('Booking cannot be cancelled');
    }

    this._status = BookingStatus.CANCELLED;
    this.addEvent(new BookingCancelledEvent(this.id, reason, new Date()));
  }

  private addEvent(event: DomainEvent): void {
    this._events.push(event);
  }

  // Business rules
  canBeModifiedBy(guestId: string): boolean {
    return this.guest.id === guestId;
  }

  isUpcoming(): boolean {
    return this.dateRange.start > new Date();
  }

  isActive(): boolean {
    const now = new Date();
    return this.dateRange.start <= now && this.dateRange.end >= now;
  }
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export class Guest {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly dateOfBirth: Date | null,
    public readonly nationality: string | null
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export class BookingPricing {
  constructor(
    public readonly baseAmount: Money,
    public readonly cleaningFee: Money | null,
    public readonly serviceFee: Money | null,
    public readonly taxes: Tax[],
    public readonly totalAmount: Money,
    public readonly currency: string
  ) {}

  get breakdown(): Record<string, Money> {
    const breakdown: Record<string, Money> = {
      base: this.baseAmount,
      total: this.totalAmount,
    };

    if (this.cleaningFee) breakdown.cleaning = this.cleaningFee;
    if (this.serviceFee) breakdown.service = this.serviceFee;

    return breakdown;
  }
}

export class Tax {
  constructor(
    public readonly name: string,
    public readonly rate: number,
    public readonly amount: Money
  ) {}
}

// ── Domain Events ──
export interface DomainEvent {
  eventType: string;
  eventId: string;
  aggregateId: string;
  occurredAt: Date;
  eventData: Record<string, any>;
}

export class BookingCreatedEvent implements DomainEvent {
  eventType = 'booking.created';
  eventId: string;
  aggregateId: string;
  occurredAt: Date;
  eventData: Record<string, any>;

  constructor(bookingId: string, propertyId: string, guestId: string, dateRange: DateRange, totalAmount: Money) {
    this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = bookingId;
    this.occurredAt = new Date();
    this.eventData = {
      propertyId,
      guestId,
      checkInDate: dateRange.start.toISOString(),
      checkOutDate: dateRange.end.toISOString(),
      totalAmount: totalAmount.amount,
      currency: totalAmount.currency,
    };
  }
}

export class BookingConfirmedEvent implements DomainEvent {
  eventType = 'booking.confirmed';
  eventId: string;
  aggregateId: string;
  occurredAt: Date;
  eventData: Record<string, any>;

  constructor(bookingId: string, confirmedAt: Date) {
    this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = bookingId;
    this.occurredAt = confirmedAt;
    this.eventData = {};
  }
}

export class BookingCancelledEvent implements DomainEvent {
  eventType = 'booking.cancelled';
  eventId: string;
  aggregateId: string;
  occurredAt: Date;
  eventData: Record<string, any>;

  constructor(bookingId: string, reason: string | undefined, cancelledAt: Date) {
    this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = bookingId;
    this.occurredAt = cancelledAt;
    this.eventData = { reason };
  }
}

export class PropertyViewedEvent implements DomainEvent {
  eventType = 'property.viewed';
  eventId: string;
  aggregateId: string;
  occurredAt: Date;
  eventData: Record<string, any>;

  constructor(propertyId: string, guestId: string | null, userAgent: string, ipAddress: string) {
    this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = propertyId;
    this.occurredAt = new Date();
    this.eventData = {
      guestId,
      userAgent,
      ipAddress,
    };
  }
}

// ── Repositories ──
export interface PropertyRepository {
  findById(id: string): Promise<Property | null>;
  findAvailable(dateRange: DateRange, guests: GuestCount, filters: PropertyFilters): Promise<Property[]>;
  save(property: Property): Promise<void>;
}

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByGuestId(guestId: string): Promise<Booking[]>;
  findByPropertyId(propertyId: string): Promise<Booking[]>;
  save(booking: Booking): Promise<void>;
  update(booking: Booking): Promise<void>;
}

export interface GuestRepository {
  findById(id: string): Promise<Guest | null>;
  findByEmail(email: string): Promise<Guest | null>;
  save(guest: Guest): Promise<void>;
}

// ── Domain Services ──
export class BookingService {
  constructor(
    private propertyRepository: PropertyRepository,
    private bookingRepository: BookingRepository,
    private guestRepository: GuestRepository
  ) {}

  async createBooking(
    guestId: string,
    propertyId: string,
    dateRange: DateRange,
    guests: GuestCount
  ): Promise<Booking> {
    // Validate business rules
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.canAccommodate(guests)) {
      throw new Error('Property cannot accommodate the requested number of guests');
    }

    if (!property.isAvailableFor(dateRange)) {
      throw new Error('Property is not available for the requested dates');
    }

    const guest = await this.guestRepository.findById(guestId);
    if (!guest) {
      throw new Error('Guest not found');
    }

    // Check for conflicting bookings
    const conflictingBookings = await this.bookingRepository.findByPropertyId(propertyId);
    const hasConflict = conflictingBookings.some(booking =>
      booking.status !== BookingStatus.CANCELLED &&
      booking.dateRange.overlaps(dateRange)
    );

    if (hasConflict) {
      throw new Error('Booking conflict detected');
    }

    // Calculate pricing
    const totalAmount = property.calculatePrice(dateRange, guests);
    const pricing = new BookingPricing(
      totalAmount,
      property.pricing.cleaningFee,
      null, // service fee
      [], // taxes
      totalAmount,
      totalAmount.currency
    );

    // Create booking
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const booking = new Booking(
      bookingId,
      guest,
      property,
      dateRange,
      guests,
      pricing,
      BookingStatus.PENDING,
      new Date(),
      new Date()
    );

    // Save and return
    await this.bookingRepository.save(booking);
    return booking;
  }

  async confirmBooking(bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.confirm();
    await this.bookingRepository.update(booking);
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.cancel(reason);
    await this.bookingRepository.update(booking);
  }
}

export class PricingService {
  calculateTaxes(amount: Money, taxRules: TaxRule[]): Tax[] {
    return taxRules.map(rule => {
      const taxAmount = amount.multiply(rule.rate / 100);
      return new Tax(rule.name, rule.rate, taxAmount);
    });
  }

  applyDiscounts(amount: Money, discounts: Discount[]): Money {
    let result = amount;
    for (const discount of discounts) {
      if (discount.type === 'percentage') {
        result = result.multiply(1 - discount.value / 100);
      } else if (discount.type === 'fixed') {
        result = result.add(new Money(-discount.value, amount.currency));
      }
    }
    return result;
  }
}

// ── Commands and Queries ──

// Commands
export interface Command {
  commandId: string;
  commandType: string;
  aggregateId: string;
  payload: Record<string, any>;
}

export class CreateBookingCommand implements Command {
  commandId: string;
  commandType = 'create_booking';

  constructor(
    public aggregateId: string,
    public payload: {
      guestId: string;
      propertyId: string;
      checkInDate: Date;
      checkOutDate: Date;
      guests: GuestCount;
    }
  ) {
    this.commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class ConfirmBookingCommand implements Command {
  commandId: string;
  commandType = 'confirm_booking';

  constructor(
    public aggregateId: string,
    public payload: {
      bookingId: string;
    }
  ) {
    this.commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Queries
export interface Query {
  queryId: string;
  queryType: string;
  payload: Record<string, any>;
}

export class GetPropertyQuery implements Query {
  queryId: string;
  queryType = 'get_property';

  constructor(
    public payload: {
      propertyId: string;
    }
  ) {
    this.queryId = `qry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class SearchPropertiesQuery implements Query {
  queryId: string;
  queryType = 'search_properties';

  constructor(
    public payload: {
      location?: string;
      checkInDate?: Date;
      checkOutDate?: Date;
      guests?: GuestCount;
      filters?: PropertyFilters;
    }
  ) {
    this.queryId = `qry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Command Handlers
export interface CommandHandler<T extends Command> {
  handle(command: T): Promise<void>;
}

export class CreateBookingCommandHandler implements CommandHandler<CreateBookingCommand> {
  constructor(private bookingService: BookingService) {}

  async handle(command: CreateBookingCommand): Promise<void> {
    const { guestId, propertyId, checkInDate, checkOutDate, guests } = command.payload;
    const dateRange = new DateRange(checkInDate, checkOutDate);

    await this.bookingService.createBooking(guestId, propertyId, dateRange, guests);
  }
}

// Query Handlers
export interface QueryHandler<T extends Query, R> {
  handle(query: T): Promise<R>;
}

export class GetPropertyQueryHandler implements QueryHandler<GetPropertyQuery, Property | null> {
  constructor(private propertyRepository: PropertyRepository) {}

  async handle(query: GetPropertyQuery): Promise<Property | null> {
    return this.propertyRepository.findById(query.payload.propertyId);
  }
}

export class SearchPropertiesQueryHandler implements QueryHandler<SearchPropertiesQuery, Property[]> {
  constructor(private propertyRepository: PropertyRepository) {}

  async handle(query: SearchPropertiesQuery): Promise<Property[]> {
    const { location, checkInDate, checkOutDate, guests, filters } = query.payload;

    let dateRange: DateRange | undefined;
    if (checkInDate && checkOutDate) {
      dateRange = new DateRange(checkInDate, checkOutDate);
    }

    return this.propertyRepository.findAvailable(
      dateRange!,
      guests || new GuestCount(2),
      filters || {}
    );
  }
}

// ── Supporting Types ──
export interface PropertyFilters {
  propertyType?: string[];
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  bedrooms?: {
    min: number;
    max: number;
  };
  instantBook?: boolean;
  superhost?: boolean;
}

export interface TaxRule {
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
}

export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  code?: string;
  description?: string;
}

// ── CQRS Infrastructure ──
export class CommandBus {
  private handlers = new Map<string, CommandHandler<any>>();

  register<T extends Command>(commandType: string, handler: CommandHandler<T>): void {
    this.handlers.set(commandType, handler);
  }

  async dispatch<T extends Command>(command: T): Promise<void> {
    const handler = this.handlers.get(command.commandType);
    if (!handler) {
      throw new Error(`No handler registered for command type: ${command.commandType}`);
    }

    await handler.handle(command);
  }
}

export class QueryBus {
  private handlers = new Map<string, QueryHandler<any, any>>();

  register<T extends Query, R>(queryType: string, handler: QueryHandler<T, R>): void {
    this.handlers.set(queryType, handler);
  }

  async execute<T extends Query, R>(query: T): Promise<R> {
    const handler = this.handlers.get(query.queryType);
    if (!handler) {
      throw new Error(`No handler registered for query type: ${query.queryType}`);
    }

    return handler.handle(query);
  }
}

// ── Event Store and Event Handlers ──
export interface EventStore {
  save(events: DomainEvent[]): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
}

export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export class BookingEventHandler implements EventHandler<BookingCreatedEvent | BookingConfirmedEvent | BookingCancelledEvent> {
  async handle(event: BookingCreatedEvent | BookingConfirmedEvent | BookingCancelledEvent): Promise<void> {
    // Send notifications, update search indexes, etc.
    console.log(`Handling ${event.eventType} for booking ${event.aggregateId}`);

    switch (event.eventType) {
      case 'booking.created':
        // Send confirmation email, update availability, etc.
        break;
      case 'booking.confirmed':
        // Send payment request, update calendar, etc.
        break;
      case 'booking.cancelled':
        // Send cancellation email, update availability, etc.
        break;
    }
  }
}

export class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    await Promise.all(handlers.map(handler => handler.handle(event)));
  }
}

// ── Application Services ──
export class PropertyApplicationService {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private eventBus: EventBus
  ) {}

  async searchProperties(criteria: SearchPropertiesQuery['payload']): Promise<Property[]> {
    const query = new SearchPropertiesQuery({ payload: criteria });
    return this.queryBus.execute(query);
  }

  async getProperty(propertyId: string): Promise<Property | null> {
    const query = new GetPropertyQuery({ payload: { propertyId } });
    return this.queryBus.execute(query);
  }

  async createBooking(
    guestId: string,
    propertyId: string,
    checkInDate: Date,
    checkOutDate: Date,
    guests: GuestCount
  ): Promise<string> {
    const command = new CreateBookingCommand(
      `booking_${Date.now()}`,
      {
        guestId,
        propertyId,
        checkInDate,
        checkOutDate,
        guests,
      }
    );

    await this.commandBus.dispatch(command);
    return command.aggregateId;
  }

  async confirmBooking(bookingId: string): Promise<void> {
    const command = new ConfirmBookingCommand(
      bookingId,
      { bookingId }
    );

    await this.commandBus.dispatch(command);
  }
}

// ── Factory Functions ──
export function createPropertyApplicationService(): PropertyApplicationService {
  // Setup dependencies
  const propertyRepository: PropertyRepository = {} as PropertyRepository; // Implementation needed
  const bookingRepository: BookingRepository = {} as BookingRepository; // Implementation needed
  const guestRepository: GuestRepository = {} as GuestRepository; // Implementation needed

  const bookingService = new BookingService(
    propertyRepository,
    bookingRepository,
    guestRepository
  );

  // Setup CQRS
  const commandBus = new CommandBus();
  const queryBus = new QueryBus();
  const eventBus = new EventBus();

  // Register command handlers
  commandBus.register('create_booking', new CreateBookingCommandHandler(bookingService));
  commandBus.register('confirm_booking', new ConfirmBookingCommandHandler(bookingService));

  // Register query handlers
  queryBus.register('get_property', new GetPropertyQueryHandler(propertyRepository));
  queryBus.register('search_properties', new SearchPropertiesQueryHandler(propertyRepository));

  // Register event handlers
  const bookingEventHandler = new BookingEventHandler();
  eventBus.subscribe('booking.created', bookingEventHandler);
  eventBus.subscribe('booking.confirmed', bookingEventHandler);
  eventBus.subscribe('booking.cancelled', bookingEventHandler);

  return new PropertyApplicationService(commandBus, queryBus, eventBus);
}

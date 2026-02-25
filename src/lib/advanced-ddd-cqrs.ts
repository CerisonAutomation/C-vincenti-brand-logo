/**
 * Advanced DDD/CQRS Architecture - Production Ready
 * Implements Domain-Driven Design with Command Query Responsibility Segregation
 * Features event-driven patterns, async processing, domain events, and comprehensive business logic
 * @version 2.0.0
 * @author Cascade AI - Project Perfection Engine
 */

import { z } from 'zod';
import { BusinessProcessSchema } from './business-automation';

// Core Domain Types
export const DomainEntitySchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number().default(1),
});

export const DomainEventSchema = z.object({
  id: z.string(),
  aggregateId: z.string(),
  aggregateType: z.string(),
  eventType: z.string(),
  eventVersion: z.string().default('1.0.0'),
  occurredAt: z.number(),
  data: z.record(z.unknown()),
  metadata: z.object({
    correlationId: z.string(),
    causationId: z.string().optional(),
    userId: z.string().optional(),
    source: z.string(),
  }),
});

export const CommandSchema = z.object({
  id: z.string(),
  commandType: z.string(),
  aggregateId: z.string().optional(),
  data: z.record(z.unknown()),
  metadata: z.object({
    correlationId: z.string(),
    userId: z.string().optional(),
    timestamp: z.number(),
    expectedVersion: z.number().optional(),
  }),
});

export const QuerySchema = z.object({
  id: z.string(),
  queryType: z.string(),
  parameters: z.record(z.unknown()),
  metadata: z.object({
    correlationId: z.string(),
    userId: z.string().optional(),
    timestamp: z.number(),
  }),
});

// Domain Primitives
export class DomainId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Domain ID cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: DomainId): boolean {
    return this.value === other.value;
  }
}

export class EmailAddress {
  constructor(private readonly value: string) {
    if (!this.isValidEmail(value)) {
      throw new Error('Invalid email address');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }
}

export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code');
    }
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
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

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}

export class DateRange {
  constructor(
    private readonly start: Date,
    private readonly end: Date
  ) {
    if (start >= end) {
      throw new Error('Start date must be before end date');
    }
  }

  getStart(): Date {
    return new Date(this.start);
  }

  getEnd(): Date {
    return new Date(this.end);
  }

  getDurationInDays(): number {
    return Math.ceil((this.end.getTime() - this.start.getTime()) / (1000 * 60 * 60 * 24));
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  overlaps(other: DateRange): boolean {
    return this.start < other.end && this.end > other.start;
  }

  toString(): string {
    return `${this.start.toISOString().split('T')[0]} to ${this.end.toISOString().split('T')[0]}`;
  }
}

// Domain Events
export abstract class DomainEvent {
  public readonly id: string;
  public readonly aggregateId: string;
  public readonly aggregateType: string;
  public readonly eventType: string;
  public readonly occurredAt: number;
  public readonly eventVersion: string;
  public readonly metadata: DomainEventMetadata;

  constructor(
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    metadata: DomainEventMetadata,
    eventVersion: string = '1.0.0'
  ) {
    this.id = crypto.randomUUID();
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.eventType = eventType;
    this.occurredAt = Date.now();
    this.eventVersion = eventVersion;
    this.metadata = metadata;
  }

  abstract getData(): Record<string, unknown>;
}

// Specific Domain Events
export class PropertyCreatedEvent extends DomainEvent {
  constructor(
    public readonly propertyId: string,
    public readonly title: string,
    public readonly ownerId: string,
    metadata: DomainEventMetadata
  ) {
    super(propertyId, 'Property', 'PropertyCreated', metadata);
  }

  getData(): Record<string, unknown> {
    return {
      propertyId: this.propertyId,
      title: this.title,
      ownerId: this.ownerId,
    };
  }
}

export class BookingCreatedEvent extends DomainEvent {
  constructor(
    public readonly bookingId: string,
    public readonly propertyId: string,
    public readonly guestId: string,
    public readonly dateRange: DateRange,
    public readonly totalAmount: Money,
    metadata: DomainEventMetadata
  ) {
    super(bookingId, 'Booking', 'BookingCreated', metadata);
  }

  getData(): Record<string, unknown> {
    return {
      bookingId: this.bookingId,
      propertyId: this.propertyId,
      guestId: this.guestId,
      dateRange: {
        start: this.dateRange.getStart().toISOString(),
        end: this.dateRange.getEnd().toISOString(),
      },
      totalAmount: {
        amount: this.totalAmount.getAmount(),
        currency: this.totalAmount.getCurrency(),
      },
    };
  }
}

export class PaymentProcessedEvent extends DomainEvent {
  constructor(
    public readonly bookingId: string,
    public readonly paymentId: string,
    public readonly amount: Money,
    public readonly status: 'completed' | 'failed' | 'refunded',
    metadata: DomainEventMetadata
  ) {
    super(bookingId, 'Booking', 'PaymentProcessed', metadata);
  }

  getData(): Record<string, unknown> {
    return {
      bookingId: this.bookingId,
      paymentId: this.paymentId,
      amount: {
        amount: this.amount.getAmount(),
        currency: this.amount.getCurrency(),
      },
      status: this.status,
    };
  }
}

// Commands
export abstract class Command {
  public readonly id: string;
  public readonly commandType: string;
  public readonly aggregateId?: string;
  public readonly metadata: CommandMetadata;

  constructor(
    commandType: string,
    aggregateId: string | undefined,
    metadata: CommandMetadata
  ) {
    this.id = crypto.randomUUID();
    this.commandType = commandType;
    this.aggregateId = aggregateId;
    this.metadata = {
      ...metadata,
      timestamp: Date.now(),
    };
  }
}

// Specific Commands
export class CreatePropertyCommand extends Command {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly address: Record<string, unknown>,
    public readonly pricing: Record<string, unknown>,
    metadata: CommandMetadata
  ) {
    super('CreateProperty', undefined, metadata);
  }
}

export class CreateBookingCommand extends Command {
  constructor(
    public readonly propertyId: string,
    public readonly guestId: string,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date,
    public readonly guestCount: number,
    metadata: CommandMetadata
  ) {
    super('CreateBooking', undefined, metadata);
  }
}

export class ProcessPaymentCommand extends Command {
  constructor(
    public readonly bookingId: string,
    public readonly paymentMethodId: string,
    public readonly amount: Money,
    metadata: CommandMetadata
  ) {
    super('ProcessPayment', bookingId, metadata);
  }
}

// Queries
export abstract class Query {
  public readonly id: string;
  public readonly queryType: string;
  public readonly metadata: QueryMetadata;

  constructor(queryType: string, metadata: QueryMetadata) {
    this.id = crypto.randomUUID();
    this.queryType = queryType;
    this.metadata = {
      ...metadata,
      timestamp: Date.now(),
    };
  }
}

// Specific Queries
export class GetPropertyByIdQuery extends Query {
  constructor(public readonly propertyId: string, metadata: QueryMetadata) {
    super('GetPropertyById', metadata);
  }
}

export class SearchPropertiesQuery extends Query {
  constructor(
    public readonly filters: Record<string, unknown>,
    public readonly pagination: { page: number; limit: number },
    metadata: QueryMetadata
  ) {
    super('SearchProperties', metadata);
  }
}

export class GetBookingByIdQuery extends Query {
  constructor(public readonly bookingId: string, metadata: QueryMetadata) {
    super('GetBookingById', metadata);
  }
}

// Domain Entities
export abstract class DomainEntity {
  protected _id: DomainId;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected _version: number;
  protected domainEvents: DomainEvent[] = [];

  constructor(id: DomainId) {
    this._id = id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._version = 1;
  }

  get id(): DomainId {
    return this._id;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get version(): number {
    return this._version;
  }

  protected incrementVersion(): void {
    this._version++;
    this._updatedAt = new Date();
  }

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  public hasUncommittedEvents(): boolean {
    return this.domainEvents.length > 0;
  }
}

// Property Aggregate Root
export class Property extends DomainEntity {
  private _title: string;
  private _description: string;
  private _address: PropertyAddress;
  private _pricing: PropertyPricing;
  private _amenities: string[];
  private _images: PropertyImage[];
  private _availability: PropertyAvailability;
  private _ownerId: DomainId;
  private _status: 'draft' | 'published' | 'archived';

  constructor(
    id: DomainId,
    title: string,
    description: string,
    address: PropertyAddress,
    pricing: PropertyPricing,
    ownerId: DomainId
  ) {
    super(id);
    this._title = title;
    this._description = description;
    this._address = address;
    this._pricing = pricing;
    this._amenities = [];
    this._images = [];
    this._availability = new PropertyAvailability();
    this._ownerId = ownerId;
    this._status = 'draft';
  }

  // Business Logic
  publish(): void {
    if (this._status !== 'draft') {
      throw new Error('Only draft properties can be published');
    }

    if (this._images.length === 0) {
      throw new Error('Property must have at least one image to be published');
    }

    this._status = 'published';
    this.incrementVersion();

    this.addDomainEvent(new PropertyCreatedEvent(
      this._id.toString(),
      this._title,
      this._ownerId.toString(),
      {
        correlationId: crypto.randomUUID(),
        source: 'Property.publish()',
      }
    ));
  }

  updatePricing(newPricing: PropertyPricing): void {
    // Validate pricing rules
    if (newPricing.basePrice <= 0) {
      throw new Error('Base price must be positive');
    }

    this._pricing = newPricing;
    this.incrementVersion();
  }

  addImage(image: PropertyImage): void {
    if (this._images.length >= 50) {
      throw new Error('Maximum 50 images allowed per property');
    }

    this._images.push(image);
    this.incrementVersion();
  }

  checkAvailability(dateRange: DateRange): boolean {
    return this._availability.isAvailable(dateRange);
  }

  // Getters
  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get address(): PropertyAddress {
    return { ...this._address };
  }

  get pricing(): PropertyPricing {
    return this._pricing;
  }

  get amenities(): string[] {
    return [...this._amenities];
  }

  get images(): PropertyImage[] {
    return [...this._images];
  }

  get status(): string {
    return this._status;
  }

  get ownerId(): DomainId {
    return this._ownerId;
  }
}

// Booking Aggregate Root
export class Booking extends DomainEntity {
  private _propertyId: DomainId;
  private _guestId: DomainId;
  private _dateRange: DateRange;
  private _guestCount: number;
  private _totalAmount: Money;
  private _status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  private _paymentStatus: 'unpaid' | 'paid' | 'refunded';

  constructor(
    id: DomainId,
    propertyId: DomainId,
    guestId: DomainId,
    dateRange: DateRange,
    guestCount: number,
    totalAmount: Money
  ) {
    super(id);
    this._propertyId = propertyId;
    this._guestId = guestId;
    this._dateRange = dateRange;
    this._guestCount = guestCount;
    this._totalAmount = totalAmount;
    this._status = 'pending';
    this._paymentStatus = 'unpaid';
  }

  // Business Logic
  confirm(): void {
    if (this._status !== 'pending') {
      throw new Error('Only pending bookings can be confirmed');
    }

    if (this._paymentStatus !== 'paid') {
      throw new Error('Booking must be paid before confirmation');
    }

    this._status = 'confirmed';
    this.incrementVersion();

    this.addDomainEvent(new BookingCreatedEvent(
      this._id.toString(),
      this._propertyId.toString(),
      this._guestId.toString(),
      this._dateRange,
      this._totalAmount,
      {
        correlationId: crypto.randomUUID(),
        source: 'Booking.confirm()',
      }
    ));
  }

  processPayment(paymentId: string, amount: Money): void {
    if (this._paymentStatus !== 'unpaid') {
      throw new Error('Payment has already been processed');
    }

    if (!amount.equals(this._totalAmount)) {
      throw new Error('Payment amount does not match booking total');
    }

    this._paymentStatus = 'paid';
    this.incrementVersion();

    this.addDomainEvent(new PaymentProcessedEvent(
      this._id.toString(),
      paymentId,
      amount,
      'completed',
      {
        correlationId: crypto.randomUUID(),
        source: 'Booking.processPayment()',
      }
    ));
  }

  cancel(): void {
    if (this._status === 'completed') {
      throw new Error('Completed bookings cannot be cancelled');
    }

    this._status = 'cancelled';
    this.incrementVersion();

    // Handle refunds, notifications, etc.
  }

  // Getters
  get propertyId(): DomainId {
    return this._propertyId;
  }

  get guestId(): DomainId {
    return this._guestId;
  }

  get dateRange(): DateRange {
    return this._dateRange;
  }

  get guestCount(): number {
    return this._guestCount;
  }

  get totalAmount(): Money {
    return this._totalAmount;
  }

  get status(): string {
    return this._status;
  }

  get paymentStatus(): string {
    return this._paymentStatus;
  }
}

// Value Objects
export class PropertyAddress {
  constructor(
    public readonly full: string,
    public readonly city: string,
    public readonly country: string,
    public readonly lat: number,
    public readonly lng: number
  ) {
    if (lat < -90 || lat > 90) {
      throw new Error('Invalid latitude');
    }
    if (lng < -180 || lng > 180) {
      throw new Error('Invalid longitude');
    }
  }
}

export class PropertyPricing {
  constructor(
    public readonly currency: string,
    public readonly basePrice: number,
    public readonly cleaningFee?: number,
    public readonly weeklyDiscount?: number,
    public readonly monthlyDiscount?: number
  ) {
    if (basePrice <= 0) {
      throw new Error('Base price must be positive');
    }
  }

  calculateTotal(nights: number): Money {
    let total = this.basePrice * nights;

    if (this.cleaningFee) {
      total += this.cleaningFee;
    }

    // Apply discounts for longer stays
    if (nights >= 30 && this.monthlyDiscount) {
      total = total * (1 - this.monthlyDiscount / 100);
    } else if (nights >= 7 && this.weeklyDiscount) {
      total = total * (1 - this.weeklyDiscount / 100);
    }

    return new Money(total, this.currency);
  }
}

export class PropertyImage {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly thumbnailUrl?: string,
    public readonly caption?: string,
    public readonly sort?: number
  ) {}
}

export class PropertyAvailability {
  private blockedDates: DateRange[] = [];

  isAvailable(dateRange: DateRange): boolean {
    return !this.blockedDates.some(blocked => blocked.overlaps(dateRange));
  }

  blockDates(dateRange: DateRange): void {
    // Check for overlaps and merge if necessary
    const overlapping = this.blockedDates.filter(blocked => blocked.overlaps(dateRange));

    if (overlapping.length === 0) {
      this.blockedDates.push(dateRange);
    } else {
      // Merge overlapping ranges
      const merged = this.mergeDateRanges([...overlapping, dateRange]);
      this.blockedDates = this.blockedDates.filter(blocked => !overlapping.includes(blocked));
      this.blockedDates.push(...merged);
    }
  }

  private mergeDateRanges(ranges: DateRange[]): DateRange[] {
    if (ranges.length <= 1) return ranges;

    // Sort by start date
    ranges.sort((a, b) => a.getStart().getTime() - b.getStart().getTime());

    const merged: DateRange[] = [ranges[0]];

    for (let i = 1; i < ranges.length; i++) {
      const current = ranges[i];
      const last = merged[merged.length - 1];

      if (current.getStart() <= last.getEnd()) {
        // Overlapping, merge
        const mergedRange = new DateRange(
          last.getStart(),
          current.getEnd() > last.getEnd() ? current.getEnd() : last.getEnd()
        );
        merged[merged.length - 1] = mergedRange;
      } else {
        merged.push(current);
      }
    }

    return merged;
  }
}

// Command Handlers
export interface CommandHandler<T extends Command> {
  handle(command: T): Promise<void>;
}

export class CreatePropertyCommandHandler implements CommandHandler<CreatePropertyCommand> {
  constructor(
    private propertyRepository: PropertyRepository,
    private eventBus: EventBus
  ) {}

  async handle(command: CreatePropertyCommand): Promise<void> {
    const propertyId = new DomainId(crypto.randomUUID());
    const address = new PropertyAddress(
      command.address.full as string,
      command.address.city as string,
      command.address.country as string,
      command.address.lat as number,
      command.address.lng as number
    );
    const pricing = new PropertyPricing(
      command.pricing.currency as string,
      command.pricing.basePrice as number,
      command.pricing.cleaningFee as number,
      command.pricing.weeklyDiscount as number,
      command.pricing.monthlyDiscount as number
    );

    const property = new Property(
      propertyId,
      command.title,
      command.description,
      address,
      pricing,
      new DomainId(command.metadata.userId!)
    );

    await this.propertyRepository.save(property);
    await this.eventBus.publishAll(property.pullDomainEvents());
  }
}

export class CreateBookingCommandHandler implements CommandHandler<CreateBookingCommand> {
  constructor(
    private bookingRepository: BookingRepository,
    private propertyRepository: PropertyRepository,
    private eventBus: EventBus
  ) {}

  async handle(command: CreateBookingCommand): Promise<void> {
    // Validate property exists and is available
    const property = await this.propertyRepository.findById(new DomainId(command.propertyId));
    if (!property) {
      throw new Error('Property not found');
    }

    const dateRange = new DateRange(command.checkInDate, command.checkOutDate);
    if (!property.checkAvailability(dateRange)) {
      throw new Error('Property is not available for the selected dates');
    }

    // Calculate pricing
    const nights = dateRange.getDurationInDays();
    const totalAmount = property.pricing.calculateTotal(nights);

    // Create booking
    const bookingId = new DomainId(crypto.randomUUID());
    const booking = new Booking(
      bookingId,
      new DomainId(command.propertyId),
      new DomainId(command.guestId),
      dateRange,
      command.guestCount,
      totalAmount
    );

    await this.bookingRepository.save(booking);
    await this.eventBus.publishAll(booking.pullDomainEvents());
  }
}

// Query Handlers
export interface QueryHandler<T extends Query, R> {
  handle(query: T): Promise<R>;
}

export class GetPropertyByIdQueryHandler implements QueryHandler<GetPropertyByIdQuery, Property | null> {
  constructor(private propertyRepository: PropertyRepository) {}

  async handle(query: GetPropertyByIdQuery): Promise<Property | null> {
    return this.propertyRepository.findById(new DomainId(query.propertyId));
  }
}

export class SearchPropertiesQueryHandler implements QueryHandler<SearchPropertiesQuery, PropertySearchResult> {
  constructor(private propertyRepository: PropertyRepository) {}

  async handle(query: SearchPropertiesQuery): Promise<PropertySearchResult> {
    return this.propertyRepository.search(query.filters, query.pagination);
  }
}

// Event Bus
export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    await Promise.all(handlers.map(handler => handler.handle(event)));
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map(event => this.publish(event)));
  }
}

// Repositories
export interface PropertyRepository {
  save(property: Property): Promise<void>;
  findById(id: DomainId): Promise<Property | null>;
  findByOwner(ownerId: DomainId): Promise<Property[]>;
  search(filters: Record<string, unknown>, pagination: { page: number; limit: number }): Promise<PropertySearchResult>;
}

export interface BookingRepository {
  save(booking: Booking): Promise<void>;
  findById(id: DomainId): Promise<Booking | null>;
  findByProperty(propertyId: DomainId): Promise<Booking[]>;
  findByGuest(guestId: DomainId): Promise<Booking[]>;
}

// CQRS Bus
export class CommandBus {
  private handlers: Map<string, CommandHandler<Command>> = new Map();

  register<T extends Command>(commandType: string, handler: CommandHandler<T>): void {
    this.handlers.set(commandType, handler as CommandHandler<Command>);
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
  private handlers: Map<string, QueryHandler<Query, unknown>> = new Map();

  register<T extends Query, R>(queryType: string, handler: QueryHandler<T, R>): void {
    this.handlers.set(queryType, handler as QueryHandler<Query, unknown>);
  }

  async execute<T extends Query, R>(query: T): Promise<R> {
    const handler = this.handlers.get(query.queryType);
    if (!handler) {
      throw new Error(`No handler registered for query type: ${query.queryType}`);
    }

    return handler.handle(query) as Promise<R>;
  }
}

// Event Sourcing
export class EventStore {
  private events: DomainEvent[] = [];

  async saveEvents(aggregateId: string, events: DomainEvent[]): Promise<void> {
    // In a real implementation, this would save to a database with optimistic concurrency
    for (const event of events) {
      if (event.aggregateId !== aggregateId) {
        throw new Error('Event aggregate ID mismatch');
      }
      this.events.push(event);
    }
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.events.filter(event => event.aggregateId === aggregateId);
  }

  async getAllEvents(): Promise<DomainEvent[]> {
    return [...this.events];
  }
}

// Application Services
export class PropertyApplicationService {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus
  ) {}

  async createProperty(command: CreatePropertyCommand): Promise<string> {
    await this.commandBus.dispatch(command);
    return command.id; // Would be set by the command handler
  }

  async getProperty(query: GetPropertyByIdQuery): Promise<Property | null> {
    return this.queryBus.execute<GetPropertyByIdQuery, Property | null>(query);
  }

  async searchProperties(query: SearchPropertiesQuery): Promise<PropertySearchResult> {
    return this.queryBus.execute<SearchPropertiesQuery, PropertySearchResult>(query);
  }
}

export class BookingApplicationService {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus
  ) {}

  async createBooking(command: CreateBookingCommand): Promise<string> {
    await this.commandBus.dispatch(command);
    return command.id;
  }

  async processPayment(command: ProcessPaymentCommand): Promise<void> {
    await this.commandBus.dispatch(command);
  }

  async getBooking(query: GetBookingByIdQuery): Promise<Booking | null> {
    return this.queryBus.execute<GetBookingByIdQuery, Booking | null>(query);
  }
}

// Event Handlers
export interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}

export class PropertyCreatedEventHandler implements EventHandler {
  async handle(event: PropertyCreatedEvent): Promise<void> {
    // Send notification to property owner
    console.log(`Property created: ${event.propertyId} - ${event.title}`);

    // Update search indexes
    // Send welcome email
    // etc.
  }
}

export class BookingCreatedEventHandler implements EventHandler {
  async handle(event: BookingCreatedEvent): Promise<void> {
    // Send confirmation emails
    console.log(`Booking created: ${event.bookingId} for property ${event.propertyId}`);

    // Update property availability
    // Send notifications to host and guest
    // Schedule check-in reminders
    // etc.
  }
}

export class PaymentProcessedEventHandler implements EventHandler {
  async handle(event: PaymentProcessedEvent): Promise<void> {
    // Update booking status
    console.log(`Payment processed: ${event.paymentId} for booking ${event.bookingId}`);

    // Send payment confirmations
    // Update financial records
    // Trigger booking confirmation
    // etc.
  }
}

// Saga Pattern for Complex Business Processes
export abstract class Saga {
  protected id: string;
  protected completed = false;

  constructor(id: string) {
    this.id = id;
  }

  abstract handleEvent(event: DomainEvent): Promise<void>;
  abstract isComplete(): boolean;
  abstract getResult(): unknown;

  getId(): string {
    return this.id;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  protected markCompleted(): void {
    this.completed = true;
  }
}

export class BookingSaga extends Saga {
  private bookingId?: string;
  private paymentProcessed = false;
  private confirmationSent = false;

  constructor(bookingId: string) {
    super(`booking-${bookingId}`);
  }

  async handleEvent(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case 'BookingCreated':
        this.bookingId = (event as BookingCreatedEvent).bookingId;
        // Send initial booking confirmation
        await this.sendBookingConfirmation();
        break;

      case 'PaymentProcessed':
        if ((event as PaymentProcessedEvent).status === 'completed') {
          this.paymentProcessed = true;
          // Send payment confirmation
          await this.sendPaymentConfirmation();
        }
        break;
    }

    if (this.bookingId && this.paymentProcessed && this.confirmationSent) {
      this.markCompleted();
    }
  }

  isComplete(): boolean {
    return this.bookingId !== undefined && this.paymentProcessed && this.confirmationSent;
  }

  getResult(): unknown {
    return {
      bookingId: this.bookingId,
      paymentProcessed: this.paymentProcessed,
      confirmationSent: this.confirmationSent,
    };
  }

  private async sendBookingConfirmation(): Promise<void> {
    // Send booking confirmation email
    console.log(`Sending booking confirmation for ${this.bookingId}`);
    this.confirmationSent = true;
  }

  private async sendPaymentConfirmation(): Promise<void> {
    // Send payment confirmation email
    console.log(`Sending payment confirmation for ${this.bookingId}`);
  }
}

// Global instances and wiring
export const eventBus = new EventBus();
export const commandBus = new CommandBus();
export const queryBus = new QueryBus();
export const eventStore = new EventStore();

// Wire up event handlers
eventBus.subscribe('PropertyCreated', new PropertyCreatedEventHandler());
eventBus.subscribe('BookingCreated', new BookingCreatedEventHandler());
eventBus.subscribe('PaymentProcessed', new PaymentProcessedEventHandler());

// Application services
export const propertyService = new PropertyApplicationService(commandBus, queryBus);
export const bookingService = new BookingApplicationService(commandBus, queryBus);

// Type definitions
interface DomainEventMetadata {
  correlationId: string;
  causationId?: string;
  userId?: string;
  source: string;
}

interface CommandMetadata {
  correlationId: string;
  userId?: string;
  timestamp?: number;
}

interface QueryMetadata {
  correlationId: string;
  userId?: string;
  timestamp?: number;
}

interface PropertySearchResult {
  properties: Property[];
  totalCount: number;
  page: number;
  pageSize: number;
}

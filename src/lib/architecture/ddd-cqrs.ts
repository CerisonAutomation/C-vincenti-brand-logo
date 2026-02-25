/**
 * Domain-Driven Design (DDD) / Command Query Responsibility Segregation (CQRS) Architecture
 * Event-driven architecture with self-healing gates and enterprise-grade patterns
 * Implements domain modeling, command/query separation, event sourcing, and resilience patterns
 * @version 2.0.0
 * @author Cascade AI
 */

// Core domain types and interfaces
export interface DomainEntity {
  readonly id: string;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date;
}

export interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly version: number;
  readonly timestamp: Date;
  readonly payload: Record<string, any>;
  readonly metadata: {
    readonly correlationId: string;
    readonly causationId?: string;
    readonly userId?: string;
  };
}

export interface Command {
  readonly id: string;
  readonly type: string;
  readonly aggregateId: string;
  readonly payload: Record<string, any>;
  readonly metadata: {
    readonly correlationId: string;
    readonly userId?: string;
    readonly timestamp: Date;
  };
}

export interface Query {
  readonly id: string;
  readonly type: string;
  readonly payload: Record<string, any>;
  readonly metadata: {
    readonly correlationId: string;
    readonly userId?: string;
  };
}

// Domain aggregates
export class BookingAggregate implements DomainEntity {
  readonly id: string;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private _status: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  private _listingId: string;
  private _guestId: string;
  private _checkIn: Date;
  private _checkOut: Date;
  private _guests: number;
  private _totalPrice: number;
  private _currency: string;

  constructor(
    id: string,
    listingId: string,
    guestId: string,
    checkIn: Date,
    checkOut: Date,
    guests: number,
    totalPrice: number,
    currency: string
  ) {
    this.id = id;
    this.version = 1;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this._status = 'draft';
    this._listingId = listingId;
    this._guestId = guestId;
    this._checkIn = checkIn;
    this._checkOut = checkOut;
    this._guests = guests;
    this._totalPrice = totalPrice;
    this._currency = currency;
  }

  // Business logic methods
  confirm(): void {
    if (this._status !== 'draft') {
      throw new DomainError('Can only confirm draft bookings');
    }
    this._status = 'confirmed';
  }

  cancel(): void {
    if (this._status === 'completed') {
      throw new DomainError('Cannot cancel completed bookings');
    }
    this._status = 'cancelled';
  }

  complete(): void {
    if (this._status !== 'confirmed') {
      throw new DomainError('Can only complete confirmed bookings');
    }
    this._status = 'completed';
  }

  // Getters
  get status() { return this._status; }
  get listingId() { return this._listingId; }
  get guestId() { return this._guestId; }
  get checkIn() { return this._checkIn; }
  get checkOut() { return this._checkOut; }
  get guests() { return this._guests; }
  get totalPrice() { return this._totalPrice; }
  get currency() { return this._currency; }
}

export class ListingAggregate implements DomainEntity {
  readonly id: string;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private _title: string;
  private _description: string;
  private _price: number;
  private _currency: string;
  private _isActive: boolean;
  private _hostId: string;

  constructor(
    id: string,
    title: string,
    description: string,
    price: number,
    currency: string,
    hostId: string
  ) {
    this.id = id;
    this.version = 1;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this._title = title;
    this._description = description;
    this._price = price;
    this._currency = currency;
    this._isActive = true;
    this._hostId = hostId;
  }

  updatePrice(newPrice: number): void {
    if (newPrice <= 0) {
      throw new DomainError('Price must be positive');
    }
    this._price = newPrice;
  }

  deactivate(): void {
    this._isActive = false;
  }

  get title() { return this._title; }
  get description() { return this._description; }
  get price() { return this._price; }
  get currency() { return this._currency; }
  get isActive() { return this._isActive; }
  get hostId() { return this._hostId; }
}

// Command handlers
export interface CommandHandler<T extends Command = Command> {
  handle(command: T): Promise<void>;
}

export class CreateBookingCommandHandler implements CommandHandler {
  constructor(
    private eventStore: EventStore,
    private bookingRepository: BookingRepository
  ) {}

  async handle(command: CreateBookingCommand): Promise<void> {
    try {
      // Validate business rules
      await this.validateBooking(command);

      // Create aggregate
      const booking = new BookingAggregate(
        command.aggregateId,
        command.payload.listingId,
        command.payload.guestId,
        new Date(command.payload.checkIn),
        new Date(command.payload.checkOut),
        command.payload.guests,
        command.payload.totalPrice,
        command.payload.currency
      );

      // Save aggregate
      await this.bookingRepository.save(booking);

      // Emit domain events
      await this.eventStore.append([
        new BookingCreatedEvent(
          command.id,
          booking.id,
          command.payload,
          command.metadata
        )
      ]);

    } catch (error) {
      await this.handleCommandError(command, error);
    }
  }

  private async validateBooking(command: CreateBookingCommand): Promise<void> {
    // Business rule validations
    const existingBookings = await this.bookingRepository.findOverlapping(
      command.payload.listingId,
      new Date(command.payload.checkIn),
      new Date(command.payload.checkOut)
    );

    if (existingBookings.length > 0) {
      throw new DomainError('Listing is not available for selected dates');
    }
  }

  private async handleCommandError(command: Command, error: any): Promise<void> {
    // Log error and emit failure event
    console.error('Command failed:', command, error);

    await this.eventStore.append([
      new CommandFailedEvent(
        command.id,
        command.aggregateId,
        { error: error.message },
        command.metadata
      )
    ]);
  }
}

// Query handlers
export interface QueryHandler<T extends Query = Query, R = any> {
  handle(query: T): Promise<R>;
}

export class GetBookingQueryHandler implements QueryHandler<GetBookingQuery, BookingView> {
  constructor(private bookingReadModel: BookingReadModel) {}

  async handle(query: GetBookingQuery): Promise<BookingView> {
    const booking = await this.bookingReadModel.findById(query.payload.bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    return booking;
  }
}

// Event store abstraction
export interface EventStore {
  append(events: DomainEvent[]): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  subscribe(handler: (event: DomainEvent) => Promise<void>): () => void;
}

// Event sourcing repository
export class EventSourcedRepository<T extends DomainEntity> {
  constructor(
    private eventStore: EventStore,
    private aggregateFactory: (events: DomainEvent[]) => T
  ) {}

  async save(aggregate: T): Promise<void> {
    const events = await this.eventStore.getEvents(aggregate.id);
    const expectedVersion = events.length;

    if (aggregate.version !== expectedVersion + 1) {
      throw new ConcurrencyError('Aggregate version conflict');
    }

    // In a real implementation, we'd extract events from the aggregate
    // For now, we'll assume events are passed separately
  }

  async findById(id: string): Promise<T | null> {
    const events = await this.eventStore.getEvents(id);

    if (events.length === 0) {
      return null;
    }

    return this.aggregateFactory(events);
  }
}

// Self-healing circuit breaker
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000,
    private monitoringPeriod: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new CircuitBreakerError('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();

      if (this.state === 'half-open') {
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();

      if (this.failures >= this.failureThreshold) {
        this.trip();
      }

      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private trip(): void {
    this.state = 'open';
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Saga pattern for complex business transactions
export class BookingSaga {
  constructor(
    private commandBus: CommandBus,
    private eventStore: EventStore
  ) {}

  async handleBookingProcess(bookingId: string): Promise<void> {
    const unsubscribe = this.eventStore.subscribe(async (event) => {
      if (event.aggregateId === bookingId) {
        switch (event.type) {
          case 'BookingCreated':
            await this.processPayment(bookingId);
            break;
          case 'PaymentSucceeded':
            await this.confirmBooking(bookingId);
            break;
          case 'PaymentFailed':
            await this.cancelBooking(bookingId);
            break;
          case 'BookingConfirmed':
            await this.sendConfirmationEmail(bookingId);
            break;
        }
      }
    });

    // Cleanup after saga completes
    setTimeout(unsubscribe, 300000); // 5 minutes timeout
  }

  private async processPayment(bookingId: string): Promise<void> {
    // Implementation would process payment
  }

  private async confirmBooking(bookingId: string): Promise<void> {
    await this.commandBus.send(new ConfirmBookingCommand(bookingId));
  }

  private async cancelBooking(bookingId: string): Promise<void> {
    await this.commandBus.send(new CancelBookingCommand(bookingId));
  }

  private async sendConfirmationEmail(bookingId: string): Promise<void> {
    // Implementation would send email
  }
}

// Command and Query buses
export class CommandBus {
  private handlers = new Map<string, CommandHandler>();

  register<T extends Command>(commandType: string, handler: CommandHandler<T>): void {
    this.handlers.set(commandType, handler);
  }

  async send(command: Command): Promise<void> {
    const handler = this.handlers.get(command.type);

    if (!handler) {
      throw new Error(`No handler registered for command type: ${command.type}`);
    }

    return handler.handle(command);
  }
}

export class QueryBus {
  private handlers = new Map<string, QueryHandler>();

  register<T extends Query, R>(queryType: string, handler: QueryHandler<T, R>): void {
    this.handlers.set(queryType, handler);
  }

  async send<T extends Query, R>(query: T): Promise<R> {
    const handler = this.handlers.get(query.type) as QueryHandler<T, R>;

    if (!handler) {
      throw new Error(`No handler registered for query type: ${query.type}`);
    }

    return handler.handle(query);
  }
}

// Domain events
export class BookingCreatedEvent implements DomainEvent {
  readonly id: string;
  readonly type = 'BookingCreated';
  readonly aggregateId: string;
  readonly aggregateType = 'Booking';
  readonly version: number;
  readonly timestamp: Date;

  constructor(
    commandId: string,
    aggregateId: string,
    payload: Record<string, any>,
    metadata: Command['metadata']
  ) {
    this.id = commandId;
    this.aggregateId = aggregateId;
    this.version = 1;
    this.timestamp = new Date();
    this.payload = payload;
    this.metadata = metadata;
  }

  readonly payload: Record<string, any>;
  readonly metadata: DomainEvent['metadata'];
}

export class CommandFailedEvent implements DomainEvent {
  readonly id: string;
  readonly type = 'CommandFailed';
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly version: number;
  readonly timestamp: Date;

  constructor(
    commandId: string,
    aggregateId: string,
    payload: Record<string, any>,
    metadata: Command['metadata']
  ) {
    this.id = commandId;
    this.aggregateId = aggregateId;
    this.version = 1;
    this.timestamp = new Date();
    this.payload = payload;
    this.metadata = metadata;
  }

  readonly payload: Record<string, any>;
  readonly metadata: DomainEvent['metadata'];
}

// Commands
export class CreateBookingCommand implements Command {
  readonly id: string;
  readonly type = 'CreateBooking';
  readonly aggregateId: string;

  constructor(
    id: string,
    aggregateId: string,
    payload: {
      listingId: string;
      guestId: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      totalPrice: number;
      currency: string;
    },
    metadata: Command['metadata']
  ) {
    this.id = id;
    this.aggregateId = aggregateId;
    this.payload = payload;
    this.metadata = metadata;
  }

  readonly payload: Record<string, any>;
  readonly metadata: Command['metadata'];
}

export class ConfirmBookingCommand implements Command {
  readonly id: string;
  readonly type = 'ConfirmBooking';
  readonly aggregateId: string;

  constructor(bookingId: string) {
    this.id = crypto.randomUUID();
    this.aggregateId = bookingId;
    this.payload = {};
    this.metadata = {
      correlationId: crypto.randomUUID(),
      timestamp: new Date(),
    };
  }

  readonly payload: Record<string, any>;
  readonly metadata: Command['metadata'];
}

export class CancelBookingCommand implements Command {
  readonly id: string;
  readonly type = 'CancelBooking';
  readonly aggregateId: string;

  constructor(bookingId: string) {
    this.id = crypto.randomUUID();
    this.aggregateId = bookingId;
    this.payload = {};
    this.metadata = {
      correlationId: crypto.randomUUID(),
      timestamp: new Date(),
    };
  }

  readonly payload: Record<string, any>;
  readonly metadata: Command['metadata'];
}

// Queries
export class GetBookingQuery implements Query {
  readonly id: string;
  readonly type = 'GetBooking';

  constructor(bookingId: string) {
    this.id = crypto.randomUUID();
    this.type = 'GetBooking';
    this.payload = { bookingId };
    this.metadata = {
      correlationId: crypto.randomUUID(),
    };
  }

  readonly payload: Record<string, any>;
  readonly metadata: Query['metadata'];
}

// Read models
export interface BookingView {
  id: string;
  listingId: string;
  guestId: string;
  status: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  currency: string;
  createdAt: Date;
}

// Repositories
export interface BookingRepository {
  save(booking: BookingAggregate): Promise<void>;
  findById(id: string): Promise<BookingAggregate | null>;
  findOverlapping(listingId: string, checkIn: Date, checkOut: Date): Promise<BookingAggregate[]>;
}

export interface BookingReadModel {
  findById(id: string): Promise<BookingView | null>;
  findByGuest(guestId: string): Promise<BookingView[]>;
  findByListing(listingId: string): Promise<BookingView[]>;
}

// Domain errors
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConcurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyError';
  }
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

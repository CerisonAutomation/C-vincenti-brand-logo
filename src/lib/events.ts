/**
 * Event-driven architecture for the application.
 * Implements CQRS pattern with event sourcing capabilities.
 */

// Base event interface
export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: Date;
  eventData: Record<string, unknown>;
  metadata?: {
    correlationId?: string;
    causationId?: string;
    userId?: string;
    tenantId?: string;
  };
}

// Event handler interface
export interface EventHandler<T extends DomainEvent> {
  eventType: string;
  handle(event: T): Promise<void> | void;
}

// Event handler interface
export interface EventHandler<T extends DomainEvent> {
  eventType: string;
  handle(event: T): Promise<void> | void;
}

// Event bus for publishing and subscribing to events
export class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  /**
   * Subscribe to an event type
   */
  subscribe<T extends DomainEvent>(handler: EventHandler<T>): void {
    const handlers = this.handlers.get(handler.eventType) || [];
    handlers.push(handler);
    this.handlers.set(handler.eventType, handlers);
  }

  /**
   * Unsubscribe from an event type
   */
  unsubscribe<T extends DomainEvent>(handler: EventHandler<T>): void {
    const handlers = this.handlers.get(handler.eventType) || [];
    const filtered = handlers.filter(h => h !== handler);
    this.handlers.set(handler.eventType, filtered);
  }

  /**
   * Publish an event to all subscribers
   */
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];

    // Publish to all handlers asynchronously
    const promises = handlers.map(handler =>
      Promise.resolve(handler.handle(event)).catch(error => {
        console.error(`Error handling event ${event.eventType}:`, error);
        // Continue processing other handlers even if one fails
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Publish multiple events in sequence
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}

// Global event bus instance
export const eventBus = new EventBus();

// Domain events for the property management system
export class PropertyListedEvent implements DomainEvent {
  eventId: string;
  eventType = 'PropertyListed';
  aggregateId: string; // property id
  occurredAt: Date;
  eventData: {
    title: string;
    location: string;
    price: string;
    amenities: string[];
  };

  constructor(propertyId: string, data: PropertyListedEvent['eventData']) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = propertyId;
    this.occurredAt = new Date();
    this.eventData = data;
  }
}

export class BookingCreatedEvent implements DomainEvent {
  eventId: string;
  eventType = 'BookingCreated';
  aggregateId: string; // booking id
  occurredAt: Date;
  eventData: {
    propertyId: string;
    userId: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
  };

  constructor(bookingId: string, data: BookingCreatedEvent['eventData']) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = bookingId;
    this.occurredAt = new Date();
    this.eventData = data;
  }
}

export class UserRegisteredEvent implements DomainEvent {
  eventId: string;
  eventType = 'UserRegistered';
  aggregateId: string; // user id
  occurredAt: Date;
  eventData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'owner' | 'guest' | 'admin';
  };

  constructor(userId: string, data: UserRegisteredEvent['eventData']) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = userId;
    this.occurredAt = new Date();
    this.eventData = data;
  }
}

// Command interface for CQRS
export interface Command {
  commandId: string;
  commandType: string;
  aggregateId: string;
  commandData: Record<string, unknown>;
}

// Command handler interface
export interface CommandHandler<T extends Command> {
  commandType: string;
  handle(command: T): Promise<void> | void;
}

// Command bus for CQRS
export class CommandBus {
  private handlers = new Map<string, CommandHandler<Command>>();

  register<T extends Command>(handler: CommandHandler<T>): void {
    this.handlers.set(handler.commandType, handler as CommandHandler<Command>);
  }

  async execute(command: Command): Promise<void> {
    const handler = this.handlers.get(command.commandType);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.commandType}`);
    }

    await Promise.resolve(handler.handle(command));
  }
}

// Global command bus instance
export const commandBus = new CommandBus();

// Commands for the system
export class CreatePropertyCommand implements Command {
  commandId: string;
  commandType = 'CreateProperty';
  aggregateId: string;
  commandData: {
    title: string;
    location: string;
    price: string;
    amenities: string[];
    description?: string;
  };

  constructor(propertyId: string, data: CreatePropertyCommand['commandData']) {
    this.commandId = crypto.randomUUID();
    this.aggregateId = propertyId;
    this.commandData = data;
  }
}

export class BookPropertyCommand implements Command {
  commandId: string;
  commandType = 'BookProperty';
  aggregateId: string; // booking id
  commandData: {
    propertyId: string;
    userId: string;
    checkIn: Date;
    checkOut: Date;
  };

  constructor(bookingId: string, data: BookPropertyCommand['commandData']) {
    this.commandId = crypto.randomUUID();
    this.aggregateId = bookingId;
    this.commandData = data;
  }
}

// Aggregate root base class for DDD
export abstract class AggregateRoot {
  protected id: string;
  protected version: number = 0;
  protected uncommittedEvents: DomainEvent[] = [];

  constructor(id: string) {
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  getVersion(): number {
    return this.version;
  }

  protected markAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  protected applyEvent(event: DomainEvent): void {
    this.version++;
    this.uncommittedEvents.push(event);
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }
}

// Property aggregate
export class Property extends AggregateRoot {
  private title: string = '';
  private location: string = '';
  private price: string = '';
  private amenities: string[] = [];
  private isAvailable: boolean = true;

  static create(id: string, title: string, location: string, price: string, amenities: string[]): Property {
    const property = new Property(id);
    const event = new PropertyListedEvent(id, { title, location, price, amenities });
    property.applyEvent(event);
    property.applyPropertyListed(event);
    return property;
  }

  private applyPropertyListed(event: PropertyListedEvent): void {
    this.title = event.eventData.title;
    this.location = event.eventData.location;
    this.price = event.eventData.price;
    this.amenities = event.eventData.amenities;
  }

  // Getters
  getTitle(): string { return this.title; }
  getLocation(): string { return this.location; }
  getPrice(): string { return this.price; }
  getAmenities(): string[] { return this.amenities; }
  getIsAvailable(): boolean { return this.isAvailable; }
}

// Repository interface for data persistence
export interface Repository<T extends AggregateRoot> {
  save(aggregate: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}

// Event store for event sourcing
export interface EventStore {
  saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEventsForAggregate(aggregateId: string): Promise<DomainEvent[]>;
}

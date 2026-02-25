/**
 * Enterprise AI Routing and Schema Enforcement with Dynamic Playbooks
 * Implements intelligent request routing, schema validation, and automated decision-making
 * Features multi-model AI orchestration and dynamic playbook execution
 * @version 2.0.0
 * @author Cascade AI
 */

import { z } from 'zod';
import OpenAI from 'openai';

// AI Configuration
export const AIConfig = {
  MODELS: {
    ROUTING: 'gpt-4-turbo-preview',
    VALIDATION: 'gpt-4-turbo-preview',
    DECISION_MAKING: 'gpt-4-turbo-preview',
    NATURAL_LANGUAGE: 'gpt-3.5-turbo',
    CODE_GENERATION: 'gpt-4-turbo-preview',
  },

  TEMPERATURES: {
    ROUTING: 0.1, // Low creativity for consistent routing
    VALIDATION: 0.0, // Zero creativity for validation
    DECISION_MAKING: 0.3, // Moderate creativity for decisions
    NATURAL_LANGUAGE: 0.7, // High creativity for conversation
    CODE_GENERATION: 0.2, // Low creativity for code
  },

  MAX_TOKENS: {
    ROUTING: 500,
    VALIDATION: 1000,
    DECISION_MAKING: 2000,
    NATURAL_LANGUAGE: 1500,
    CODE_GENERATION: 3000,
  },

  RATE_LIMITS: {
    REQUESTS_PER_MINUTE: 60,
    TOKENS_PER_MINUTE: 100000,
  },

  CONFIDENCE_THRESHOLDS: {
    ROUTING: 0.8,
    VALIDATION: 0.9,
    DECISION_MAKING: 0.7,
  },
} as const;

// Request Classification Schema
export const RequestClassificationSchema = z.object({
  intent: z.enum([
    'BOOKING_CREATE',
    'BOOKING_MODIFY',
    'BOOKING_CANCEL',
    'LISTING_SEARCH',
    'LISTING_DETAILS',
    'USER_PROFILE_UPDATE',
    'PAYMENT_PROCESS',
    'SUPPORT_REQUEST',
    'GENERAL_INQUIRY',
  ]),
  confidence: z.number().min(0).max(1),
  entities: z.record(z.any()),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  complexity: z.enum(['SIMPLE', 'MODERATE', 'COMPLEX']),
  requiredCapabilities: z.array(z.string()),
});

// AI Router - Intelligent Request Routing
export class AIRouter {
  private openai: OpenAI;
  private routeCache = new Map<string, RoutingDecision>();
  private performanceMetrics = new Map<string, number[]>();

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async routeRequest(request: IncomingRequest): Promise<RoutingDecision> {
    const cacheKey = this.generateCacheKey(request);

    // Check cache first
    if (this.routeCache.has(cacheKey)) {
      return this.routeCache.get(cacheKey)!;
    }

    const startTime = performance.now();

    try {
      // Classify the request using AI
      const classification = await this.classifyRequest(request);

      // Apply routing logic
      const decision = await this.makeRoutingDecision(request, classification);

      // Validate routing decision
      const validatedDecision = await this.validateRoutingDecision(decision);

      // Cache the decision
      this.routeCache.set(cacheKey, validatedDecision);

      // Record performance metrics
      const duration = performance.now() - startTime;
      this.recordMetric('routing_duration', duration);

      return validatedDecision;

    } catch (error) {
      console.error('AI routing failed:', error);
      // Fallback to rule-based routing
      return this.fallbackRouting(request);
    }
  }

  private async classifyRequest(request: IncomingRequest): Promise<RequestClassification> {
    const prompt = `
Analyze this user request and classify it according to our booking platform schema:

Request: "${request.content}"
Context: ${JSON.stringify(request.context)}
User History: ${JSON.stringify(request.userHistory)}

Provide classification in the following JSON format:
{
  "intent": "BOOKING_CREATE|BOOKING_MODIFY|BOOKING_CANCEL|LISTING_SEARCH|LISTING_DETAILS|USER_PROFILE_UPDATE|PAYMENT_PROCESS|SUPPORT_REQUEST|GENERAL_INQUIRY",
  "confidence": 0.0-1.0,
  "entities": { extracted entities },
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
  "urgency": "LOW|MEDIUM|HIGH|CRITICAL",
  "complexity": "SIMPLE|MODERATE|COMPLEX",
  "requiredCapabilities": ["array of required capabilities"]
}
`;

    const response = await this.openai.chat.completions.create({
      model: AIConfig.MODELS.ROUTING,
      messages: [{ role: 'user', content: prompt }],
      temperature: AIConfig.TEMPERATURES.ROUTING,
      max_tokens: AIConfig.MAX_TOKENS.ROUTING,
    });

    const classificationText = response.choices[0]?.message?.content;
    if (!classificationText) {
      throw new Error('No classification response from AI');
    }

    const classification = JSON.parse(classificationText);
    return RequestClassificationSchema.parse(classification);
  }

  private async makeRoutingDecision(
    request: IncomingRequest,
    classification: RequestClassification
  ): Promise<RoutingDecision> {
    const decision: RoutingDecision = {
      route: this.determineRoute(classification),
      priority: this.calculatePriority(classification),
      estimatedDuration: this.estimateDuration(classification),
      requiredResources: this.determineResources(classification),
      fallbackRoutes: this.generateFallbacks(classification),
      monitoring: {
        trackPerformance: true,
        alertOnFailure: classification.urgency === 'CRITICAL',
        logLevel: classification.complexity === 'COMPLEX' ? 'DEBUG' : 'INFO',
      },
    };

    return decision;
  }

  private determineRoute(classification: RequestClassification): Route {
    switch (classification.intent) {
      case 'BOOKING_CREATE':
        return {
          service: 'booking-service',
          endpoint: '/api/bookings',
          method: 'POST',
          version: 'v2',
        };
      case 'LISTING_SEARCH':
        return {
          service: 'listing-service',
          endpoint: '/api/listings/search',
          method: 'GET',
          version: 'v2',
        };
      case 'PAYMENT_PROCESS':
        return {
          service: 'payment-service',
          endpoint: '/api/payments',
          method: 'POST',
          version: 'v2',
        };
      case 'SUPPORT_REQUEST':
        return {
          service: 'support-service',
          endpoint: '/api/support',
          method: 'POST',
          version: 'v1',
        };
      default:
        return {
          service: 'general-service',
          endpoint: '/api/general',
          method: 'POST',
          version: 'v1',
        };
    }
  }

  private calculatePriority(classification: RequestClassification): Priority {
    if (classification.urgency === 'CRITICAL' || classification.intent === 'PAYMENT_PROCESS') {
      return 'CRITICAL';
    }
    if (classification.urgency === 'HIGH' || classification.intent === 'BOOKING_CREATE') {
      return 'HIGH';
    }
    if (classification.urgency === 'MEDIUM') {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private estimateDuration(classification: RequestClassification): number {
    const baseDuration = 1000; // 1 second base
    const complexityMultiplier = {
      SIMPLE: 1,
      MODERATE: 2,
      COMPLEX: 4,
    }[classification.complexity];

    const urgencyMultiplier = {
      LOW: 1,
      MEDIUM: 1.5,
      HIGH: 2,
      CRITICAL: 3,
    }[classification.urgency];

    return baseDuration * complexityMultiplier * urgencyMultiplier;
  }

  private determineResources(classification: RequestClassification): ResourceRequirements {
    return {
      cpu: classification.complexity === 'COMPLEX' ? 'HIGH' : 'MEDIUM',
      memory: classification.intent === 'LISTING_SEARCH' ? 'HIGH' : 'MEDIUM',
      database: classification.intent.includes('BOOKING') ? 'READ_WRITE' : 'READ_ONLY',
      externalAPIs: classification.requiredCapabilities,
    };
  }

  private generateFallbacks(classification: RequestClassification): Route[] {
    const fallbacks: Route[] = [];

    // Add slower but more reliable fallback routes
    if (classification.intent === 'BOOKING_CREATE') {
      fallbacks.push({
        service: 'booking-service',
        endpoint: '/api/bookings/fallback',
        method: 'POST',
        version: 'v1',
      });
    }

    // Add general support fallback
    fallbacks.push({
      service: 'support-service',
      endpoint: '/api/support',
      method: 'POST',
      version: 'v1',
    });

    return fallbacks;
  }

  private async validateRoutingDecision(decision: RoutingDecision): Promise<RoutingDecision> {
    // Use AI to validate the routing decision
    const validationPrompt = `
Validate this routing decision for the given request:

Request: ${JSON.stringify(decision.originalRequest)}
Decision: ${JSON.stringify(decision)}

Is this routing decision appropriate? Consider:
- Service capabilities
- Load balancing
- Business rules
- User permissions
- Performance requirements

Respond with "VALID" or "INVALID: [reason]"
`;

    const response = await this.openai.chat.completions.create({
      model: AIConfig.MODELS.VALIDATION,
      messages: [{ role: 'user', content: validationPrompt }],
      temperature: AIConfig.TEMPERATURES.VALIDATION,
      max_tokens: AIConfig.MAX_TOKENS.VALIDATION,
    });

    const validation = response.choices[0]?.message?.content || '';

    if (validation.startsWith('INVALID')) {
      throw new Error(`Routing validation failed: ${validation}`);
    }

    return decision;
  }

  private fallbackRouting(request: IncomingRequest): RoutingDecision {
    // Rule-based fallback routing
    return {
      route: {
        service: 'general-service',
        endpoint: '/api/general',
        method: 'POST',
        version: 'v1',
      },
      priority: 'LOW',
      estimatedDuration: 5000,
      requiredResources: {
        cpu: 'LOW',
        memory: 'LOW',
        database: 'READ_ONLY',
        externalAPIs: [],
      },
      fallbackRoutes: [],
      monitoring: {
        trackPerformance: false,
        alertOnFailure: false,
        logLevel: 'ERROR',
      },
    };
  }

  private generateCacheKey(request: IncomingRequest): string {
    return `${request.method}-${request.endpoint}-${request.userId}-${JSON.stringify(request.body).slice(0, 100)}`;
  }

  private recordMetric(name: string, value: number): void {
    if (!this.performanceMetrics.has(name)) {
      this.performanceMetrics.set(name, []);
    }

    const metrics = this.performanceMetrics.get(name)!;
    metrics.push(value);

    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getMetrics(): Record<string, { avg: number; p95: number; count: number }> {
    const result: Record<string, { avg: number; p95: number; count: number }> = {};

    this.performanceMetrics.forEach((values, name) => {
      if (values.length === 0) return;

      const sorted = [...values].sort((a, b) => a - b);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const p95 = sorted[Math.floor(sorted.length * 0.95)];

      result[name] = {
        avg: Math.round(avg),
        p95: Math.round(p95),
        count: values.length,
      };
    });

    return result;
  }
}

// Dynamic Playbook Engine
export class PlaybookEngine {
  private playbooks = new Map<string, Playbook>();
  private executionHistory = new Map<string, PlaybookExecution[]>();

  registerPlaybook(playbook: Playbook): void {
    this.playbooks.set(playbook.id, playbook);
  }

  async executePlaybook(
    playbookId: string,
    context: PlaybookContext,
    input: Record<string, any>
  ): Promise<PlaybookResult> {
    const playbook = this.playbooks.get(playbookId);
    if (!playbook) {
      throw new Error(`Playbook not found: ${playbookId}`);
    }

    const execution: PlaybookExecution = {
      id: crypto.randomUUID(),
      playbookId,
      startTime: new Date(),
      status: 'RUNNING',
      steps: [],
      context,
      input,
    };

    try {
      // Execute playbook steps
      for (const step of playbook.steps) {
        const stepResult = await this.executeStep(step, context, input);

        execution.steps.push({
          stepId: step.id,
          startTime: new Date(),
          endTime: new Date(),
          status: stepResult.success ? 'COMPLETED' : 'FAILED',
          output: stepResult.output,
          error: stepResult.error,
        });

        if (!stepResult.success && step.onFailure === 'STOP') {
          break;
        }

        // Update context with step output
        Object.assign(context, stepResult.output);
      }

      execution.status = 'COMPLETED';
      execution.endTime = new Date();

      this.recordExecution(execution);

      return {
        success: true,
        output: context,
        execution,
      };

    } catch (error) {
      execution.status = 'FAILED';
      execution.endTime = new Date();
      execution.error = error as Error;

      this.recordExecution(execution);

      return {
        success: false,
        error: error as Error,
        execution,
      };
    }
  }

  private async executeStep(
    step: PlaybookStep,
    context: PlaybookContext,
    input: Record<string, any>
  ): Promise<StepResult> {
    try {
      // Evaluate conditions
      if (step.conditions) {
        for (const condition of step.conditions) {
          if (!this.evaluateCondition(condition, context, input)) {
            return {
              success: true,
              output: {},
              skipped: true,
            };
          }
        }
      }

      // Execute action
      const output = await this.executeAction(step.action, context, input);

      // Validate output
      if (step.validation) {
        const validationResult = await this.validateOutput(step.validation, output);
        if (!validationResult.valid) {
          throw new Error(`Step validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      return {
        success: true,
        output,
      };

    } catch (error) {
      return {
        success: false,
        error: error as Error,
        output: {},
      };
    }
  }

  private evaluateCondition(
    condition: PlaybookCondition,
    context: PlaybookContext,
    input: Record<string, any>
  ): boolean {
    // Simple condition evaluation
    const value = this.getValueByPath(condition.field, { context, input });
    const expectedValue = condition.value;

    switch (condition.operator) {
      case 'EQUALS':
        return value === expectedValue;
      case 'NOT_EQUALS':
        return value !== expectedValue;
      case 'GREATER_THAN':
        return value > expectedValue;
      case 'LESS_THAN':
        return value < expectedValue;
      case 'CONTAINS':
        return String(value).includes(String(expectedValue));
      case 'EXISTS':
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }

  private async executeAction(
    action: PlaybookAction,
    context: PlaybookContext,
    input: Record<string, any>
  ): Promise<Record<string, any>> {
    switch (action.type) {
      case 'HTTP_REQUEST':
        return await this.executeHttpRequest(action.config, context, input);
      case 'DATABASE_QUERY':
        return await this.executeDatabaseQuery(action.config, context, input);
      case 'AI_ANALYSIS':
        return await this.executeAIAnalysis(action.config, context, input);
      case 'NOTIFICATION':
        return await this.executeNotification(action.config, context, input);
      case 'TRANSFORMATION':
        return this.executeTransformation(action.config, context, input);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async executeHttpRequest(
    config: HttpActionConfig,
    context: PlaybookContext,
    input: Record<string, any>
  ): Promise<Record<string, any>> {
    const url = this.interpolateString(config.url, context, input);
    const headers = this.interpolateObject(config.headers || {}, context, input);
    const body = config.body ? JSON.stringify(this.interpolateObject(config.body, context, input)) : undefined;

    const response = await fetch(url, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private async executeDatabaseQuery(
    config: DatabaseActionConfig,
    context: PlaybookContext,
    input: Record<string, any>
  ): Promise<Record<string, any>> {
    // Implementation would execute database query
    // For now, return mock data
    return { result: 'mock database result' };
  }

  private async executeAIAnalysis(
    config: AIAnalysisActionConfig,
    context: PlaybookContext,
    input: Record<string, any>
  ): Promise<Record<string, any>> {
    // Use AI to analyze data
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const prompt = this.interpolateString(config.prompt, context, input);

    const response = await openai.chat.completions.create({
      model: AIConfig.MODELS.DECISION_MAKING,
      messages: [{ role: 'user', content: prompt }],
      temperature: AIConfig.TEMPERATURES.DECISION_MAKING,
      max_tokens: AIConfig.MAX_TOKENS.DECISION_MAKING,
    });

    const analysis = response.choices[0]?.message?.content || '{}';
    return JSON.parse(analysis);
  }

  private async executeNotification(
    config: NotificationActionConfig,
    context: PlaybookContext,
    input: Record<string, any>
  ): Promise<Record<string, any>> {
    // Implementation would send notification
    console.log('Sending notification:', config);
    return { sent: true };
  }

  private executeTransformation(
    config: TransformationActionConfig,
    context: PlaybookContext,
    input: Record<string, any>
  ): Record<string, any> {
    // Apply data transformation
    const data = this.interpolateObject(config.input, context, input);
    const result = this.applyTransformation(config.transform, data);
    return result;
  }

  private async validateOutput(
    validation: PlaybookValidation,
    output: Record<string, any>
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const rule of validation.rules) {
      const value = this.getValueByPath(rule.field, output);

      switch (rule.type) {
        case 'REQUIRED':
          if (value === undefined || value === null || value === '') {
            errors.push(`${rule.field} is required`);
          }
          break;
        case 'TYPE':
          if (typeof value !== rule.expectedType) {
            errors.push(`${rule.field} must be of type ${rule.expectedType}`);
          }
          break;
        case 'RANGE':
          if (typeof value === 'number') {
            if (rule.min !== undefined && value < rule.min) {
              errors.push(`${rule.field} must be at least ${rule.min}`);
            }
            if (rule.max !== undefined && value > rule.max) {
              errors.push(`${rule.field} must be at most ${rule.max}`);
            }
          }
          break;
        case 'PATTERN':
          if (typeof value === 'string' && !new RegExp(rule.pattern).test(value)) {
            errors.push(`${rule.field} must match pattern ${rule.pattern}`);
          }
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private interpolateString(
    template: string,
    context: PlaybookContext,
    input: Record<string, any>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.getValueByPath(key, { context, input }) || match;
    });
  }

  private interpolateObject(
    obj: Record<string, any>,
    context: PlaybookContext,
    input: Record<string, any>
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = this.interpolateString(value, context, input);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.interpolateObject(value, context, input);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private applyTransformation(transform: TransformationConfig, data: any): any {
    // Simple transformation logic
    switch (transform.type) {
      case 'MAP':
        return transform.mapping.reduce((acc, map) => {
          acc[map.to] = this.getValueByPath(map.from, data);
          return acc;
        }, {} as Record<string, any>);
      case 'FILTER':
        return data.filter((item: any) => {
          const value = this.getValueByPath(transform.field, item);
          return transform.condition(value);
        });
      case 'AGGREGATE':
        return data.reduce((acc: any, item: any) => {
          const value = this.getValueByPath(transform.field, item);
          acc[transform.operation] = acc[transform.operation] || 0;
          acc[transform.operation] += value;
          return acc;
        }, {});
      default:
        return data;
    }
  }

  private getValueByPath(path: string, obj: any): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private recordExecution(execution: PlaybookExecution): void {
    const executions = this.executionHistory.get(execution.playbookId) || [];
    executions.push(execution);

    // Keep only last 50 executions
    if (executions.length > 50) {
      executions.shift();
    }

    this.executionHistory.set(execution.playbookId, executions);
  }

  getExecutionHistory(playbookId: string): PlaybookExecution[] {
    return this.executionHistory.get(playbookId) || [];
  }
}

// React Hook for AI Routing
export const useAIRouting = () => {
  const [router] = useState(() => new AIRouter(process.env.OPENAI_API_KEY!));

  const routeRequest = useCallback(async (request: IncomingRequest) => {
    return await router.routeRequest(request);
  }, [router]);

  const getMetrics = useCallback(() => {
    return router.getMetrics();
  }, [router]);

  return { routeRequest, getMetrics };
};

// React Hook for Dynamic Playbooks
export const useDynamicPlaybooks = () => {
  const [engine] = useState(() => new PlaybookEngine());

  const executePlaybook = useCallback(async (
    playbookId: string,
    context: PlaybookContext,
    input: Record<string, any>
  ) => {
    return await engine.executePlaybook(playbookId, context, input);
  }, [engine]);

  const registerPlaybook = useCallback((playbook: Playbook) => {
    engine.registerPlaybook(playbook);
  }, [engine]);

  const getExecutionHistory = useCallback((playbookId: string) => {
    return engine.getExecutionHistory(playbookId);
  }, [engine]);

  return { executePlaybook, registerPlaybook, getExecutionHistory };
};

// Type definitions
export interface IncomingRequest {
  id: string;
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body?: any;
  userId?: string;
  content: string;
  context: Record<string, any>;
  userHistory?: any[];
}

export interface RequestClassification {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  requiredCapabilities: string[];
}

export interface Route {
  service: string;
  endpoint: string;
  method: string;
  version: string;
}

export interface RoutingDecision {
  route: Route;
  priority: Priority;
  estimatedDuration: number;
  requiredResources: ResourceRequirements;
  fallbackRoutes: Route[];
  monitoring: {
    trackPerformance: boolean;
    alertOnFailure: boolean;
    logLevel: string;
  };
  originalRequest?: IncomingRequest;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ResourceRequirements {
  cpu: 'LOW' | 'MEDIUM' | 'HIGH';
  memory: 'LOW' | 'MEDIUM' | 'HIGH';
  database: 'READ_ONLY' | 'READ_WRITE';
  externalAPIs: string[];
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: PlaybookStep[];
  triggers: PlaybookTrigger[];
  metadata: {
    author: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  };
}

export interface PlaybookStep {
  id: string;
  name: string;
  description: string;
  action: PlaybookAction;
  conditions?: PlaybookCondition[];
  validation?: PlaybookValidation;
  onFailure: 'CONTINUE' | 'STOP' | 'RETRY';
  retryAttempts?: number;
  timeout?: number;
}

export interface PlaybookAction {
  type: 'HTTP_REQUEST' | 'DATABASE_QUERY' | 'AI_ANALYSIS' | 'NOTIFICATION' | 'TRANSFORMATION';
  config: ActionConfig;
}

export interface PlaybookCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'EXISTS';
  value: any;
}

export interface PlaybookValidation {
  rules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  type: 'REQUIRED' | 'TYPE' | 'RANGE' | 'PATTERN';
  expectedType?: string;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface PlaybookTrigger {
  type: 'EVENT' | 'SCHEDULE' | 'API_CALL' | 'USER_ACTION';
  config: Record<string, any>;
}

export interface PlaybookContext {
  userId?: string;
  sessionId?: string;
  requestId: string;
  correlationId: string;
  [key: string]: any;
}

export interface PlaybookExecution {
  id: string;
  playbookId: string;
  startTime: Date;
  endTime?: Date;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  steps: StepExecution[];
  context: PlaybookContext;
  input: Record<string, any>;
  error?: Error;
}

export interface StepExecution {
  stepId: string;
  startTime: Date;
  endTime: Date;
  status: 'COMPLETED' | 'FAILED' | 'SKIPPED';
  output: Record<string, any>;
  error?: Error;
}

export interface StepResult {
  success: boolean;
  output: Record<string, any>;
  error?: Error;
  skipped?: boolean;
}

export interface PlaybookResult {
  success: boolean;
  output?: Record<string, any>;
  error?: Error;
  execution: PlaybookExecution;
}

// Action configuration types
export interface HttpActionConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

export interface DatabaseActionConfig {
  query: string;
  parameters?: Record<string, any>;
}

export interface AIAnalysisActionConfig {
  prompt: string;
  model?: string;
  temperature?: number;
}

export interface NotificationActionConfig {
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  recipient: string;
  subject?: string;
  message: string;
}

export interface TransformationActionConfig {
  input: Record<string, any>;
  transform: TransformationConfig;
}

export interface TransformationConfig {
  type: 'MAP' | 'FILTER' | 'AGGREGATE';
  mapping?: Array<{ from: string; to: string }>;
  field?: string;
  condition?: (value: any) => boolean;
  operation?: string;
}

export type ActionConfig =
  | HttpActionConfig
  | DatabaseActionConfig
  | AIAnalysisActionConfig
  | NotificationActionConfig
  | TransformationActionConfig;

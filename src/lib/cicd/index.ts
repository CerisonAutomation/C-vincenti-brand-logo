/**
 * Enterprise CI/CD, Monitoring, Documentation, ADRs, OpenAPI, and Deployment Automation
 * Implements comprehensive DevOps pipeline, observability, documentation, and automated deployment
 * Features multi-environment deployment, comprehensive monitoring, and operational excellence
 * @version 2.0.0
 * @author Cascade AI
 */

import { z } from 'zod';

// CI/CD Configuration
export const CIConfig = {
  PIPELINES: {
    MAIN: {
      name: 'guesty-booking-platform',
      triggers: ['push', 'pull_request', 'schedule'],
      environments: ['development', 'staging', 'production'],
      requiredChecks: [
        'lint',
        'type-check',
        'unit-tests',
        'integration-tests',
        'e2e-tests',
        'security-scan',
        'performance-test',
        'accessibility-test',
      ],
    },
  },

  QUALITY_GATES: {
    COVERAGE_THRESHOLD: 95,
    PERFORMANCE_BUDGET: {
      BUNDLE_SIZE: 100 * 1024, // 100KB
      FIRST_CONTENTFUL_PAINT: 1800, // 1.8s
      LARGEST_CONTENTFUL_PAINT: 2500, // 2.5s
    },
    SECURITY_SCORE: 85,
    ACCESSIBILITY_SCORE: 95,
  },

  DEPLOYMENT_STRATEGIES: {
    DEVELOPMENT: 'direct',
    STAGING: 'canary',
    PRODUCTION: 'blue-green',
  },

  ROLLBACK_STRATEGIES: {
    AUTOMATIC: 'immediate',
    MANUAL: 'gradual',
    SAFE: 'feature-flag',
  },
} as const;

// Monitoring and Observability
export class MonitoringService {
  private static instance: MonitoringService;
  private metrics = new Map<string, MetricData>();
  private alerts = new Map<string, AlertRule>();

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    const key = `${name}:${JSON.stringify(tags)}`;

    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        name,
        values: [],
        tags,
        lastUpdated: new Date(),
      });
    }

    const metric = this.metrics.get(key)!;
    metric.values.push({
      value,
      timestamp: new Date(),
    });

    // Keep only last 1000 values
    if (metric.values.length > 1000) {
      metric.values = metric.values.slice(-1000);
    }

    metric.lastUpdated = new Date();

    // Check alert rules
    this.checkAlerts(name, value, tags);
  }

  private checkAlerts(metricName: string, value: number, tags: Record<string, string>): void {
    this.alerts.forEach((rule, alertId) => {
      if (rule.metric === metricName && this.evaluateCondition(rule.condition, value)) {
        this.triggerAlert(alertId, rule, value, tags);
      }
    });
  }

  private evaluateCondition(condition: AlertCondition, value: number): boolean {
    switch (condition.operator) {
      case 'GT':
        return value > condition.threshold;
      case 'LT':
        return value < condition.threshold;
      case 'EQ':
        return value === condition.threshold;
      case 'GTE':
        return value >= condition.threshold;
      case 'LTE':
        return value <= condition.threshold;
      default:
        return false;
    }
  }

  private triggerAlert(
    alertId: string,
    rule: AlertRule,
    value: number,
    tags: Record<string, string>
  ): void {
    const alert = {
      id: crypto.randomUUID(),
      alertId,
      message: rule.message,
      severity: rule.severity,
      value,
      threshold: rule.condition.threshold,
      tags,
      timestamp: new Date(),
    };

    console.error('🚨 ALERT TRIGGERED:', alert);

    // Send to monitoring systems
    this.sendToMonitoringSystems(alert);

    // Execute automated responses
    this.executeAutomatedResponses(rule, alert);
  }

  private sendToMonitoringSystems(alert: Alert): void {
    // Send to DataDog, New Relic, etc.
    const monitoringPayload = {
      title: alert.message,
      text: `Alert: ${alert.alertId} - Value: ${alert.value}, Threshold: ${alert.threshold}`,
      tags: Object.entries(alert.tags).map(([k, v]) => `${k}:${v}`),
      timestamp: alert.timestamp.getTime() / 1000,
    };

    // Implementation would send to actual monitoring services
    fetch('/api/monitoring/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(monitoringPayload),
    }).catch(() => {
      // Silently fail if monitoring endpoint is unavailable
    });
  }

  private executeAutomatedResponses(rule: AlertRule, alert: Alert): void {
    rule.automatedResponses?.forEach(response => {
      switch (response.type) {
        case 'SCALE_UP':
          this.scaleService(response.config.service, response.config.replicas);
          break;
        case 'ROLLBACK':
          this.rollbackDeployment(response.config.deploymentId);
          break;
        case 'NOTIFICATION':
          this.sendNotification(response.config.channels, alert);
          break;
        case 'CIRCUIT_BREAKER':
          this.tripCircuitBreaker(response.config.service);
          break;
      }
    });
  }

  private scaleService(service: string, replicas: number): void {
    console.log(`Scaling ${service} to ${replicas} replicas`);
    // Implementation would call Kubernetes API or similar
  }

  private rollbackDeployment(deploymentId: string): void {
    console.log(`Rolling back deployment ${deploymentId}`);
    // Implementation would trigger rollback
  }

  private sendNotification(channels: string[], alert: Alert): void {
    console.log(`Sending notification to ${channels.join(', ')}:`, alert.message);
    // Implementation would send to Slack, email, SMS, etc.
  }

  private tripCircuitBreaker(service: string): void {
    console.log(`Tripping circuit breaker for ${service}`);
    // Implementation would trip circuit breaker
  }

  addAlertRule(rule: AlertRule): void {
    this.alerts.set(rule.id, rule);
  }

  removeAlertRule(alertId: string): void {
    this.alerts.delete(alertId);
  }

  getMetrics(): Record<string, MetricSummary> {
    const summaries: Record<string, MetricSummary> = {};

    this.metrics.forEach((metric) => {
      if (metric.values.length === 0) return;

      const values = metric.values.map(v => v.value);
      const sorted = [...values].sort((a, b) => a - b);

      summaries[metric.name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        lastValue: values[values.length - 1],
        lastUpdated: metric.lastUpdated,
        tags: metric.tags,
      };
    });

    return summaries;
  }

  getActiveAlerts(): Alert[] {
    // Implementation would track active alerts
    return [];
  }

  exportMetrics(): string {
    const metrics = this.getMetrics();
    return JSON.stringify(metrics, null, 2);
  }
}

// Deployment Automation
export class DeploymentService {
  private static instance: DeploymentService;
  private deployments = new Map<string, Deployment>();

  static getInstance(): DeploymentService {
    if (!DeploymentService.instance) {
      DeploymentService.instance = new DeploymentService();
    }
    return DeploymentService.instance;
  }

  async deploy(
    environment: string,
    version: string,
    config: DeploymentConfig
  ): Promise<DeploymentResult> {
    const deploymentId = crypto.randomUUID();

    const deployment: Deployment = {
      id: deploymentId,
      environment,
      version,
      status: 'STARTING',
      startTime: new Date(),
      config,
      logs: [],
    };

    this.deployments.set(deploymentId, deployment);

    try {
      // Pre-deployment checks
      await this.runPreDeploymentChecks(deployment);

      // Execute deployment strategy
      await this.executeDeploymentStrategy(deployment);

      // Post-deployment verification
      await this.runPostDeploymentVerification(deployment);

      deployment.status = 'SUCCESS';
      deployment.endTime = new Date();

      return {
        success: true,
        deploymentId,
        environment,
        version,
        deployedAt: new Date(),
      };

    } catch (error) {
      deployment.status = 'FAILED';
      deployment.endTime = new Date();
      deployment.error = error as Error;

      // Execute rollback if configured
      if (config.rollbackOnFailure) {
        await this.rollbackDeployment(deployment);
      }

      return {
        success: false,
        deploymentId,
        environment,
        version,
        error: error as Error,
      };
    }
  }

  private async runPreDeploymentChecks(deployment: Deployment): Promise<void> {
    const checks = [
      this.checkEnvironmentHealth(deployment.environment),
      this.validateVersion(deployment.version),
      this.checkDependencies(deployment.config.dependencies || []),
      this.runSecurityScan(deployment.version),
      this.runPerformanceTest(deployment.version),
    ];

    const results = await Promise.allSettled(checks);

    const failures = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    if (failures.length > 0) {
      throw new Error(`Pre-deployment checks failed: ${failures.join(', ')}`);
    }
  }

  private async executeDeploymentStrategy(deployment: Deployment): Promise<void> {
    const strategy = deployment.config.strategy || CIConfig.DEPLOYMENT_STRATEGIES[deployment.environment.toUpperCase() as keyof typeof CIConfig.DEPLOYMENT_STRATEGIES] || 'direct';

    switch (strategy) {
      case 'direct':
        await this.deployDirect(deployment);
        break;
      case 'canary':
        await this.deployCanary(deployment);
        break;
      case 'blue-green':
        await this.deployBlueGreen(deployment);
        break;
      default:
        throw new Error(`Unknown deployment strategy: ${strategy}`);
    }
  }

  private async deployDirect(deployment: Deployment): Promise<void> {
    this.logDeployment(deployment, 'Starting direct deployment');

    // Implementation would deploy directly to target environment
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate deployment

    this.logDeployment(deployment, 'Direct deployment completed');
  }

  private async deployCanary(deployment: Deployment): Promise<void> {
    this.logDeployment(deployment, 'Starting canary deployment');

    // Deploy to 10% of traffic
    await this.updateTrafficSplit(deployment.environment, deployment.version, 0.1);

    // Wait for monitoring period
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Check metrics
    const metrics = MonitoringService.getInstance().getMetrics();
    const errorRate = metrics['api.error_rate']?.p95 || 0;

    if (errorRate > 5) { // 5% error rate threshold
      throw new Error('Canary deployment failed: high error rate');
    }

    // Gradually increase traffic
    await this.updateTrafficSplit(deployment.environment, deployment.version, 0.5);
    await new Promise(resolve => setTimeout(resolve, 30000));

    await this.updateTrafficSplit(deployment.environment, deployment.version, 1.0);

    this.logDeployment(deployment, 'Canary deployment completed');
  }

  private async deployBlueGreen(deployment: Deployment): Promise<void> {
    this.logDeployment(deployment, 'Starting blue-green deployment');

    // Deploy to green environment
    await this.deployToEnvironment('green', deployment.version);

    // Run smoke tests
    await this.runSmokeTests('green');

    // Switch traffic from blue to green
    await this.switchTraffic(deployment.environment, 'green');

    // Monitor for issues
    await new Promise(resolve => setTimeout(resolve, 60000));

    const metrics = MonitoringService.getInstance().getMetrics();
    const errorRate = metrics['api.error_rate']?.p95 || 0;

    if (errorRate > 2) {
      // Rollback to blue
      await this.switchTraffic(deployment.environment, 'blue');
      throw new Error('Blue-green deployment failed: switching back to blue');
    }

    this.logDeployment(deployment, 'Blue-green deployment completed');
  }

  private async runPostDeploymentVerification(deployment: Deployment): Promise<void> {
    const verifications = [
      this.checkServiceHealth(deployment.environment),
      this.runSmokeTests(deployment.environment),
      this.validateDatabaseMigrations(deployment.version),
      this.checkExternalIntegrations(deployment.environment),
    ];

    const results = await Promise.allSettled(verifications);

    const failures = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    if (failures.length > 0) {
      throw new Error(`Post-deployment verification failed: ${failures.join(', ')}`);
    }
  }

  private async rollbackDeployment(deployment: Deployment): Promise<void> {
    this.logDeployment(deployment, 'Starting rollback');

    // Implementation would rollback to previous version
    await new Promise(resolve => setTimeout(resolve, 3000));

    this.logDeployment(deployment, 'Rollback completed');
  }

  private logDeployment(deployment: Deployment, message: string): void {
    const logEntry = {
      timestamp: new Date(),
      level: 'INFO',
      message,
    };

    deployment.logs.push(logEntry);
    console.log(`[${deployment.environment}] ${message}`);
  }

  // Placeholder implementations for deployment operations
  private async checkEnvironmentHealth(env: string): Promise<void> {
    // Implementation would check environment health
  }

  private async validateVersion(version: string): Promise<void> {
    // Implementation would validate version format and existence
  }

  private async checkDependencies(deps: string[]): Promise<void> {
    // Implementation would check dependency availability
  }

  private async runSecurityScan(version: string): Promise<void> {
    // Implementation would run security scan
  }

  private async runPerformanceTest(version: string): Promise<void> {
    // Implementation would run performance tests
  }

  private async updateTrafficSplit(env: string, version: string, percentage: number): Promise<void> {
    // Implementation would update load balancer
  }

  private async deployToEnvironment(env: string, version: string): Promise<void> {
    // Implementation would deploy to specific environment
  }

  private async runSmokeTests(env: string): Promise<void> {
    // Implementation would run smoke tests
  }

  private async switchTraffic(env: string, target: string): Promise<void> {
    // Implementation would switch traffic routing
  }

  private async checkServiceHealth(env: string): Promise<void> {
    // Implementation would check service health
  }

  private async validateDatabaseMigrations(version: string): Promise<void> {
    // Implementation would validate DB migrations
  }

  private async checkExternalIntegrations(env: string): Promise<void> {
    // Implementation would check external integrations
  }

  getDeploymentStatus(deploymentId: string): Deployment | null {
    return this.deployments.get(deploymentId) || null;
  }

  getDeploymentHistory(environment?: string): Deployment[] {
    const deployments = Array.from(this.deployments.values());

    if (environment) {
      return deployments.filter(d => d.environment === environment);
    }

    return deployments;
  }
}

// Documentation and ADR Management
export class DocumentationService {
  private static instance: DocumentationService;
  private adrs = new Map<string, ADR>();

  static getInstance(): DocumentationService {
    if (!DocumentationService.instance) {
      DocumentationService.instance = new DocumentationService();
    }
    return DocumentationService.instance;
  }

  createADR(adr: Omit<ADR, 'id' | 'createdAt' | 'updatedAt'>): ADR {
    const newADR: ADR = {
      ...adr,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.adrs.set(newADR.id, newADR);
    return newADR;
  }

  updateADR(id: string, updates: Partial<ADR>): ADR | null {
    const adr = this.adrs.get(id);
    if (!adr) return null;

    const updatedADR = {
      ...adr,
      ...updates,
      updatedAt: new Date(),
    };

    this.adrs.set(id, updatedADR);
    return updatedADR;
  }

  getADR(id: string): ADR | null {
    return this.adrs.get(id) || null;
  }

  getAllADRs(): ADR[] {
    return Array.from(this.adrs.values());
  }

  searchADRs(query: string): ADR[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.adrs.values()).filter(adr =>
      adr.title.toLowerCase().includes(lowercaseQuery) ||
      adr.description.toLowerCase().includes(lowercaseQuery) ||
      adr.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  generateOpenAPISpec(): OpenAPISpec {
    return {
      openapi: '3.0.3',
      info: {
        title: 'Guesty Booking Platform API',
        version: '2.0.0',
        description: 'Enterprise-grade booking platform API',
      },
      servers: [
        {
          url: 'https://api.guesty.com',
          description: 'Production server',
        },
      ],
      paths: this.generateAPIPaths(),
      components: {
        schemas: this.generateAPISchemas(),
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    };
  }

  private generateAPIPaths(): Record<string, any> {
    return {
      '/api/listings': {
        get: {
          summary: 'Search listings',
          parameters: [
            {
              name: 'location',
              in: 'query',
              schema: { type: 'string' },
              description: 'Location to search',
            },
            {
              name: 'checkIn',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Check-in date',
            },
            {
              name: 'checkOut',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Check-out date',
            },
            {
              name: 'guests',
              in: 'query',
              schema: { type: 'integer', minimum: 1 },
              description: 'Number of guests',
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SearchResult',
                  },
                },
              },
            },
          },
        },
      },
      '/api/bookings': {
        post: {
          summary: 'Create booking',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateBookingRequest',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Booking created',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BookingResponse',
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  private generateAPISchemas(): Record<string, any> {
    return {
      Listing: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          address: { $ref: '#/components/schemas/Address' },
          pricing: { $ref: '#/components/schemas/Pricing' },
          amenities: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      Address: {
        type: 'object',
        properties: {
          full: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
        },
      },
      Pricing: {
        type: 'object',
        properties: {
          basePrice: { type: 'number' },
          currency: { type: 'string' },
          cleaningFee: { type: 'number' },
        },
      },
      SearchResult: {
        type: 'object',
        properties: {
          listings: {
            type: 'array',
            items: { $ref: '#/components/schemas/Listing' },
          },
          totalCount: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
        },
      },
      CreateBookingRequest: {
        type: 'object',
        required: ['listingId', 'checkInDateLocalized', 'checkOutDateLocalized', 'guestsCount'],
        properties: {
          listingId: { type: 'string' },
          checkInDateLocalized: { type: 'string', format: 'date' },
          checkOutDateLocalized: { type: 'string', format: 'date' },
          guestsCount: { type: 'integer', minimum: 1 },
          guestInfo: { $ref: '#/components/schemas/GuestInfo' },
        },
      },
      GuestInfo: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
        },
      },
      BookingResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          confirmationCode: { type: 'string' },
          status: { type: 'string' },
          money: { $ref: '#/components/schemas/Money' },
        },
      },
      Money: {
        type: 'object',
        properties: {
          currency: { type: 'string' },
          totalPaid: { type: 'number' },
        },
      },
    };
  }
}

// React Hooks for CI/CD and Monitoring
export const useMonitoring = () => {
  const [monitoring] = useState(() => MonitoringService.getInstance());

  const recordMetric = useCallback((name: string, value: number, tags?: Record<string, string>) => {
    monitoring.recordMetric(name, value, tags);
  }, [monitoring]);

  const getMetrics = useCallback(() => {
    return monitoring.getMetrics();
  }, [monitoring]);

  const addAlertRule = useCallback((rule: AlertRule) => {
    monitoring.addAlertRule(rule);
  }, [monitoring]);

  return { recordMetric, getMetrics, addAlertRule };
};

export const useDeployment = () => {
  const [deployment] = useState(() => DeploymentService.getInstance());

  const deploy = useCallback(async (
    environment: string,
    version: string,
    config: DeploymentConfig
  ) => {
    return await deployment.deploy(environment, version, config);
  }, [deployment]);

  const getDeploymentStatus = useCallback((deploymentId: string) => {
    return deployment.getDeploymentStatus(deploymentId);
  }, [deployment]);

  const getDeploymentHistory = useCallback((environment?: string) => {
    return deployment.getDeploymentHistory(environment);
  }, [deployment]);

  return { deploy, getDeploymentStatus, getDeploymentHistory };
};

export const useDocumentation = () => {
  const [docs] = useState(() => DocumentationService.getInstance());

  const createADR = useCallback((adr: Omit<ADR, 'id' | 'createdAt' | 'updatedAt'>) => {
    return docs.createADR(adr);
  }, [docs]);

  const updateADR = useCallback((id: string, updates: Partial<ADR>) => {
    return docs.updateADR(id, updates);
  }, [docs]);

  const getADR = useCallback((id: string) => {
    return docs.getADR(id);
  }, [docs]);

  const searchADRs = useCallback((query: string) => {
    return docs.searchADRs(query);
  }, [docs]);

  const generateOpenAPISpec = useCallback(() => {
    return docs.generateOpenAPISpec();
  }, [docs]);

  return { createADR, updateADR, getADR, searchADRs, generateOpenAPISpec };
};

// Type definitions
export interface MetricData {
  name: string;
  values: Array<{ value: number; timestamp: Date }>;
  tags: Record<string, string>;
  lastUpdated: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: AlertCondition;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  automatedResponses?: AutomatedResponse[];
}

export interface AlertCondition {
  operator: 'GT' | 'LT' | 'EQ' | 'GTE' | 'LTE';
  threshold: number;
  duration?: number; // in milliseconds
}

export interface AutomatedResponse {
  type: 'SCALE_UP' | 'ROLLBACK' | 'NOTIFICATION' | 'CIRCUIT_BREAKER';
  config: Record<string, any>;
}

export interface Alert {
  id: string;
  alertId: string;
  message: string;
  severity: string;
  value: number;
  threshold: number;
  tags: Record<string, string>;
  timestamp: Date;
}

export interface MetricSummary {
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
  lastValue: number;
  lastUpdated: Date;
  tags: Record<string, string>;
}

export interface Deployment {
  id: string;
  environment: string;
  version: string;
  status: 'STARTING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'ROLLING_BACK';
  startTime: Date;
  endTime?: Date;
  config: DeploymentConfig;
  logs: Array<{
    timestamp: Date;
    level: string;
    message: string;
  }>;
  error?: Error;
}

export interface DeploymentConfig {
  strategy?: 'direct' | 'canary' | 'blue-green';
  rollbackOnFailure?: boolean;
  healthCheckTimeout?: number;
  dependencies?: string[];
  environmentVariables?: Record<string, string>;
}

export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  environment: string;
  version: string;
  deployedAt: Date;
  error?: Error;
}

export interface ADR {
  id: string;
  title: string;
  description: string;
  context: string;
  decision: string;
  consequences: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'deprecated';
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  relatedADRs?: string[];
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
  security: Array<Record<string, any>>;
}

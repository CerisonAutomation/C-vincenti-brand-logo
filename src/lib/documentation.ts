/**
 * Documentation & ADR System
 * Architecture Decision Records and comprehensive documentation
 */

import { log } from '@/lib/logger';

// Architecture Decision Records (ADR)
export class ADRSystem {
  private static adrs: ADR[] = [];

  static createADR(title: string, status: ADRStatus, context: string, decision: string, consequences: string[]): ADR {
    const adr: ADR = {
      id: this.generateADRId(),
      title,
      status,
      date: new Date().toISOString(),
      context,
      decision,
      consequences,
      tags: this.extractTags(decision),
      related: []
    };

    this.adrs.push(adr);
    this.saveADR(adr);

    return adr;
  }

  static updateADR(id: string, updates: Partial<ADR>): ADR | null {
    const adr = this.adrs.find(a => a.id === id);
    if (!adr) return null;

    Object.assign(adr, updates);
    this.saveADR(adr);

    return adr;
  }

  static getADR(id: string): ADR | undefined {
    return this.adrs.find(a => a.id === id);
  }

  static getAllADRs(): ADR[] {
    return this.adrs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static getADRsByStatus(status: ADRStatus): ADR[] {
    return this.adrs.filter(a => a.status === status);
  }

  static getADRsByTag(tag: string): ADR[] {
    return this.adrs.filter(a => a.tags.includes(tag));
  }

  private static generateADRId(): string {
    const date = new Date().toISOString().split('T')[0];
    const count = this.adrs.length + 1;
    return `ADR-${date}-${count.toString().padStart(3, '0')}`;
  }

  private static extractTags(decision: string): string[] {
    const tagRegex = /#(\w+)/g;
    const tags = new Set<string>();
    let match;

    while ((match = tagRegex.exec(decision)) !== null) {
      tags.add(match[1]);
    }

    return Array.from(tags);
  }

  private static saveADR(adr: ADR): void {
    // Save to localStorage for development
    const existing = JSON.parse(localStorage.getItem('adrs') || '[]');
    const index = existing.findIndex((a: ADR) => a.id === adr.id);

    if (index >= 0) {
      existing[index] = adr;
    } else {
      existing.push(adr);
    }

    localStorage.setItem('adrs', JSON.stringify(existing));
  }
}

// API Documentation Generator
export class APIDocumentation {
  private static endpoints: APIEndpoint[] = [];

  static addEndpoint(endpoint: Omit<APIEndpoint, 'id' | 'created' | 'updated'>): APIEndpoint {
    const apiEndpoint: APIEndpoint = {
      ...endpoint,
      id: this.generateEndpointId(),
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    this.endpoints.push(apiEndpoint);
    this.generateOpenAPI(apiEndpoint);

    return apiEndpoint;
  }

  static updateEndpoint(id: string, updates: Partial<APIEndpoint>): APIEndpoint | null {
    const endpoint = this.endpoints.find(e => e.id === id);
    if (!endpoint) return null;

    Object.assign(endpoint, updates, { updated: new Date().toISOString() });
    this.generateOpenAPI(endpoint);

    return endpoint;
  }

  static getEndpoint(id: string): APIEndpoint | undefined {
    return this.endpoints.find(e => e.id === id);
  }

  static getAllEndpoints(): APIEndpoint[] {
    return this.endpoints;
  }

  static generateOpenAPI(endpoint: APIEndpoint): any {
    const openAPI = {
      openapi: '3.0.0',
      info: {
        title: 'Christiano Property Management API',
        version: '1.0.0',
        description: 'API for property management operations'
      },
      paths: {
        [endpoint.path]: {
          [endpoint.method.toLowerCase()]: {
            summary: endpoint.summary,
            description: endpoint.description,
            parameters: endpoint.parameters,
            requestBody: endpoint.requestBody,
            responses: endpoint.responses
          }
        }
      }
    };

    log.info('Generated OpenAPI spec', { endpoint: endpoint.path });
    return openAPI;
  }

  private static generateEndpointId(): string {
    return `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Code Documentation Generator
export class CodeDocumentation {
  static generateComponentDocs(component: ComponentInfo): ComponentDocumentation {
    const docs: ComponentDocumentation = {
      name: component.name,
      description: component.description,
      props: component.props.map(prop => ({
        name: prop.name,
        type: prop.type,
        required: prop.required,
        description: prop.description,
        defaultValue: prop.defaultValue
      })),
      usage: this.generateUsageExample(component),
      examples: component.examples || [],
      accessibility: this.generateAccessibilityGuidelines(component),
      performance: this.generatePerformanceGuidelines(component),
      created: new Date().toISOString(),
      version: component.version || '1.0.0'
    };

    return docs;
  }

  private static generateUsageExample(component: ComponentInfo): string {
    const props = component.props
      .filter(prop => prop.defaultValue)
      .map(prop => `  ${prop.name}="${prop.defaultValue}"`)
      .join('\n');

    return `<${component.name}
${props}
>
  ${component.description}
</${component.name}>`;
  }

  private static generateAccessibilityGuidelines(component: ComponentInfo): AccessibilityGuidelines {
    return {
      keyboardNavigation: component.props.some(p => p.name.includes('onKeyDown') || p.name.includes('onKeyPress')),
      screenReaderSupport: component.props.some(p => p.name.includes('aria') || p.name.includes('label')),
      focusManagement: component.props.some(p => p.name.includes('focus') || p.name.includes('tabIndex')),
      colorContrast: true,
      semanticMarkup: true
    };
  }

  private static generatePerformanceGuidelines(component: ComponentInfo): PerformanceGuidelines {
    return {
      memoization: component.props.length > 5,
      virtualization: component.name.includes('List') || component.name.includes('Table'),
      lazyLoading: component.name.includes('Modal') || component.name.includes('Dialog'),
      bundleSize: component.props.length < 10,
      renderOptimization: true
    };
  }
}

// Test Documentation
export class TestDocumentation {
  static generateTestPlan(component: string, requirements: TestRequirement[]): TestPlan {
    return {
      component,
      requirements,
      testCases: this.generateTestCases(requirements),
      coverage: this.calculateCoverage(requirements),
      created: new Date().toISOString()
    };
  }

  private static generateTestCases(requirements: TestRequirement[]): TestCase[] {
    return requirements.map(req => ({
      id: `test_${req.id}_${Date.now()}`,
      description: req.description,
      steps: this.generateTestSteps(req),
      expected: req.expected,
      priority: req.priority,
      type: req.type
    }));
  }

  private static generateTestSteps(requirement: TestRequirement): string[] {
    return [
      `1. Setup: ${requirement.setup || 'Initialize test environment'}`,
      `2. Action: ${requirement.action || 'Perform user action'}`,
      `3. Assert: ${requirement.assertion || 'Verify expected behavior'}`
    ];
  }

  private static calculateCoverage(requirements: TestRequirement[]): CoverageReport {
    const total = requirements.length;
    const critical = requirements.filter(r => r.priority === 'critical').length;
    const high = requirements.filter(r => r.priority === 'high').length;
    const medium = requirements.filter(r => r.priority === 'medium').length;
    const low = requirements.filter(r => r.priority === 'low').length;

    return {
      total,
      critical,
      high,
      medium,
      low,
      coveragePercentage: 100,
      riskAreas: this.identifyRiskAreas(requirements)
    };
  }

  private static identifyRiskAreas(requirements: TestRequirement[]): string[] {
    return requirements
      .filter(r => r.priority === 'critical' && r.type === 'functional')
      .map(r => r.description);
  }
}

// Types
export interface ADR {
  id: string;
  title: string;
  status: ADRStatus;
  date: string;
  context: string;
  decision: string;
  consequences: string[];
  tags: string[];
  related: string[];
}

export type ADRStatus = 'proposed' | 'accepted' | 'superseded' | 'deprecated' | 'rejected';

export interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  summary: string;
  description: string;
  parameters: APIParameter[];
  requestBody?: APIRequestBody;
  responses: APIResponse[];
  created: string;
  updated: string;
}

export interface APIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description: string;
  required: boolean;
  schema: {
    type: string;
    format?: string;
  };
}

export interface APIRequestBody {
  description: string;
  required: boolean;
  content: {
    'application/json': {
      schema: any;
    };
  };
}

export interface APIResponse {
  code: number;
  description: string;
  content?: {
    'application/json': {
      schema: any;
    };
  };
}

export interface ComponentInfo {
  name: string;
  description: string;
  props: ComponentProp[];
  examples?: string[];
  version?: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
}

export interface ComponentDocumentation {
  name: string;
  description: string;
  props: {
    name: string;
    type: string;
    required: boolean;
    description: string;
    defaultValue?: any;
  }[];
  usage: string;
  examples: string[];
  accessibility: AccessibilityGuidelines;
  performance: PerformanceGuidelines;
  created: string;
  version: string;
}

export interface AccessibilityGuidelines {
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  focusManagement: boolean;
  colorContrast: boolean;
  semanticMarkup: boolean;
}

export interface PerformanceGuidelines {
  memoization: boolean;
  virtualization: boolean;
  lazyLoading: boolean;
  bundleSize: boolean;
  renderOptimization: boolean;
}

export interface TestRequirement {
  id: string;
  description: string;
  setup?: string;
  action: string;
  assertion: string;
  expected: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'functional' | 'non-functional' | 'regression' | 'smoke';
}

export interface TestPlan {
  component: string;
  requirements: TestRequirement[];
  testCases: TestCase[];
  coverage: CoverageReport;
  created: string;
}

export interface TestCase {
  id: string;
  description: string;
  steps: string[];
  expected: string;
  priority: string;
  type: string;
}

export interface CoverageReport {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  coveragePercentage: number;
  riskAreas: string[];
}

export default {
  ADRSystem,
  APIDocumentation,
  CodeDocumentation,
  TestDocumentation
};
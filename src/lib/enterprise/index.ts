/**
 * Enterprise Risk Gating, Procurement Automation, and Marketing Automation Systems
 * Comprehensive risk management, automated procurement workflows, and intelligent marketing
 * @version 2.0.0
 * @author Cascade AI
 */

import { z } from 'zod';
import OpenAI from 'openai';

// Risk Management Configuration
export const RiskConfig = {
  // Risk thresholds
  THRESHOLDS: {
    LOW: 0.2,
    MEDIUM: 0.5,
    HIGH: 0.8,
    CRITICAL: 0.95,
  },

  // Risk categories
  CATEGORIES: {
    FINANCIAL: 'financial',
    OPERATIONAL: 'operational',
    COMPLIANCE: 'compliance',
    SECURITY: 'security',
    REPUTATIONAL: 'reputational',
    STRATEGIC: 'strategic',
  },

  // Risk scoring weights
  WEIGHTS: {
    IMPACT: 0.6,
    PROBABILITY: 0.3,
    DETECTABILITY: 0.1,
  },

  // Automated actions
  ACTIONS: {
    APPROVE: 'approve',
    REJECT: 'reject',
    ESCALATE: 'escalate',
    MONITOR: 'monitor',
    MITIGATE: 'mitigate',
  },
} as const;

// Procurement Automation
export class ProcurementAutomation {
  private static instance: ProcurementAutomation;
  private workflows = new Map<string, ProcurementWorkflow>();
  private approvals = new Map<string, ApprovalProcess>();

  static getInstance(): ProcurementAutomation {
    if (!ProcurementAutomation.instance) {
      ProcurementAutomation.instance = new ProcurementAutomation();
    }
    return ProcurementAutomation.instance;
  }

  async initiateProcurement(request: ProcurementRequest): Promise<ProcurementProcess> {
    // Risk assessment
    const riskScore = await this.assessProcurementRisk(request);
    const riskLevel = this.calculateRiskLevel(riskScore);

    // Route based on risk
    const workflow = this.selectWorkflow(request, riskLevel);

    // Create procurement process
    const process: ProcurementProcess = {
      id: crypto.randomUUID(),
      requestId: request.id,
      status: 'INITIATED',
      riskScore,
      riskLevel,
      workflowId: workflow.id,
      steps: [],
      approvals: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Execute workflow
    await this.executeWorkflow(process, workflow);

    return process;
  }

  private async assessProcurementRisk(request: ProcurementRequest): Promise<number> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const riskPrompt = `
Assess the risk level of this procurement request on a scale of 0-1:

Request: ${JSON.stringify(request, null, 2)}

Consider:
- Financial impact
- Operational complexity
- Compliance requirements
- Vendor reliability
- Market conditions
- Strategic alignment

Return only a number between 0 and 1.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: riskPrompt }],
      temperature: 0.1,
      max_tokens: 10,
    });

    const riskScore = parseFloat(response.choices[0]?.message?.content?.trim() || '0.5');
    return Math.max(0, Math.min(1, riskScore));
  }

  private calculateRiskLevel(score: number): RiskLevel {
    if (score >= RiskConfig.THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (score >= RiskConfig.THRESHOLDS.HIGH) return 'HIGH';
    if (score >= RiskConfig.THRESHOLDS.MEDIUM) return 'MEDIUM';
    return 'LOW';
  }

  private selectWorkflow(request: ProcurementRequest, riskLevel: RiskLevel): ProcurementWorkflow {
    // Select appropriate workflow based on risk and request type
    const workflowKey = `${request.type}_${riskLevel}`;
    return this.workflows.get(workflowKey) || this.getDefaultWorkflow(request.type);
  }

  private async executeWorkflow(process: ProcurementProcess, workflow: ProcurementWorkflow): Promise<void> {
    for (const step of workflow.steps) {
      const stepResult = await this.executeStep(step, process);

      process.steps.push({
        stepId: step.id,
        status: stepResult.success ? 'COMPLETED' : 'FAILED',
        executedAt: new Date(),
        output: stepResult.output,
        error: stepResult.error,
      });

      if (!stepResult.success && step.onFailure === 'STOP') {
        process.status = 'FAILED';
        process.error = stepResult.error;
        break;
      }

      // Update process status
      process.status = this.calculateProcessStatus(process);
      process.updatedAt = new Date();
    }
  }

  private async executeStep(step: WorkflowStep, process: ProcurementProcess): Promise<StepResult> {
    try {
      switch (step.type) {
        case 'RISK_ASSESSMENT':
          return await this.executeRiskAssessment(step, process);
        case 'APPROVAL_REQUEST':
          return await this.executeApprovalRequest(step, process);
        case 'VENDOR_EVALUATION':
          return await this.executeVendorEvaluation(step, process);
        case 'CONTRACT_GENERATION':
          return await this.executeContractGeneration(step, process);
        case 'PAYMENT_PROCESSING':
          return await this.executePaymentProcessing(step, process);
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        output: {},
      };
    }
  }

  private async executeRiskAssessment(step: WorkflowStep, process: ProcurementProcess): Promise<StepResult> {
    // Enhanced risk assessment with AI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const assessmentPrompt = `
Perform detailed risk assessment for procurement:

Process: ${JSON.stringify(process, null, 2)}

Provide detailed analysis including:
- Risk factors
- Mitigation strategies
- Recommended actions
- Confidence level
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: assessmentPrompt }],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const assessment = response.choices[0]?.message?.content || '';

    return {
      success: true,
      output: { riskAssessment: assessment },
    };
  }

  private async executeApprovalRequest(step: WorkflowStep, process: ProcurementProcess): Promise<StepResult> {
    // Create approval process
    const approval: ApprovalProcess = {
      id: crypto.randomUUID(),
      processId: process.id,
      requiredApprovers: step.config.approvers || [],
      status: 'PENDING',
      approvals: [],
      createdAt: new Date(),
    };

    this.approvals.set(approval.id, approval);

    // Send notifications to approvers
    await this.notifyApprovers(approval);

    return {
      success: true,
      output: { approvalId: approval.id },
    };
  }

  private async executeVendorEvaluation(step: WorkflowStep, process: ProcurementProcess): Promise<StepResult> {
    // AI-powered vendor evaluation
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const evaluationPrompt = `
Evaluate vendor for procurement:

Request: ${JSON.stringify(process, null, 2)}

Evaluate:
- Vendor reliability
- Pricing competitiveness
- Quality standards
- Delivery capability
- Risk factors

Provide score (0-100) and detailed analysis.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: evaluationPrompt }],
      temperature: 0.1,
      max_tokens: 500,
    });

    const evaluation = response.choices[0]?.message?.content || '';

    return {
      success: true,
      output: { vendorEvaluation: evaluation },
    };
  }

  private calculateProcessStatus(process: ProcurementProcess): ProcurementStatus {
    const steps = process.steps;
    const hasFailedSteps = steps.some(step => step.status === 'FAILED');
    const hasPendingSteps = steps.some(step => step.status === 'PENDING');
    const allCompleted = steps.every(step => step.status === 'COMPLETED');

    if (hasFailedSteps) return 'FAILED';
    if (hasPendingSteps) return 'IN_PROGRESS';
    if (allCompleted) return 'COMPLETED';
    return 'INITIATED';
  }

  private async notifyApprovers(approval: ApprovalProcess): Promise<void> {
    // Implementation would send notifications via email, Slack, etc.
    console.log('Notifying approvers:', approval.requiredApprovers);
  }

  private getDefaultWorkflow(type: ProcurementType): ProcurementWorkflow {
    // Return default workflow for procurement type
    return {
      id: `default-${type}`,
      name: `Default ${type} Workflow`,
      type,
      steps: [],
      riskThresholds: RiskConfig.THRESHOLDS,
    };
  }
}

// Marketing Automation System
export class MarketingAutomation {
  private static instance: MarketingAutomation;
  private campaigns = new Map<string, MarketingCampaign>();
  private segments = new Map<string, AudienceSegment>();
  private journeys = new Map<string, CustomerJourney>();

  static getInstance(): MarketingAutomation {
    if (!MarketingAutomation.instance) {
      MarketingAutomation.instance = new MarketingAutomation();
    }
    return MarketingAutomation.instance;
  }

  async createCampaign(campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarketingCampaign> {
    const newCampaign: MarketingCampaign = {
      ...campaign,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.campaigns.set(newCampaign.id, newCampaign);

    // Initialize campaign execution
    await this.initializeCampaignExecution(newCampaign);

    return newCampaign;
  }

  private async initializeCampaignExecution(campaign: MarketingCampaign): Promise<void> {
    // AI-powered campaign optimization
    const optimizedCampaign = await this.optimizeCampaign(campaign);

    // Segment audience
    const segments = await this.segmentAudience(optimizedCampaign);

    // Create customer journeys
    const journeys = await this.createCustomerJourneys(optimizedCampaign, segments);

    // Schedule execution
    await this.scheduleCampaignExecution(optimizedCampaign, journeys);
  }

  private async optimizeCampaign(campaign: MarketingCampaign): Promise<MarketingCampaign> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const optimizationPrompt = `
Optimize this marketing campaign:

Campaign: ${JSON.stringify(campaign, null, 2)}

Provide optimizations for:
- Subject lines
- Content strategy
- Timing
- Targeting
- A/B testing suggestions
- Expected performance improvements
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: optimizationPrompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const optimizations = response.choices[0]?.message?.content || '';

    return {
      ...campaign,
      optimizations,
      updatedAt: new Date(),
    };
  }

  private async segmentAudience(campaign: MarketingCampaign): Promise<AudienceSegment[]> {
    // AI-powered audience segmentation
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const segmentationPrompt = `
Segment audience for campaign:

Campaign: ${JSON.stringify(campaign, null, 2)}

Create segments based on:
- Demographics
- Behavior
- Purchase history
- Engagement levels
- Geographic location

Return 3-5 meaningful segments with targeting criteria.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: segmentationPrompt }],
      temperature: 0.2,
      max_tokens: 800,
    });

    const segmentsData = response.choices[0]?.message?.content || '[]';
    const segments = JSON.parse(segmentsData);

    return segments.map((segment: any) => ({
      id: crypto.randomUUID(),
      name: segment.name,
      criteria: segment.criteria,
      size: segment.estimatedSize,
      campaignId: campaign.id,
    }));
  }

  private async createCustomerJourneys(
    campaign: MarketingCampaign,
    segments: AudienceSegment[]
  ): Promise<CustomerJourney[]> {
    const journeys: CustomerJourney[] = [];

    for (const segment of segments) {
      const journey = await this.createJourneyForSegment(campaign, segment);
      journeys.push(journey);
      this.journeys.set(journey.id, journey);
    }

    return journeys;
  }

  private async createJourneyForSegment(
    campaign: MarketingCampaign,
    segment: AudienceSegment
  ): Promise<CustomerJourney> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const journeyPrompt = `
Create customer journey for segment:

Campaign: ${JSON.stringify(campaign, null, 2)}
Segment: ${JSON.stringify(segment, null, 2)}

Design journey with:
- Touchpoints (email, SMS, push, ads)
- Timing and sequencing
- Content strategy
- Conversion goals
- Measurement points
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: journeyPrompt }],
      temperature: 0.4,
      max_tokens: 1200,
    });

    const journeyData = response.choices[0]?.message?.content || '{}';
    const journeyConfig = JSON.parse(journeyData);

    return {
      id: crypto.randomUUID(),
      campaignId: campaign.id,
      segmentId: segment.id,
      name: `${campaign.name} - ${segment.name}`,
      touchpoints: journeyConfig.touchpoints || [],
      goals: journeyConfig.goals || [],
      status: 'ACTIVE',
      createdAt: new Date(),
    };
  }

  private async scheduleCampaignExecution(
    campaign: MarketingCampaign,
    journeys: CustomerJourney[]
  ): Promise<void> {
    // Schedule journey execution
    for (const journey of journeys) {
      await this.scheduleJourneyExecution(journey);
    }

    // Update campaign status
    campaign.status = 'ACTIVE';
    campaign.updatedAt = new Date();
  }

  private async scheduleJourneyExecution(journey: CustomerJourney): Promise<void> {
    // Implementation would schedule touchpoints using a job queue
    console.log('Scheduling journey execution:', journey.id);
  }

  async analyzeCampaignPerformance(campaignId: string): Promise<CampaignAnalytics> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Gather performance data
    const analytics: CampaignAnalytics = {
      campaignId,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      roi: 0,
      segmentPerformance: [],
      journeyPerformance: [],
      recommendations: [],
    };

    // AI-powered performance analysis
    const analysis = await this.analyzePerformanceWithAI(campaign, analytics);

    return {
      ...analytics,
      ...analysis,
    };
  }

  private async analyzePerformanceWithAI(
    campaign: MarketingCampaign,
    analytics: CampaignAnalytics
  ): Promise<Partial<CampaignAnalytics>> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const analysisPrompt = `
Analyze marketing campaign performance:

Campaign: ${JSON.stringify(campaign, null, 2)}
Analytics: ${JSON.stringify(analytics, null, 2)}

Provide:
- Performance insights
- Optimization recommendations
- A/B testing suggestions
- Budget allocation advice
- Next steps
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const analysis = response.choices[0]?.message?.content || '';

    return {
      recommendations: analysis.split('\n').filter(line => line.trim()),
    };
  }
}

// Risk Gating System
export class RiskGatingSystem {
  private static instance: RiskGatingSystem;
  private riskRules = new Map<string, RiskRule>();
  private riskAssessments = new Map<string, RiskAssessment>();

  static getInstance(): RiskGatingSystem {
    if (!RiskGatingSystem.instance) {
      RiskGatingSystem.instance = new RiskGatingSystem();
    }
    return RiskGatingSystem.instance;
  }

  async evaluateRisk(context: RiskContext): Promise<RiskAssessment> {
    const assessmentId = crypto.randomUUID();

    // Gather risk factors
    const riskFactors = await this.gatherRiskFactors(context);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(riskFactors);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore);

    // Generate mitigation strategies
    const mitigationStrategies = await this.generateMitigationStrategies(context, riskFactors);

    // Determine gating decision
    const decision = this.makeGatingDecision(riskLevel, context);

    const assessment: RiskAssessment = {
      id: assessmentId,
      context,
      riskFactors,
      riskScore,
      riskLevel,
      mitigationStrategies,
      decision,
      assessedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    this.riskAssessments.set(assessmentId, assessment);
    return assessment;
  }

  private async gatherRiskFactors(context: RiskContext): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // User risk factors
    if (context.userId) {
      factors.push(...await this.assessUserRisk(context.userId));
    }

    // Transaction risk factors
    if (context.transaction) {
      factors.push(...await this.assessTransactionRisk(context.transaction));
    }

    // Environmental risk factors
    factors.push(...await this.assessEnvironmentalRisk());

    return factors;
  }

  private async assessUserRisk(userId: string): Promise<RiskFactor[]> {
    // Implementation would assess user risk based on history, behavior, etc.
    return [
      {
        category: 'USER_HISTORY',
        factor: 'account_age',
        value: 365, // days
        weight: 0.1,
        risk: 0.2,
      },
      {
        category: 'USER_BEHAVIOR',
        factor: 'login_frequency',
        value: 30, // days since last login
        weight: 0.2,
        risk: 0.3,
      },
    ];
  }

  private async assessTransactionRisk(transaction: Transaction): Promise<RiskFactor[]> {
    // Implementation would assess transaction risk
    return [
      {
        category: 'TRANSACTION_AMOUNT',
        factor: 'amount',
        value: transaction.amount,
        weight: 0.3,
        risk: transaction.amount > 10000 ? 0.8 : 0.2,
      },
      {
        category: 'TRANSACTION_FREQUENCY',
        factor: 'velocity',
        value: transaction.frequency,
        weight: 0.2,
        risk: transaction.frequency > 10 ? 0.7 : 0.1,
      },
    ];
  }

  private async assessEnvironmentalRisk(): Promise<RiskFactor[]> {
    // Implementation would assess environmental risk (geolocation, time, etc.)
    return [
      {
        category: 'GEOGRAPHIC',
        factor: 'location',
        value: 'unknown',
        weight: 0.1,
        risk: 0.3,
      },
      {
        category: 'TEMPORAL',
        factor: 'time_of_day',
        value: new Date().getHours(),
        weight: 0.1,
        risk: 0.1,
      },
    ];
  }

  private calculateRiskScore(factors: RiskFactor[]): number {
    let totalRisk = 0;
    let totalWeight = 0;

    for (const factor of factors) {
      totalRisk += factor.risk * factor.weight;
      totalWeight += factor.weight;
    }

    return totalWeight > 0 ? totalRisk / totalWeight : 0.5;
  }

  private determineRiskLevel(score: number): RiskLevel {
    if (score >= RiskConfig.THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (score >= RiskConfig.THRESHOLDS.HIGH) return 'HIGH';
    if (score >= RiskConfig.THRESHOLDS.MEDIUM) return 'MEDIUM';
    return 'LOW';
  }

  private async generateMitigationStrategies(
    context: RiskContext,
    factors: RiskFactor[]
  ): Promise<MitigationStrategy[]> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const mitigationPrompt = `
Generate risk mitigation strategies:

Context: ${JSON.stringify(context, null, 2)}
Risk Factors: ${JSON.stringify(factors, null, 2)}

Provide specific, actionable mitigation strategies for each risk factor.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: mitigationPrompt }],
      temperature: 0.2,
      max_tokens: 800,
    });

    const strategiesText = response.choices[0]?.message?.content || '';
    const strategies = strategiesText.split('\n').filter(line => line.trim());

    return strategies.map(strategy => ({
      id: crypto.randomUUID(),
      description: strategy,
      effectiveness: 0.8, // Estimated effectiveness
      cost: 'LOW', // Estimated cost
      timeline: 'IMMEDIATE', // Implementation timeline
    }));
  }

  private makeGatingDecision(riskLevel: RiskLevel, context: RiskContext): GatingDecision {
    switch (riskLevel) {
      case 'CRITICAL':
        return {
          action: 'BLOCK',
          reason: 'Critical risk level detected',
          requiresApproval: true,
          approvalLevel: 'SENIOR_MANAGEMENT',
        };
      case 'HIGH':
        return {
          action: 'REVIEW',
          reason: 'High risk level requires manual review',
          requiresApproval: true,
          approvalLevel: 'SUPERVISOR',
        };
      case 'MEDIUM':
        return {
          action: 'MONITOR',
          reason: 'Medium risk level - proceeding with monitoring',
          requiresApproval: false,
          monitoringLevel: 'ENHANCED',
        };
      case 'LOW':
      default:
        return {
          action: 'APPROVE',
          reason: 'Low risk level - automatic approval',
          requiresApproval: false,
        };
    }
  }

  addRiskRule(rule: RiskRule): void {
    this.riskRules.set(rule.id, rule);
  }

  getRiskAssessment(assessmentId: string): RiskAssessment | null {
    return this.riskAssessments.get(assessmentId) || null;
  }
}

// Type definitions
export interface ProcurementRequest {
  id: string;
  type: ProcurementType;
  description: string;
  amount: number;
  currency: string;
  vendor?: Vendor;
  category: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requestedBy: string;
  department: string;
  justification: string;
}

export interface ProcurementProcess {
  id: string;
  requestId: string;
  status: ProcurementStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  workflowId: string;
  steps: ProcessStep[];
  approvals: Approval[];
  createdAt: Date;
  updatedAt: Date;
  error?: Error;
}

export interface ProcurementWorkflow {
  id: string;
  name: string;
  type: ProcurementType;
  steps: WorkflowStep[];
  riskThresholds: typeof RiskConfig.THRESHOLDS;
}

export interface WorkflowStep {
  id: string;
  type: StepType;
  config: Record<string, any>;
  onFailure: 'CONTINUE' | 'STOP' | 'RETRY';
  timeout?: number;
}

export interface ApprovalProcess {
  id: string;
  processId: string;
  requiredApprovers: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvals: Approval[];
  createdAt: Date;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'DISPLAY' | 'SOCIAL';
  targetAudience: string;
  budget: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  goals: CampaignGoal[];
  content: CampaignContent;
  optimizations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudienceSegment {
  id: string;
  name: string;
  criteria: Record<string, any>;
  size: number;
  campaignId: string;
}

export interface CustomerJourney {
  id: string;
  campaignId: string;
  segmentId: string;
  name: string;
  touchpoints: Touchpoint[];
  goals: JourneyGoal[];
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdAt: Date;
}

export interface RiskContext {
  userId?: string;
  transaction?: Transaction;
  action: string;
  resource: string;
  environment: Record<string, any>;
}

export interface RiskAssessment {
  id: string;
  context: RiskContext;
  riskFactors: RiskFactor[];
  riskScore: number;
  riskLevel: RiskLevel;
  mitigationStrategies: MitigationStrategy[];
  decision: GatingDecision;
  assessedAt: Date;
  expiresAt: Date;
}

export type ProcurementType = 'SOFTWARE' | 'HARDWARE' | 'SERVICES' | 'CONSULTING' | 'MARKETING';
export type ProcurementStatus = 'INITIATED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';
export type StepType = 'RISK_ASSESSMENT' | 'APPROVAL_REQUEST' | 'VENDOR_EVALUATION' | 'CONTRACT_GENERATION' | 'PAYMENT_PROCESSING';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ProcessStep {
  stepId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  executedAt: Date;
  output: Record<string, any>;
  error?: Error;
}

export interface Approval {
  id: string;
  approverId: string;
  decision: 'APPROVED' | 'REJECTED';
  comments?: string;
  approvedAt: Date;
}

export interface CampaignGoal {
  type: 'IMPRESSIONS' | 'CLICKS' | 'CONVERSIONS' | 'REVENUE';
  target: number;
  current: number;
}

export interface CampaignContent {
  subject?: string;
  body: string;
  images?: string[];
  cta?: string;
  personalization?: Record<string, any>;
}

export interface Touchpoint {
  id: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK';
  timing: {
    delay: number; // minutes from journey start
    condition?: string;
  };
  content: Record<string, any>;
}

export interface JourneyGoal {
  type: string;
  target: number;
  timeframe: number; // days
}

export interface CampaignAnalytics {
  campaignId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roi: number;
  segmentPerformance: SegmentPerformance[];
  journeyPerformance: JourneyPerformance[];
  recommendations: string[];
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  frequency: number;
  merchant: string;
  location?: string;
}

export interface RiskFactor {
  category: string;
  factor: string;
  value: any;
  weight: number;
  risk: number;
}

export interface MitigationStrategy {
  id: string;
  description: string;
  effectiveness: number;
  cost: 'LOW' | 'MEDIUM' | 'HIGH';
  timeline: 'IMMEDIATE' | 'SHORT' | 'MEDIUM' | 'LONG';
}

export interface GatingDecision {
  action: 'APPROVE' | 'REVIEW' | 'BLOCK' | 'MONITOR';
  reason: string;
  requiresApproval?: boolean;
  approvalLevel?: string;
  monitoringLevel?: string;
}

export interface RiskRule {
  id: string;
  name: string;
  condition: {
    field: string;
    operator: string;
    value: any;
  };
  action: string;
  severity: RiskLevel;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  compliance: Record<string, boolean>;
}

export interface SegmentPerformance {
  segmentId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
}

export interface JourneyPerformance {
  journeyId: string;
  completionRate: number;
  averageTime: number;
  dropOffPoints: string[];
}

export interface StepResult {
  success: boolean;
  output: Record<string, any>;
  error?: Error;
}

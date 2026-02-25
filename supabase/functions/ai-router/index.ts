import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Multi-model AI routing with schema enforcement
interface AIModel {
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral';
  capabilities: string[];
  costPerToken: number;
  maxTokens: number;
  schema: Record<string, any>;
}

const AVAILABLE_MODELS: AIModel[] = [
  {
    name: 'gpt-4o',
    provider: 'openai',
    capabilities: ['text', 'vision', 'function-calling', 'json-mode'],
    costPerToken: 0.00003,
    maxTokens: 128000,
    schema: {
      type: 'object',
      properties: {
        messages: { type: 'array', items: { type: 'object' } },
        model: { type: 'string', enum: ['gpt-4o'] },
        temperature: { type: 'number', minimum: 0, maximum: 2 },
        max_tokens: { type: 'number' },
        stream: { type: 'boolean' }
      }
    }
  },
  {
    name: 'claude-3-5-sonnet',
    provider: 'anthropic',
    capabilities: ['text', 'vision', 'function-calling', 'json-mode'],
    costPerToken: 0.000015,
    maxTokens: 200000,
    schema: {
      type: 'object',
      properties: {
        messages: { type: 'array', items: { type: 'object' } },
        model: { type: 'string', enum: ['claude-3-5-sonnet-20241022'] },
        temperature: { type: 'number', minimum: 0, maximum: 1 },
        max_tokens: { type: 'number' },
        stream: { type: 'boolean' }
      }
    }
  },
  {
    name: 'gemini-pro',
    provider: 'google',
    capabilities: ['text', 'function-calling'],
    costPerToken: 0.000001,
    maxTokens: 32768,
    schema: {
      type: 'object',
      properties: {
        contents: { type: 'array', items: { type: 'object' } },
        generationConfig: { type: 'object' }
      }
    }
  }
];

// Schema enforcement using JSON Schema validation
function validateRequest(model: AIModel, request: any): { valid: boolean; errors?: string[] } {
  // Simple schema validation - in production use a proper validator like ajv
  const schema = model.schema;
  const errors: string[] = [];

  // Basic validation for required fields
  if (schema.properties.messages && !request.messages) {
    errors.push('messages is required');
  }

  if (schema.properties.contents && !request.contents) {
    errors.push('contents is required');
  }

  if (request.temperature !== undefined) {
    const temp = request.temperature;
    if (temp < schema.properties.temperature?.minimum || temp > schema.properties.temperature?.maximum) {
      errors.push(`temperature must be between ${schema.properties.temperature?.minimum} and ${schema.properties.temperature?.maximum}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// Intelligent model selection based on request characteristics
function selectModel(request: any): AIModel {
  const { messages, temperature = 0.7, max_tokens, capabilities = [] } = request;

  // Check for vision requirements
  const hasVision = messages?.some((msg: any) =>
    msg.content?.some((content: any) => content.type === 'image_url')
  ) || capabilities.includes('vision');

  // Check for function calling
  const needsFunctionCalling = capabilities.includes('function-calling');

  // Check for JSON mode
  const needsJsonMode = capabilities.includes('json-mode');

  // Select based on requirements and cost optimization
  if (hasVision && needsFunctionCalling) {
    return AVAILABLE_MODELS.find(m => m.name === 'gpt-4o')!;
  }

  if (hasVision) {
    return AVAILABLE_MODELS.find(m => m.name === 'claude-3-5-sonnet')!;
  }

  if (needsFunctionCalling && temperature < 0.5) {
    return AVAILABLE_MODELS.find(m => m.name === 'gpt-4o')!;
  }

  // Default to cheapest for general text
  return AVAILABLE_MODELS.find(m => m.name === 'gemini-pro')!;
}

// Route to appropriate AI provider
async function routeToProvider(model: AIModel, request: any): Promise<Response> {
  const apiKey = Deno.env.get(`${model.provider.toUpperCase()}_API_KEY`);
  if (!apiKey) {
    throw new Error(`API key not configured for ${model.provider}`);
  }

  let url: string;
  let headers: Record<string, string>;
  let body: any;

  switch (model.provider) {
    case 'openai':
      url = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };
      body = {
        ...request,
        model: model.name,
      };
      break;

    case 'anthropic':
      url = 'https://api.anthropic.com/v1/messages';
      headers = {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      };
      body = {
        ...request,
        model: model.name,
      };
      break;

    case 'google':
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${apiKey}`;
      headers = {
        'Content-Type': 'application/json',
      };
      body = request;
      break;

    default:
      throw new Error(`Unsupported provider: ${model.provider}`);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return response;
}

// Self-healing: retry with fallback model on failure
async function executeWithFallback(request: any, primaryModel: AIModel): Promise<Response> {
  try {
    return await routeToProvider(primaryModel, request);
  } catch (error) {
    console.error(`Primary model ${primaryModel.name} failed:`, error);

    // Try fallback model
    const fallbackModel = AVAILABLE_MODELS.find(m => m.name !== primaryModel.name && m.capabilities.includes('text'));
    if (fallbackModel) {
      console.log(`Trying fallback model: ${fallbackModel.name}`);
      return await routeToProvider(fallbackModel, request);
    }

    throw error;
  }
}

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request = await req.json();

    // Select optimal model
    const selectedModel = selectModel(request);

    // Validate request against schema
    const validation = validateRequest(selectedModel, request);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          error: 'Request validation failed',
          details: validation.errors
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Execute with self-healing fallback
    const response = await executeWithFallback(request, selectedModel);

    // Return response with additional metadata
    const responseData = await response.json();
    const enrichedResponse = {
      ...responseData,
      _metadata: {
        model_used: selectedModel.name,
        provider: selectedModel.provider,
        cost_estimate: (responseData.usage?.total_tokens || 0) * selectedModel.costPerToken,
        routing_timestamp: new Date().toISOString(),
      }
    };

    return new Response(
      JSON.stringify(enrichedResponse),
      {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('AI routing error:', error);

    return new Response(
      JSON.stringify({
        error: 'AI routing failed',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

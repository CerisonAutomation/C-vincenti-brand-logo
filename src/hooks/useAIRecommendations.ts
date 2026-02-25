import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { guestyClient } from '@/lib/guesty/client';

// Schema for AI chat responses with strict validation
const AIChatResponseSchema = z.object({
  message: z.string().min(1).max(1000),
  suggestions: z.array(z.string()).max(5).optional(),
  confidence: z.number().min(0).max(1).optional(),
  timestamp: z.string().datetime(),
  metadata: z.object({
    model: z.string(),
    tokens: z.number().min(0),
    processingTime: z.number().min(0),
  }).optional(),
});

export type AIChatResponse = z.infer<typeof AIChatResponseSchema>;

// Schema for chat messages
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
  timestamp: z.date().optional(),
  id: z.string().optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Validates and enforces schema for AI chat responses
 * @param response Raw AI response
 * @returns Validated AIChatResponse or throws error
 */
function validateAIResponse(response: unknown): AIChatResponse {
  try {
    return AIChatResponseSchema.parse(response);
  } catch (error) {
    console.error('AI response validation failed:', error);
    // Return a safe fallback response
    return {
      message: "I'm sorry, I encountered an issue processing your request. Please try again.",
      timestamp: new Date().toISOString(),
      confidence: 0,
      metadata: {
        model: 'error-fallback',
        tokens: 0,
        processingTime: 0,
      },
    };
  }
}

/**
 * Validates chat messages
 * @param messages Array of chat messages
 * @returns Validated chat messages
 */
function validateChatMessages(messages: unknown[]): ChatMessage[] {
  return messages.map(msg => {
    try {
      return ChatMessageSchema.parse(msg);
    } catch (error) {
      console.error('Chat message validation failed:', error);
      // Return sanitized fallback
      return {
        role: 'user',
        content: 'Invalid message',
        timestamp: new Date(),
        id: Math.random().toString(),
      };
    }
  });
}

/**
 * Hook for AI chat interactions with schema enforcement
 * @param messages Array of chat messages
 * @returns AI response with validation
 */
export function useAIChat(messages: ChatMessage[]) {
  const validatedMessages = validateChatMessages(messages);

  return useQuery({
    queryKey: ['ai-chat', validatedMessages],
    queryFn: async (): Promise<AIChatResponse> => {
      // In production, this would call a real AI service
      // For now, return validated mock response
      const mockResponse = {
        message: `Based on your query about ${validatedMessages[validatedMessages.length - 1]?.content || 'properties'}, I can help you find the perfect accommodation. Would you like me to search for available properties in Malta?`,
        suggestions: [
          'Search for luxury villas',
          'Find budget-friendly apartments',
          'Explore beachfront properties',
        ],
        confidence: 0.95,
        timestamp: new Date().toISOString(),
        metadata: {
          model: 'mock-gpt-4',
          tokens: 150,
          processingTime: 0.8,
        },
      };

      return validateAIResponse(mockResponse);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Retry up to 3 times for validation errors
      if (error instanceof z.ZodError) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

interface AIRecommendation {
  type: 'similar_properties' | 'price_suggestion' | 'amenity_recommendations' | 'seasonal_trends';
  data: unknown;
  confidence: number;
  reasoning: string;
}

interface PriceSuggestion {
  suggestedPrice: number;
  marketAverage: number;
  reasoning: string;
}

interface UserPreferences {
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  amenities?: string[];
  propertyTypes?: string[];
  locations?: string[];
}

export function useAIRecommendations(propertyId: string, userPreferences?: UserPreferences) {
  return useQuery({
    queryKey: ['ai-recommendations', propertyId, userPreferences],
    queryFn: async () => {
      // This would call an AI service - for now, return mock data
      const recommendations: AIRecommendation[] = [
        {
          type: 'similar_properties',
          data: await guestyClient.getListings({ limit: 3 }),
          confidence: 0.95,
          reasoning: 'Based on location, amenities, and price range similarity'
        },
        {
          type: 'price_suggestion',
          data: { suggestedPrice: 150, marketAverage: 140, reasoning: 'Above average due to premium location' } as PriceSuggestion,
          confidence: 0.87,
          reasoning: 'Analyzed 100+ comparable properties in the area'
        }
      ];
      return recommendations;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

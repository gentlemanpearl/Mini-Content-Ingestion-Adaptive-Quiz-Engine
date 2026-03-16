
'use server';
/**
 * @fileOverview A Genkit flow for categorizing educational content from a text chunk.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CategorizeEducationalContentInputSchema = z.object({
  textChunk: z.string().describe('A segment of extracted text content.'),
  fileName: z.string().optional().describe('The name of the source file.'),
});
export type CategorizeEducationalContentInput = z.infer<typeof CategorizeEducationalContentInputSchema>;

const CategorizeEducationalContentOutputSchema = z.object({
  grade: z.number().describe('The identified grade level (e.g., 1-12).'),
  subject: z.string().describe('The identified subject (e.g., Math, Science).'),
  topic: z.string().describe('A specific topic within the subject.'),
});
export type CategorizeEducationalContentOutput = z.infer<typeof CategorizeEducationalContentOutputSchema>;

export async function categorizeEducationalContent(input: CategorizeEducationalContentInput): Promise<CategorizeEducationalContentOutput> {
  return categorizeEducationalContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeEducationalContentPrompt',
  input: { schema: CategorizeEducationalContentInputSchema },
  output: { schema: CategorizeEducationalContentOutputSchema },
  prompt: `You are an expert educator. Analyze the provided text chunk and determine its grade level (integer between 1-12), subject (e.g., Biology, World History, Algebra), and a specific topic.

Text Content:
{{{textChunk}}}

File Context:
{{{fileName}}}`,
});

const categorizeEducationalContentFlow = ai.defineFlow(
  {
    name: 'categorizeEducationalContentFlow',
    inputSchema: CategorizeEducationalContentInputSchema,
    outputSchema: CategorizeEducationalContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to categorize content.');
    return output;
  }
);

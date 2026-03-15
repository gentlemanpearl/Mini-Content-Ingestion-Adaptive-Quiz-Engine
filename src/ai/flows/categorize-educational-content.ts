'use server';
/**
 * @fileOverview A Genkit flow for categorizing educational content from a text chunk.
 *
 * - categorizeEducationalContent - A function that handles the categorization process.
 * - CategorizeEducationalContentInput - The input type for the categorizeEducationalContent function.
 * - CategorizeEducationalContentOutput - The return type for the categorizeEducationalContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CategorizeEducationalContentInputSchema = z.object({
  textChunk: z.string().describe('A segment of extracted text content from an educational PDF.'),
  fileName: z.string().optional().describe('The name of the PDF file from which the text chunk was extracted, providing additional context.'),
});
export type CategorizeEducationalContentInput = z.infer<typeof CategorizeEducationalContentInputSchema>;

const CategorizeEducationalContentOutputSchema = z.object({
  grade: z.number().describe('The identified grade level of the educational content (e.g., 1, 4, 10).'),
  subject: z.string().describe('The identified subject of the educational content (e.g., Math, Science, English).'),
  topic: z.string().describe('A specific topic within the subject (e.g., Numbers, Plants and Animals, Grammar).'),
});
export type CategorizeEducationalContentOutput = z.infer<typeof CategorizeEducationalContentOutputSchema>;

export async function categorizeEducationalContent(input: CategorizeEducationalContentInput): Promise<CategorizeEducationalContentOutput> {
  return categorizeEducationalContentFlow(input);
}

const categorizeEducationalContentPrompt = ai.definePrompt({
  name: 'categorizeEducationalContentPrompt',
  input: { schema: CategorizeEducationalContentInputSchema },
  output: { schema: CategorizeEducationalContentOutputSchema },
  prompt: `You are an expert educational content categorizer. Your task is to analyze the provided text chunk, along with the original filename, and accurately determine its educational grade level, primary subject, and a specific topic within that subject.

Consider the complexity of the language, the concepts discussed, and common educational curricula to make your determination.

Text from Chunk:
{{{textChunk}}}

Original File Name (for additional context, if available):
{{{fileName}}}`,
});

const categorizeEducationalContentFlow = ai.defineFlow(
  {
    name: 'categorizeEducationalContentFlow',
    inputSchema: CategorizeEducationalContentInputSchema,
    outputSchema: CategorizeEducationalContentOutputSchema,
  },
  async (input) => {
    const { output } = await categorizeEducationalContentPrompt(input);
    if (!output) {
      throw new Error('Failed to categorize educational content.');
    }
    return output;
  }
);

'use server';
/**
 * @fileOverview A Genkit flow for generating diverse quiz questions from content chunks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  text: z.string().describe('The content to generate questions from.'),
  grade: z.number().describe('The target grade level.'),
  subject: z.string().describe('The subject.'),
  topic: z.string().describe('The topic.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  type: z.enum(['MCQ', 'True/False', 'Fill in the blank']).describe('Question type.'),
  options: z.array(z.string()).optional().describe('Options for MCQ.'),
  answer: z.string().describe('The correct answer.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level.'),
});

const GenerateQuizQuestionsOutputSchema = z.array(QuizQuestionSchema);
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: { schema: GenerateQuizQuestionsInputSchema },
  output: { schema: GenerateQuizQuestionsOutputSchema },
  prompt: `You are an expert quiz creator. Generate 3-5 diverse questions from this content:

Subject: {{{subject}}}
Topic: {{{topic}}}
Grade: {{{grade}}}
Content:
"""
{{{text}}}
"""

Include MCQ, True/False, and Fill-in-the-blank questions. For MCQ, provide exactly 4 options.`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate questions.');
    return output;
  }
);
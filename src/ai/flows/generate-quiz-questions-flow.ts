'use server';
/**
 * @fileOverview A Genkit flow for generating diverse quiz questions (MCQ, True/False, Fill-in-the-blank)
 * from educational content chunks.
 *
 * - generateQuizQuestions - A function that handles the quiz question generation process.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  sourceId: z.string().describe('The ID of the source document.'),
  chunkId: z.string().describe('The ID of the content chunk.'),
  grade: z.number().describe('The grade level for the content.'),
  subject: z.string().describe('The subject of the educational content.'),
  topic: z.string().describe('The specific topic of the content chunk.'),
  text: z.string().describe('The educational content text from which to generate questions.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The text of the quiz question.'),
  type: z.enum(['MCQ', 'True/False', 'Fill in the blank']).describe('The type of quiz question.'),
  options: z.array(z.string()).optional().describe('An array of possible answer options for MCQ questions.'),
  answer: z.string().describe('The correct answer to the question.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the question.'),
  sourceChunkId: z.string().describe('The ID of the content chunk from which this question was generated.'),
});

const GenerateQuizQuestionsOutputSchema = z.array(QuizQuestionSchema).describe('An array of generated quiz questions.');
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are an expert educator and quiz creator. Your task is to generate diverse quiz questions 
(Multiple Choice, True/False, and Fill-in-the-blank) from the provided educational content.

Here is the educational content chunk:
Subject: {{{subject}}}
Topic: {{{topic}}}
Grade Level: {{{grade}}}
Content:
"""
{{{text}}}
"""

Generate between 3 to 5 quiz questions for the above content. Ensure a mix of question types (MCQ, True/False, Fill in the blank).
For MCQ questions, provide exactly four distinct options, with one being the correct answer.
For True/False questions, clearly state whether the statement is true or false in the answer.
For Fill-in-the-blank questions, indicate the blank with a single underscore like this: "___".`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate quiz questions.');
    }
    return output;
  }
);

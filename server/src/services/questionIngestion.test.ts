import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cosineTextSimilarity,
  processRawQuestion,
  QuestionAiAdapter
} from './questionIngestion.js';

test('locally structures raw text when no AI credentials are configured', async () => {
  const result = await processRawQuestion({
    text: 'Shortest path with BFS\nGiven an unweighted graph, return the shortest path between two vertices.\nConstraints: 1 <= N <= 100000'
  }, []);

  assert.equal(result.processingMode, 'local');
  assert.equal(result.question.title, 'Shortest path with BFS');
  assert.equal(result.question.suggestedCategory, 'DSA/Graphs/Shortest Paths');
  assert.deepEqual(result.question.constraints, ['1 <= N <= 100000']);
  assert.equal(result.duplicate, null);
  assert.equal(result.assets.testCases.length, 0);
});

test('cosine scoring is order-independent for equivalent question text', () => {
  const first = 'find the shortest path in an unweighted graph using breadth first search';
  const second = 'using breadth first search find shortest path in unweighted graph';
  assert.ok(cosineTextSimilarity(first, second) > 0.99);
});

test('rejects a duplicate before spending an AI call on testcase generation', async () => {
  let synthesizeCalls = 0;
  const ai: QuestionAiAdapter = {
    formalize: async () => ({
      title: 'Two Sum',
      description: 'Find two array values whose sum equals a target.',
      difficulty: 'Easy',
      suggestedCategory: 'DSA/Arrays/Traversal'
    }),
    synthesize: async () => {
      synthesizeCalls += 1;
      return {};
    }
  };

  const result = await processRawQuestion(
    { text: 'Given an array and a target, find two values that add to the target.' },
    [{ id: 'existing-1', title: 'Two Sum', description: 'Find two array values whose sum equals a target.' }],
    { ai }
  );

  assert.equal(result.processingMode, 'ai');
  assert.equal(result.duplicate?.id, 'existing-1');
  assert.equal(result.duplicate?.similarity, 1);
  assert.equal(synthesizeCalls, 0);
});

test('uses AI output and generated assets for a non-duplicate question', async () => {
  const ai: QuestionAiAdapter = {
    formalize: async () => ({
      title: 'Count Islands',
      description: 'Count connected components of land in a binary grid.',
      inputFormat: 'Rows, columns, then the grid.',
      outputFormat: 'One integer.',
      constraints: ['1 <= rows, columns <= 1000'],
      difficulty: 'Medium',
      suggestedCategory: 'DSA/Graphs/Depth First Search (DFS)'
    }),
    synthesize: async () => ({
      referenceSolution: { language: 'cpp', code: 'int main() { return 0; }' },
      testCases: [{ id: 9, input: '1 1\n1', expectedOutput: '1', isSample: true }]
    })
  };

  const result = await processRawQuestion(
    { text: 'Given a grid of zeroes and ones, count the islands.' },
    [],
    { ai }
  );

  assert.equal(result.processingMode, 'ai');
  assert.equal(result.question.title, 'Count Islands');
  assert.equal(result.assets.referenceSolution.language, 'cpp');
  assert.equal(result.assets.testCases.length, 1);
  assert.equal(result.assets.testCases[0].id, 1);
});

test('falls back locally when the AI adapter fails', async () => {
  const ai: QuestionAiAdapter = {
    formalize: async () => { throw new Error('missing key'); },
    synthesize: async () => ({})
  };
  const result = await processRawQuestion({ text: 'Reverse a string.' }, [], { ai });

  assert.equal(result.processingMode, 'local');
  assert.equal(result.question.title, 'Reverse a string.');
  assert.match(result.warnings[0], /local structuring was used/);
});

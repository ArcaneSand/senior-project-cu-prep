/**
 * Manual test for StarJudge
 * 
 * Run with: npx tsx __tests__/evaluation/star-judge.test.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import StarJudge from '../../lib/evaluation/judges/StarJudge';
import { REFERENCE_ANSWERS } from '../../lib/evaluation/rubrics/StarRubric';

// Test configuration
const TEST_QUESTION = "Tell me about a time you solved a technical problem";
const TEST_ANSWER_EXCELLENT = REFERENCE_ANSWERS.excellent;
const TEST_ANSWER_POOR = REFERENCE_ANSWERS.poor;

/**
 * Run tests on StarJudge
 */
async function runTest() {
  console.log('='.repeat(60));
  console.log('STAR JUDGE TEST');
  console.log('='.repeat(60));
  
  // Check API key
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
  }
  
  console.log('✓ API key found');
  
  // Create judge instance
  const judge = new StarJudge(apiKey);
  console.log('✓ StarJudge instance created');
  console.log('');
  
  // Test 1: Excellent answer
  console.log('TEST 1: Evaluating EXCELLENT answer');
  console.log('-'.repeat(60));
  console.log('Answer preview:', TEST_ANSWER_EXCELLENT.substring(0, 150) + '...');
  console.log('');
  
  const excellentResult = await judge.evaluate({
    question: TEST_QUESTION,
    answer: TEST_ANSWER_EXCELLENT
  });
  
  console.log('RESULT:');
  console.log(JSON.stringify(excellentResult, null, 2));
  console.log('');
  console.log(`Overall Score: ${excellentResult.overallScore}/4.0`);
  console.log('');
  
  // Validate excellent answer scored high
  if (excellentResult.overallScore < 3.0) {
    console.error('❌ FAILED: Excellent answer scored too low');
    console.error(`   Expected: >= 3.0, Got: ${excellentResult.overallScore}`);
  } else {
    console.log(`✓ PASSED: Excellent answer scored ${excellentResult.overallScore}/4.0 (expected >= 3.0)`);
  }
  console.log('');
  console.log('='.repeat(60));
  console.log('');
  
  // Test 2: Poor answer
  console.log('TEST 2: Evaluating POOR answer');
  console.log('-'.repeat(60));
  console.log('Answer preview:', TEST_ANSWER_POOR.substring(0, 150) + '...');
  console.log('');
  
  const poorResult = await judge.evaluate({
    question: TEST_QUESTION,
    answer: TEST_ANSWER_POOR
  });
  
  console.log('RESULT:');
  console.log(JSON.stringify(poorResult, null, 2));
  console.log('');
  console.log(`Overall Score: ${poorResult.overallScore}/4.0`);
  console.log('');
  
  // Validate poor answer scored low
  if (poorResult.overallScore > 2.0) {
    console.error('❌ FAILED: Poor answer scored too high');
    console.error(`   Expected: <= 2.0, Got: ${poorResult.overallScore}`);
  } else {
    console.log(`✓ PASSED: Poor answer scored ${poorResult.overallScore}/4.0 (expected <= 2.0)`);
  }
  console.log('');
  console.log('='.repeat(60));
  console.log('');
  
  // Summary
  console.log('TEST SUMMARY');
  console.log('-'.repeat(60));
  console.log(`Excellent answer: ${excellentResult.overallScore}/4.0 ${excellentResult.overallScore >= 3.0 ? '✓' : '❌'}`);
  console.log(`Poor answer: ${poorResult.overallScore}/4.0 ${poorResult.overallScore <= 2.0 ? '✓' : '❌'}`);
  console.log('');
  
  const allPassed = excellentResult.overallScore >= 3.0 && poorResult.overallScore <= 2.0;
  
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('');
    console.log('Day 1 is complete! StarJudge is working correctly.');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('');
    console.log('This may indicate the judge needs prompt tuning.');
  }
  
  console.log('='.repeat(60));
  
  return {
    excellentResult,
    poorResult,
    passed: allPassed
  };
}

// Run the test
runTest()
  .then((results) => {
    process.exit(results.passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ TEST ERROR:');
    console.error(error);
    console.error('');
    process.exit(1);
  });
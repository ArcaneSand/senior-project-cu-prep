/**
 * Multi-Judge System Test
 * 
 * Tests the complete multi-judge evaluation pipeline with
 * StarJudge, CompetencyJudge, and Aggregator.
 * 
 * Run with: npx tsx __tests__/evaluation/multijudge.test.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import StarJudge from '../../lib/evaluation/judges/StarJudge';
import CompetencyJudge from '../../lib/evaluation/judges/CompetencyJudge';
import { Aggregator } from '../../lib/evaluation/Aggregator';
import { REFERENCE_ANSWERS } from '../../lib/evaluation/rubrics/StarRubric';

// Test configuration
const TEST_QUESTION = "Tell me about a time you solved a technical problem";
const TEST_ANSWER_EXCELLENT = REFERENCE_ANSWERS.excellent;
const TEST_ANSWER_POOR = REFERENCE_ANSWERS.poor;

/**
 * Test multi-judge evaluation system
 */
async function runMultiJudgeTest() {
  console.log('='.repeat(70));
  console.log('MULTI-JUDGE EVALUATION SYSTEM TEST');
  console.log('='.repeat(70));
  console.log('');
  
  // Check API key
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
  }
  
  console.log('✓ API key found');
  
  // Initialize judges and aggregator
  const starJudge = new StarJudge(apiKey);
  const competencyJudge = new CompetencyJudge(apiKey);
  const aggregator = new Aggregator();
  
  console.log('✓ StarJudge initialized');
  console.log('✓ CompetencyJudge initialized');
  console.log('✓ Aggregator initialized');
  console.log('');
  
  // ========== TEST 1: EXCELLENT ANSWER ==========
  
  console.log('TEST 1: Multi-Judge Evaluation of EXCELLENT Answer');
  console.log('-'.repeat(70));
  console.log('Answer preview:', TEST_ANSWER_EXCELLENT.substring(0, 100) + '...');
  console.log('');
  console.log('Running both judges in parallel...');
  console.log('');
  
  const [excellentStar, excellentComp] = await Promise.all([
    starJudge.evaluate({ question: TEST_QUESTION, answer: TEST_ANSWER_EXCELLENT }),
    competencyJudge.evaluate({ question: TEST_QUESTION, answer: TEST_ANSWER_EXCELLENT })
  ]);
  
  console.log('');
  console.log('INDIVIDUAL JUDGE RESULTS:');
  console.log('  StarJudge Score:', excellentStar.overallScore, '/4.0');
  console.log('  CompetencyJudge Score:', excellentComp.overallScore, '/4.0');
  console.log('');
  
  // Aggregate results
  console.log('Aggregating results...');
  const excellentAggregated = aggregator.aggregate([excellentStar, excellentComp]);
  
  console.log('');
  console.log('AGGREGATED RESULTS:');
  console.log('  Mean Score:', excellentAggregated.aggregatedScores.overall.mean, '/4.0');
  console.log('  Median Score:', excellentAggregated.aggregatedScores.overall.median, '/4.0');
  console.log('  Standard Deviation:', excellentAggregated.aggregatedScores.overall.stdDev);
  console.log('  Judge Agreement:', (excellentAggregated.aggregatedScores.overall.agreement * 100).toFixed(0) + '%');
  console.log('  Confidence Score:', (excellentAggregated.confidenceScore * 100).toFixed(0) + '%');
  console.log('');
  
  console.log('TOP STRENGTHS (Synthesized):');
  excellentAggregated.synthesizedFeedback.topStrengths.forEach((strength, i) => {
    console.log(`  ${i + 1}. ${strength}`);
  });
  console.log('');
  
  console.log('TOP IMPROVEMENTS (Synthesized):');
  excellentAggregated.synthesizedFeedback.topImprovements.forEach((improvement, i) => {
    console.log(`  ${i + 1}. ${improvement}`);
  });
  console.log('');
  
  if (excellentAggregated.synthesizedFeedback.disagreementFlags.length > 0) {
    console.log('DISAGREEMENT FLAGS:');
    excellentAggregated.synthesizedFeedback.disagreementFlags.forEach(flag => {
      console.log(`  ⚠️  ${flag}`);
    });
    console.log('');
  }
  
  // Validate excellent answer
  const excellentMedian = excellentAggregated.aggregatedScores.overall.median;
  if (excellentMedian < 3.0) {
    console.log('❌ FAILED: Excellent answer scored too low');
    console.log(`   Expected: >= 3.0, Got: ${excellentMedian}`);
  } else {
    console.log(`✓ PASSED: Excellent answer scored ${excellentMedian}/4.0 (expected >= 3.0)`);
  }
  console.log('');
  console.log('='.repeat(70));
  console.log('');
  
  // ========== TEST 2: POOR ANSWER ==========
  
  console.log('TEST 2: Multi-Judge Evaluation of POOR Answer');
  console.log('-'.repeat(70));
  console.log('Answer preview:', TEST_ANSWER_POOR.substring(0, 100) + '...');
  console.log('');
  console.log('Running both judges in parallel...');
  console.log('');
  
  const [poorStar, poorComp] = await Promise.all([
    starJudge.evaluate({ question: TEST_QUESTION, answer: TEST_ANSWER_POOR }),
    competencyJudge.evaluate({ question: TEST_QUESTION, answer: TEST_ANSWER_POOR })
  ]);
  
  console.log('');
  console.log('INDIVIDUAL JUDGE RESULTS:');
  console.log('  StarJudge Score:', poorStar.overallScore, '/4.0');
  console.log('  CompetencyJudge Score:', poorComp.overallScore, '/4.0');
  console.log('');
  
  // Aggregate results
  console.log('Aggregating results...');
  const poorAggregated = aggregator.aggregate([poorStar, poorComp]);
  
  console.log('');
  console.log('AGGREGATED RESULTS:');
  console.log('  Mean Score:', poorAggregated.aggregatedScores.overall.mean, '/4.0');
  console.log('  Median Score:', poorAggregated.aggregatedScores.overall.median, '/4.0');
  console.log('  Standard Deviation:', poorAggregated.aggregatedScores.overall.stdDev);
  console.log('  Judge Agreement:', (poorAggregated.aggregatedScores.overall.agreement * 100).toFixed(0) + '%');
  console.log('  Confidence Score:', (poorAggregated.confidenceScore * 100).toFixed(0) + '%');
  console.log('');
  
  console.log('TOP STRENGTHS (Synthesized):');
  poorAggregated.synthesizedFeedback.topStrengths.forEach((strength, i) => {
    console.log(`  ${i + 1}. ${strength}`);
  });
  console.log('');
  
  console.log('TOP IMPROVEMENTS (Synthesized):');
  poorAggregated.synthesizedFeedback.topImprovements.forEach((improvement, i) => {
    console.log(`  ${i + 1}. ${improvement}`);
  });
  console.log('');
  
  if (poorAggregated.synthesizedFeedback.disagreementFlags.length > 0) {
    console.log('DISAGREEMENT FLAGS:');
    poorAggregated.synthesizedFeedback.disagreementFlags.forEach(flag => {
      console.log(`  ⚠️  ${flag}`);
    });
    console.log('');
  }
  
  // Validate poor answer
  const poorMedian = poorAggregated.aggregatedScores.overall.median;
  if (poorMedian > 2.0) {
    console.log('❌ FAILED: Poor answer scored too high');
    console.log(`   Expected: <= 2.0, Got: ${poorMedian}`);
  } else {
    console.log(`✓ PASSED: Poor answer scored ${poorMedian}/4.0 (expected <= 2.0)`);
  }
  console.log('');
  console.log('='.repeat(70));
  console.log('');
  
  // ========== SUMMARY ==========
  
  console.log('TEST SUMMARY');
  console.log('-'.repeat(70));
  console.log('');
  console.log('Judge Performance:');
  console.log(`  StarJudge - Excellent: ${excellentStar.overallScore}/4.0, Poor: ${poorStar.overallScore}/4.0`);
  console.log(`  CompetencyJudge - Excellent: ${excellentComp.overallScore}/4.0, Poor: ${poorComp.overallScore}/4.0`);
  console.log('');
  console.log('Aggregated Scores:');
  console.log(`  Excellent: ${excellentMedian}/4.0 ${excellentMedian >= 3.0 ? '✓' : '❌'}`);
  console.log(`  Poor: ${poorMedian}/4.0 ${poorMedian <= 2.0 ? '✓' : '❌'}`);
  console.log('');
  console.log('Agreement Levels:');
  console.log(`  Excellent: ${(excellentAggregated.aggregatedScores.overall.agreement * 100).toFixed(0)}%`);
  console.log(`  Poor: ${(poorAggregated.aggregatedScores.overall.agreement * 100).toFixed(0)}%`);
  console.log('');
  
  const excellentPassed = excellentMedian >= 3.0;
  const poorPassed = poorMedian <= 2.0;
  const allPassed = excellentPassed && poorPassed;
  
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('');
    console.log('Day 2 is complete! Multi-judge system is working correctly.');
    console.log('');
    console.log('Key achievements:');
    console.log('  ✓ Two independent judges evaluate answers');
    console.log('  ✓ Different rubrics (STAR vs Competency)');
    console.log('  ✓ Parallel execution (both judges run simultaneously)');
    console.log('  ✓ Statistical aggregation (mean, median, agreement)');
    console.log('  ✓ Synthesized feedback from multiple perspectives');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('');
    console.log('This may indicate judges need prompt tuning or rubric refinement.');
  }
  
  console.log('');
  console.log('='.repeat(70));
  
  return {
    excellentAggregated,
    poorAggregated,
    passed: allPassed
  };
}

// Run the test
runMultiJudgeTest()
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
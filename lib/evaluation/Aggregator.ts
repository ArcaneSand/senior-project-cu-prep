/**
 * Aggregator
 * 
 * Combines evaluations from multiple judges into aggregated scores
 * and synthesized feedback using statistical methods (NO AI).
 */

import { JudgeEvaluation, EvaluationDimension } from './BaseJudge';

/**
 * Aggregated evaluation combining multiple judges
 */
export interface AggregatedEvaluation {
  /** Original evaluations from all judges */
  judgeEvaluations: JudgeEvaluation[];
  
  /** Statistical aggregation of scores */
  aggregatedScores: {
    overall: {
      mean: number;
      median: number;
      stdDev: number;
      agreement: number; // 0-1, higher = more agreement
    };
    byDimension: Record<string, {
      mean: number;
      median: number;
      stdDev: number;
    }>;
  };
  
  /** Synthesized feedback (text analysis, NO AI) */
  synthesizedFeedback: {
    topStrengths: string[];
    topImprovements: string[];
    disagreementFlags: string[]; // Dimensions with high variance
  };
  
  /** Overall confidence in this evaluation */
  confidenceScore: number;
}

/**
 * Aggregates multiple judge evaluations using statistical methods
 */
export class Aggregator {
  
  /**
   * Aggregate multiple judge evaluations
   * @param evaluations - Array of judge evaluations (minimum 2)
   * @returns Aggregated evaluation with statistics and synthesized feedback
   */
  aggregate(evaluations: JudgeEvaluation[]): AggregatedEvaluation {
    if (evaluations.length < 2) {
      throw new Error('Aggregator requires at least 2 judge evaluations');
    }
    
    console.log(`Aggregator: Combining ${evaluations.length} judge evaluations...`);
    
    // Calculate overall score statistics
    const overallScores = evaluations.map(e => e.overallScore);
    const overallStats = {
      mean: this.mean(overallScores),
      median: this.median(overallScores),
      stdDev: this.stdDev(overallScores),
      agreement: this.calculateAgreement(overallScores)
    };
    
    console.log(`Aggregator: Overall scores - Mean: ${overallStats.mean.toFixed(2)}, Agreement: ${(overallStats.agreement * 100).toFixed(0)}%`);
    
    // Aggregate by dimension
    const byDimension = this.aggregateDimensions(evaluations);
    
    // Synthesize feedback (text analysis, NO AI)
    const synthesizedFeedback = this.synthesizeFeedback(evaluations);
    
    // Calculate confidence
    const confidenceScore = this.calculateConfidence(evaluations);
    
    console.log(`Aggregator: Synthesis complete. Confidence: ${(confidenceScore * 100).toFixed(0)}%`);
    
    return {
      judgeEvaluations: evaluations,
      aggregatedScores: {
        overall: overallStats,
        byDimension: byDimension
      },
      synthesizedFeedback: synthesizedFeedback,
      confidenceScore: confidenceScore
    };
  }
  
  /**
   * Aggregate scores by dimension across all judges
   */
  private aggregateDimensions(evaluations: JudgeEvaluation[]): Record<string, any> {
    const dimensionGroups: Record<string, number[]> = {};
    
    // Group scores by dimension name
    evaluations.forEach(evaluation => {
      evaluation.dimensions.forEach(dim => {
        if (!dimensionGroups[dim.name]) {
          dimensionGroups[dim.name] = [];
        }
        dimensionGroups[dim.name].push(dim.score);
      });
    });
    
    // Calculate statistics for each dimension
    const result: Record<string, any> = {};
    Object.entries(dimensionGroups).forEach(([name, scores]) => {
      result[name] = {
        mean: this.mean(scores),
        median: this.median(scores),
        stdDev: this.stdDev(scores)
      };
    });
    
    return result;
  }
  
  /**
   * Synthesize feedback from multiple judges using text analysis
   */
  private synthesizeFeedback(evaluations: JudgeEvaluation[]): {
    topStrengths: string[];
    topImprovements: string[];
    disagreementFlags: string[];
  } {
    // Extract all strengths and improvements
    const allStrengths = evaluations.flatMap(e => e.strengths);
    const allImprovements = evaluations.flatMap(e => e.improvements);
    
    // Find common themes in strengths
    const topStrengths = this.findCommonThemes(allStrengths, evaluations.length);
    
    // Find common themes in improvements
    const topImprovements = this.findCommonThemes(allImprovements, evaluations.length);
    
    // Find dimensions where judges disagree (stdDev > 1.0)
    const disagreementFlags = this.findDisagreements(evaluations);
    
    return {
      topStrengths: topStrengths.slice(0, 3),
      topImprovements: topImprovements.slice(0, 3),
      disagreementFlags: disagreementFlags
    };
  }
  
  /**
   * Find common themes in feedback using keyword frequency
   */
  private findCommonThemes(items: string[], judgeCount: number): string[] {
    if (items.length === 0) return [];
    
    // Count keyword frequency across all items
    const keywordCounts: Record<string, { count: number; items: string[] }> = {};
    
    items.forEach(item => {
      const keywords = this.extractKeywords(item);
      keywords.forEach(keyword => {
        if (!keywordCounts[keyword]) {
          keywordCounts[keyword] = { count: 0, items: [] };
        }
        keywordCounts[keyword].count++;
        keywordCounts[keyword].items.push(item);
      });
    });
    
    // Rank by frequency and get representative items
    const ranked = Object.entries(keywordCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
    
    // Return items that contain the most common themes
    const seen = new Set<string>();
    const result: string[] = [];
    
    ranked.forEach(([keyword, data]) => {
      // Find first item we haven't used yet
      const item = data.items.find(i => !seen.has(i));
      if (item) {
        // Add note if multiple judges mentioned this
        const mentionCount = data.items.length;
        if (mentionCount > 1 && judgeCount > 1) {
          result.push(`${item} (${mentionCount}/${judgeCount} judges agree)`);
        } else {
          result.push(item);
        }
        seen.add(item);
      }
    });
    
    // If we don't have enough, add unique items
    items.forEach(item => {
      if (result.length < 3 && !seen.has(item)) {
        result.push(item);
        seen.add(item);
      }
    });
    
    return result;
  }
  
  /**
   * Extract keywords from text for theme detection
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4); // Only words longer than 4 chars
    
    // Remove common stop words
    const stopWords = new Set(['should', 'could', 'would', 'there', 'their', 'about', 'which', 'these', 'those']);
    return words.filter(word => !stopWords.has(word));
  }
  
  /**
   * Find dimensions where judges disagree significantly
   */
  private findDisagreements(evaluations: JudgeEvaluation[]): string[] {
    const disagreements: string[] = [];
    
    // Group dimensions by name
    const dimensionGroups: Record<string, number[]> = {};
    evaluations.forEach(evaluation => {
      evaluation.dimensions.forEach(dim => {
        if (!dimensionGroups[dim.name]) {
          dimensionGroups[dim.name] = [];
        }
        dimensionGroups[dim.name].push(dim.score);
      });
    });
    
    // Find dimensions with high standard deviation (> 1.0)
    Object.entries(dimensionGroups).forEach(([name, scores]) => {
      if (this.stdDev(scores) > 1.0) {
        disagreements.push(name);
      }
    });
    
    return disagreements;
  }
  
  /**
   * Calculate agreement metric (0-1, higher = more agreement)
   */
  private calculateAgreement(scores: number[]): number {
    const stdDev = this.stdDev(scores);
    // Max reasonable stdDev for 0-4 scale is ~2
    // Agreement = 1 - (stdDev / 2)
    const agreement = Math.max(0, 1 - (stdDev / 2));
    return Math.round(agreement * 100) / 100;
  }
  
  /**
   * Calculate overall confidence in evaluation
   */
  private calculateConfidence(evaluations: JudgeEvaluation[]): number {
    // Confidence based on:
    // 1. Agreement between judges (higher = better)
    const overallScores = evaluations.map(e => e.overallScore);
    const agreement = this.calculateAgreement(overallScores);
    
    // 2. Individual judge confidence
    const avgJudgeConfidence = this.mean(evaluations.map(e => e.confidence));
    
    // 3. Number of judges (more = better, but diminishing returns)
    const judgeCountFactor = Math.min(1, evaluations.length / 3);
    
    // Weighted combination
    const confidence = (agreement * 0.5) + (avgJudgeConfidence * 0.3) + (judgeCountFactor * 0.2);
    
    return Math.round(confidence * 100) / 100;
  }
  
  // ========== Statistical Helper Methods ==========
  
  /**
   * Calculate mean (average)
   */
  private mean(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    return Math.round((sum / numbers.length) * 100) / 100;
  }
  
  /**
   * Calculate median (middle value)
   */
  private median(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      // Even number of elements - average the two middle values
      return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
    } else {
      // Odd number of elements - return middle value
      return sorted[mid];
    }
  }
  
  /**
   * Calculate standard deviation (measure of spread)
   */
  private stdDev(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const avg = this.mean(numbers);
    const squareDiffs = numbers.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = this.mean(squareDiffs);
    
    return Math.round(Math.sqrt(avgSquareDiff) * 100) / 100;
  }
}
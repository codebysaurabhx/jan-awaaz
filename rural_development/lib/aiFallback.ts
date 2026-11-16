// lib/aiFallback.ts
/**
 * Simple AI fallback used when Gemini API key is not provided.
 * It performs deterministic categorisation based on keyword matching.
 */
export type ComplaintAIResult = {
  suggestedCategory: string;
  department: string;
  summary: string;
};

const categoryMap: Record<string, { category: string; department: string }> = {
  water: { category: 'Drinking Water', department: 'Water Supply' },
  road: { category: 'Roads and Infrastructure', department: 'Public Works' },
  electricity: { category: 'Electricity', department: 'Energy' },
  sanitation: { category: 'Sanitation and Garbage', department: 'Sanitation' },
  ration: { category: 'Ration and Food Distribution', department: 'Food Supplies' },
  pension: { category: 'Pension Issues', department: 'Social Welfare' },
  education: { category: 'Education', department: 'Education' },
  health: { category: 'Healthcare', department: 'Health Services' },
  agriculture: { category: 'Agriculture', department: 'Agriculture' },
  scheme: { category: 'Government Schemes', department: 'Administration' },
  women: { category: 'Women Safety', department: 'Women Welfare' },
};

export async function aiFallback(description: string): Promise<ComplaintAIResult> {
  const lowered = description.toLowerCase();
  for (const key of Object.keys(categoryMap)) {
    if (lowered.includes(key)) {
      const { category, department } = categoryMap[key];
      return {
        suggestedCategory: category,
        department,
        summary: description.slice(0, 150) + (description.length > 150 ? '...' : ''),
      };
    }
  }
  // Default fallback
  return {
    suggestedCategory: 'Other',
    department: 'General Administration',
    summary: description.slice(0, 150) + (description.length > 150 ? '...' : ''),
  };
}

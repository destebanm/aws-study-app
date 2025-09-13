const fs = require('fs');

// Read the questions file
const questionsFile = '/Users/danielestebanmenendez/workspace/aws-study-app/client/public/questions.json';
const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

// Function to improve question readability
function improveQuestionText(text) {
  // If text already has good formatting, return as is
  if (text.includes('\n\n') || text.includes('**')) {
    return text;
  }
  
  let improved = text;
  
  // Split very long sentences and add structure
  const improvements = [
    // Add structure to architecture descriptions
    {
      pattern: /^([^.]+has developed[^.]+\.) ([^.]+includes[^.]+\.) ([^.]+stores[^.]+\.) ([^.]+analyzing[^.]+\.) (.+)$/,
      replacement: '$1\n\n**Current Architecture:**\n$2 $3\n\n**Performance Analysis:**\n$4\n\n**Question:**\n$5'
    },
    // Structure for startup scenarios
    {
      pattern: /^([^.]+startup[^.]+AWS\.) ([^.]+architecture includes[^.]+\.) ([^.]+Recently[^.]+\.) (.+)$/,
      replacement: '$1\n\n**Current Architecture:**\n$2\n\n**Problem Observed:**\n$3\n\n**Question:**\n$4'
    },
    // General long paragraph improvements
    {
      pattern: /\. The ([A-Z][^.]+\.) ([^.]+\.) (.+)/g,
      replacement: '.\n\n**Background:**\nThe $1 $2\n\n**Question:**\n$3'
    },
    // Question indicators
    {
      pattern: /\. (Which|What|How) ([a-z][^?]+\?)/g,
      replacement: '.\n\n**Question:**\n$1 $2'
    },
    // Current state indicators
    {
      pattern: /Currently, ([^.]+\.)/g,
      replacement: '\n\n**Current State:**\n• $1'
    },
    // Problem indicators
    {
      pattern: /Recently, ([^.]+\.)/g,
      replacement: '\n\n**Problem:**\n• $1'
    }
  ];
  
  improvements.forEach(improvement => {
    improved = improved.replace(improvement.pattern, improvement.replacement);
  });
  
  // Clean up multiple newlines
  improved = improved.replace(/\n{3,}/g, '\n\n');
  
  return improved.trim();
}

// Target specific long questions that need improvement
const problematicQuestions = [
  'q677', 'q678', 'q301', 'q683', 'q689', 'q680', 'q682'
];

let improvedCount = 0;

questions.forEach(question => {
  if (problematicQuestions.includes(question.id) || question.questionText.length > 300) {
    const originalText = question.questionText;
    const improvedText = improveQuestionText(originalText);
    
    if (improvedText !== originalText) {
      question.questionText = improvedText;
      console.log(`Improved question ${question.id}:`);
      console.log('Original length:', originalText.length);
      console.log('New length:', improvedText.length);
      console.log('---');
      improvedCount++;
    }
  }
});

// Write the improved questions back to file
fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2));

console.log(`\nImproved ${improvedCount} questions for better readability!`);
console.log('Changes saved to questions.json');
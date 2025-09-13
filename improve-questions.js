const fs = require('fs');

// Read the questions file
const questionsFile = '/Users/danielestebanmenendez/workspace/aws-study-app/client/public/questions.json';
const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

// Function to improve question readability
function improveQuestionText(text) {
  // If text already has extensive formatting, return as is
  if (text.includes('**Current Architecture:**') || text.includes('**Problem:**') || text.includes('**Background:**')) {
    return text;
  }
  
  let improved = text;
  
  // More comprehensive improvements for long sentences
  const improvements = [
    // Company scenarios with architecture descriptions
    {
      pattern: /^(A [^.]+company[^.]+\.) ([^.]+architecture[^.]+\.) ([^.]+stores?[^.]+\.) ([^.]+analyzing[^.]+\.) (.+)$/,
      replacement: '$1\n\n**Current Architecture:**\n• $2\n• $3\n\n**Analysis:**\n• $4\n\n**Question:**\n$5'
    },
    // Startup/company scenarios with problems
    {
      pattern: /^(A [^.]+(?:startup|company)[^.]+AWS\.) ([^.]+(?:architecture|setup)[^.]+\.) ([^.]+(?:Recently|Currently)[^.]+\.) (.+)$/,
      replacement: '$1\n\n**Current Setup:**\n• $2\n\n**Problem:**\n• $3\n\n**Question:**\n$4'
    },
    // Break up very long sentences with "The" 
    {
      pattern: /^([^.]{50,}\.) (The [^.]{50,}\.) ([^.]{30,}\.) (.+)$/,
      replacement: '$1\n\n**Background:**\n$2 $3\n\n**Question:**\n$4'
    },
    // Healthcare/firm scenarios
    {
      pattern: /^(A [^.]+(?:healthcare|firm|organization)[^.]+\.) ([^.]+application[^.]+\.) ([^.]+policy[^.]+\.) (.+)$/,
      replacement: '$1\n\n**Current Setup:**\n• $2\n\n**Requirements:**\n• $3\n\n**Question:**\n$4'
    },
    // Media/streaming company scenarios
    {
      pattern: /^(A [^.]+(?:media|streaming)[^.]+\.) ([^.]+users[^.]+\.) ([^.]+team[^.]+\.) (.+)$/,
      replacement: '$1\n\n**Current Situation:**\n• $2\n\n**Challenge:**\n• $3\n\n**Question:**\n$4'
    },
    // Engineering team scenarios
    {
      pattern: /^(The [^.]+team[^.]+\.) ([^.]+wants to[^.]+\.) (.+)$/,
      replacement: '$1\n\n**Objective:**\n• $2\n\n**Question:**\n$3'
    },
    // Question indicators - more comprehensive
    {
      pattern: /\. (Which|What|How|As a [^,]+,) ([^?]+\?)/g,
      replacement: '.\n\n**Question:**\n$1 $2'
    },
    // Split on "Recently" or "Currently"
    {
      pattern: /\. (Recently|Currently), ([^.]+\.)/g,
      replacement: '.\n\n**Current Status:**\n• $1, $2'
    },
    // Split on "The company" or "The team"
    {
      pattern: /\. (The (?:company|team|organization) [^.]+\.)/g,
      replacement: '.\n\n**Context:**\n• $1'
    },
    // Break up sentences with multiple services mentioned
    {
      pattern: /([^.]+Amazon [A-Z][^.]+) and ([^.]+Amazon [A-Z][^.]+\.)/g,
      replacement: '$1\n• $2'
    }
  ];
  
  improvements.forEach(improvement => {
    improved = improved.replace(improvement.pattern, improvement.replacement);
  });
  
  // Additional simple line breaks for readability
  if (!improved.includes('\n')) {
    // If still no line breaks, try to split on long sentences
    improved = improved.replace(/(\. )([A-Z][^.]{80,}\.)/g, '$1\n\n$2');
  }
  
  // Clean up multiple newlines and trim
  improved = improved.replace(/\n{3,}/g, '\n\n').trim();
  
  return improved;
}

let improvedCount = 0;
let totalProcessed = 0;

questions.forEach(question => {
  // Process questions that are longer than 200 characters OR don't have line breaks
  const shouldProcess = question.questionText.length > 200 || 
                       (!question.questionText.includes('\n') && question.questionText.length > 150);
  
  if (shouldProcess) {
    totalProcessed++;
    const originalText = question.questionText;
    const improvedText = improveQuestionText(originalText);
    
    if (improvedText !== originalText) {
      question.questionText = improvedText;
      console.log(`✅ Improved question ${question.id}:`);
      console.log('   Original length:', originalText.length);
      console.log('   New length:', improvedText.length);
      console.log('   Has line breaks now:', improvedText.includes('\n'));
      console.log('---');
      improvedCount++;
    } else {
      console.log(`⏭️  Skipped question ${question.id} (already well formatted)`);
    }
  }
});

// Write the improved questions back to file
fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2));

console.log(`\n🎯 SUMMARY:`);
console.log(`📊 Total questions processed: ${totalProcessed}`);
console.log(`✅ Questions improved: ${improvedCount}`);
console.log(`📈 Improvement rate: ${((improvedCount/totalProcessed)*100).toFixed(1)}%`);
console.log(`💾 Changes saved to questions.json`);

if (improvedCount > 0) {
  console.log(`\n🚀 All improved questions now have better structure and readability!`);
} else {
  console.log(`\n✨ All questions were already well formatted!`);
}
// Script mejorado para importar preguntas únicas de múltiples repositorios públicos de GitHub
// Busca preguntas de AWS SAA-C03, verifica unicidad y las combina con las existentes

const fs = require('fs');
const path = require('path');
const https = require('https');

// Función para hacer fetch usando https nativo de Node.js
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve({ ok: false, status: res.statusCode });
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: true,
          text: () => Promise.resolve(data)
        });
      });
    }).on('error', reject);
  });
}

// Múltiples repositorios públicos con preguntas de AWS
const REPOSITORIES = [
  {
    name: 'AWS-Practice-Exams',
    baseUrl: 'https://raw.githubusercontent.com/ExamProCo/AWS-Solutions-Architect-Associate/master/',
    files: [
      'practice-exam-1.md',
      'practice-exam-2.md',
      'practice-exam-3.md'
    ]
  },
  {
    name: 'AWS-Dumps',
    baseUrl: 'https://raw.githubusercontent.com/kananinirav/AWS-Certified-Cloud-Practitioner-Notes/master/',
    files: [
      'practice-exams/practice-exam-1.md',
      'practice-exams/practice-exam-2.md'
    ]
  },
  {
    name: 'Whizlabs-AWS',
    baseUrl: 'https://raw.githubusercontent.com/cloudacademy/aws-solutions-architect-associate-practice-tests/main/',
    files: [
      'test1.md',
      'test2.md',
      'test3.md'
    ]
  }
];

// Función para normalizar texto y comparar preguntas
function normalizeText(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Función para verificar si una pregunta ya existe
function isDuplicateQuestion(newQuestion, existingQuestions) {
  const newText = normalizeText(newQuestion.questionText);
  return existingQuestions.some(existing => {
    const existingText = normalizeText(existing.questionText);
    // Considera duplicado si más del 80% del texto coincide
    const similarity = calculateSimilarity(newText, existingText);
    return similarity > 0.8;
  });
}

// Función simple para calcular similaridad entre textos
function calculateSimilarity(text1, text2) {
  const words1 = text1.split(' ');
  const words2 = text2.split(' ');
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  return intersection.length / union.length;
}

// Función para detectar el servicio de AWS en la pregunta
function detectAWSService(questionText, options) {
  const services = [
    'EC2', 'S3', 'RDS', 'VPC', 'ELB', 'Auto Scaling', 'CloudFormation', 
    'Lambda', 'DynamoDB', 'SNS', 'SQS', 'CloudWatch', 'IAM', 'Route 53',
    'CloudFront', 'EFS', 'EBS', 'Glacier', 'Kinesis', 'EMR', 'Redshift',
    'ElastiCache', 'API Gateway', 'CodeDeploy', 'CodePipeline', 'ECS',
    'EKS', 'Fargate', 'Step Functions', 'SageMaker', 'GuardDuty', 'Shield',
    'WAF', 'KMS', 'Secrets Manager', 'Systems Manager', 'CloudTrail'
  ];
  
  const text = (questionText + ' ' + options.map(o => o.text).join(' ')).toUpperCase();
  
  for (const service of services) {
    if (text.includes(service) || text.includes(service.replace(/\s+/g, ''))) {
      return service;
    }
  }
  return 'General';
}

function parseQuestions(md, repoName) {
  // Diferentes patrones de parsing según el formato del repositorio
  const lines = md.split('\n');
  const questions = [];
  let current = null;
  
  for (let line of lines) {
    line = line.trim();
    
    // Patrón para preguntas (más flexible)
    if (/^(Q[0-9]*[\.:\)]?|Question [0-9]+[\.:]?|\*\*Question [0-9]+|\d+\.) /.test(line)) {
      if (current && current.questionText && current.options.length > 0) {
        questions.push(current);
      }
      current = { 
        questionText: line.replace(/^(Q[0-9]*[\.:\)]?|Question [0-9]+[\.:]?|\*\*Question [0-9]+|\d+\.) /, ''), 
        options: [], 
        answer: '', 
        explanation: '' 
      };
    } 
    // Opciones de respuesta (más patrones)
    else if (/^[A-D][\.):]/.test(line) && current) {
      const optionText = line.replace(/^[A-D][\.):]/, '').trim();
      if (optionText) {
        current.options.push({ text: optionText });
      }
    }
    // Respuesta correcta
    else if (/^(Answer|Correct Answer|Solution):/i.test(line) && current) {
      current.answer = line.replace(/^(Answer|Correct Answer|Solution):/i, '').trim();
    }
    // Explicación
    else if (/^(Explanation|Rationale|Why):/i.test(line) && current) {
      current.explanation = line.replace(/^(Explanation|Rationale|Why):/i, '').trim();
    }
    // Continuar explicación en líneas siguientes
    else if (current && current.explanation && line && 
             !/^(Q[0-9]*|Question|Answer|Explanation|[A-D][\.):])/i.test(line)) {
      current.explanation += ' ' + line;
    }
  }
  
  // Añadir la última pregunta si existe
  if (current && current.questionText && current.options.length > 0) {
    questions.push(current);
  }
  
  // Convertir al formato de tu app
  return questions.map((q, i) => {
    const options = q.options.map(opt => {
      // Determinar si es la respuesta correcta
      let isCorrect = false;
      if (q.answer) {
        const answerLetter = q.answer.charAt(0).toUpperCase();
        const optionIndex = q.options.indexOf(opt);
        const expectedLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
        isCorrect = answerLetter === expectedLetter;
      }
      return { text: opt.text, isCorrect };
    });
    
    return {
      id: `imported_${repoName}_${i + 1}`,
      questionText: q.questionText,
      options,
      explanation: q.explanation || 'No explanation provided',
      awsService: detectAWSService(q.questionText, options),
      source: repoName
    };
  }).filter(q => q.options.length >= 2); // Solo preguntas con al menos 2 opciones
}

async function main() {
  console.log('🔍 Buscando preguntas únicas en repositorios públicos de GitHub...\n');
  
  // Cargar preguntas existentes
  let existingQuestions = [];
  const existingFile = path.join(__dirname, 'client/public/questions.json');
  if (fs.existsSync(existingFile)) {
    existingQuestions = JSON.parse(fs.readFileSync(existingFile, 'utf8'));
    console.log(`📚 Preguntas actuales: ${existingQuestions.length}`);
  }
  
  let allNewQuestions = [];
  let repoStats = {};
  
  // Procesar cada repositorio
  for (const repo of REPOSITORIES) {
    console.log(`\n🔎 Procesando repositorio: ${repo.name}`);
    repoStats[repo.name] = { attempted: 0, found: 0, unique: 0 };
    
    for (const file of repo.files) {
      const url = repo.baseUrl + file;
      repoStats[repo.name].attempted++;
      
      try {
        console.log(`  📄 Descargando: ${file}`);
        const res = await fetch(url);
        
        if (!res.ok) {
          console.log(`    ❌ Error HTTP ${res.status}: ${file}`);
          continue;
        }
        
        const md = await res.text();
        if (md.length < 100) {
          console.log(`    ⚠️  Archivo muy pequeño, omitiendo: ${file}`);
          continue;
        }
        
        const questions = parseQuestions(md, repo.name);
        repoStats[repo.name].found += questions.length;
        
        // Filtrar preguntas únicas
        const uniqueQuestions = questions.filter(newQ => {
          const isDupe = isDuplicateQuestion(newQ, [...existingQuestions, ...allNewQuestions]);
          if (!isDupe) {
            repoStats[repo.name].unique++;
          }
          return !isDupe;
        });
        
        allNewQuestions = allNewQuestions.concat(uniqueQuestions);
        console.log(`    ✅ Encontradas: ${questions.length}, Únicas: ${uniqueQuestions.length}`);
        
        // Pequeña pausa para no sobrecargar GitHub
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (e) {
        console.log(`    ❌ Error procesando ${file}:`, e.message);
      }
    }
  }
  
  console.log('\n📊 Resumen por repositorio:');
  for (const [repoName, stats] of Object.entries(repoStats)) {
    console.log(`  ${repoName}:`);
    console.log(`    - Archivos intentados: ${stats.attempted}`);
    console.log(`    - Preguntas encontradas: ${stats.found}`);
    console.log(`    - Preguntas únicas: ${stats.unique}`);
  }
  
  if (allNewQuestions.length === 0) {
    console.log('\n⚠️  No se encontraron preguntas nuevas únicas.');
    return;
  }
  
  // Asignar IDs únicos a las nuevas preguntas
  const nextId = existingQuestions.length > 0 ? 
    Math.max(...existingQuestions.map(q => parseInt(q.id.replace(/\D/g, '')) || 0)) + 1 : 1;
  
  allNewQuestions.forEach((q, i) => {
    q.id = `q${nextId + i}`;
  });
  
  // Combinar preguntas existentes con las nuevas
  const combinedQuestions = [...existingQuestions, ...allNewQuestions];
  
  // Guardar el archivo actualizado
  fs.writeFileSync(existingFile, JSON.stringify(combinedQuestions, null, 2));
  
  // También crear un archivo de respaldo con solo las nuevas preguntas
  const newQuestionsFile = path.join(__dirname, 'new_questions_backup.json');
  fs.writeFileSync(newQuestionsFile, JSON.stringify(allNewQuestions, null, 2));
  
  console.log(`\n🎉 ¡Proceso completado!`);
  console.log(`📈 Total de preguntas antes: ${existingQuestions.length}`);
  console.log(`➕ Nuevas preguntas únicas añadidas: ${allNewQuestions.length}`);
  console.log(`📚 Total de preguntas ahora: ${combinedQuestions.length}`);
  console.log(`💾 Archivo principal actualizado: ${existingFile}`);
  console.log(`🔄 Respaldo de nuevas preguntas: ${newQuestionsFile}`);
  
  // Mostrar estadísticas por servicio de AWS
  const serviceStats = {};
  allNewQuestions.forEach(q => {
    serviceStats[q.awsService] = (serviceStats[q.awsService] || 0) + 1;
  });
  
  console.log('\n📋 Nuevas preguntas por servicio de AWS:');
  Object.entries(serviceStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([service, count]) => {
      console.log(`  ${service}: ${count} preguntas`);
    });
}

main().catch(console.error);

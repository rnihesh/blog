#!/usr/bin/env node

/**
 * Validation script for .github/copilot-instructions.md
 * 
 * This script validates that the copilot-instructions.md file:
 * 1. Exists in the correct location
 * 2. Has the required sections
 * 3. Follows the expected structure
 * 4. Contains meaningful content
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Required sections in the copilot-instructions.md file
const REQUIRED_SECTIONS = [
  'Project Overview',
  'Tech Stack',
  'Project Structure',
  'Development Commands',
  'Code Style and Conventions'
];

// Optional but recommended sections
const RECOMMENDED_SECTIONS = [
  'Testing',
  'Common Tasks',
  'Important Notes'
];

let errors = [];
let warnings = [];
let passed = 0;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  errors.push(message);
  log(`✗ ${message}`, colors.red);
}

function warn(message) {
  warnings.push(message);
  log(`⚠ ${message}`, colors.yellow);
}

function success(message) {
  passed++;
  log(`✓ ${message}`, colors.green);
}

function validateFileExists() {
  const filePath = path.join(process.cwd(), '.github', 'copilot-instructions.md');
  
  if (!fs.existsSync(filePath)) {
    error('File .github/copilot-instructions.md does not exist');
    return null;
  }
  
  success('File .github/copilot-instructions.md exists');
  return filePath;
}

function validateFileContent(filePath) {
  let content;
  
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    error(`Failed to read file: ${err.message}`);
    return null;
  }
  
  if (content.trim().length === 0) {
    error('File is empty');
    return null;
  }
  
  success('File contains content');
  return content;
}

function validateMarkdownStructure(content) {
  // Check for markdown heading syntax
  const hasHeadings = /^#+\s+.+$/m.test(content);
  
  if (!hasHeadings) {
    error('File does not contain any markdown headings');
    return false;
  }
  
  success('File uses markdown heading syntax');
  return true;
}

function validateRequiredSections(content) {
  const missingRequired = [];
  const missingRecommended = [];
  
  // Check required sections
  REQUIRED_SECTIONS.forEach(section => {
    // Match section as a heading (## or ###)
    const regex = new RegExp(`^#{1,3}\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
    
    if (!regex.test(content)) {
      missingRequired.push(section);
    } else {
      success(`Required section found: "${section}"`);
    }
  });
  
  // Check recommended sections
  RECOMMENDED_SECTIONS.forEach(section => {
    const regex = new RegExp(`^#{1,3}\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
    
    if (!regex.test(content)) {
      missingRecommended.push(section);
    } else {
      success(`Recommended section found: "${section}"`);
    }
  });
  
  if (missingRequired.length > 0) {
    error(`Missing required sections: ${missingRequired.join(', ')}`);
  }
  
  if (missingRecommended.length > 0) {
    warn(`Missing recommended sections: ${missingRecommended.join(', ')}`);
  }
  
  return missingRequired.length === 0;
}

function validateContentQuality(content) {
  const lines = content.split('\n');
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  
  // Check minimum word count (should be substantial)
  if (wordCount < 200) {
    error(`Content is too short (${wordCount} words). Expected at least 200 words.`);
  } else {
    success(`Content has sufficient length (${wordCount} words)`);
  }
  
  // Check for code blocks (should have examples)
  const hasCodeBlocks = /```[\s\S]*?```/.test(content);
  if (hasCodeBlocks) {
    success('File contains code examples');
  } else {
    warn('File does not contain any code examples');
  }
  
  // Check for lists (should have structured information)
  const hasLists = /^[-*+]\s+/m.test(content) || /^\d+\.\s+/m.test(content);
  if (hasLists) {
    success('File contains lists for structured information');
  } else {
    warn('File does not contain any lists');
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(50));
  log(`${colors.bold}Validation Summary${colors.reset}`);
  console.log('='.repeat(50));
  
  log(`Passed: ${passed}`, colors.green);
  
  if (warnings.length > 0) {
    log(`Warnings: ${warnings.length}`, colors.yellow);
  }
  
  if (errors.length > 0) {
    log(`Errors: ${errors.length}`, colors.red);
  }
  
  console.log('='.repeat(50) + '\n');
}

function main() {
  log(`${colors.bold}Validating GitHub Copilot Instructions${colors.reset}\n`);
  
  const filePath = validateFileExists();
  if (!filePath) {
    printSummary();
    process.exit(1);
  }
  
  const content = validateFileContent(filePath);
  if (!content) {
    printSummary();
    process.exit(1);
  }
  
  validateMarkdownStructure(content);
  validateRequiredSections(content);
  validateContentQuality(content);
  
  printSummary();
  
  if (errors.length > 0) {
    log('Validation failed with errors.', colors.red);
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    log('Validation passed with warnings.', colors.yellow);
    process.exit(0);
  }
  
  log('✓ All validations passed!', colors.green);
  process.exit(0);
}

main();

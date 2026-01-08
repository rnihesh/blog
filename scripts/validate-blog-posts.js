#!/usr/bin/env node

/**
 * Validation script for content/*.md blog post files
 *
 * This script validates that blog post markdown files:
 * 1. Have valid YAML frontmatter
 * 2. Contain required fields: title, author, date, excerpt, tags
 * 3. Have proper structure (frontmatter followed by content)
 * 4. Follow the expected format
 */

const fs = require("fs");
const path = require("path");

// ANSI color codes for output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// Required frontmatter fields
const REQUIRED_FIELDS = ["title", "author", "date", "excerpt", "tags"];

let errors = [];
let warnings = [];
let passed = 0;
let filesChecked = 0;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  errors.push(message);
  log(`✖ ${message}`, colors.red);
}

function warn(message) {
  warnings.push(message);
  log(`! ${message}`, colors.yellow);
}

function success(message) {
  passed++;
  log(`✔ ${message}`, colors.green);
}

function info(message) {
  log(`• ${message}`, colors.blue);
}

function getMarkdownFiles() {
  const contentDir = path.join(process.cwd(), "content");

  if (!fs.existsSync(contentDir)) {
    error("Content directory does not exist");
    return [];
  }

  const files = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(contentDir, file));

  return files;
}

function parseFrontmatter(content) {
  // Trim any leading whitespace/newlines
  content = content.trimStart();

  // Check if content starts with ---
  if (!content.startsWith("---")) {
    return {
      error: "File does not start with frontmatter delimiter (---)",
      frontmatter: null,
      body: null,
    };
  }

  // Find the end of frontmatter
  const lines = content.split("\n");
  let frontmatterEndIndex = -1;

  // Start from line 1 (skip first ---) and find the closing ---
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      frontmatterEndIndex = i;
      break;
    }
  }

  if (frontmatterEndIndex === -1) {
    return {
      error: "Frontmatter closing delimiter (---) not found",
      frontmatter: null,
      body: null,
    };
  }

  // Extract frontmatter content (between the two ---)
  const frontmatterLines = lines.slice(1, frontmatterEndIndex);
  const frontmatterText = frontmatterLines.join("\n");

  // Extract body (after the closing ---)
  const bodyLines = lines.slice(frontmatterEndIndex + 1);
  const body = bodyLines.join("\n").trim();

  // Parse frontmatter as simple key-value pairs
  const frontmatter = {};
  for (const line of frontmatterLines) {
    // Match key: value or key: "value"
    const match = line.match(/^([a-zA-Z_-]+):\s*(.+)$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Handle arrays (tags)
      if (value.startsWith("[") && value.endsWith("]")) {
        // Simple array parsing
        value = value
          .slice(1, -1)
          .split(",")
          .map((v) => v.trim().replace(/['"]/g, ""));
      }

      frontmatter[key] = value;
    }
  }

  return { error: null, frontmatter, body };
}

function validateFile(filePath) {
  const fileName = path.basename(filePath);
  filesChecked++;

  info(`\nChecking: ${fileName}`);

  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    error(`  Failed to read file: ${err.message}`);
    return false;
  }

  if (content.trim().length === 0) {
    error(`  File is empty`);
    return false;
  }

  // Parse frontmatter
  const { error: parseError, frontmatter, body } = parseFrontmatter(content);

  if (parseError) {
    error(`  ${parseError}`);
    return false;
  }

  success(`  Frontmatter structure is valid`);

  // Check required fields
  const missingFields = [];
  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    error(`  Missing required fields: ${missingFields.join(", ")}`);
    return false;
  }

  success(`  All required fields present (${REQUIRED_FIELDS.join(", ")})`);

  // Validate field formats

  // Date format validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(frontmatter.date)) {
    error(
      `  Date format invalid. Expected YYYY-MM-DD, got: ${frontmatter.date}`,
    );
    return false;
  }
  success(`  Date format is valid (${frontmatter.date})`);

  // Tags should be an array
  if (Array.isArray(frontmatter.tags)) {
    if (frontmatter.tags.length === 0) {
      warn(`  No tags specified`);
    } else {
      success(`  Tags are valid (${frontmatter.tags.length} tag(s))`);
    }
  } else {
    error(`  Tags should be an array`);
    return false;
  }

  // Check that body exists
  if (!body || body.length === 0) {
    error(`  Blog post body is empty`);
    return false;
  }

  success(`  Blog post body exists (${body.length} characters)`);

  return true;
}

function printSummary() {
  console.log("\n" + "=".repeat(50));
  log(`${colors.bold}Validation Summary${colors.reset}`);
  console.log("=".repeat(50));

  log(`Files checked: ${filesChecked}`, colors.blue);
  log(`Passed: ${passed}`, colors.green);

  if (warnings.length > 0) {
    log(`Warnings: ${warnings.length}`, colors.yellow);
  }

  if (errors.length > 0) {
    log(`Errors: ${errors.length}`, colors.red);
  }

  console.log("=".repeat(50) + "\n");
}

function main() {
  log(`${colors.bold}Validating Blog Post Markdown Files${colors.reset}\n`);

  const files = getMarkdownFiles();

  if (files.length === 0) {
    error("No markdown files found in content/ directory");
    printSummary();
    process.exit(1);
  }

  log(`Found ${files.length} markdown file(s) in content/ directory\n`);

  let allValid = true;
  for (const file of files) {
    const isValid = validateFile(file);
    if (!isValid) {
      allValid = false;
    }
  }

  printSummary();

  if (!allValid || errors.length > 0) {
    log("Validation failed. Some files have errors.", colors.red);
    process.exit(1);
  }

  if (warnings.length > 0) {
    log("Validation passed with warnings.", colors.yellow);
  } else {
    log("✔ All blog posts are valid!", colors.green);
  }

  process.exit(0);
}

main();

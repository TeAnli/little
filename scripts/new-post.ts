// 创建新文章 --- 交互式输入标题、标签、摘要，自动生成 Markdown 文件
import { readline } from 'bun';
import * as fs from 'node:fs';
import * as path from 'node:path';

const POSTS_DIR = path.resolve(import.meta.dir, '..', 'app', 'backend', 'content', 'posts');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, '-')
    .replace(/^-|-$/g, '');
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function ask(prompt: string): Promise<string> {
  process.stdout.write(prompt + ' ');
  for await (const line of readline()) {
    return line.trim();
  }
  return '';
}

async function main() {
  console.log('\n  Create New Post\n');

  const title = await ask('Title:');
  if (!title) {
    console.log('Title is required. Aborted.');
    process.exit(1);
  }

  const tagsInput = await ask('Tags (comma separated):');
  const tags = tagsInput
    ? tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];

  const summary = await ask('Summary:');

  const slug = slugify(title);
  const date = today();

  const frontMatter = [
    '---',
    `title: "${title}"`,
    `date: "${date}"`,
    `tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]`,
    `slug: "${slug}"`,
    `summary: "${summary || title}"`,
    '---',
    '',
    'Write your content here...',
    '',
  ].join('\n');

  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(filePath, frontMatter, 'utf-8');

  console.log(`\n  Created: ${filePath}`);
  console.log(`  Slug:    ${slug}`);
  console.log(`  Date:    ${date}`);
}

main();

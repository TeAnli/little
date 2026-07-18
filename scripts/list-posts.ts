// 列出所有文章 --- 扫描 content/posts/ 目录，解析 YAML front matter，按日期排序
import * as fs from 'node:fs';
import * as path from 'node:path';

const POSTS_DIR = path.resolve(import.meta.dir, '..', 'app', 'backend', 'content', 'posts');

interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
}

function parseFM(text: string): Post | null {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('---', 3);
  if (end === -1) return null;

  const fm = text.slice(3, end);
  const result: Record<string, any> = {};

  const lines = fm.split('\n');
  let currentKey = '';
  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const val = keyMatch[2].trim();
      if (val.startsWith('[')) {
        result[currentKey] = JSON.parse(val.replace(/'/g, '"'));
      } else {
        result[currentKey] = val.replace(/^"|"$/g, '');
      }
    }
  }

  if (!result.title) return null;
  return {
    slug: result.slug || '',
    title: result.title,
    date: result.date || '',
    tags: result.tags || [],
    summary: result.summary || '',
  };
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('No posts directory found.');
    return;
  }

  const posts = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8');
      return parseFM(content);
    })
    .filter(Boolean) as Post[];

  posts.sort((a, b) => b.date.localeCompare(a.date));

  console.log(`\n  ${posts.length} posts\n`);

  for (const p of posts) {
    console.log(`  ${p.date}  ${p.title}`);
    console.log(`         ${p.slug}`);
    if (p.tags.length) console.log(`         [${p.tags.join(', ')}]`);
    console.log();
  }
}

main();

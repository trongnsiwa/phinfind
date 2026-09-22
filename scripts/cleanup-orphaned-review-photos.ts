import dotenv from 'dotenv';
import path from 'path';

import { createClient } from '@supabase/supabase-js';

import { extractStoragePath } from '../src/lib/supabase/storage';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function getAllReferencedReviewPaths(): Promise<Set<string>> {
  const referencedPaths = new Set<string>();
  const pageSize = 1000;
  let page = 0;

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('images')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch reviews from database: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const row of data) {
      if (Array.isArray(row.images)) {
        for (const url of row.images) {
          const extracted = extractStoragePath(url, 'shop-photos');
          if (extracted) {
            referencedPaths.add(extracted);
          }
        }
      }
    }

    if (data.length < pageSize) {
      break;
    }
    page++;
  }

  return referencedPaths;
}

async function listAllFiles(bucket: string, prefix: string): Promise<string[]> {
  const files: string[] = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      throw new Error(`Failed to list storage path "${prefix}": ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data) {
      if (item.name === '.emptyFolderPlaceholder') continue;

      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (!item.id) {
        const subFiles = await listAllFiles(bucket, itemPath);
        files.push(...subFiles);
      } else {
        files.push(itemPath);
      }
    }

    if (data.length < limit) {
      break;
    }
    offset += limit;
  }

  return files;
}

async function removeFiles(bucket: string, paths: string[]): Promise<number> {
  const chunkSize = 100;
  let deletedCount = 0;

  for (let i = 0; i < paths.length; i += chunkSize) {
    const chunk = paths.slice(i, i + chunkSize);
    const { data, error } = await supabaseAdmin.storage.from(bucket).remove(chunk);
    if (error) {
      console.error(`❌ Error removing chunk starting at index ${i}:`, error.message);
    } else if (data) {
      deletedCount += data.length;
    }
  }

  return deletedCount;
}

async function main() {
  const isDelete = process.argv.includes('--delete') && !process.argv.includes('--dry-run');

  console.log(`🔍 Scanning for orphaned review photos in "shop-photos/reviews/"...`);
  console.log(`⚙️ Mode: ${isDelete ? 'DELETE' : 'DRY-RUN (default)'}\n`);

  try {
    const [referencedPaths, storageFiles] = await Promise.all([
      getAllReferencedReviewPaths(),
      listAllFiles('shop-photos', 'reviews'),
    ]);

    console.log(`📦 Found ${storageFiles.length} file(s) in storage under "reviews/".`);
    console.log(`🔗 Found ${referencedPaths.size} unique review image(s) referenced in database.\n`);

    const orphaned = storageFiles.filter((filePath) => !referencedPaths.has(filePath));

    if (orphaned.length === 0) {
      console.log('✅ No orphaned review photos found! Storage is clean.');
      return;
    }

    console.log(`⚠️ Found ${orphaned.length} orphaned file(s):`);
    orphaned.forEach((file, idx) => {
      console.log(`  ${idx + 1}. ${file}`);
    });

    if (isDelete) {
      console.log(`\n🗑️ Deleting ${orphaned.length} orphaned file(s)...`);
      const deleted = await removeFiles('shop-photos', orphaned);
      console.log(`✅ Successfully deleted ${deleted} file(s).`);
    } else {
      console.log(`\nℹ️ Dry-run completed. No files were deleted. Pass --delete to perform actual deletion.`);
    }
  } catch (error: any) {
    console.error('❌ Script execution failed:', error.message || error);
    process.exit(1);
  }
}

main();

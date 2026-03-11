import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Attempt to read local changelog file for Netdisk project
    // Path: c:\Users\steel\my-terminal\baidu-pan-alist\src\data\changelog.json
    // Relative to this file: ../../../../../baidu-pan-alist/src/data/changelog.json
    const changelogPath = path.join(process.cwd(), '..', 'baidu-pan-alist', 'src', 'data', 'changelog.json');
    
    if (fs.existsSync(changelogPath)) {
      const data = fs.readFileSync(changelogPath, 'utf8');
      return NextResponse.json(JSON.parse(data));
    }
    
    return NextResponse.json({ error: 'Changelog file not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

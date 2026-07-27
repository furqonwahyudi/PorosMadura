const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'frontend', 'src', 'data', 'dummyArticles.ts');
const destPath = path.join(__dirname, 'backend', 'prisma', 'dummyArticles.ts');

if (fs.existsSync(srcPath)) {
  let content = fs.readFileSync(srcPath, 'utf8');
  // Hapus baris import tipe data frontend
  content = content.replace("import { Article } from '../types';", "");
  content = content.replace('import { Article } from "../types";', "");
  // Ubah anotasi tipe data ke any[]
  content = content.replace(": Article[]", ": any[]");
  
  fs.writeFileSync(destPath, content, 'utf8');
  console.log('Sukses menyalin dummyArticles ke backend/prisma/dummyArticles.ts');
} else {
  console.error('File sumber tidak ditemukan:', srcPath);
}

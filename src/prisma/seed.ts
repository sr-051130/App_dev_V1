import { PrismaClient } from '@prisma/client';
import * as XLSX from 'exceljs';
import path from 'path'; // ファイルパスを安全に解決するためにNode.jsのpathモジュールを使用

const prisma = new PrismaClient();

async function main() {
  console.log(`SEED処理を開始します...`);

  // 1. Excelファイルのパスを指定
  // __dirnameは現在のファイルがあるディレクトリを指すため、パスが環境に依存せず安全
  const excelFilePath = path.join(__dirname, 'initial_users.xlsx');
  console.log(`Excelファイルを読み込んでいます: ${excelFilePath}`);

  // 2. Excelファイルを読み込み、解析
  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[] = XLSX.utils.sheet_to_json(worksheet);

  console.log(`${data.length}件のデータが見つかりました。データベースに登録します...`);

  // 3. データをDBの形式に整形
  const usersToCreate = data.map(user => ({
    email: user.email,
    username: user.username,
    birth: user.birth ? new Date(user.birth) : null,
    password: 'default-password' // Excelにない必須項目などをここで設定
  }));

  // 4. データベースに一括登録
  // 既存のemailと重複するデータはスキップする
  const result = await prisma.user.createMany({
    data: usersToCreate,
    skipDuplicates: true,
  });

  console.log(`${result.count}件のユーザーが正常に作成されました。`);
  console.log(`SEED処理が完了しました。`);
}

main()
  .catch((e) => {
    console.error('SEED処理中にエラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
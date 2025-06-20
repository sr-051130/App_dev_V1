import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs'; // 'xlsx' の代わりに 'exceljs' をインポート
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log(`SEED処理を開始します...`);

  const excelFilePath = path.join(__dirname, 'initial_users.xlsx');
  console.log(`Excelファイルを読み込んでいます: ${excelFilePath}`);

  // exceljs を使ったファイルの読み込み
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelFilePath);
  const worksheet = workbook.getWorksheet(1); // 最初のシートを取得

  if (!worksheet) {
    throw new Error('Excelシートが見つかりません。');
  }

  const usersToCreate: any[] = [];
  // ヘッダー行を読み飛ばすために、2行目から処理を開始
  worksheet.eachRow((row, rowNumber) => {
    // 1行目はヘッダーなのでスキップ
    if (rowNumber === 1) return;

    // セルの値を取得 (A列が1, B列が2, ...)
    const email = row.getCell(1).value as string;
    const username = row.getCell(2).value as string;
    const birth = row.getCell(3).value as Date;

    // emailが空でない行のみ処理
    if (email) {
      usersToCreate.push({
        email: email,
        username: username,
        birth: birth ? new Date(birth) : null,
        password: 'default-password' // デフォルトパスワード
      });
    }
  });

  console.log(`${usersToCreate.length}件のデータが見つかりました。データベースに登録します...`);

  if (usersToCreate.length > 0) {
    const result = await prisma.user.createMany({
      data: usersToCreate,
      skipDuplicates: true,
    });
    console.log(`${result.count}件のユーザーが正常に作成されました。`);
  }

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
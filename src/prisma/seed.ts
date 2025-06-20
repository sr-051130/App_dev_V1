<<<<<<< HEAD
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
// 実際のアプリケーションでは、パスワードハッシュ化ライブラリをインポートします
// 例: import bcrypt from 'bcrypt';

// PrismaClientを初期化
const prisma = new PrismaClient();

async function main() {
  console.log(`🚀 Start seeding ...`);

  // 既存のユーザーデータをクリーンアップする場合（開発環境のみで推奨）
  // await prisma.user.deleteMany({});
  // console.log("🗑️ Cleared existing user data.");

  // シーディングするユーザーデータ
  const usersToSeed = [
    {
      email: 'alice@example.com',
      password: 'password123', // ⚠️ 実際にはハッシュ化する
      username: 'Alice Smith',
      year: 2020,
      class: 1,
      birth: new Date('2002-04-15'), // Null不可なので必ず日付を指定
    },
    {
      email: 'bob@example.com',
      password: 'securepassword', // ⚠️ 実際にはハッシュ化する
      username: 'Bob Johnson',
      year: 2021,
      class: 2,
      birth: new Date('2003-08-20'),
    },
    {
      email: 'charlie@example.com',
      password: 'anotherpassword', // ⚠️ 実際にはハッシュ化する
      username: 'Charlie Brown',
      year: 2020,
      class: 3,
      birth: new Date('2002-11-05'),
    },
  ];

  // 各ユーザーデータをデータベースに挿入または更新
  for (const userData of usersToSeed) {
    // ⚠️ パスワードをハッシュ化する処理をここに追加してください
    // 例: const hashedPassword = await bcrypt.hash(userData.password, 10);
    // userData.password = hashedPassword; // ハッシュ化されたパスワードで上書き

    const user = await prisma.user.upsert({
      where: { email: userData.email }, // emailで既存ユーザーを検索
      update: userData, // 既存ユーザーがいれば更新
      create: userData, // 既存ユーザーがいなければ新規作成
    });
    console.log(`✅ Upserted user with ID: ${user.id} and email: ${user.email}`);
  }

  console.log(`🎉 Seeding finished successfully.`);
}

// シーディングスクリプトの実行とエラーハンドリング
main()
  .catch(e => {
    console.error(`❌ Seeding failed:`, e);
    process.exit(1); // エラーでプロセスを終了
  })
  .finally(async () => {
    await prisma.$disconnect(); // データベース接続を閉じる
    console.log(`🔌 Disconnected from database.`);
=======
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
>>>>>>> d4e76764c1cbd0dfa7d7af47a0b9093e0bb25931
  });
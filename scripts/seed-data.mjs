import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { mysqlTable, int, varchar, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

// スキーマ定義
const members = mysqlTable("members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  generation: int("generation").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const seats = mysqlTable("seats", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  generation: int("generation").notNull(),
  tableNumber: varchar("tableNumber", { length: 10 }).notNull(),
  seatPosition: int("seatPosition").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// 名簿データ
const membersData = [
  { name: "荘　茗", generation: 27 },
  { name: "吉積夏帆", generation: 27 },
  { name: "嶋森　一司", generation: 27 },
  { name: "根岸佳希", generation: 27 },
  { name: "多田万寿美", generation: 27 },
  { name: "寺沢遥希", generation: 27 },
  { name: "平戸　涼太郎", generation: 27 },
  { name: "宮田駿", generation: 27 },
  { name: "高橋　柚衣", generation: 27 },
  { name: "草山祥枝", generation: 27 },
  { name: "東 一成", generation: 28 },
  { name: "若杉俊輔", generation: 28 },
  { name: "鈴木 涼馬", generation: 28 },
  { name: "波多野大知", generation: 28 },
  { name: "池田有紗", generation: 28 },
  { name: "駒 紗綾", generation: 28 },
  { name: "菅原諒馬", generation: 28 },
  { name: "伊東ひろや", generation: 28 },
  { name: "岡田　航", generation: 29 },
  { name: "加藤佑望", generation: 29 },
  { name: "大谷　海羽", generation: 29 },
  { name: "山田穂乃花", generation: 29 },
  { name: "富田　晴翔", generation: 30 },
  { name: "沢井 駿", generation: 30 },
  { name: "服部明日夏", generation: 30 },
  { name: "大硲　聖将", generation: 30 },
  { name: "鳴海 春香", generation: 30 },
  { name: "物部　真也", generation: 30 },
  { name: "松本　累", generation: 31 },
  { name: "恩田崚平", generation: 31 },
  { name: "池田彩夏", generation: 31 },
  { name: "宇多村桃子", generation: 31 },
  { name: "大谷 亮平", generation: 31 },
  { name: "斎藤千紘", generation: 31 },
  { name: "岡田　陸", generation: 31 },
  { name: "渡邉紫乃", generation: 31 },
  { name: "清野　紗更", generation: 31 },
  { name: "新田美優", generation: 31 },
  { name: "福田彩花", generation: 31 },
  { name: "田中美羽", generation: 31 },
  { name: "小保方彩里", generation: 31 },
  { name: "華井　杏菜", generation: 31 },
  { name: "木幡涼真", generation: 32 },
  { name: "徳泉雪音", generation: 32 },
  { name: "岩田彩", generation: 32 },
  { name: "加藤里彩", generation: 32 },
  { name: "柳本実玖", generation: 32 },
  { name: "荒井優奈", generation: 32 },
  { name: "詹　合翔", generation: 32 },
  { name: "髙橋翼", generation: 33 },
  { name: "南　里和", generation: 33 },
  { name: "山内美陽", generation: 33 },
  { name: "柏木 晴帆", generation: 33 },
  { name: "木下　未久実", generation: 33 },
  { name: "渡邉篤", generation: 33 },
  { name: "世耕洸樹", generation: 33 },
  { name: "芦川真隆", generation: 33 },
  { name: "森田瑞央", generation: 33 },
  { name: "村下舞衣", generation: 33 },
  { name: "清透馬", generation: 33 },
  { name: "鶴岡茉紘", generation: 33 },
  { name: "小野 凜太郎", generation: 33 },
  { name: "鈴木直紀", generation: 33 },
  { name: "石津周都", generation: 33 },
  { name: "井上遥香", generation: 33 },
  { name: "平野恵樹", generation: 33 },
  { name: "中山拓樹", generation: 33 },
  { name: "小豆彩巴", generation: 33 },
  { name: "新納愛菜", generation: 33 },
  { name: "張宸瑜", generation: 34 },
  { name: "山中瞭", generation: 34 },
  { name: "松井柚里香", generation: 34 },
  { name: "伊藤遥香", generation: 34 },
  { name: "鈴木泰理", generation: 34 },
  { name: "谷川優奈", generation: 34 },
  { name: "成田陽向子", generation: 34 },
  { name: "井澤菜々美", generation: 34 },
  { name: "坂本頼星", generation: 34 },
  { name: "岡村　洋介", generation: 34 },
  { name: "小笠原由華", generation: 34 },
  { name: "清水彩音", generation: 34 },
  { name: "海老名里来", generation: 34 },
  { name: "井手 大樹", generation: 34 },
  { name: "紀伊龍二", generation: 34 },
  { name: "富田佳奈", generation: 35 },
  { name: "齋藤希光", generation: 35 },
  { name: "細渕花夏", generation: 35 },
  { name: "松村　真之介", generation: 35 },
  { name: "和久井理那", generation: 35 },
  { name: "鄭文瑄", generation: 35 },
  { name: "大塚彩月", generation: 35 },
  { name: "中村瞳", generation: 35 },
  { name: "山崎愛菜", generation: 35 },
  { name: "森田 結奈", generation: 35 },
  { name: "岡莉子", generation: 35 },
  { name: "丸橋怜央", generation: 35 },
  { name: "小奈佳怜", generation: 35 },
  { name: "外尾春菜", generation: 35 },
  { name: "豊永茉由", generation: 35 },
  { name: "松原理輝", generation: 35 },
  { name: "中本有亮", generation: 35 },
  { name: "平井優衣", generation: 35 },
  { name: "三輪柊介", generation: 36 },
  { name: "金山英斗", generation: 36 },
  { name: "山香　実輝", generation: 36 },
  { name: "中岫奏希", generation: 36 },
  { name: "加納汐梨", generation: 36 },
  { name: "森丈流", generation: 36 },
  { name: "近藤智之", generation: 36 },
  { name: "前田理子", generation: 36 },
  { name: "小池莉々夏", generation: 36 },
  { name: "ブランチ瑠唯", generation: 36 },
  { name: "萩原和子", generation: 36 },
  { name: "木村健斗", generation: 36 },
  { name: "安村拓馬", generation: 36 },
  { name: "小笠原正義", generation: 36 },
  { name: "武田正太朗", generation: 36 },
];

// 座席表データ
const seatsData = [
  // 卓1
  { name: "荘茗", generation: 27, tableNumber: "1", seatPosition: 1 },
  { name: "吉積夏帆", generation: 27, tableNumber: "1", seatPosition: 2 },
  { name: "嶋森一司", generation: 27, tableNumber: "1", seatPosition: 3 },
  { name: "根岸佳希", generation: 27, tableNumber: "1", seatPosition: 4 },
  { name: "多田万寿美", generation: 27, tableNumber: "1", seatPosition: 5 },
  // 卓2
  { name: "寺沢遥希", generation: 27, tableNumber: "2", seatPosition: 1 },
  { name: "平戸涼太郎", generation: 27, tableNumber: "2", seatPosition: 2 },
  { name: "宮田駿", generation: 27, tableNumber: "2", seatPosition: 3 },
  { name: "高橋柚衣", generation: 27, tableNumber: "2", seatPosition: 4 },
  { name: "草山祥枝", generation: 27, tableNumber: "2", seatPosition: 5 },
  // 卓3
  { name: "東一成", generation: 28, tableNumber: "3", seatPosition: 1 },
  { name: "若杉俊輔", generation: 28, tableNumber: "3", seatPosition: 2 },
  { name: "鈴木涼馬", generation: 28, tableNumber: "3", seatPosition: 3 },
  { name: "波多野大知", generation: 28, tableNumber: "3", seatPosition: 4 },
  { name: "池田有紗", generation: 28, tableNumber: "3", seatPosition: 5 },
  { name: "菅原諒馬", generation: 28, tableNumber: "3", seatPosition: 6 },
  { name: "伊東ひろや", generation: 28, tableNumber: "3", seatPosition: 7 },
  // 卓4
  { name: "岡田航", generation: 29, tableNumber: "4", seatPosition: 1 },
  { name: "加藤佑望", generation: 29, tableNumber: "4", seatPosition: 2 },
  { name: "大谷海羽", generation: 29, tableNumber: "4", seatPosition: 3 },
  { name: "山田穂乃花", generation: 29, tableNumber: "4", seatPosition: 4 },
  { name: "森田結奈", generation: 35, tableNumber: "4", seatPosition: 5 },
  { name: "齋藤希光", generation: 35, tableNumber: "4", seatPosition: 6 },
  { name: "細渕花夏", generation: 35, tableNumber: "4", seatPosition: 7 },
  { name: "山崎愛菜", generation: 35, tableNumber: "4", seatPosition: 8 },
  { name: "中村瞳", generation: 35, tableNumber: "4", seatPosition: 9 },
  // 卓5
  { name: "富田晴翔", generation: 30, tableNumber: "5", seatPosition: 1 },
  { name: "沢井駿", generation: 30, tableNumber: "5", seatPosition: 2 },
  { name: "服部明日夏", generation: 30, tableNumber: "5", seatPosition: 3 },
  { name: "大硲聖将", generation: 30, tableNumber: "5", seatPosition: 4 },
  { name: "鳴海春香", generation: 30, tableNumber: "5", seatPosition: 5 },
  { name: "物部真也", generation: 30, tableNumber: "5", seatPosition: 6 },
  { name: "外尾春菜", generation: 35, tableNumber: "5", seatPosition: 7 },
  { name: "豊永茉由", generation: 35, tableNumber: "5", seatPosition: 8 },
  { name: "富田佳奈", generation: 35, tableNumber: "5", seatPosition: 9 },
  // 卓6
  { name: "松本累", generation: 31, tableNumber: "6", seatPosition: 1 },
  { name: "恩田崚平", generation: 31, tableNumber: "6", seatPosition: 2 },
  { name: "池田彩夏", generation: 31, tableNumber: "6", seatPosition: 3 },
  { name: "宇多村桃子", generation: 31, tableNumber: "6", seatPosition: 4 },
  { name: "大谷亮平", generation: 31, tableNumber: "6", seatPosition: 5 },
  { name: "斎藤千紘", generation: 31, tableNumber: "6", seatPosition: 6 },
  { name: "岡田陸", generation: 31, tableNumber: "6", seatPosition: 7 },
  { name: "華井杏菜", generation: 31, tableNumber: "6", seatPosition: 8 },
  { name: "小保方彩里", generation: 31, tableNumber: "6", seatPosition: 9 },
  // 卓7
  { name: "渡邉紫乃", generation: 31, tableNumber: "7", seatPosition: 1 },
  { name: "清野紗更", generation: 31, tableNumber: "7", seatPosition: 2 },
  { name: "新田美優", generation: 31, tableNumber: "7", seatPosition: 3 },
  { name: "福田彩花", generation: 31, tableNumber: "7", seatPosition: 4 },
  { name: "田中美羽", generation: 31, tableNumber: "7", seatPosition: 5 },
  { name: "松原理輝", generation: 35, tableNumber: "7", seatPosition: 6 },
  { name: "中本有亮", generation: 35, tableNumber: "7", seatPosition: 7 },
  { name: "平井優衣", generation: 35, tableNumber: "7", seatPosition: 8 },
  // 卓8
  { name: "木幡涼真", generation: 32, tableNumber: "8", seatPosition: 1 },
  { name: "徳泉雪音", generation: 32, tableNumber: "8", seatPosition: 2 },
  { name: "岩田彩", generation: 32, tableNumber: "8", seatPosition: 3 },
  { name: "加藤里彩", generation: 32, tableNumber: "8", seatPosition: 4 },
  { name: "柳本実玖", generation: 32, tableNumber: "8", seatPosition: 5 },
  { name: "荒井優奈", generation: 32, tableNumber: "8", seatPosition: 6 },
  { name: "詹合翔", generation: 32, tableNumber: "8", seatPosition: 7 },
  { name: "小笠原正義", generation: 36, tableNumber: "8", seatPosition: 8 },
  { name: "武田正太朗", generation: 36, tableNumber: "8", seatPosition: 9 },
  { name: "近藤智之", generation: 36, tableNumber: "8", seatPosition: 10 },
  // 卓9
  { name: "髙橋翼", generation: 33, tableNumber: "9", seatPosition: 1 },
  { name: "南里和", generation: 33, tableNumber: "9", seatPosition: 2 },
  { name: "山内美陽", generation: 33, tableNumber: "9", seatPosition: 3 },
  { name: "柏木晴帆", generation: 33, tableNumber: "9", seatPosition: 4 },
  { name: "木下未久実", generation: 33, tableNumber: "9", seatPosition: 5 },
  { name: "渡邉篤", generation: 33, tableNumber: "9", seatPosition: 6 },
  { name: "三輪柊介", generation: 36, tableNumber: "9", seatPosition: 7 },
  { name: "小笠原由華", generation: 34, tableNumber: "9", seatPosition: 8 },
  { name: "紀伊龍二", generation: 34, tableNumber: "9", seatPosition: 9 },
  // 卓10
  { name: "芦川真隆", generation: 33, tableNumber: "10", seatPosition: 1 },
  { name: "森田瑞央", generation: 33, tableNumber: "10", seatPosition: 2 },
  { name: "村下舞衣", generation: 33, tableNumber: "10", seatPosition: 3 },
  { name: "清透馬", generation: 33, tableNumber: "10", seatPosition: 4 },
  { name: "金山英斗", generation: 36, tableNumber: "10", seatPosition: 5 },
  { name: "山香実輝", generation: 36, tableNumber: "10", seatPosition: 6 },
  { name: "伊藤遥香", generation: 34, tableNumber: "10", seatPosition: 7 },
  { name: "山中瞭", generation: 34, tableNumber: "10", seatPosition: 8 },
  { name: "井手大樹", generation: 34, tableNumber: "10", seatPosition: 9 },
  // 卓11
  { name: "鶴岡茉紘", generation: 33, tableNumber: "11", seatPosition: 1 },
  { name: "小野凜太郎", generation: 33, tableNumber: "11", seatPosition: 2 },
  { name: "鈴木直紀", generation: 33, tableNumber: "11", seatPosition: 3 },
  { name: "石津周都", generation: 33, tableNumber: "11", seatPosition: 4 },
  { name: "井上遥香", generation: 33, tableNumber: "11", seatPosition: 5 },
  { name: "中岫奏希", generation: 36, tableNumber: "11", seatPosition: 6 },
  { name: "加納汐梨", generation: 36, tableNumber: "11", seatPosition: 7 },
  { name: "鈴木泰理", generation: 34, tableNumber: "11", seatPosition: 8 },
  { name: "谷川優奈", generation: 34, tableNumber: "11", seatPosition: 9 },
  { name: "井澤菜々美", generation: 34, tableNumber: "11", seatPosition: 10 },
  { name: "松井柚里香", generation: 34, tableNumber: "11", seatPosition: 11 },
  // 卓12
  { name: "中山拓樹", generation: 33, tableNumber: "12", seatPosition: 1 },
  { name: "小豆彩巴", generation: 33, tableNumber: "12", seatPosition: 2 },
  { name: "新納愛菜", generation: 33, tableNumber: "12", seatPosition: 3 },
  { name: "平野恵樹", generation: 33, tableNumber: "12", seatPosition: 4 },
  { name: "世耕洸樹", generation: 33, tableNumber: "12", seatPosition: 5 },
  { name: "ブランチ瑠唯", generation: 36, tableNumber: "12", seatPosition: 6 },
  { name: "萩原和子", generation: 36, tableNumber: "12", seatPosition: 7 },
  { name: "清水彩音", generation: 34, tableNumber: "12", seatPosition: 8 },
  { name: "坂本頼星", generation: 34, tableNumber: "12", seatPosition: 9 },
  { name: "海老名里来", generation: 34, tableNumber: "12", seatPosition: 10 },
  // 自由席
  { name: "成田陽向子", generation: 34, tableNumber: "自由", seatPosition: 1 },
  { name: "岡村洋介", generation: 34, tableNumber: "自由", seatPosition: 2 },
  { name: "張宸瑜", generation: 34, tableNumber: "自由", seatPosition: 3 },
  { name: "駒紗綾", generation: 28, tableNumber: "4", seatPosition: 6 },
];

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    console.log("Seeding members...");
    await db.insert(members).values(membersData);
    console.log(`✓ Inserted ${membersData.length} members`);

    console.log("Seeding seats...");
    await db.insert(seats).values(seatsData);
    console.log(`✓ Inserted ${seatsData.length} seats`);

    console.log("\n✓ Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed();

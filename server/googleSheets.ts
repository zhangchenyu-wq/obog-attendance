import { ENV } from "./_core/env";

const SPREADSHEET_ID = "1IUWy4R2qBPpFASfc8qubjFZAQ-SmtIPQkX4PZU4eYNI";
const SHEET_ID = "1970069080";
const BASE_ROW = 2; // データは2行目から開始

/**
 * Googleスプレッドシートに出席情報を記入
 * @param name - 出席者の名前
 * @param generation - 期
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function syncAttendanceToSheet(
  name: string,
  generation: number
): Promise<boolean> {
  try {
    // スプレッドシートから全データを取得
    const sheetData = await getSheetData();
    if (!sheetData) {
      console.error("[GoogleSheets] Failed to fetch sheet data");
      return false;
    }

    // 名前と期に一致する行を探す
    const rowIndex = sheetData.findIndex(
      (row) => row[0]?.toString().trim() === name.trim() && 
               parseInt(row[1]?.toString() || "0") === generation
    );

    if (rowIndex === -1) {
      console.warn(`[GoogleSheets] Member not found: ${name} (${generation}期)`);
      return false;
    }

    // 実際のシート行番号（0ベースのインデックス + ヘッダー行 + BASE_ROW）
    const actualRow = rowIndex + BASE_ROW;

    // C列（3列目）に「出席」と記入
    const range = `'Sheet1'!C${actualRow}`;
    const success = await updateSheetCell(range, "出席");

    if (success) {
      console.log(`[GoogleSheets] Updated attendance for ${name} (${generation}期) at row ${actualRow}`);
    }

    return success;
  } catch (error) {
    console.error("[GoogleSheets] Error syncing attendance:", error);
    return false;
  }
}

/**
 * スプレッドシートから全データを取得
 */
async function getSheetData(): Promise<any[][] | null> {
  try {
    const response = await fetch(
      `${ENV.forgeApiUrl}/data_api/v1/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A:C`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ENV.forgeApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`[GoogleSheets] Failed to fetch data: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error("[GoogleSheets] Error fetching sheet data:", error);
    return null;
  }
}

/**
 * スプレッドシートのセルを更新
 */
async function updateSheetCell(range: string, value: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${ENV.forgeApiUrl}/data_api/v1/spreadsheets/${SPREADSHEET_ID}/values/${range}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${ENV.forgeApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [[value]],
        }),
      }
    );

    if (!response.ok) {
      console.error(`[GoogleSheets] Failed to update cell: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[GoogleSheets] Error updating sheet cell:", error);
    return false;
  }
}

/**
 * 名前と期からスプレッドシート内の行番号を検索
 */
export async function findMemberRowInSheet(
  name: string,
  generation: number
): Promise<number | null> {
  try {
    const sheetData = await getSheetData();
    if (!sheetData) return null;

    const rowIndex = sheetData.findIndex(
      (row) => row[0]?.toString().trim() === name.trim() && 
               parseInt(row[1]?.toString() || "0") === generation
    );

    return rowIndex !== -1 ? rowIndex + BASE_ROW : null;
  } catch (error) {
    console.error("[GoogleSheets] Error finding member row:", error);
    return null;
  }
}

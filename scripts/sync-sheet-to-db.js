/**
 * Google Apps Script — 구글시트 → DB 동기화
 *
 * Apps Script에서 JDBC를 사용하여 구글시트 데이터를 MySQL/PostgreSQL로 동기화합니다.
 * 이 스크립트를 google-apps-script.js 와 같은 Apps Script 프로젝트에 추가하세요.
 *
 * ===== 설정 =====
 * 1. Apps Script에서 [서비스 추가] → JDBC 활성화 (기본 포함)
 * 2. DB_* 상수를 본인의 DB 정보로 변경
 * 3. 트리거 설정: [트리거 추가] → syncSheetToDB → 시간 기반 → 매 1시간
 */

// ===== DB 접속 정보 (본인 환경에 맞게 수정) =====
const DB_HOST = 'your-db-host.com';
const DB_PORT = '3306';
const DB_NAME = 'solar_editorial';
const DB_USER = 'your_username';
const DB_PASSWORD = 'your_password';
const DB_URL = `jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=true&characterEncoding=utf8mb4`;

/**
 * 구글시트 전체 데이터를 DB에 동기화 (UPSERT)
 * 트리거로 주기적 실행 권장 (매 1시간)
 */
function syncSheetToDB() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    Logger.log('시트를 찾을 수 없습니다: ' + SHEET_NAME);
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    Logger.log('동기화할 데이터가 없습니다.');
    return;
  }

  // 헤더 제외, 2행부터 읽기
  const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();

  let conn;
  try {
    conn = Jdbc.getConnection(DB_URL, DB_USER, DB_PASSWORD);

    const sql = `
      INSERT INTO consultation_requests
        (timestamp, name, phone, region, building_type, monthly_bill, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        region = VALUES(region),
        building_type = VALUES(building_type),
        monthly_bill = VALUES(monthly_bill),
        message = VALUES(message),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
    `;

    const stmt = conn.prepareStatement(sql);
    let syncCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const [timestamp, name, phone, region, buildingType, monthlyBill, message, status] = row;

      // 빈 행 건너뛰기
      if (!name || !phone) continue;

      // 타임스탬프 변환
      let tsValue;
      if (timestamp instanceof Date) {
        tsValue = Utilities.formatDate(timestamp, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
      } else {
        tsValue = timestamp.toString();
      }

      stmt.setString(1, tsValue);
      stmt.setString(2, name.toString());
      stmt.setString(3, phone.toString());
      stmt.setString(4, region.toString());
      stmt.setString(5, buildingType.toString());
      stmt.setString(6, (monthlyBill || '-').toString());
      stmt.setString(7, (message || '-').toString());
      stmt.setString(8, (status || '신규').toString());

      stmt.addBatch();
      syncCount++;
    }

    if (syncCount > 0) {
      stmt.executeBatch();
      Logger.log(`동기화 완료: ${syncCount}건`);
    } else {
      Logger.log('동기화할 유효 데이터가 없습니다.');
    }

    stmt.close();

  } catch (error) {
    Logger.log('DB 동기화 오류: ' + error.toString());
  } finally {
    if (conn) conn.close();
  }
}


/**
 * DB → 구글시트 역동기화 (DB에서 상태 변경된 건을 시트에 반영)
 * 관리자가 DB/CRM에서 상태를 변경한 경우 시트에도 반영
 */
function syncDBToSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) return;

  let conn;
  try {
    conn = Jdbc.getConnection(DB_URL, DB_USER, DB_PASSWORD);

    // 최근 24시간 내 상태 변경된 건 조회
    const sql = `
      SELECT cr.phone, cr.status, cr.updated_at
      FROM consultation_requests cr
      WHERE cr.updated_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND cr.updated_at > cr.created_at
      ORDER BY cr.updated_at DESC
    `;

    const stmt = conn.createStatement();
    const rs = stmt.executeQuery(sql);

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;

    // 시트의 연락처(C열) 기준으로 매칭
    const phoneCol = sheet.getRange(2, 3, lastRow - 1, 1).getValues(); // C열
    const statusCol = sheet.getRange(2, 8, lastRow - 1, 1);            // H열

    const phoneToRow = {};
    for (let i = 0; i < phoneCol.length; i++) {
      const phone = phoneCol[i][0].toString().trim();
      if (phone) {
        phoneToRow[phone] = i + 2; // 시트 행 번호 (2부터 시작)
      }
    }

    let updateCount = 0;
    while (rs.next()) {
      const phone = rs.getString('phone');
      const newStatus = rs.getString('status');
      const sheetRow = phoneToRow[phone];

      if (sheetRow) {
        sheet.getRange(sheetRow, 8).setValue(newStatus);
        updateCount++;
      }
    }

    rs.close();
    stmt.close();
    Logger.log(`역동기화 완료: ${updateCount}건 상태 업데이트`);

  } catch (error) {
    Logger.log('역동기화 오류: ' + error.toString());
  } finally {
    if (conn) conn.close();
  }
}


/**
 * 동기화 상태 체크 — 시트와 DB 행 수 비교
 */
function checkSyncStatus() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const sheetRows = sheet ? sheet.getLastRow() - 1 : 0; // 헤더 제외

  let dbRows = 0;
  let conn;
  try {
    conn = Jdbc.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    const stmt = conn.createStatement();
    const rs = stmt.executeQuery('SELECT COUNT(*) AS cnt FROM consultation_requests');
    if (rs.next()) {
      dbRows = rs.getInt('cnt');
    }
    rs.close();
    stmt.close();
  } catch (error) {
    Logger.log('DB 연결 실패: ' + error.toString());
  } finally {
    if (conn) conn.close();
  }

  const result = {
    sheetRows: sheetRows,
    dbRows: dbRows,
    inSync: sheetRows === dbRows,
    checkedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

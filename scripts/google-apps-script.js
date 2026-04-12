/**
 * Google Apps Script — Solar Editorial 상담 신청 데이터 수집
 *
 * ===== 설정 방법 =====
 * 1. Google Sheets에서 [확장 프로그램] → [Apps Script] 클릭
 * 2. 이 코드를 Code.gs에 붙여넣기
 * 3. SHEET_ID를 본인의 시트 ID로 변경 (URL에서 /d/ 와 /edit 사이 값)
 * 4. [배포] → [새 배포] → 유형: 웹 앱
 *    - 실행 주체: 나
 *    - 액세스 권한: 모든 사용자
 * 5. 배포 URL을 .env.local의 GOOGLE_SCRIPT_URL에 입력
 */

const SHEET_ID = '1bVX2D1UK3SOteW3kJ_KIwZr4ue7fXCsWjibu5hsXbc0';
const SHEET_NAME = '상담신청';

// ========================================
// 구글시트 헤더 (1행) — 반드시 이 순서로 세팅
// ========================================
// A: 타임스탬프
// B: 성함
// C: 연락처
// D: 설치희망주소
// E: 건물유형
// F: 월평균전기요금
// G: 문의내용
// H: 상담상태
// ========================================

/**
 * 시트 초기 세팅 — 최초 1회 실행
 * Apps Script 에디터에서 이 함수를 선택하고 ▶ 실행
 */
function setupSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // 헤더 세팅
  const headers = [
    '타임스탬프',
    '성함',
    '연락처',
    '설치희망주소',
    '건물유형',
    '월평균전기요금',
    '문의내용',
    '상담상태'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // 헤더 스타일
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#0c1324');
  headerRange.setFontColor('#4edea3');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // 열 너비 조정
  sheet.setColumnWidth(1, 160); // 타임스탬프
  sheet.setColumnWidth(2, 100); // 성함
  sheet.setColumnWidth(3, 140); // 연락처
  sheet.setColumnWidth(4, 250); // 설치희망주소
  sheet.setColumnWidth(5, 100); // 건물유형
  sheet.setColumnWidth(6, 140); // 월평균전기요금
  sheet.setColumnWidth(7, 300); // 문의내용
  sheet.setColumnWidth(8, 100); // 상담상태

  // 1행 고정
  sheet.setFrozenRows(1);

  // 상담상태 열에 데이터 유효성 검사 (드롭다운)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['신규', '상담중', '견적발송', '계약완료', '설치완료', '보류', '취소'])
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 8, 500, 1).setDataValidation(statusRule);

  Logger.log('시트 초기 세팅 완료: ' + SHEET_NAME);
}


/**
 * POST 요청 처리 — 랜딩페이지에서 호출
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      setupSheet();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    // 시트 헤더 순서에 맞춰 데이터 행 추가
    const row = [
      data.timestamp || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      data.name || '',
      data.phone || '',
      data.region || '',
      data.buildingType || '',
      data.monthlyBill || '-',
      data.message || '-',
      data.status || '신규',
    ];

    sheet.appendRow(row);

    // 새 행에 상담상태 드롭다운 적용
    const lastRow = sheet.getLastRow();
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['신규', '상담중', '견적발송', '계약완료', '설치완료', '보류', '취소'])
      .setAllowInvalid(false)
      .build();
    sheet.getRange(lastRow, 8).setDataValidation(statusRule);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * GET 요청 처리 — 테스트용
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Solar Editorial 상담 API 정상 작동 중',
      sheet: SHEET_NAME
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * 신규 상담 알림 이메일 발송 (선택)
 * 트리거 설정: [트리거] → [트리거 추가] → onFormSubmit → 스프레드시트에서 → 변경 시
 */
function sendNotificationEmail() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(lastRow, 1, 1, 8).getValues()[0];

  const ADMIN_EMAIL = 'your-email@example.com'; // ← 관리자 이메일로 변경

  const subject = `[Solar Editorial] 새 상담 신청 - ${data[1]}님`;
  const body = `
새로운 상담 신청이 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━
📅 접수일시: ${data[0]}
👤 성함: ${data[1]}
📞 연락처: ${data[2]}
📍 설치희망주소: ${data[3]}
🏠 건물유형: ${data[4]}
💰 월평균전기요금: ${data[5]}
💬 문의내용: ${data[6]}
━━━━━━━━━━━━━━━━━━━━

시트에서 확인: https://docs.google.com/spreadsheets/d/${SHEET_ID}
  `;

  MailApp.sendEmail(ADMIN_EMAIL, subject, body);
}

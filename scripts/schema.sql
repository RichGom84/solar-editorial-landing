-- ============================================
-- Solar Editorial — 상담 신청 DB 스키마
-- Google Sheets ↔ RDB 동기화용
-- ============================================

-- 1. 상담 신청 메인 테이블
-- 구글시트 헤더와 1:1 매핑
CREATE TABLE IF NOT EXISTS consultation_requests (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    timestamp       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP  COMMENT '타임스탬프 (시트 A열)',
    name            VARCHAR(50)     NOT NULL                           COMMENT '성함 (시트 B열)',
    phone           VARCHAR(20)     NOT NULL                           COMMENT '연락처 (시트 C열)',
    region          VARCHAR(200)    NOT NULL                           COMMENT '설치희망주소 (시트 D열)',
    building_type   VARCHAR(20)     NOT NULL                           COMMENT '건물유형 (시트 E열)',
    monthly_bill    VARCHAR(30)     DEFAULT '-'                        COMMENT '월평균전기요금 (시트 F열)',
    message         TEXT            DEFAULT NULL                       COMMENT '문의내용 (시트 G열)',
    status          VARCHAR(20)     NOT NULL DEFAULT '신규'            COMMENT '상담상태 (시트 H열)',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_created (created_at),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='랜딩페이지 상담 신청 데이터 (구글시트 동기화)';


-- 2. 상담상태 변경 이력 테이블
CREATE TABLE IF NOT EXISTS consultation_status_log (
    id                  BIGINT      AUTO_INCREMENT PRIMARY KEY,
    consultation_id     BIGINT      NOT NULL,
    prev_status         VARCHAR(20) DEFAULT NULL    COMMENT '이전 상태',
    new_status          VARCHAR(20) NOT NULL        COMMENT '변경 상태',
    changed_by          VARCHAR(50) DEFAULT 'system' COMMENT '변경자',
    changed_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (consultation_id) REFERENCES consultation_requests(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_consultation (consultation_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='상담 상태 변경 이력';


-- 3. 상태 변경 시 자동 이력 기록 트리거
DELIMITER $$
CREATE TRIGGER trg_consultation_status_change
AFTER UPDATE ON consultation_requests
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO consultation_status_log (consultation_id, prev_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
END$$
DELIMITER ;


-- ============================================
-- 구글시트 → DB 동기화용 쿼리 (Apps Script에서 사용)
-- ============================================

-- 신규 행 삽입 (시트에서 DB로)
-- INSERT INTO consultation_requests (timestamp, name, phone, region, building_type, monthly_bill, message, status)
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- 중복 방지 UPSERT (phone + timestamp 기준)
INSERT INTO consultation_requests
    (timestamp, name, phone, region, building_type, monthly_bill, message, status)
VALUES
    (:timestamp, :name, :phone, :region, :building_type, :monthly_bill, :message, :status)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    region = VALUES(region),
    building_type = VALUES(building_type),
    monthly_bill = VALUES(monthly_bill),
    message = VALUES(message),
    status = VALUES(status),
    updated_at = CURRENT_TIMESTAMP;


-- ============================================
-- 유용한 조회 쿼리
-- ============================================

-- 상담 현황 대시보드
SELECT
    status                              AS '상담상태',
    COUNT(*)                            AS '건수',
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS '비율(%)'
FROM consultation_requests
GROUP BY status
ORDER BY FIELD(status, '신규', '상담중', '견적발송', '계약완료', '설치완료', '보류', '취소');


-- 일별 신청 추이
SELECT
    DATE(created_at)    AS '날짜',
    COUNT(*)            AS '신청건수'
FROM consultation_requests
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC
LIMIT 30;


-- 건물유형별 통계
SELECT
    building_type       AS '건물유형',
    COUNT(*)            AS '건수',
    GROUP_CONCAT(DISTINCT monthly_bill ORDER BY monthly_bill) AS '전기요금분포'
FROM consultation_requests
GROUP BY building_type
ORDER BY COUNT(*) DESC;


-- 전환율 분석 (신규 → 계약완료)
SELECT
    DATE_FORMAT(created_at, '%Y-%m')                                AS '월',
    COUNT(*)                                                         AS '총신청',
    SUM(CASE WHEN status = '계약완료' THEN 1 ELSE 0 END)           AS '계약완료',
    ROUND(SUM(CASE WHEN status = '계약완료' THEN 1 ELSE 0 END)
          * 100.0 / COUNT(*), 1)                                     AS '전환율(%)'
FROM consultation_requests
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY 1 DESC;

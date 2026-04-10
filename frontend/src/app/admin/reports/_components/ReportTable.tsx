'use client';

import React, { useState, useCallback } from 'react';
import styles from './ReportTable.module.css';
import { InputField, Pagination, Checkbox } from '@/components/ui';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import PopoverMenu from '@/components/ui/PopoverMenu';
import { MoreIcon } from '@/components/icons';
import { useUIStore } from '@/store/useUIStore';

/* ──────────── 타입 정의 ──────────── */
type TabKey = 'POST' | 'USER' | 'EVENT' | 'REFUND';
type StatusFilter = 'ALL' | 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

interface ReportItem {
  id: number;
  targetType: string;
  targetId: number;
  reason: string;
  detail: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  adminAction: string | null;
  createdAt: string;
  resolvedAt: string | null;
  reporterNickname: string;
  reporterId: number;
  // 프론트 전용 추가 필드 (UI 표시용 더미)
  title?: string;
  authorName?: string;
  hostName?: string;
  schedule?: string;
  amount?: string;
  registeredAt?: string;
}

/* ──────────── 탭 설정 ──────────── */
const TABS: { key: TabKey; label: string }[] = [
  { key: 'POST', label: '게시글' },
  { key: 'USER', label: '사용자' },
  { key: 'EVENT', label: '프로그램' },
  { key: 'REFUND', label: '환불지연' },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'PENDING', label: '대기 중' },
  { key: 'IN_REVIEW', label: '검토 중' },
  { key: 'RESOLVED', label: '처리 완료' },
  { key: 'REJECTED', label: '반려' },
];

/* ──────────── 더미 데이터 ──────────── */
const DUMMY_POST: ReportItem[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  targetType: 'POST',
  targetId: i + 100,
  reason: '부적절한 내용',
  detail: '',
  status: 'PENDING' as const,
  adminAction: null,
  createdAt: '2026-03-29T10:00:00',
  resolvedAt: null,
  reporterNickname: '신고자',
  reporterId: 10,
  title: '게시물 제목 게시물 제목 게시물 제목 게시물 제목게시물 제목 게시물 제목 게시물...',
  authorName: '호스트 이름',
}));

const DUMMY_USER: ReportItem[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 20,
  targetType: 'USER',
  targetId: i + 200,
  reason: '스팸 활동',
  detail: '',
  status: 'RESOLVED' as const,
  adminAction: 'WARN',
  createdAt: '2026-03-29T10:54:00',
  resolvedAt: '2026-03-30T10:00:00',
  reporterNickname: '신고자',
  reporterId: 11,
  authorName: '사용자 이름',
}));

const DUMMY_EVENT: ReportItem[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 40,
  targetType: 'EVENT',
  targetId: i + 300,
  reason: '허위 정보',
  detail: '',
  status: 'PENDING' as const,
  adminAction: null,
  createdAt: '2026-03-29T10:00:00',
  resolvedAt: null,
  reporterNickname: '신고자',
  reporterId: 12,
  title: '강의 제목 강의 제목 강의 제목 강의 제목 강의 제목 강의...',
  hostName: '호스트 이름',
  schedule: '10:00 - 11:00',
}));

const DUMMY_REFUND: ReportItem[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 60,
  targetType: 'REFUND',
  targetId: i + 400,
  reason: '환불 지연',
  detail: '',
  status: 'PENDING' as const,
  adminAction: null,
  createdAt: '2026-03-29T10:00:00',
  resolvedAt: null,
  reporterNickname: '신고자',
  reporterId: 13,
  authorName: '사용자 이름',
  title: '강의 제목 강의 제목 강의 제목 강의 제목 강의 제...',
  amount: '₩80,000',
}));

const DUMMY_MAP: Record<TabKey, ReportItem[]> = {
  POST: DUMMY_POST,
  USER: DUMMY_USER,
  EVENT: DUMMY_EVENT,
  REFUND: DUMMY_REFUND,
};

/* ──────────── 상태 → Tag 매핑 ──────────── */
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PENDING':
      return <Tag variant="red">대기 중</Tag>;
    case 'IN_REVIEW':
      return <Tag variant="purple">검토 중</Tag>;
    case 'RESOLVED':
      return <Tag variant="green">처리 완료</Tag>;
    case 'REJECTED':
      return <Tag variant="gray">반려</Tag>;
    default:
      return <Tag variant="gray">{status}</Tag>;
  }
}

/* ──────────── 날짜 포맷 ──────────── */
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}\n${hh}:${mi}`;
}

/* ════════════ 메인 컴포넌트 ════════════ */
export default function ReportTable() {
  const [activeTab, setActiveTab] = useState<TabKey>('POST');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [showHidden, setShowHidden] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

  const { showToast } = useUIStore();

  /* ── 탭 전환 ── */
  const handleTabClick = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setOpenPopoverId(null);
    // TODO: API 호출 – adminReportAPI.getList({ targetType: tab, status: statusFilter, page: 0 })
  }, [statusFilter]);

  /* ── 상태 필터 전환 ── */
  const handleStatusFilter = useCallback((status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
    // TODO: API 호출
  }, []);

  /* ── 더보기 메뉴 액션 ── */
  const handlePopoverAction = useCallback((reportId: number, actionValue: string) => {
    setOpenPopoverId(null);

    // TODO: adminReportAPI.processReport(reportId, { action: actionValue, status: 'RESOLVED' })
    const actionLabels: Record<string, string> = {
      HIDE: '숨김 처리',
      DELETE: '삭제',
      REJECT: '반려',
      WARN: '경고',
    };

    const label = actionLabels[actionValue] || actionValue;
    showToast(`성공적으로 ${label} 처리되었습니다.`, 'success');
  }, [showToast]);

  /* ── 현재 데이터 (추후 API 연동 시 교체) ── */
  const data = DUMMY_MAP[activeTab];

  return (
    <div className={styles.container}>
      {/* ── 1) 탭 + 숨김 처리 체크박스 ── */}
      <div className={styles.tabRow}>
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
              onClick={() => handleTabClick(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.checkboxArea}>
          <Checkbox
            label="숨김 처리된 강의 보기"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
          />
        </div>
      </div>

      {/* ── 2) 검색바 + 상태 필터 버튼 ── */}
      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <InputField
            variant="search"
            placeholder="검색어를 입력하세요"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
        <div className={styles.statusButtons}>
          {STATUS_FILTERS.map((sf) => (
            <Button
              key={sf.key}
              variant={statusFilter === sf.key ? 'primary' : 'secondary'}
              size="medium"
              onClick={() => handleStatusFilter(sf.key)}
            >
              {sf.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── 3) 테이블 ── */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          {/* ── 헤더 ── */}
          <thead>
            <tr>
              {activeTab === 'POST' && (
                <>
                  <th className={styles.colTitle}>게시글 제목</th>
                  <th className={styles.colAuthor}>게시자</th>
                  <th className={styles.colDate}>게시일</th>
                  <th className={styles.colStatus}>상태</th>
                  <th className={styles.colMore}></th>
                </>
              )}
              {activeTab === 'USER' && (
                <>
                  <th className={styles.colStudent}>수강생</th>
                  <th className={styles.colDate}>등록일</th>
                  <th className={styles.colStatus}>상태</th>
                  <th className={styles.colMore}></th>
                </>
              )}
              {activeTab === 'EVENT' && (
                <>
                  <th className={styles.colTitle}>프로그램 제목</th>
                  <th className={styles.colAuthor}>호스트</th>
                  <th className={styles.colDate}>일정</th>
                  <th className={styles.colStatus}>상태</th>
                  <th className={styles.colMore}></th>
                </>
              )}
              {activeTab === 'REFUND' && (
                <>
                  <th className={styles.colStudent}>수강생</th>
                  <th className={styles.colTitle}>강의 제목</th>
                  <th className={styles.colAmount}>환불 금액</th>
                  <th className={styles.colStatus}>상태</th>
                  <th className={styles.colMore}></th>
                </>
              )}
            </tr>
          </thead>

          {/* ── 바디 ── */}
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                {/* ── 게시글 탭 ── */}
                {activeTab === 'POST' && (
                  <>
                    <td className={styles.colTitle}>
                      <span className={styles.ellipsis}>{item.title}</span>
                    </td>
                    <td className={styles.colAuthor}>{item.authorName}</td>
                    <td className={styles.colDate}>
                      <span className={styles.dateText}>{formatDate(item.createdAt)}</span>
                    </td>
                    <td className={styles.colStatus}>
                      <StatusBadge status={item.status} />
                    </td>
                  </>
                )}

                {/* ── 사용자 탭 ── */}
                {activeTab === 'USER' && (
                  <>
                    <td className={styles.colStudent}>
                      <div className={styles.userProfile}>
                        <div className={styles.avatar}></div>
                        <span className={styles.userName}>{item.authorName}</span>
                      </div>
                    </td>
                    <td className={styles.colDate}>
                      <span className={styles.dateText}>{formatDate(item.createdAt)}</span>
                    </td>
                    <td className={styles.colStatus}>
                      <StatusBadge status={item.status} />
                    </td>
                  </>
                )}

                {/* ── 프로그램 탭 ── */}
                {activeTab === 'EVENT' && (
                  <>
                    <td className={styles.colTitle}>
                      <span className={styles.ellipsis}>{item.title}</span>
                    </td>
                    <td className={styles.colAuthor}>{item.hostName}</td>
                    <td className={styles.colDate}>
                      <span className={styles.dateText}>
                        {formatDate(item.createdAt)}
                        {item.schedule ? `\n${item.schedule}` : ''}
                      </span>
                    </td>
                    <td className={styles.colStatus}>
                      <StatusBadge status={item.status} />
                    </td>
                  </>
                )}

                {/* ── 환불지연 탭 ── */}
                {activeTab === 'REFUND' && (
                  <>
                    <td className={styles.colStudent}>
                      <div className={styles.userProfile}>
                        <div className={styles.avatar}></div>
                        <span className={styles.userName}>{item.authorName}</span>
                      </div>
                    </td>
                    <td className={styles.colTitle}>
                      <span className={styles.ellipsis}>{item.title}</span>
                    </td>
                    <td className={styles.colAmount}>
                      <span className={styles.amountText}>{item.amount}</span>
                    </td>
                    <td className={styles.colStatus}>
                      <StatusBadge status={item.status} />
                    </td>
                  </>
                )}

                {/* ── 더보기(⋮) – 공통 ── */}
                <td className={styles.colMore}>
                  <div className={styles.moreWrapper}>
                    <button
                      className={styles.iconButton}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() =>
                        setOpenPopoverId(openPopoverId === item.id ? null : item.id)
                      }
                    >
                      <MoreIcon />
                    </button>
                    {openPopoverId === item.id && (
                      <PopoverMenu
                        items={[
                          { value: 'DELETE', label: '삭제' },
                          { value: 'REJECT', label: '반려' },
                          { value: 'WARN', label: '경고' },
                        ]}
                        onSelect={(value) => handlePopoverAction(item.id, value)}
                        onClose={() => setOpenPopoverId(null)}
                        width={120}
                        style={{ top: '100%', right: 0 }}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 4) 페이지네이션 ── */}
      <div className={styles.paginationArea}>
        <Pagination
          currentPage={currentPage}
          totalPages={23}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

'use client';

import React, { useState, useCallback } from 'react';
import styles from './ReportTable.module.css';
import { InputField, Pagination, Checkbox } from '@/components/ui';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import PopoverMenu from '@/components/ui/PopoverMenu';
import { MoreIcon } from '@/components/icons';
import { useUIStore } from '@/store/useUIStore';

import { adminReportAPI, AdminReportListItem } from '@/lib/admin-api';

/* ──────────── 타입 정의 ──────────── */
type TabKey = 'POST' | 'USER' | 'EVENT';
type StatusFilter = 'ALL' | 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

// API 데이터에 UI 필드를 보정하기 위한 타입
interface ReportItem extends AdminReportListItem {
  authorName?: string;
  title?: string;
  hostName?: string;
  schedule?: string;
  amount?: string;
}

/* ──────────── 탭 설정 ──────────── */
const TABS: { key: TabKey; label: string }[] = [
  { key: 'POST', label: '게시글' },
  { key: 'USER', label: '사용자' },
  { key: 'EVENT', label: '프로그램' },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'PENDING', label: '대기 중' },
  // { key: 'IN_REVIEW', label: '검토 중' }, // 백엔드 ReportStatus에는 PENDING, RESOLVED, REJECTED만 있음
  { key: 'RESOLVED', label: '처리 완료' },
  { key: 'REJECTED', label: '반려' },
];

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
  if (!dateStr) return '-';
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
  const [totalPages, setTotalPages] = useState(1);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useUIStore();


  /* ── 데이터 가져오기 ── */
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminReportAPI.getReports({
        targetType: activeTab,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        keyword: searchKeyword || undefined,
        page: currentPage - 1,
        size: 10,
      });

      if (response.success) {
        const { content, totalPages } = response.data;
        const mappedContent = content.map((item: any) => ({
          ...item,
          title: `[ID: ${item.targetId}] ${item.reason}`,
          hostName: item.reporterNickname, // 임시로 신고자 닉네임 표시
        }));
        setReports(mappedContent);
        setTotalPages(totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      showToast('신고 목록을 가져오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, statusFilter, searchKeyword, currentPage, showToast]);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /* ── 탭 전환 ── */
  const handleTabClick = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setOpenPopoverId(null);
  };

  /* ── 상태 필터 전환 ── */
  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  /* ── 더보기 메뉴 액션 ── */
  const handlePopoverAction = async (reportId: number, actionValue: string) => {
    setOpenPopoverId(null);

    try {
      // 액션이 DISMISS(반려)인 경우 상태를 REJECTED로, 그 외(DELETE, WARN 등)는 RESOLVED로 처리
      const status = actionValue === 'DISMISS' ? 'REJECTED' : 'RESOLVED';
      const response = await adminReportAPI.processReport(reportId, actionValue, status);
      
      if (response.success) {
        const actionLabels: Record<string, string> = {
          HIDE: '숨김 처리',
          DELETE: '삭제',
          DISMISS: '반려',
          WARN: '경고',
        };
        const label = actionLabels[actionValue] || actionValue;
        showToast(`성공적으로 ${label} 처리되었습니다.`, 'success');
        fetchReports(); // 목록 갱신
      }
    } catch (error) {
      console.error('Failed to process report:', error);
      showToast('처리에 실패했습니다.', 'error');
    }
  };

  /* ── 현재 데이터 ── */
  const data = reports;

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
                        <span className={styles.userName}>{item.reporterNickname}</span>
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
                          { value: 'DISMISS', label: '반려' },
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
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

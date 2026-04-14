'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './EventTable.module.css';
import { DeleteIcon, MoreIcon } from '@/components/icons';
import { Checkbox, Pagination, Tag, Toggle, InputField, PopoverMenu } from '@/components/ui';
import { adminEventAPI, adminCategoryAPI, AdminEventListItem } from '@/lib/admin-api';
import { useUIStore } from '@/store/useUIStore';
import ConfirmModal from '@/components/modal/ConfirmModal';

/** 어드민 표준 날짜 포맷 함수 */
function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}


export default function EventTable() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);

  // 팝오버 및 모달 상태
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, eventId: 0, title: '' });
  const [hideModal, setHideModal] = useState({ isOpen: false, eventId: 0 });

  const { showToast } = useUIStore();

  /* ── 디바운스 처리 ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(1); // 검색어 변경 시 페이지 초기화
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  /* ── 초기 데이터 가져오기 (카테고리 목록) ── */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminCategoryAPI.getList();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  /* ── 데이터 가져오기 ── */
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminEventAPI.getEvents({
        status: activeTab === 'ALL' ? undefined : activeTab,
        categoryId: selectedCategoryId || undefined,
        keyword: debouncedKeyword || undefined,
        isHidden: showHiddenOnly || undefined,
        page: currentPage - 1,
        size: 10,
      });

      if (response.success) {
        setEvents(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      showToast('강의 목록을 가져오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedCategoryId, debouncedKeyword, showHiddenOnly, currentPage, showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /* ── 액션 핸들러 ── */
  const handleToggleVisibility = async (id: number) => {
    try {
      const response = await adminEventAPI.toggleVisibility(id);
      if (response.success) {
        showToast('노출 상태가 변경되었습니다.', 'success');
        fetchEvents();
      }
    } catch (error) {
      showToast('상태 변경에 실패했습니다.', 'error');
    }
  };

  const handleDeleteClick = (event: AdminEventListItem) => {
    setDeleteModal({ isOpen: true, eventId: event.id, title: event.title });
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await adminEventAPI.deleteEvent(deleteModal.eventId);
      if (response.success) {
        showToast('강의가 삭제되었습니다.', 'success');
        setDeleteModal({ ...deleteModal, isOpen: false });
        fetchEvents();
      }
    } catch (error) {
      showToast('강의 삭제에 실패했습니다.', 'error');
    }
  };

  const handlePopoverSelect = (value: string, event: AdminEventListItem) => {
    if (value === 'delete') {
      handleDeleteClick(event);
    } else if (value === 'hide') {
      if (event.isHidden) {
        handleToggleVisibility(event.id); // 노출 전환은 바로 처리
      } else {
        setHideModal({ isOpen: true, eventId: event.id }); // 숨김 처리 시에만 모달
      }
    } else if (value === 'edit') {
      router.push(`/admin/events/${event.id}`);
    }
  };

  /* ── UI 매핑 데이터 ── */
  const tabs = [
    { key: 'ALL', label: '전체' },
    { key: 'READY', label: '게시 전' },
    { key: 'RECRUITING', label: '모집 중' },
    { key: 'CLOSED', label: '종료' },
  ];

  const getStatusTag = (displayStatus: string) => {
    switch (displayStatus) {
      case 'READY': return <Tag variant="gray">게시 전</Tag>;
      case 'RECRUITING': return <Tag variant="green">모집 중</Tag>;
      case 'CLOSED': return <Tag variant="red">종료</Tag>;
      default: return null;
    }
  };

  const router = useRouter();

  return (
    <div className={styles.tableWrapper}>
      {/* 1) 상단 탭 + 필터 */}
      <div className={styles.tabRow}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.checkboxArea}>
          <Checkbox
            label="숨김 처리된 강의 보기"
            checked={showHiddenOnly}
            onChange={(e) => {
              setShowHiddenOnly(e.target.checked);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* 2) 검색바 (공통 InputField 활용) */}
      <div className={styles.filterRow}>
        <div className={styles.searchArea}>
          <InputField
            variant="search"
            placeholder="강의 제목으로 검색하세요"
            className={styles.searchInput}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* 3) 카테고리 필터 영역 (검색바 아래로 이동) */}
      <div className={styles.categoryRow}>
        <div className={styles.categoryChips}>
          <button
            className={`${styles.chip} ${selectedCategoryId === null ? styles.activeChip : ''}`}
            onClick={() => { setSelectedCategoryId(null); setCurrentPage(1); }}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.chip} ${selectedCategoryId === cat.id ? styles.activeChip : ''}`}
              onClick={() => { setSelectedCategoryId(cat.id); setCurrentPage(1); }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3) 테이블 (어드민 표준 레이아웃) */}
      <div className={styles.container}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colTitle}>강의 제목</th>
              <th className={styles.colAttendees}>인원</th>
              <th className={styles.colDate}>개설일</th>
              <th className={styles.colStatus}>상태</th>
              <th className={styles.colVisibility}>노출</th>
              <th className={styles.colAction}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className={styles.loadingTd}>로딩 중...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyTd}>데이터가 없습니다.</td></tr>
            ) : (
              events.map((event) => (
                <tr 
                  key={event.id} 
                  onClick={() => router.push(`/admin/events/${event.id}`)}
                  className={styles.clickableRow}
                >
                    <td className={styles.colTitle}>
                      <span className={styles.eventTitleText}>
                        {event.title}
                      </span>
                    </td>
                    <td className={styles.colAttendees}>{event.currentAttendees}명</td>
                    <td className={styles.colDate}>
                      {formatDate(event.createdAt)}
                    </td>
                    <td className={styles.colStatus}>
                      {getStatusTag(event.displayStatus)}
                    </td>
                    <td className={styles.colVisibility} onClick={(e) => e.stopPropagation()}>
                      <Toggle
                        checked={!event.isHidden}
                        onChange={() => handleToggleVisibility(event.id)}
                      />
                    </td>
                    <td className={styles.colAction} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.actionGroup}>
                        <button className={styles.deleteBtn} onClick={() => handleDeleteClick(event)}>
                          <DeleteIcon />
                        </button>
                        <div className={styles.moreWrapper}>
                          <button
                            className={styles.iconButton}
                            onClick={() => setOpenPopoverId(openPopoverId === event.id ? null : event.id)}
                          >
                            <MoreIcon />
                          </button>
                          {openPopoverId === event.id && (
                            <PopoverMenu
                              items={[
                                { value: 'edit', label: '편집' },
                                { value: 'delete', label: '삭제' },
                              ]}
                              onSelect={(v) => handlePopoverSelect(v, event)}
                              onClose={() => setOpenPopoverId(null)}
                              width={120}
                              className={styles.popover}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4) 페이지네이션 */}
      <div className={styles.paginationArea}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="해당 강의를 삭제하시겠습니까?"
        subtitle="삭제된 강의 데이터는 복구할 수 없으며, 연결된 커리큘럼과 수강생 기록이 모두 소멸됩니다."
        status="danger"
        confirmText="삭제"
        cancelText="취소"
      />

      {/* 숨김 확인 모달 (CSS 변수 오버라이드로 레이아웃은 유지하되 버튼 색상만 변경) */}
      <div style={{ '--color-error': 'var(--color-primary)' } as React.CSSProperties}>
        <ConfirmModal
          isOpen={hideModal.isOpen}
          onClose={() => setHideModal({ ...hideModal, isOpen: false })}
          onConfirm={() => {
            handleToggleVisibility(hideModal.eventId);
            setHideModal({ ...hideModal, isOpen: false });
          }}
          title="해당 강의를 목록에서 숨기시겠습니까?"
          subtitle="숨김 처리 시 수강생 페이지에 노출되지 않으며, 언제든지 다시 노출할 수 있습니다."
          status="danger"
          confirmText="숨기기"
          cancelText="취소"
        />
      </div>
    </div>
  );
}

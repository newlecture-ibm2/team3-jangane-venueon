'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { Sidebar } from '@/components/layout';
import { Pagination } from '@/components/ui';
import ConfirmModal from '@/components/modal/ConfirmModal';
import EventFilter from './_components/EventFilter/EventFilter';
import { useAdminEvents } from './useAdminEvents';

// Hydration Mismatch 방지를 위해 Client Side 전용으로 로드
const EventTable = dynamic(() => import('./_components/EventTable/EventTable'), {
  ssr: false,
});

export default function AdminEventsPage() {
  const { state, actions } = useAdminEvents();

  return (
    <div className="container-sidebar">
      {/* 사이드바 */}
      <Sidebar role="admin" />

      {/* 우측 메인 콘텐츠 */}
      <section className="sidebar-content">
        <h1 className={styles.pageTitle}>강의 관리</h1>

        <EventFilter
          activeTab={state.activeTab}
          showHiddenOnly={state.showHiddenOnly}
          searchKeyword={state.searchKeyword}
          selectedCategoryId={state.selectedCategoryId}
          categories={state.categories}
          onTabChange={actions.setActiveTab}
          onHiddenOnlyChange={actions.setShowHiddenOnly}
          onSearchChange={actions.setSearchKeyword}
          onCategoryChange={actions.setSelectedCategoryId}
        />

        <div className={styles.tableSection}>
          <EventTable
            events={state.events}
            isLoading={state.isLoading}
            openPopoverId={state.openPopoverId}
            onToggleVisibility={actions.handleToggleVisibility}
            onDeleteClick={actions.handleDeleteClick}
            onPopoverSelect={actions.handlePopoverSelect}
            onPopoverToggle={actions.setOpenPopoverId}
          />
        </div>

        {/* 4) 페이지네이션 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <Pagination
            currentPage={state.currentPage}
            totalPages={state.totalPages}
            onPageChange={actions.setCurrentPage}
          />
        </div>
      </section>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={state.deleteModal.isOpen}
        onClose={() => actions.setDeleteModal({ ...state.deleteModal, isOpen: false })}
        onConfirm={actions.handleConfirmDelete}
        title="해당 강의를 삭제하시겠습니까?"
        subtitle="삭제된 강의 데이터는 복구할 수 없으며, 연결된 커리큘럼과 수강생 기록이 모두 소멸됩니다."
        status="danger"
        confirmText="삭제"
        cancelText="취소"
      />

      {/* 숨김 확인 모달 (CSS 변수 오버라이드로 레이아웃은 유지하되 버튼 색상만 변경) */}
      <div style={{ '--color-error': 'var(--color-primary)' } as React.CSSProperties}>
        <ConfirmModal
          isOpen={state.hideModal.isOpen}
          onClose={() => actions.setHideModal({ ...state.hideModal, isOpen: false })}
          onConfirm={() => {
            actions.handleToggleVisibility(state.hideModal.eventId);
            actions.setHideModal({ ...state.hideModal, isOpen: false });
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

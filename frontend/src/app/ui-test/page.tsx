'use client';

import React, { useState } from 'react';
import { Button, Checkbox, Toggle, Radio, SelectBox, Pagination, UserProfile, Logo, Tag, Card, CardGrid, Tabs, InputField, TextareaField, Dropdown, UploadField, CommentInput } from '@/components/ui';
import CommunityPostItem from '@/app/community/components/CommunityPostItem';
import CommunityCommentItem from '@/app/community/components/CommunityCommentItem';
import CommunityCard from '@/app/community/components/CommunityCard';
import { ConfirmModal, InputModal, UploadModal, PaymentModal, InquiryModal } from '@/components/modal';
import { useUIStore } from '@/store/useUIStore';

export default function UITestPage() {
  const { showToast } = useUIStore();

  const [checked, setChecked] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [radioVal, setRadioVal] = useState('option1');
  const [selectVal, setSelectVal] = useState('');
  const [dropdownVal, setDropdownVal] = useState('');
  const [activeLineTab, setActiveLineTab] = useState('menu1');
  const [activePillTab, setActivePillTab] = useState('tech');

  // 모달 상태 관리
  const [isConfirm1Open, setIsConfirm1Open] = useState(false);
  const [isConfirm2Open, setIsConfirm2Open] = useState(false);
  const [isConfirm3Open, setIsConfirm3Open] = useState(false);
  const [isInputUserOpen, setIsInputUserOpen] = useState(false);
  const [isInputAdminOpen, setIsInputAdminOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isInquiryUserOpen, setIsInquiryUserOpen] = useState(false);
  const [isInquiryHostOpen, setIsInquiryHostOpen] = useState(false);

  // Tailwind CSS가 없는 환경이므로 순수 인라인 스타일로 깔끔한 테스트 레이아웃 구성
  const containerStyle: React.CSSProperties = {
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'var(--font-sans)',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '40px',
    padding: '30px',
    backgroundColor: '#fff',
    border: '1px solid var(--color-text-gray-300)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-h2---bold)',
    fontWeight: 'bold',
    marginBottom: '24px',
    borderBottom: '2px solid var(--color-surface)',
    paddingBottom: '12px',
    color: 'var(--color-primary)'
  };

  const flexRow: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: 'var(--font-size-h1---bold)', fontWeight: 700, marginBottom: '40px', color: 'var(--color-primary)' }}>
        UI Component Design System
      </h1>

      {/* 1. Button */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>1. Button</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Primary:</strong>
            <Button variant="primary" size="large">Large 버튼</Button>
            <Button variant="primary" size="medium">Medium 버튼</Button>
            <Button variant="primary" size="large" disabled>Large 지연</Button>
            <Button variant="primary" size="medium" disabled>Medium 지연</Button>
          </div>
          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Secondary:</strong>
            <Button variant="secondary" size="large">Large 버튼</Button>
            <Button variant="secondary" size="medium">Medium 버튼</Button>
            <Button variant="secondary" size="large" disabled>Large 지연</Button>
            <Button variant="secondary" size="medium" disabled>Medium 지연</Button>
          </div>
          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Outlined:</strong>
            <Button variant="outlined" size="large">Large 버튼</Button>
            <Button variant="outlined" size="medium">Medium 버튼</Button>
            <Button variant="outlined" size="large" disabled>Large 지연</Button>
            <Button variant="outlined" size="medium" disabled>Medium 지연</Button>
          </div>
          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Danger:</strong>
            <Button variant="danger" size="large">Large 버튼</Button>
            <Button variant="danger" size="medium">Medium 버튼</Button>
            <Button variant="danger" size="large" disabled>Large 지연</Button>
            <Button variant="danger" size="medium" disabled>Medium 지연</Button>
          </div>
        </div>
      </div>

      {/* 2. Checkbox, Toggle, Radio */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>2. Form Controls</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Checkbox:</strong>
            <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'center' }}>
              <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <span>동의합니다</span>
            </label>
            <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'center', color: 'var(--color-text-gray-500)' }}>
              <Checkbox checked={true} readOnly disabled />
              <span>필수 동의 (Disabled)</span>
            </label>
          </div>

          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Radio:</strong>
            <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'center' }}>
              <Radio name="demoRadio" value="option1" checked={radioVal === 'option1'} onChange={(e) => setRadioVal(e.target.value)} />
            </label>
            <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'center' }}>
              <Radio name="demoRadio" value="option2" checked={radioVal === 'option2'} onChange={(e) => setRadioVal(e.target.value)} />
            </label>
            <label style={{ display: 'flex', gap: '8px', cursor: 'not-allowed', alignItems: 'center', color: 'var(--color-text-gray-500)' }}>
              <Radio name="demoRadio_disabled" checked={true} readOnly disabled />
              <span>선택 불가 (Disabled)</span>
            </label>
          </div>

          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Toggle:</strong>
            <label style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
              <Toggle checked={toggled} onChange={() => setToggled(!toggled)} />
              <span>{toggled ? '알림 켜짐' : '알림 꺼짐'}</span>
            </label>
          </div>

        </div>
      </div>

      {/* 3. SelectBox */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>3. SelectBox</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SelectBox
            name="payment"
            value="card"
            label="신용/체크카드"
            checked={selectVal === 'card'}
            onChange={(e) => setSelectVal(e.target.value)}
          />
          <SelectBox
            name="payment"
            value="bank"
            label="무통장입금"
            checked={selectVal === 'bank'}
            onChange={(e) => setSelectVal(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Pagination */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>4. Pagination</h2>
        <Pagination currentPage={2} totalPages={10} onPageChange={() => { }} />
      </div>

      {/* 5. UserProfile */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>5. UserProfile</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Large:</strong>
            <UserProfile name="장회원" size="large" />
            <UserProfile name="이미지유저" size="large" imageUrl="https://i.pravatar.cc/150?img=12" />
          </div>
          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Medium:</strong>
            <UserProfile name="댓글유저" size="medium" />
            <UserProfile name="이미지유저" size="medium" imageUrl="https://i.pravatar.cc/150?img=11" />
          </div>
        </div>
      </div>

      {/* 6. Logo */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>6. Logo</h2>
        <div style={{ padding: '20px', background: 'var(--color-surface)', display: 'inline-block', borderRadius: '8px' }}>
          <Logo />
        </div>
      </div>

      {/* 7. Tag (Badge) */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>7. Tag (Badge)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Red:</strong>
            <Tag variant="red">대기 중</Tag>
            <Tag variant="red">신고된 게시글</Tag>
            <Tag variant="red">승인 대기</Tag>
          </div>
          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Purple:</strong>
            <Tag variant="purple">검토 중</Tag>
            <Tag variant="purple">숨김 처리됨</Tag>
            <Tag variant="purple">환불 대기</Tag>
            <Tag variant="purple">진행 중</Tag>
          </div>
          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Green:</strong>
            <Tag variant="green">처리 완료</Tag>
            <Tag variant="green">모집 중</Tag>
            <Tag variant="green">승인 완료</Tag>
            <Tag variant="green">결제 완료</Tag>
          </div>
          <div style={flexRow}>
            <strong style={{ width: '100px' }}>Gray:</strong>
            <Tag variant="gray">게시 전</Tag>
            <Tag variant="gray">준비 중</Tag>
            <Tag variant="gray">종료</Tag>
            <Tag variant="gray">취소됨</Tag>
            <Tag variant="gray">환불 완료</Tag>
            <Tag variant="gray">반려</Tag>
          </div>
        </div>
      </div>



      {/* 8. Card & CardGrid */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>8. Card & CardGrid (Dashboard Layout / 2-Cols)</h2>
        <p style={{ marginBottom: '16px', color: '#6B7280' }}>마이페이지, 어드민 등 대시보드(상태 표시용) 공간에서 사용하는 2열 그리드입니다.</p>
        <CardGrid layout="2-cols">
          <Card
            status="모집 중"
            category="IT/프로그래밍"
            title="나만의 디자인 시스템으로 시작하는 프론트엔드 레벨업 가이드"
            organizer="UX/UI KOREA"
            dateTime="2026.04.15 (토) 14:00"
            location="강남역 TOZ 3호점"
            price={80000}
            actionButtonText="스터디룸 입장"
          />
          <Card
            status="종료"
            category="백엔드/DB"
            title="스프링 부트(Spring Boot) 백엔드 파이프라인 구축 세미나 - 심화편"
            organizer="Java Developer Group"
            dateTime="2026.03.11 (수) 19:00"
            location="온라인 (Zoom)"
            price={0}
            actionButtonText="스터디룸 입장"
          />
        </CardGrid>
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          <Pagination currentPage={1} totalPages={5} onPageChange={() => { }} />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={titleStyle}>9. Card & CardGrid (Landing Layout / 3-Cols)</h2>
        <p style={{ marginBottom: '16px', color: '#6B7280' }}>메인 홈, 이벤트 탐색 등 랜딩 페이지 공간에서 사용하는 3열 그리드입니다.</p>
        <CardGrid layout="3-cols">
          <Card
            variant="landing"
            status="게시 전"
            dDay={4}
            category="웹 개발"
            title="TypeScript 심화반: 고급 타입 시스템과 제네릭 마스터하기"
            organizer="토스 프론트엔드 팀"
            dateTime="2026.05.01 (금) 19:30"
            location="테헤란로 공유오피스"
            price={150000}
          />
          <Card
            variant="landing"
            status="진행 중"
            dDay="D-Day"
            category="UX/UI 디자인"
            title="Figma 완전 정복: 실무에서 쓰이는 컴포넌트 설계"
            organizer="디자인 스펙트럼"
            dateTime="2026.04.05 (수) 13:00"
            location="온라인 (Google Meet)"
            price={45000}
          />
          <Card
            variant="landing"
            status="준비 중"
            dDay="진행 중"
            category="AI/인공지능"
            title="2026 AI 트렌드 리포트: ChatGPT 이후의 세계"
            organizer="미래기술연구소"
            dateTime="2026.06.10 (수) 10:00"
            location="코엑스 오디토리움"
            price={0}
          />
        </CardGrid>
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          <Pagination currentPage={1} totalPages={10} onPageChange={() => { }} />
        </div>
      </div>

      {/* 10. Tabs */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>10. Tabs</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <p style={{ marginBottom: '16px', color: '#6B7280' }}>Line Variant (주로 대메뉴나 최상위 계층)</p>
            <Tabs
              variant="line"
              activeValue={activeLineTab}
              onChange={setActiveLineTab}
              options={[
                { value: 'menu1', label: '카테고리' },
                { value: 'menu2', label: '카테고리' },
                { value: 'menu3', label: '카테고리' },
                { value: 'menu4', label: '카테고리' },
              ]}
            />
          </div>

          <div>
            <p style={{ marginBottom: '16px', color: '#6B7280' }}>Pill Variant (주로 서브 필터나 보조 계층)</p>
            <Tabs
              variant="pill"
              activeValue={activePillTab}
              onChange={setActivePillTab}
              options={[
                { value: 'all', label: '전체' },
                { value: 'tech', label: '개발/IT' },
                { value: 'data', label: '데이터' },
                { value: 'design', label: '디자인' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 11. InputField */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>11. InputField (자동 레이아웃 팽창 방지)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '410px' }}>

          <InputField
            label="1. 일반 상태 (공간 미확보)"
            placeholder="제목을 입력하세요"
          />

          <InputField
            label="2. 에러가 날 수 있는 공간 (공간 사전 확보)"
            placeholder="제목을 입력하세요"
            reserveError={true}
          />

          <InputField
            label="3. 에러 발생 상태"
            placeholder="입력 중 오류가 난 상태"
            reserveError={true}
            error="에러 메세지는 여기에 나옵니다."
            defaultValue="잘못된 데이터"
          />

          <InputField
            label="4. 비활성화 상태"
            placeholder="수정 불가 상태입니다."
            disabled
          />

          <InputField
            variant="search"
            placeholder="검색어를 입력하세요"
          />

        </div>
      </div>

      {/* 12. TextareaField */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>12. TextareaField (긴 텍스트 입력)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '410px' }}>

          <TextareaField
            label="세션 소개"
            placeholder="세션에 대한 상세한 소개를 입력해주세요."
            showCount={true}
          />

        </div>
      </div>

      {/* 13. Dropdown */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>13. Dropdown (Select Menu)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '410px' }}>

          <Dropdown
            label="카테고리 선택"
            placeholder="옵션을 선택하세요."
            value={dropdownVal}
            onChange={setDropdownVal}
            options={[
              { value: 'opt1', label: '개발/IT' },
              { value: 'opt2', label: '디자인' },
              { value: 'opt3', label: '기획/경영' },
              { value: 'opt4', label: '마케팅' },
            ]}
          />

        </div>
      </div>

      {/* 14. UploadField */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>14. UploadField (파일 업로드)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '410px' }}>

          <UploadField
            label="사업자등록증명 업로드"
            accept="image/*,.pdf"
            onFileSelect={(file) => console.log('Selected file:', file.name)}
          />
        </div>
      </div>

      {/* 15. Modals */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>15. Modals (모달 창들)</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setIsConfirm1Open(true)}>1. 일반 모달</Button>
          <Button variant="primary" onClick={() => setIsConfirm2Open(true)}>1. 경고성 모달</Button>
          <Button variant="primary" onClick={() => setIsConfirm3Open(true)}>1. 체크 경고 모달</Button>
          <Button variant="outlined" onClick={() => setIsInputUserOpen(true)}>2. 입력 폼 모달 (User)</Button>
          <Button variant="outlined" onClick={() => setIsInputAdminOpen(true)}>2. 상세 내역 모달 (Admin)</Button>
          <Button variant="primary" onClick={() => setIsUploadOpen(true)}>3. 파일업로드 모달</Button>
          <Button variant="primary" onClick={() => setIsPaymentOpen(true)}>4. 결제 모달</Button>
          <Button variant="outlined" onClick={() => setIsInquiryUserOpen(true)}>5. 1:1 문의 (User)</Button>
          <Button variant="outlined" onClick={() => setIsInquiryHostOpen(true)}>5. 1:1 문의 (Host)</Button>
        </div>
      </div>

      {/* 16. Toast Messages */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>16. Toast Messages (토스트 알림)</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => showToast('저장이 완료되었습니다.', 'success', '성공적으로 데이터를 저장했습니다.')}>Success 토스트</Button>
          <Button variant="outlined" onClick={() => showToast('결제에 실패했습니다.', 'error', '잔액이 부족하거나 네트웍 오류입니다.')}>Fail 토스트</Button>
        </div>
      </div>

      {/* 17. Community Components */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>17. Community Components</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* CommunityCard */}
          <div>
            <p style={{ marginBottom: '12px', color: '#6B7280' }}>CommunityCard (커뮤니티 리스트 카드)</p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <CommunityCard
                postType="프로젝트 모집"
                timeAgo="방금 전"
                title="함께 사이드 프로젝트 완성할 프론트엔드 개발자 찾습니다 👀"
                keywords={['사이드프로젝트', '프론트엔드', '리액트', '주말코딩']}
              />
            </div>
          </div>

          {/* CommunityPostItem */}
          <div>
            <p style={{ marginBottom: '12px', color: '#6B7280' }}>CommunityPostItem (게시글 목록 아이템)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
              <CommunityPostItem
                title="이번 세미나 듣고 실무에 바로 적용해본 후기 + 궁금한 점"
                username="사용자 이름"
                date="2026.03.30 / 10:35"
                selected={true}
              />
              <CommunityPostItem
                title="이번 세미나 듣고 실무에 바로 적용해본 후기 + 궁금한 점"
                username="사용자 이름"
                date="2026.03.30 / 10:35"
                selected={false}
              />
              <CommunityPostItem
                title="프론트엔드 개발자가 알아야 할 디자인 시스템 구축 방법론과 실전 사례 공유"
                username="김디자인"
                date="2026.04.01 / 09:15"
                selected={false}
              />
            </div>
          </div>

          {/* CommentInput */}
          <div>
            <p style={{ marginBottom: '12px', color: '#6B7280' }}>CommentInput (댓글 입력)</p>
            <div style={{ maxWidth: '600px' }}>
              <CommentInput
                onSubmit={(value) => alert(`댓글 등록: ${value}`)}
              />
            </div>
          </div>

          {/* CommunityCommentItem */}
          <div>
            <p style={{ marginBottom: '12px', color: '#6B7280' }}>CommunityCommentItem (댓글 표시)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
              <CommunityCommentItem
                username="사용자 이름"
                date="2026.03.30 / 10:35"
                content="저도 프롬프트 지니 쓰다가 최근에는 클로드로 넘어왔는데, 마케팅 문구는 클로드가 훨씬 자연스러운 것 같아요!"
                menuItems={[
                  { value: 'edit', label: '수정하기' },
                  { value: 'delete', label: '삭제하기' },
                  { value: 'report', label: '신고하기' },
                ]}
                onMenuSelect={(v) => alert(`선택: ${v}`)}
              />
              <CommunityCommentItem
                username="김개발"
                date="2026.04.02 / 14:20"
                content="세미나 자료 공유해주실 수 있나요? 정말 유익한 내용이었습니다."
                menuItems={[
                  { value: 'edit', label: '수정하기' },
                  { value: 'delete', label: '삭제하기' },
                  { value: 'report', label: '신고하기' },
                ]}
                onMenuSelect={(v) => alert(`선택: ${v}`)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* =============== 모달 컴포넌트들 =============== */}

      {/* 1-1. 일반 모달 */}
      <ConfirmModal
        isOpen={isConfirm1Open}
        onClose={() => setIsConfirm1Open(false)}
        title="등록 완료"
        subtitle="입력하신 정보가 등록되었습니다."
        status="default"
        confirmText="확인"
        onConfirm={() => { alert('OK!'); setIsConfirm1Open(false); }}
      />

      {/* 1-2. 경고 모달 */}
      <ConfirmModal
        isOpen={isConfirm2Open}
        onClose={() => setIsConfirm2Open(false)}
        title="정말 삭제하시겠습니까?"
        subtitle="삭제된 데이터는 복구할 수 없습니다."
        status="danger"
        confirmText="삭제"
        onConfirm={() => { alert('삭제!'); setIsConfirm2Open(false); }}
      />

      {/* 1-3. 체크박스 경고 모달 */}
      <ConfirmModal
        isOpen={isConfirm3Open}
        onClose={() => setIsConfirm3Open(false)}
        title="계정을 영구 삭제하시겠습니까?"
        subtitle="모든 데이터가 삭제되며 복구가 불가능합니다."
        status="danger"
        requireCheckbox={true}
        checkboxLabel="네, 모든 데이터가 삭제되는 것에 동의합니다."
        confirmText="영구 삭제"
        onConfirm={() => { alert('영구 삭제!'); setIsConfirm3Open(false); }}
      />

      {/* 2-1. InputModal (User Role) */}
      <InputModal
        isOpen={isInputUserOpen}
        onClose={() => setIsInputUserOpen(false)}
        role="user"
        title="신고 사유를 작성해주세요"
        subtitle="부적절한 내용일 경우 운영진 확인 후 조치됩니다."
        onConfirm={(data) => {
          console.log('Report Data:', data);
          alert('신고가 접수되었습니다.');
          setIsInputUserOpen(false);
        }}
      />

      {/* 2-2. InputModal (Admin Role) */}
      <InputModal
        isOpen={isInputAdminOpen}
        onClose={() => setIsInputAdminOpen(false)}
        role="admin"
        title="신고 상세 내역"
        adminData={{
          date1: '2026-04-16',
          userName: '홍길동',
          statusText: '대기 중',
          date2: '2026-04-16',
          reasonDetail: '해당 세션의 사업자 번호가 존재하지 않는 번호입니다. 확인 부탁드립니다.'
        }}
        onConfirm={() => setIsInputAdminOpen(false)}
      />

      {/* 3. UploadModal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="사업자 등록증 업로드"
        subtitle="가입 승인을 위해 반드시 업로드해 주세요."
        uploadLabel="파일 찾아보기"
        accept="image/*,.pdf"
        requireCheckbox={true}
        checkboxLabel="위 서류가 위조되지 않은 진본임을 확인합니다."
        confirmText="업로드 완료"
        onConfirm={(file) => {
          console.log('Uploaded File:', file?.name);
          alert('업로드 성공!');
          setIsUploadOpen(false);
        }}
      />

      {/* 4. PaymentModal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="결제하기"
        pricePerUnit={80000}
        onConfirm={(data) => {
          console.log('Payment Data:', data);
          alert(`결제 완료! \n- 수량: ${data.quantity}개 \n- 총액: ${data.totalPrice}원\n- 수단: ${data.paymentMethod}`);
          setIsPaymentOpen(false);
        }}
      />

      {/* 5-1. InquiryModal (User) */}
      <InquiryModal
        isOpen={isInquiryUserOpen}
        onClose={() => setIsInquiryUserOpen(false)}
        role="user"
        onSubmit={(data) => {
          console.log('User Inquiry:', data);
          alert(`문의 전송!\n- 유형: ${data.category}\n- 제목: ${data.title}\n- 내용: ${data.content}\n- 첨부: ${data.attachment?.name || '없음'}`);
        }}
      />

      {/* 5-2. InquiryModal (Host) */}
      <InquiryModal
        isOpen={isInquiryHostOpen}
        onClose={() => setIsInquiryHostOpen(false)}
        role="host"
        onSubmit={(data) => {
          console.log('Host Inquiry:', data);
          alert(`호스트 문의 전송!\n- 유형: ${data.category}\n- 제목: ${data.title}\n- 내용: ${data.content}\n- 첨부: ${data.attachment?.name || '없음'}`);
        }}
      />

    </div>
  );
}

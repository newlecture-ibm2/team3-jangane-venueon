package com.venueon.common.config;

import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.category.adapter.out.persistence.repository.CategoryJpaRepository;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.EventSessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.EventSessionJpaRepository;
import com.venueon.event.domain.model.EventStatus;
import com.venueon.event.domain.model.EventType;
import com.venueon.event.domain.model.PurchaseType;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.report.adapter.out.persistence.entity.RefundJpaEntity;
import com.venueon.report.adapter.out.persistence.entity.ReportJpaEntity;
import com.venueon.report.adapter.out.persistence.repository.RefundJpaRepository;
import com.venueon.report.adapter.out.persistence.repository.ReportJpaRepository;
import com.venueon.report.domain.model.AdminAction;
import com.venueon.report.domain.model.RefundStatus;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import com.venueon.user.adapter.out.persistence.entity.HostProfileJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.HostProfileJpaRepository;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import com.venueon.user.domain.model.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserJpaRepository userRepository;
    private final HostProfileJpaRepository hostProfileRepository;
    private final CategoryJpaRepository categoryRepository;
    private final EventJpaRepository eventRepository;
    private final EventSessionJpaRepository eventSessionRepository;
    private final OrderJpaRepository orderRepository;
    private final ReportJpaRepository reportRepository;
    private final RefundJpaRepository refundRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            log.info("데이터가 이미 존재합니다. 초기화를 건너뜁니다.");
            return;
        }

        log.info("=== 개발용 초기 데이터 생성 시작 ===");

        UserJpaEntity admin = createAdmin();
        List<UserJpaEntity> users = createUsers();
        List<UserJpaEntity> hosts = createHosts();
        List<CategoryJpaEntity> categories = createCategories();
        List<EventJpaEntity> events = createEvents(hosts, categories);
        createSessions(events);
        List<OrderJpaEntity> orders = createOrders(users, events);
        List<ReportJpaEntity> reports = createReports(users, events);
        List<RefundJpaEntity> refunds = createRefunds(users, orders);

        log.info("=== 개발용 초기 데이터 생성 완료 ===");
        log.info("Admin: 1명, User: {}명, Host: {}명", users.size(), hosts.size());
        log.info("Category: {}개, Event: {}개, Session: {}개", categories.size(), events.size(), eventSessionRepository.count());
        log.info("Order: {}개, Report: {}개, Refund: {}개", orders.size(), reports.size(), refunds.size());
    }

    private UserJpaEntity createAdmin() {
        return userRepository.save(UserJpaEntity.builder()
                .email("admin@venueon.com")
                .password(passwordEncoder.encode("Admin1234!"))
                .nickname("VenueOn관리자")
                .role(UserRole.ADMIN)
                .build());
    }

    private List<UserJpaEntity> createUsers() {
        return userRepository.saveAll(List.of(
                UserJpaEntity.builder()
                        .email("user1@example.com")
                        .password(passwordEncoder.encode("User1234!"))
                        .nickname("김참여")
                        .role(UserRole.USER)
                        .build(),
                UserJpaEntity.builder()
                        .email("user2@example.com")
                        .password(passwordEncoder.encode("User1234!"))
                        .nickname("이탐색")
                        .role(UserRole.USER)
                        .build(),
                UserJpaEntity.builder()
                        .email("user3@example.com")
                        .password(passwordEncoder.encode("User1234!"))
                        .nickname("박이벤트")
                        .role(UserRole.USER)
                        .build()
        ));
    }

    private List<UserJpaEntity> createHosts() {
        String encodedPassword = passwordEncoder.encode("Host1234!");

        // 호스트 정보 배열 (User + HostProfile 데이터)
        record HostData(String email, String nickname, String profileImg, String phone,
                        String orgName, String orgNumber, String managerName, String orgDescription) {}

        List<HostData> hostDataList = List.of(
                new HostData("contact@nextcode.kr", "NextCode", "nextcode.png", "02-1234-5678",
                        "넥스트코드", "123-45-67890", "김개발",
                        "AI와 클라우드 기술 전문 교육 기업. 현직 개발자가 이끄는 실무 중심 코딩 부트캠프와 기술 세미나를 운영합니다."),
                new HostData("hello@designbridge.co.kr", "DesignBridge", "designbridge.png", "02-2345-6789",
                        "디자인브릿지", "234-56-78901", "이디자인",
                        "UX/UI 디자인 전문 에이전시. 실무 프로젝트 기반의 디자인 워크숍과 포트폴리오 클래스를 제공합니다."),
                new HostData("info@sparkventures.io", "SparkVentures", "sparkventures.png", "02-3456-7890",
                        "스파크벤처스", "345-67-89012", "박벤처",
                        "초기 스타트업을 위한 액셀러레이터. 투자 유치 전략, 비즈니스 모델 설계, 네트워킹 이벤트를 정기적으로 개최합니다."),
                new HostData("wellness@greenlife.kr", "GreenLifeAcademy", "greenlife-academy.png", "02-4567-8901",
                        "그린라이프 아카데미", "456-78-90123", "최건강",
                        "건강한 라이프스타일을 위한 웰니스 교육 플랫폼. 요가, 명상, 영양학 클래스와 건강 세미나를 운영합니다."),
                new HostData("art@artspaceseoul.com", "ArtSpaceSeoul", "artspace-seoul.png", "02-5678-9012",
                        "아트스페이스 서울", "567-89-01234", "정예술",
                        "서울 성수동 소재 복합 문화 공간. 전시, 공연, 아트 워크숍 등 다양한 문화 이벤트를 기획하고 운영합니다."),
                new HostData("consulting@bizon.co.kr", "BizOnConsulting", "bizon-consulting.png", "02-6789-0123",
                        "비즈온 컨설팅", "678-90-12345", "강전략",
                        "기업 성장 전략 전문 컨설팅 펌. 리더십, 마케팅, 데이터 기반 의사결정 등 비즈니스 컨퍼런스와 세미나를 개최합니다."),
                new HostData("chef@foodlabseoul.kr", "FoodLabSeoul", "foodlab-seoul.png", "02-7890-1234",
                        "푸드랩 서울", "789-01-23456", "한요리",
                        "셰프와 미식가를 위한 쿠킹 스튜디오. 한식, 양식, 베이킹 클래스와 푸드 네트워킹 밋업을 정기적으로 운영합니다."),
                new HostData("invest@moneyflow.co.kr", "MoneyFlow", "moneyflow.png", "02-8901-2345",
                        "머니플로우", "890-12-34567", "윤재테크",
                        "개인 투자자와 금융 전문가를 연결하는 핀테크 교육 플랫폼. 주식, 부동산, 가상자산 세미나와 재테크 컨퍼런스를 개최합니다."),
                new HostData("hello@creatorshub.kr", "CreatorsHub", "creators-hub.png", "02-9012-3456",
                        "크리에이터즈 허브", "901-23-45678", "신미디어",
                        "유튜버, 인플루언서, 콘텐츠 크리에이터를 위한 미디어 교육 기관. 영상 편집, SNS 마케팅, 브랜딩 클래스를 운영합니다."),
                new HostData("forum@seoulscience.org", "SeoulScienceForum", "seoul-science-forum.png", "02-0123-4567",
                        "서울사이언스포럼", "012-34-56789", "조과학",
                        "과학 기술 대중화를 위한 비영리 학술 단체. 최신 연구 동향 발표, 과학 강연, 학술 컨퍼런스를 주최합니다.")
        );

        // 1) User 엔티티 저장
        List<UserJpaEntity> hostUsers = userRepository.saveAll(
                hostDataList.stream().map(d -> UserJpaEntity.builder()
                        .email(d.email())
                        .password(encodedPassword)
                        .nickname(d.nickname())
                        .role(UserRole.HOST)
                        .profileImg(d.profileImg())
                        .phone(d.phone())
                        .build()
                ).toList()
        );

        // 2) HostProfile 엔티티 저장
        for (int i = 0; i < hostUsers.size(); i++) {
            HostData d = hostDataList.get(i);
            hostProfileRepository.save(HostProfileJpaEntity.builder()
                    .user(hostUsers.get(i))
                    .orgName(d.orgName())
                    .orgNumber(d.orgNumber())
                    .managerName(d.managerName())
                    .orgDescription(d.orgDescription())
                    .build());
        }

        return hostUsers;
    }

    private List<CategoryJpaEntity> createCategories() {
        return categoryRepository.saveAll(List.of(
                CategoryJpaEntity.builder().name("테크/개발 교육").sortOrder(1).build(),
                CategoryJpaEntity.builder().name("디자인/크리에이티브").sortOrder(2).build(),
                CategoryJpaEntity.builder().name("창업/스타트업").sortOrder(3).build(),
                CategoryJpaEntity.builder().name("건강/웰니스").sortOrder(4).build(),
                CategoryJpaEntity.builder().name("문화/예술").sortOrder(5).build(),
                CategoryJpaEntity.builder().name("경영/비즈니스").sortOrder(6).build(),
                CategoryJpaEntity.builder().name("요리/F&B").sortOrder(7).build(),
                CategoryJpaEntity.builder().name("금융/투자").sortOrder(8).build(),
                CategoryJpaEntity.builder().name("미디어/콘텐츠").sortOrder(9).build(),
                CategoryJpaEntity.builder().name("과학/학술").sortOrder(10).build()
        ));
    }

    private List<EventJpaEntity> createEvents(List<UserJpaEntity> hosts, List<CategoryJpaEntity> categories) {
        return eventRepository.saveAll(List.of(
                EventJpaEntity.builder()
                        .creator(hosts.get(0))
                        .category(categories.get(0))
                        .title("AI & Cloud Bootcamp")
                        .description("현직 개발자와 함께하는 2일 집중 부트캠프. AI 모델 배포부터 클라우드 인프라 설계까지, 실무에서 바로 쓸 수 있는 기술을 배웁니다. AWS, GCP 환경에서 직접 실습하며 포트폴리오를 완성합니다.")
                        .type(EventType.SEMINAR)
                        .status(EventStatus.PUBLISHED)
                        .location("서울 강남구 테헤란로 123 넥스트코드 교육센터")
                        .isOnline(false)
                        .price(150000)
                        .maxAttendees(40)
                        .thumbnailUrl("lecture-thumbnail/NC_thumbnail.jpg")
                        .startDate(LocalDateTime.of(2026, 4, 12, 10, 0))
                        .endDate(LocalDateTime.of(2026, 4, 13, 18, 0))
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(1))
                        .category(categories.get(1))
                        .title("UX Design Workshop")
                        .description("사용자 리서치부터 프로토타이핑까지, UX 디자인의 전 과정을 실습합니다. Figma를 활용한 와이어프레임 제작과 사용성 테스트 방법을 현업 디자이너에게 직접 배울 수 있습니다.")
                        .type(EventType.CLASS)
                        .status(EventStatus.PUBLISHED)
                        .location("서울 성동구 성수이로 45 디자인브릿지 스튜디오")
                        .isOnline(false)
                        .price(80000)
                        .maxAttendees(25)
                        .thumbnailUrl("lecture-thumbnail/DB_thumbnail.jpg")
                        .startDate(LocalDateTime.of(2026, 4, 26, 10, 0))
                        .endDate(LocalDateTime.of(2026, 4, 27, 17, 0))
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(2))
                        .category(categories.get(2))
                        .title("Startup Demo Day")
                        .description("스파크벤처스 5기 배치 스타트업 10팀의 데모데이. 투자자, 멘토, 예비 창업자가 한자리에 모여 혁신적인 비즈니스 모델을 발표하고 네트워킹합니다. 참관은 무료입니다.")
                        .type(EventType.CONFERENCE)
                        .status(EventStatus.PUBLISHED)
                        .location("서울 영등포구 여의대로 108 파크원타워 컨벤션홀")
                        .isOnline(false)
                        .price(0)
                        .maxAttendees(200)
                        .thumbnailUrl("lecture-thumbnail/SV_thumbnail.jpg")
                        .startDate(LocalDateTime.of(2026, 5, 10, 14, 0))
                        .endDate(LocalDateTime.of(2026, 5, 10, 20, 0))
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(3))
                        .category(categories.get(3))
                        .title("마음챙김 요가 클래스")
                        .description("바쁜 일상 속 나를 돌보는 시간. 호흡법과 명상을 결합한 빈야사 요가 클래스입니다. 초보자도 편하게 참여할 수 있으며, 요가 매트와 소도구는 현장에서 제공됩니다.")
                        .type(EventType.CLASS)
                        .status(EventStatus.PUBLISHED)
                        .location("서울 마포구 연남로 27 그린라이프 웰니스센터")
                        .isOnline(false)
                        .price(30000)
                        .maxAttendees(20)
                        .thumbnailUrl("lecture-thumbnail/GLA_thumbnail.jpg")
                        .startDate(LocalDateTime.of(2026, 5, 17, 9, 0))
                        .endDate(LocalDateTime.of(2026, 5, 17, 11, 30))
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(4))
                        .category(categories.get(4))
                        .title("현대미술 워크숍")
                        .description("추상표현주의부터 미디어아트까지, 현대미술의 주요 흐름을 이해하고 직접 작품을 제작합니다. 전시 큐레이터와 작가가 함께 진행하며, 완성 작품은 갤러리에서 전시됩니다.")
                        .type(EventType.CLASS)
                        .status(EventStatus.PUBLISHED)
                        .location("서울 성동구 서울숲2길 17 아트스페이스 서울")
                        .isOnline(false)
                        .price(120000)
                        .maxAttendees(15)
                        .thumbnailUrl("lecture-thumbnail/AS_thumbnail.jpg")
                        .startDate(LocalDateTime.of(2026, 5, 24, 10, 0))
                        .endDate(LocalDateTime.of(2026, 5, 25, 17, 0))
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(5))
                        .category(categories.get(5))
                        .title("Business Growth Summit")
                        .description("기업 성장의 핵심 전략을 다루는 비즈니스 서밋. 데이터 기반 의사결정, 조직 확장, 해외 진출 등 실전 경험을 가진 CEO와 임원진의 강연과 패널 토론으로 구성됩니다.")
                        .type(EventType.CONFERENCE)
                        .status(EventStatus.PUBLISHED)
                        .location("서울 중구 세종대로 110 프레스센터 국제회의장")
                        .isOnline(true)
                        .price(50000)
                        .maxAttendees(150)
                        .thumbnailUrl("lecture-thumbnail/BOC_thumbnail.jpg")
                        .startDate(LocalDateTime.of(2026, 5, 31, 9, 30))
                        .endDate(LocalDateTime.of(2026, 5, 31, 18, 0))
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(6))
                        .category(categories.get(6))
                        .title("한식 마스터클래스")
                        .description("전통 한식의 맛과 멋을 배우는 쿠킹 클래스. 계절 식재료를 활용한 상차림을 셰프와 함께 만들고, 한식 플레이팅 기법까지 배웁니다. 만든 음식은 현장에서 시식합니다.")
                        .type(EventType.CLASS)
                        .status(EventStatus.PUBLISHED)
                        .location("서울 종로구 인사동길 38 푸드랩 서울 쿠킹스튜디오")
                        .isOnline(false)
                        .price(65000)
                        .maxAttendees(12)
                        .thumbnailUrl("lecture-thumbnail/FLS_thumbnail.jpg")
                        .startDate(LocalDateTime.of(2026, 6, 7, 11, 0))
                        .endDate(LocalDateTime.of(2026, 6, 7, 15, 0))
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(7))
                        .category(categories.get(7))
                        .title("Smart Investment Seminar 2026")
                        .description("개인 투자자를 위한 스마트 투자 전략 세미나. 글로벌 매크로 분석, ETF 포트폴리오 구성, AI 기반 퀀트 투자까지 최신 투자 트렌드를 금융 전문가가 직접 해설합니다.")
                        .type(EventType.SEMINAR)
                        .status(EventStatus.PUBLISHED)
                        .location("서울 영등포구 국제금융로 10 머니플로우 세미나홀")
                        .isOnline(true)
                        .price(40000)
                        .maxAttendees(100)
                        .thumbnailUrl("lecture-thumbnail/MF_thumbnail.jpg")
                        .startDate(LocalDateTime.of(2026, 6, 14, 13, 0))
                        .endDate(LocalDateTime.of(2026, 6, 14, 18, 0))
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(8))
                        .category(categories.get(8))
                        .title("Creator Academy: Video Editing")
                        .description("유튜브·숏폼 콘텐츠 제작을 위한 영상 편집 아카데미. Premiere Pro와 DaVinci Resolve를 활용한 컷 편집, 색보정, 자막 디자인을 실습합니다. 개인 노트북 지참 필수.")
                        .type(EventType.CLASS)
                        .status(EventStatus.PUBLISHED)
                        .location("서울 강남구 논현로 515 크리에이터즈 허브 미디어랩")
                        .isOnline(false)
                        .price(90000)
                        .maxAttendees(30)
                        .thumbnailUrl("lecture-thumbnail/CH_thumbnail.jpg")
                        .startDate(LocalDateTime.of(2026, 6, 21, 10, 0))
                        .endDate(LocalDateTime.of(2026, 6, 22, 17, 0))
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(9))
                        .category(categories.get(9))
                        .title("Future Science Conference")
                        .description("미래 과학 기술의 최신 연구 성과를 공유하는 학술 컨퍼런스. 생명공학, 양자컴퓨팅, 우주과학 등 분야별 세션으로 구성되며, 국내외 연구자 발표와 포스터 세션이 진행됩니다.")
                        .type(EventType.CONFERENCE)
                        .status(EventStatus.PUBLISHED)
                        .location("서울 동대문구 회기로 85 서울과학기술대 국제회의실")
                        .isOnline(true)
                        .price(0)
                        .maxAttendees(300)
                        .thumbnailUrl("lecture-thumbnail/SSF_thumbnail.jpg")
                        .startDate(LocalDateTime.of(2026, 6, 28, 9, 0))
                        .endDate(LocalDateTime.of(2026, 6, 29, 18, 0))
                        .build()
        ));
    }

    /**
     * 세션 생성 — 모든 이벤트에 기본 세션(is_default=true) 생성
     * AI Bootcamp(index 0)와 Future Science Conference(index 9)는 hasSession=true로 다중 세션 예시
     */
    private void createSessions(List<EventJpaEntity> events) {
        // 1) 모든 이벤트에 기본 세션 생성
        for (EventJpaEntity event : events) {
            eventSessionRepository.save(EventSessionJpaEntity.builder()
                    .event(event)
                    .title(event.getTitle())
                    .description(event.getDescription())
                    .sortOrder(0)
                    .startTime(event.getStartDate())
                    .endTime(event.getEndDate())
                    .location(event.getLocation())
                    .isOnline(event.isOnline())
                    .price(event.getPrice())
                    .maxAttendees(event.getMaxAttendees())
                    .isDefault(true)
                    .build());
        }

        // 2) AI & Cloud Bootcamp — 다중 세션 예시 (hasSession=true 이벤트)
        EventJpaEntity bootcamp = events.get(0);
        eventSessionRepository.save(EventSessionJpaEntity.builder()
                .event(bootcamp)
                .title("Day 1: AI 모델 배포")
                .description("TensorFlow/PyTorch 모델을 AWS SageMaker에 배포하는 실습")
                .sortOrder(1)
                .startTime(LocalDateTime.of(2026, 4, 12, 10, 0))
                .endTime(LocalDateTime.of(2026, 4, 12, 18, 0))
                .location("서울 강남구 테헤란로 123 넥스트코드 교육센터")
                .price(80000)
                .maxAttendees(40)
                .isDefault(false)
                .build());
        eventSessionRepository.save(EventSessionJpaEntity.builder()
                .event(bootcamp)
                .title("Day 2: 클라우드 인프라 설계")
                .description("AWS/GCP 기반 마이크로서비스 아키텍처 설계 및 배포 파이프라인 구축")
                .sortOrder(2)
                .startTime(LocalDateTime.of(2026, 4, 13, 10, 0))
                .endTime(LocalDateTime.of(2026, 4, 13, 18, 0))
                .location("서울 강남구 테헤란로 123 넥스트코드 교육센터")
                .price(80000)
                .maxAttendees(40)
                .isDefault(false)
                .build());

        // 3) Future Science Conference — 다중 세션 예시 (온라인 포함)
        EventJpaEntity sciConf = events.get(9);
        eventSessionRepository.save(EventSessionJpaEntity.builder()
                .event(sciConf)
                .title("세션 A: 생명공학의 미래")
                .description("유전자 편집 기술과 맞춤형 의료의 최신 연구 성과 발표")
                .sortOrder(1)
                .startTime(LocalDateTime.of(2026, 6, 28, 10, 0))
                .endTime(LocalDateTime.of(2026, 6, 28, 12, 0))
                .location("서울 동대문구 회기로 85 국제회의실 A홀")
                .price(0)
                .maxAttendees(100)
                .isDefault(false)
                .build());
        eventSessionRepository.save(EventSessionJpaEntity.builder()
                .event(sciConf)
                .title("세션 B: 양자컴퓨팅")
                .description("양자 알고리즘과 오류 보정 기술의 최신 동향")
                .sortOrder(2)
                .startTime(LocalDateTime.of(2026, 6, 28, 14, 0))
                .endTime(LocalDateTime.of(2026, 6, 28, 16, 0))
                .isOnline(true)
                .onlineLink("https://zoom.us/j/1234567890")
                .price(0)
                .maxAttendees(200)
                .isDefault(false)
                .build());
        eventSessionRepository.save(EventSessionJpaEntity.builder()
                .event(sciConf)
                .title("세션 C: 우주과학")
                .description("차세대 우주탐사 기술과 민간 우주산업의 전망")
                .sortOrder(3)
                .startTime(LocalDateTime.of(2026, 6, 29, 10, 0))
                .endTime(LocalDateTime.of(2026, 6, 29, 12, 0))
                .location("서울 동대문구 회기로 85 국제회의실 B홀")
                .price(0)
                .maxAttendees(100)
                .isDefault(false)
                .build());

        log.info("세션 생성 완료: 기본 세션 {}개, 추가 세션 5개", events.size());
    }

    private List<OrderJpaEntity> createOrders(List<UserJpaEntity> users, List<EventJpaEntity> events) {
        return orderRepository.saveAll(List.of(
                // user1(김참여) — AI & Cloud Bootcamp 수강 (유료, PAID)
                OrderJpaEntity.builder()
                        .user(users.get(0))
                        .event(events.get(0))
                        .status(OrderStatus.PAID)
                        .quantity(1)
                        .amount(150000)
                        .paymentMethod("CARD")
                        .tossOrderId("venueon_order_1_1680000001")
                        .tossPaymentKey("test_pk_demo_001")
                        .build(),
                // user1(김참여) — 마음챙김 요가 클래스 수강 (유료, PAID)
                OrderJpaEntity.builder()
                        .user(users.get(0))
                        .event(events.get(3))
                        .status(OrderStatus.PAID)
                        .quantity(2)
                        .amount(60000)
                        .paymentMethod("KAKAO_PAY")
                        .tossOrderId("venueon_order_2_1680000002")
                        .tossPaymentKey("test_pk_demo_002")
                        .build(),
                // user2(이탐색) — UX Design Workshop 수강 (유료, PAID)
                OrderJpaEntity.builder()
                        .user(users.get(1))
                        .event(events.get(1))
                        .status(OrderStatus.PAID)
                        .quantity(1)
                        .amount(80000)
                        .paymentMethod("NAVER_PAY")
                        .tossOrderId("venueon_order_3_1680000003")
                        .tossPaymentKey("test_pk_demo_003")
                        .build(),
                // user2(이탐색) — Startup Demo Day 참가 (무료, REGISTERED)
                OrderJpaEntity.builder()
                        .user(users.get(1))
                        .event(events.get(2))
                        .status(OrderStatus.REGISTERED)
                        .quantity(1)
                        .amount(0)
                        .build(),
                // user3(박이벤트) — Business Growth Summit 수강 (유료, CANCELLED → 환불 대상)
                OrderJpaEntity.builder()
                        .user(users.get(2))
                        .event(events.get(5))
                        .status(OrderStatus.CANCELLED)
                        .quantity(1)
                        .amount(50000)
                        .paymentMethod("CARD")
                        .tossOrderId("venueon_order_5_1680000005")
                        .tossPaymentKey("test_pk_demo_005")
                        .build(),
                // user3(박이벤트) — 한식 마스터클래스 수강 (유료, PAID)
                OrderJpaEntity.builder()
                        .user(users.get(2))
                        .event(events.get(6))
                        .status(OrderStatus.PAID)
                        .quantity(1)
                        .amount(65000)
                        .paymentMethod("BANK_TRANSFER")
                        .tossOrderId("venueon_order_6_1680000006")
                        .tossPaymentKey("test_pk_demo_006")
                        .build()
        ));
    }

    private List<ReportJpaEntity> createReports(List<UserJpaEntity> users, List<EventJpaEntity> events) {
        return reportRepository.saveAll(List.of(
                // 신고 1: user1이 이벤트(AI & Cloud Bootcamp)를 허위 정보로 신고 — 대기중
                ReportJpaEntity.builder()
                        .reporter(users.get(0))
                        .targetType(ReportTargetType.EVENT)
                        .targetId(events.get(0).getId())
                        .reason("허위 정보")
                        .detail("강의 내용과 실제 진행 내용이 전혀 다릅니다. 설명에는 AWS, GCP 실습이라고 되어 있지만 실제로는 이론 수업만 진행됩니다.")
                        .status(ReportStatus.PENDING)
                        .build(),
                // 신고 2: user2가 user3을 스팸/광고로 신고 — 대기중
                ReportJpaEntity.builder()
                        .reporter(users.get(1))
                        .targetType(ReportTargetType.USER)
                        .targetId(users.get(2).getId())
                        .reason("스팸/광고")
                        .detail("커뮤니티에서 반복적으로 외부 사이트 링크를 게시하고 있습니다. 광고성 글을 지속적으로 작성합니다.")
                        .status(ReportStatus.PENDING)
                        .build(),
                // 신고 3: user3이 이벤트(현대미술 워크숍)를 부적절한 콘텐츠로 신고 — 처리 완료
                ReportJpaEntity.builder()
                        .reporter(users.get(2))
                        .targetType(ReportTargetType.EVENT)
                        .targetId(events.get(4).getId())
                        .reason("부적절한 콘텐츠")
                        .detail("이벤트 설명에 부적절한 이미지가 포함되어 있습니다.")
                        .status(ReportStatus.RESOLVED)
                        .adminAction(AdminAction.WARN)
                        .resolvedAt(LocalDateTime.now().minusDays(2))
                        .build(),
                // 신고 4: user1이 이벤트(Business Growth Summit)를 저작권 침해로 신고 — 반려
                ReportJpaEntity.builder()
                        .reporter(users.get(0))
                        .targetType(ReportTargetType.EVENT)
                        .targetId(events.get(5).getId())
                        .reason("저작권 침해")
                        .detail("이벤트 썸네일 이미지가 타사의 저작물을 무단으로 사용한 것 같습니다.")
                        .status(ReportStatus.REJECTED)
                        .adminAction(AdminAction.DISMISS)
                        .resolvedAt(LocalDateTime.now().minusDays(1))
                        .build()
        ));
    }

    private List<RefundJpaEntity> createRefunds(List<UserJpaEntity> users, List<OrderJpaEntity> orders) {
        return refundRepository.saveAll(List.of(
                // 환불 1: user3(박이벤트)의 Business Growth Summit 취소 → 환불 요청 (대기중)
                RefundJpaEntity.builder()
                        .order(orders.get(4))  // CANCELLED 상태인 주문
                        .user(users.get(2))
                        .amount(50000)
                        .status(RefundStatus.PENDING)
                        .reason("일정이 변경되어 참석이 어렵습니다.")
                        .build(),
                // 환불 2: user1(김참여)의 마음챙김 요가 클래스 환불 (승인 완료)
                RefundJpaEntity.builder()
                        .order(orders.get(1))  // 요가 클래스 주문
                        .user(users.get(0))
                        .amount(60000)
                        .status(RefundStatus.APPROVED)
                        .reason("개인 사정으로 참석이 어렵습니다.")
                        .processedAt(LocalDateTime.now().minusDays(3))
                        .build()
        ));
    }
}

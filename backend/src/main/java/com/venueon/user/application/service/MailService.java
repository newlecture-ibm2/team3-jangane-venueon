package com.venueon.user.application.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * 이메일 인증 메일 발송 서비스
 * Gmail SMTP를 통해 인증 링크가 담긴 HTML 메일을 전송합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * 이메일 인증 메일을 발송합니다.
     *
     * @param toEmail 수신자 이메일
     * @param token   인증 토큰 (UUID)
     */
    public void sendVerificationEmail(String toEmail, String token) {
        String verifyUrl = frontendUrl + "/verify-email?token=" + token;

        String subject = "[VenueOn] 이메일 인증을 완료해 주세요";
        String htmlContent = buildEmailHtml(verifyUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);
            log.info("인증 메일 발송 완료: to={}", toEmail);
        } catch (MessagingException e) {
            log.error("인증 메일 발송 실패: to={}", toEmail, e);
            throw new RuntimeException("인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.", e);
        }
    }

    /**
     * 인증 메일 HTML 템플릿
     */
    private String buildEmailHtml(String verifyUrl) {
        return """
            <!DOCTYPE html>
            <html lang="ko">
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#F3F4F6;font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr><td align="center">
                  <table width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.3);overflow:hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background:#374151;padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:700;">VenueOn</h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">이메일 인증</p>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">회원가입을 환영합니다! 🎉</h2>
                        <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">
                          아래 버튼을 클릭하시면 이메일 인증이 완료되고,<br>
                          VenueOn 서비스를 이용하실 수 있습니다.
                        </p>
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr><td align="center" style="padding:8px 0 24px;">
                            <a href="%s"
                               style="display:inline-block;padding:14px 48px;background:#374151;
                                      color:#FFFFFF;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">
                              이메일 인증하기
                            </a>
                          </td></tr>
                        </table>
                        <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.5;">
                          본 링크는 <strong>10분간</strong> 유효합니다.<br>
                          본인이 요청하지 않으셨다면, 이 메일을 무시해 주세요.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px;background:#F3F4F6;text-align:center;border-top:1px solid #D1D5DB;">
                        <p style="margin:0;font-size:12px;color:#9CA3AF;">© 2026 VenueOn. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(verifyUrl);
    }

    /**
     * 임시 비밀번호 메일을 발송합니다.
     */
    public void sendTempPasswordEmail(String toEmail, String tempPassword) {
        String subject = "[VenueOn] 임시 비밀번호 안내";
        String loginUrl = frontendUrl + "/login";
        String htmlContent = buildTempPasswordHtml(tempPassword, loginUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("임시 비밀번호 메일 발송 완료: to={}", toEmail);
        } catch (MessagingException e) {
            log.error("임시 비밀번호 메일 발송 실패: to={}", toEmail, e);
            throw new RuntimeException("임시 비밀번호 메일 발송에 실패했습니다.", e);
        }
    }

    private String buildTempPasswordHtml(String tempPassword, String loginUrl) {
        return """
            <!DOCTYPE html>
            <html lang="ko">
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#F3F4F6;font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr><td align="center">
                  <table width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.3);overflow:hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background:#374151;padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:700;">VenueOn</h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">임시 비밀번호 안내</p>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">임시 비밀번호가 발급되었습니다 🔑</h2>
                        <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">
                          아래 임시 비밀번호로 로그인하신 후,<br>
                          새 비밀번호로 변경해 주세요.
                        </p>
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-radius:8px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px;text-align:center;">
                              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">임시 비밀번호</p>
                              <p style="margin:0;font-size:28px;font-weight:700;color:#111827;letter-spacing:4px;">%s</p>
                            </td>
                          </tr>
                        </table>
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr><td align="center" style="padding:8px 0 24px;">
                            <a href="%s"
                               style="display:inline-block;padding:14px 48px;background:#374151;
                                      color:#FFFFFF;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">
                              로그인하러 가기
                            </a>
                          </td></tr>
                        </table>
                        <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.5;">
                          보안을 위해 로그인 후 반드시 비밀번호를 변경해 주세요.<br>
                          본인이 요청하지 않으셨다면, 이 메일을 무시해 주세요.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px;background:#F3F4F6;text-align:center;border-top:1px solid #D1D5DB;">
                        <p style="margin:0;font-size:12px;color:#9CA3AF;">© 2026 VenueOn. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(tempPassword, loginUrl);
    }

    /**
     * 결제 확인 메일을 발송합니다.
     *
     * @param toEmail      수신자 이메일
     * @param customerName 구매자 이름
     * @param orderName    주문명
     * @param totalAmount  합계 금액
     * @param itemCount    주문 항목 수
     * @param startTime    세션 시작 시간 (nullable)
     * @param endTime      세션 종료 시간 (nullable)
     * @param location     세션 장소 (nullable)
     */
    public void sendPaymentConfirmationEmail(String toEmail, String customerName,
                                              String orderName, int totalAmount, int itemCount,
                                              java.time.LocalDateTime startTime,
                                              java.time.LocalDateTime endTime,
                                              String location) {
        String subject = "[VenueOn] 결제가 완료되었습니다";
        String ordersUrl = frontendUrl + "/mypage/orders";
        String calendarUrl = buildGoogleCalendarUrl(orderName, startTime, endTime, location);
        String htmlContent = buildPaymentConfirmHtml(customerName, orderName, totalAmount, itemCount, ordersUrl, calendarUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("결제 확인 메일 발송 완료: to={}, orderName={}", toEmail, orderName);
        } catch (MessagingException e) {
            log.warn("결제 확인 메일 발송 실패 (결제는 정상 처리됨): to={}, error={}", toEmail, e.getMessage());
        }
    }

    /**
     * Google Calendar 이벤트 추가 URL을 생성합니다.
     * https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=.../...&location=...
     */
    private String buildGoogleCalendarUrl(String title, java.time.LocalDateTime startTime,
                                           java.time.LocalDateTime endTime, String location) {
        if (startTime == null) return null;

        java.time.format.DateTimeFormatter gcalFmt = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
        String start = startTime.format(gcalFmt);
        String end = (endTime != null) ? endTime.format(gcalFmt) : startTime.plusHours(2).format(gcalFmt);

        StringBuilder sb = new StringBuilder("https://calendar.google.com/calendar/render?action=TEMPLATE");
        sb.append("&text=").append(urlEncode(title));
        sb.append("&dates=").append(start).append("/").append(end);
        sb.append("&details=").append(urlEncode("VenueOn에서 결제한 강의입니다."));
        if (location != null && !location.isBlank()) {
            sb.append("&location=").append(urlEncode(location));
        }
        return sb.toString();
    }

    private String urlEncode(String value) {
        try {
            return java.net.URLEncoder.encode(value, "UTF-8");
        } catch (java.io.UnsupportedEncodingException e) {
            return value;
        }
    }

    /**
     * 결제 확인 메일 HTML 템플릿
     */
    private String buildPaymentConfirmHtml(String customerName, String orderName,
                                            int totalAmount, int itemCount,
                                            String ordersUrl, String calendarUrl) {
        String formattedAmount = String.format("%,d", totalAmount);

        // 캘린더 버튼 HTML (날짜 정보가 있을 때만 표시)
        String calendarButton = "";
        if (calendarUrl != null) {
            calendarButton = """
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr><td align="center" style="padding:0 0 16px;">
                            <a href="%s" target="_blank"
                               style="display:inline-block;padding:14px 48px;background:#FFFFFF;
                                      color:#374151;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;
                                      border:1px solid #D1D5DB;">
                              📅 Google 캘린더에 추가
                            </a>
                          </td></tr>
                        </table>
                """.formatted(calendarUrl);
        }

        return """
            <!DOCTYPE html>
            <html lang="ko">
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#F3F4F6;font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr><td align="center">
                  <table width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.3);overflow:hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background:#374151;padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:700;">VenueOn</h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">결제 완료</p>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">결제가 완료되었습니다 🎉</h2>
                        <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">
                          %s님, 아래 내용으로 결제가 정상 처리되었습니다.
                        </p>
                        <!-- Order Summary Table -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-radius:8px;padding:20px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:8px 16px;font-size:13px;color:#6B7280;">주문명</td>
                            <td style="padding:8px 16px;font-size:14px;color:#111827;font-weight:600;text-align:right;">%s</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 16px;font-size:13px;color:#6B7280;">수량</td>
                            <td style="padding:8px 16px;font-size:14px;color:#111827;font-weight:600;text-align:right;">%d건</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 16px;font-size:13px;color:#6B7280;border-top:1px solid #D1D5DB;">결제 금액</td>
                            <td style="padding:8px 16px;font-size:18px;color:#111827;font-weight:700;text-align:right;border-top:1px solid #D1D5DB;">₩%s</td>
                          </tr>
                        </table>
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr><td align="center" style="padding:8px 0 16px;">
                            <a href="%s"
                               style="display:inline-block;padding:14px 48px;background:#374151;
                                      color:#FFFFFF;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">
                              내 결제 내역 보기
                            </a>
                          </td></tr>
                        </table>
                        %s
                        <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.5;">
                          문의사항이 있으시면 마이페이지 &gt; 고객센터를 이용해 주세요.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px;background:#F3F4F6;text-align:center;border-top:1px solid #D1D5DB;">
                        <p style="margin:0;font-size:12px;color:#9CA3AF;">© 2026 VenueOn. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(customerName, orderName, itemCount, formattedAmount, ordersUrl, calendarButton);
    }
}

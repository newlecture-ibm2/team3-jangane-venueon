package com.venueon.admin.user.adapter.in.web.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class AdminSummaryResponse {
    private long newUserCount;      
    private long newHostCount;      
    private long newEventCount;     
    private long totalUserCount;    
    private long totalHostCount;    
    
    private List<DailyTrend> trends; // 최근 7일간의 일자별 통계

    @Getter
    @Builder
    public static class DailyTrend {
        private String date;        // "Mon", "Tue" 또는 "04-15"
        private long users;
        private long hosts;
        private long events;
    }
}

package com.venueon.admin.community.adapter.in.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice(assignableTypes = AdminCommunityController.class)
public class AdminCommunityExceptionHandler {

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<String> handleAllExceptions(Throwable ex) {
        StringBuilder sb = new StringBuilder();
        sb.append("ERROR: ").append(ex.toString()).append("\n");
        
        Throwable cause = ex.getCause();
        while (cause != null) {
            sb.append("CAUSED BY: ").append(cause.toString()).append("\n");
            cause = cause.getCause();
        }

        // 전체 스택트레이스를 앞 10줄만 첨부
        StackTraceElement[] trace = ex.getStackTrace();
        for (int i = 0; i < Math.min(10, trace.length); i++) {
            sb.append(trace[i].toString()).append("\n");
        }

        return ResponseEntity.status(500).body(sb.toString());
    }
}

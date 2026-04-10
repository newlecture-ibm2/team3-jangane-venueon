package com.venueon.order.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class CreateBatchOrderRequest {

    @NotNull(message = "장바구니 항목 ID 목록은 필수입니다.")
    @Size(min = 1, message = "최소 1개 이상의 장바구니 항목이 필요합니다.")
    private List<Long> cartIds;

    @NotBlank(message = "결제 수단은 필수입니다.")
    private String paymentMethod;
}

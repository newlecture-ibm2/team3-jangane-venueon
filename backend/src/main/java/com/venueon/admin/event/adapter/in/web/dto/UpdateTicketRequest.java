package com.venueon.admin.event.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateTicketRequest {
    @NotBlank(message = "티켓 이름은 필수입니다.")
    private String name;

    private String description;

    @NotNull(message = "가격 정보는 필수입니다.")
    private int price;

    private int originalPrice;
    private Integer maxQuantity;
    private boolean isActive;
}

package com.venueon.wishlist.adapter.in.web;
import com.venueon.common.dto.ApiResponse;
import com.venueon.wishlist.application.port.in.GetWishlistUseCase;
import com.venueon.wishlist.application.port.in.ToggleWishlistUseCase;
import com.venueon.wishlist.adapter.in.web.dto.WishlistResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/wishlists")
@RequiredArgsConstructor
public class WishlistController {
    private final ToggleWishlistUseCase toggleWishlistUseCase;
    private final GetWishlistUseCase getWishlistUseCase;

    private Long getUserId(Long principalId) {
        return principalId != null ? principalId : 1L; // Fallback mock userId
    }

    @PostMapping("/events/{eventId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleWishlist(
            @PathVariable Long eventId,
            @AuthenticationPrincipal Long userId) {
        boolean isAdded = toggleWishlistUseCase.toggle(getUserId(userId), eventId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isWishlisted", isAdded)));
    }

    @GetMapping("/events/{eventId}/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkWishlist(
            @PathVariable Long eventId,
            @AuthenticationPrincipal Long userId) {
        boolean exists = getWishlistUseCase.checkWishlist(getUserId(userId), eventId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isWishlisted", exists)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<WishlistResponse>>> getMyWishlist(
            @AuthenticationPrincipal Long userId,
            @PageableDefault(size = 8) Pageable pageable) {
        Page<WishlistResponse> res = getWishlistUseCase.getWishlist(getUserId(userId), pageable);
        return ResponseEntity.ok(ApiResponse.success(res));
    }
}

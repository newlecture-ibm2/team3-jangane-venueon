package com.venueon.user.application.port.in;

public interface UpdateUserPasswordUseCase {
    void updatePassword(String email, String currentPassword, String newPassword);
}

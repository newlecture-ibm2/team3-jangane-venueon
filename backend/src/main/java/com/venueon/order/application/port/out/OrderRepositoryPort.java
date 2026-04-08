package com.venueon.order.application.port.out;

import com.venueon.order.domain.model.Order;
import com.venueon.order.domain.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface OrderRepositoryPort {
    
    Order save(Order order);
    
    Optional<Order> findById(Long id);
    
    Optional<Order> findByTossOrderId(String tossOrderId);
    
    List<Order> findByUserIdAndEventIdAndStatusIn(Long userId, Long eventId, List<OrderStatus> statuses);
    
    List<Order> findByUserIdAndSessionIdAndStatusIn(Long userId, Long sessionId, List<OrderStatus> statuses);
    
    long countByEventIdAndStatusIn(Long eventId, List<OrderStatus> statuses);
    
    long countBySessionIdAndStatusIn(Long sessionId, List<OrderStatus> statuses);
    
    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findValidOrdersByUserId(Long userId, Pageable pageable);
}

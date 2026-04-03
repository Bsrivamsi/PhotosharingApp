package com.photoshare.repository;

import com.photoshare.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long>, JpaSpecificationExecutor<ActivityLog> {
    List<ActivityLog> findByUserId(Long userId);
    List<ActivityLog> findByAction(String action);
    List<ActivityLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<ActivityLog> findAllByOrderByTimestampDesc();
}

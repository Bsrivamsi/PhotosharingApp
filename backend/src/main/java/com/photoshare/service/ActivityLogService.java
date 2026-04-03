package com.photoshare.service;

import com.photoshare.model.ActivityLog;
import com.photoshare.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@SuppressWarnings("null")
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public ActivityLog logActivity(Long userId, String username, String action, String details, String ipAddress) {
        ActivityLog log = new ActivityLog(userId, username, action, details, ipAddress);
        return activityLogRepository.save(log);
    }

    public List<ActivityLog> getActivityLogs() {
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }

    public Page<ActivityLog> getActivityLogsPage(Integer page, Integer size, String q, String action) {
        int safePage = page == null || page < 0 ? 0 : page;
        int safeSize = size == null || size < 1 ? 10 : Math.min(size, 100);

        Specification<ActivityLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String likeQuery = "%" + q.toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), likeQuery),
                        cb.like(cb.lower(root.get("action")), likeQuery),
                        cb.like(cb.lower(root.get("details")), likeQuery)
                ));
            }
            if (action != null && !action.isBlank() && !"ALL".equalsIgnoreCase(action)) {
                predicates.add(cb.equal(cb.upper(root.get("action")), action.toUpperCase(Locale.ROOT)));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "timestamp"));
        return activityLogRepository.findAll(spec, pageable);
    }

    public List<ActivityLog> getUserActivityLogs(Long userId) {
        return activityLogRepository.findByUserId(userId);
    }

    public List<ActivityLog> getActivityLogsByAction(String action) {
        return activityLogRepository.findByAction(action);
    }

    public List<ActivityLog> getActivityLogsByTimeRange(LocalDateTime start, LocalDateTime end) {
        return activityLogRepository.findByTimestampBetween(start, end);
    }

    public Map<String, Object> deleteAllLogs() {
        long count = activityLogRepository.count();
        activityLogRepository.deleteAll();
        return Map.of("deletedCount", count);
    }

    public void deleteLogById(Long id) {
        activityLogRepository.deleteById(id);
    }
}

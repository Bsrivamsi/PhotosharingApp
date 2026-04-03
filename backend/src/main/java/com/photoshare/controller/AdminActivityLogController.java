package com.photoshare.controller;

import com.photoshare.model.ActivityLog;
import com.photoshare.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/activity-logs")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<?> getActivityLogs(@RequestParam(defaultValue = "0") Integer page,
                                             @RequestParam(defaultValue = "10") Integer size,
                                             @RequestParam(required = false) String q,
                                             @RequestParam(required = false) String action) {
        try {
            Page<ActivityLog> logsPage = activityLogService.getActivityLogsPage(page, size, q, action);
            Map<String, Object> response = Map.of(
                    "totalLogs", logsPage.getTotalElements(),
                    "logs", logsPage.getContent(),
                    "page", logsPage.getNumber(),
                    "size", logsPage.getSize(),
                    "totalPages", logsPage.getTotalPages()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserActivityLogs(@PathVariable Long userId) {
        try {
            List<ActivityLog> logs = activityLogService.getUserActivityLogs(userId);
            Map<String, Object> response = Map.of(
                    "userId", userId,
                    "logs", logs
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<?> getActivityLogsByAction(@PathVariable String action) {
        try {
            List<ActivityLog> logs = activityLogService.getActivityLogsByAction(action);
            Map<String, Object> response = Map.of(
                    "action", action,
                    "logs", logs
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/range")
    public ResponseEntity<?> getActivityLogsByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        try {
            List<ActivityLog> logs = activityLogService.getActivityLogsByTimeRange(start, end);
            Map<String, Object> response = Map.of(
                    "startTime", start,
                    "endTime", end,
                    "logs", logs
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllActivityLogs() {
        try {
            return ResponseEntity.ok(activityLogService.deleteAllLogs());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteActivityLogById(@PathVariable Long id) {
        try {
            activityLogService.deleteLogById(id);
            return ResponseEntity.ok(Map.of("message", "Activity log deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}

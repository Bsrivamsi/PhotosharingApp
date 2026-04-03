package com.photoshare.model;

import jakarta.persistence.*;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String username;
    private String action; // LOGIN, DELETE_USER, DELETE_PHOTO, EDIT_PHOTO, DELETE_CATEGORY, etc.
    private String details; // JSON or additional info
    private String ipAddress;
    private java.time.LocalDateTime timestamp = java.time.LocalDateTime.now();

    public ActivityLog() {
    }

    public ActivityLog(Long userId, String username, String action, String details, String ipAddress) {
        this.userId = userId;
        this.username = username;
        this.action = action;
        this.details = details;
        this.ipAddress = ipAddress;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public java.time.LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(java.time.LocalDateTime timestamp) { this.timestamp = timestamp; }
}

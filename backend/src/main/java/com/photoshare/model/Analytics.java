package com.photoshare.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "analytics")
public class Analytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private Long totalVisitors = 0L;
    private Long totalLogins = 0L;
    private Long photosUploaded = 0L;
    private Long photosShared = 0L;
    private Long totalUsersCreated = 0L;
    private Long anonymousVisitors = 0L;

    public Analytics() {
    }

    public Analytics(LocalDate date) {
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getTotalVisitors() {
        return totalVisitors;
    }

    public void setTotalVisitors(Long totalVisitors) {
        this.totalVisitors = totalVisitors;
    }

    public Long getTotalLogins() {
        return totalLogins;
    }

    public void setTotalLogins(Long totalLogins) {
        this.totalLogins = totalLogins;
    }

    public Long getPhotosUploaded() {
        return photosUploaded;
    }

    public void setPhotosUploaded(Long photosUploaded) {
        this.photosUploaded = photosUploaded;
    }

    public Long getPhotosShared() {
        return photosShared;
    }

    public void setPhotosShared(Long photosShared) {
        this.photosShared = photosShared;
    }

    public Long getTotalUsersCreated() {
        return totalUsersCreated;
    }

    public void setTotalUsersCreated(Long totalUsersCreated) {
        this.totalUsersCreated = totalUsersCreated;
    }

    public Long getAnonymousVisitors() {
        return anonymousVisitors;
    }

    public void setAnonymousVisitors(Long anonymousVisitors) {
        this.anonymousVisitors = anonymousVisitors;
    }
}

package com.photoshare.dto;

import java.time.LocalDateTime;

public class PhotoDto {
    private Long id;
    private String title;
    private String description;
    private String uploader;
    private String thumbnailUrl;
    private String photoUrl;
    private LocalDateTime uploadedAt;

    public PhotoDto() {
    }

    public PhotoDto(Long id, String title, String description, String uploader, String thumbnailUrl, String photoUrl, LocalDateTime uploadedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.uploader = uploader;
        this.thumbnailUrl = thumbnailUrl;
        this.photoUrl = photoUrl;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUploader() {
        return uploader;
    }

    public void setUploader(String uploader) {
        this.uploader = uploader;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}

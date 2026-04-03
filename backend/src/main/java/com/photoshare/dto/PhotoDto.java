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
    private String category;
    private Integer shareCount;
    private Integer downloadCount;
    private Long likeCount;
    private Long commentCount;
    private Boolean isLikedByCurrentUser;

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

    public PhotoDto(Long id, String title, String description, String uploader, String thumbnailUrl, String photoUrl, LocalDateTime uploadedAt, String category, Integer shareCount, Integer downloadCount) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.uploader = uploader;
        this.thumbnailUrl = thumbnailUrl;
        this.photoUrl = photoUrl;
        this.uploadedAt = uploadedAt;
        this.category = category;
        this.shareCount = shareCount;
        this.downloadCount = downloadCount;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getShareCount() {
        return shareCount;
    }

    public void setShareCount(Integer shareCount) {
        this.shareCount = shareCount;
    }

    public Integer getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(Integer downloadCount) {
        this.downloadCount = downloadCount;
    }

    public Long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(Long likeCount) {
        this.likeCount = likeCount;
    }

    public Long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(Long commentCount) {
        this.commentCount = commentCount;
    }

    public Boolean getIsLikedByCurrentUser() {
        return isLikedByCurrentUser;
    }

    public void setIsLikedByCurrentUser(Boolean isLikedByCurrentUser) {
        this.isLikedByCurrentUser = isLikedByCurrentUser;
    }
}

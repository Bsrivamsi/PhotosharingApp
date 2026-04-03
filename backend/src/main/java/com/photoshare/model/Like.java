package com.photoshare.model;

import jakarta.persistence.*;

@Entity
@Table(name = "likes", uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "photo_id"})})
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "photo_id", nullable = false)
    private Photo photo;

    private java.time.LocalDateTime likedAt = java.time.LocalDateTime.now();

    public Like() {
    }

    public Like(User user, Photo photo) {
        this.user = user;
        this.photo = photo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Photo getPhoto() { return photo; }
    public void setPhoto(Photo photo) { this.photo = photo; }
    public java.time.LocalDateTime getLikedAt() { return likedAt; }
    public void setLikedAt(java.time.LocalDateTime likedAt) { this.likedAt = likedAt; }
}

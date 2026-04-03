package com.photoshare.model;

import jakarta.persistence.*;

@Entity
@Table(name = "follows", uniqueConstraints = {@UniqueConstraint(columnNames = {"follower_id", "following_id"})})
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @ManyToOne
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    private java.time.LocalDateTime followedAt = java.time.LocalDateTime.now();

    public Follow() {
    }

    public Follow(User follower, User following) {
        this.follower = follower;
        this.following = following;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getFollower() { return follower; }
    public void setFollower(User follower) { this.follower = follower; }
    public User getFollowing() { return following; }
    public void setFollowing(User following) { this.following = following; }
    public java.time.LocalDateTime getFollowedAt() { return followedAt; }
    public void setFollowedAt(java.time.LocalDateTime followedAt) { this.followedAt = followedAt; }
}

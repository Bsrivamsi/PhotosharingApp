package com.photoshare.dto;

public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private String profileBio;
    private String profilePhoto;
    private String role;
    private Boolean isActive;

    public UserProfileDto() {
    }

    public UserProfileDto(Long id, String username, String email, String profileBio, String profilePhoto, String role, Boolean isActive) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.profileBio = profileBio;
        this.profilePhoto = profilePhoto;
        this.role = role;
        this.isActive = isActive;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProfileBio() { return profileBio; }
    public void setProfileBio(String profileBio) { this.profileBio = profileBio; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

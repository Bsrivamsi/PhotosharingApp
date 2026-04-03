package com.photoshare.dto;

public class FeedbackRequestDto {
    private String email;
    private String name;
    private String message;
    private Integer rating;

    public FeedbackRequestDto() {
    }

    public FeedbackRequestDto(String email, String name, String message, Integer rating) {
        this.email = email;
        this.name = name;
        this.message = message;
        this.rating = rating;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}

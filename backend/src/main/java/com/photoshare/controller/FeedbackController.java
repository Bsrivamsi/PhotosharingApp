package com.photoshare.controller;

import com.photoshare.dto.FeedbackRequestDto;
import com.photoshare.model.Feedback;
import com.photoshare.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Map<String, String>> submitFeedback(@RequestBody FeedbackRequestDto request,
                                                              Authentication authentication) {
        Long userId = null;
        if (authentication != null && authentication.getName() != null) {
            userId = (long) authentication.getName().hashCode();
        }

        feedbackService.saveFeedback(userId, request.getEmail(), request.getName(), request.getMessage(), request.getRating());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Feedback submitted successfully"));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}

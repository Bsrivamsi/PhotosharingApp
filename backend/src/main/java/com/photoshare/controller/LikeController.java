package com.photoshare.controller;

import com.photoshare.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = "*")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            likeService.toggleLike(id, username);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Like toggled successfully");
            response.put("likeCount", likeService.getLikeCount(id));
            response.put("isLiked", likeService.isLikedByUser(id, username));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/likes")
    public ResponseEntity<?> getLikeCount(@PathVariable Long id) {
        try {
            Long likeCount = likeService.getLikeCount(id);
            Map<String, Object> response = new HashMap<>();
            response.put("photoId", id);
            response.put("likeCount", likeCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/likes/check")
    public ResponseEntity<?> checkIfLiked(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            Boolean isLiked = likeService.isLikedByUser(id, username);
            Map<String, Object> response = new HashMap<>();
            response.put("photoId", id);
            response.put("isLiked", isLiked);
            response.put("likeCount", likeService.getLikeCount(id));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}

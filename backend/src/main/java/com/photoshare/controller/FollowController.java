package com.photoshare.controller;

import com.photoshare.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping("/{username}/follow")
    public ResponseEntity<?> toggleFollow(@PathVariable String username, Authentication authentication) {
        try {
            String followerUsername = authentication.getName();
            followService.toggleFollow(followerUsername, username);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Follow toggled successfully");
            response.put("followersCount", followService.getFollowersCount(username));
            response.put("isFollowing", followService.isFollowing(followerUsername, username));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<?> getFollowersCount(@PathVariable String username) {
        try {
            Long followersCount = followService.getFollowersCount(username);
            Long followingCount = followService.getFollowingCount(username);
            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("followersCount", followersCount);
            response.put("followingCount", followingCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{username}/followers/check")
    public ResponseEntity<?> checkIfFollowing(@PathVariable String username, Authentication authentication) {
        try {
            String followerUsername = authentication.getName();
            Boolean isFollowing = followService.isFollowing(followerUsername, username);
            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("isFollowing", isFollowing);
            response.put("followersCount", followService.getFollowersCount(username));
            response.put("followingCount", followService.getFollowingCount(username));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}

package com.photoshare.controller;

import com.photoshare.model.Comment;
import com.photoshare.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/photo/{photoId}")
    public ResponseEntity<?> addComment(@PathVariable Long photoId, @RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String username = authentication.getName();
            String text = request.get("text");
            Comment comment = commentService.addComment(photoId, username, text);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable Long commentId, @RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            Comment comment = commentService.updateComment(commentId, text);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        try {
            commentService.deleteComment(commentId);
            return ResponseEntity.ok("Comment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/photo/{photoId}")
    public ResponseEntity<?> getPhotoComments(@PathVariable Long photoId) {
        try {
            List<Comment> comments = commentService.getPhotoComments(photoId);
            Map<String, Object> response = new HashMap<>();
            response.put("photoId", photoId);
            response.put("commentCount", comments.size());
            response.put("comments", comments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/photo/{photoId}/all")
    public ResponseEntity<?> getAllPhotoComments(@PathVariable Long photoId) {
        try {
            List<Comment> comments = commentService.getAllComments(photoId);
            Map<String, Object> response = new HashMap<>();
            response.put("photoId", photoId);
            response.put("totalComments", comments.size());
            response.put("comments", comments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{commentId}/approve")
    public ResponseEntity<?> approveComment(@PathVariable Long commentId) {
        try {
            Comment comment = commentService.approveComment(commentId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{commentId}/reject")
    public ResponseEntity<?> rejectComment(@PathVariable Long commentId) {
        try {
            Comment comment = commentService.rejectComment(commentId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}

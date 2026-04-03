package com.photoshare.service;

import com.photoshare.model.Comment;
import com.photoshare.model.Photo;
import com.photoshare.model.User;
import com.photoshare.repository.CommentRepository;
import com.photoshare.repository.PhotoRepository;
import com.photoshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private UserRepository userRepository;

    public Comment addComment(Long photoId, String username, String text) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new RuntimeException("Photo not found"));

        Comment comment = new Comment(user, photo, text);
        return commentRepository.save(comment);
    }

    public Comment updateComment(Long commentId, String text) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setText(text);
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    public List<Comment> getPhotoComments(Long photoId) {
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new RuntimeException("Photo not found"));
        return commentRepository.findByPhotoAndIsApproved(photo, true);
    }

    public List<Comment> getAllComments(Long photoId) {
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new RuntimeException("Photo not found"));
        return commentRepository.findByPhoto(photo);
    }

    public Comment approveComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setIsApproved(true);
        return commentRepository.save(comment);
    }

    public Comment rejectComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setIsApproved(false);
        return commentRepository.save(comment);
    }

    public Long getCommentCount(Long photoId) {
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new RuntimeException("Photo not found"));
        return commentRepository.countByPhoto(photo);
    }
}

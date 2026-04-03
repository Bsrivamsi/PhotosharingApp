package com.photoshare.repository;

import com.photoshare.model.Comment;
import com.photoshare.model.Photo;
import com.photoshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPhoto(Photo photo);
    List<Comment> findByUser(User user);
    List<Comment> findByPhotoAndIsApproved(Photo photo, Boolean isApproved);
    Long countByPhoto(Photo photo);
}

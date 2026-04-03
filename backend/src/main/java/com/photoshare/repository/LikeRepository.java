package com.photoshare.repository;

import com.photoshare.model.Like;
import com.photoshare.model.Photo;
import com.photoshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPhoto(User user, Photo photo);
    List<Like> findByPhoto(Photo photo);
    List<Like> findByUser(User user);
    Long countByPhoto(Photo photo);
}

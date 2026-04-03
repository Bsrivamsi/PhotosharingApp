package com.photoshare.service;

import com.photoshare.model.Like;
import com.photoshare.model.Photo;
import com.photoshare.model.User;
import com.photoshare.repository.LikeRepository;
import com.photoshare.repository.PhotoRepository;
import com.photoshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private UserRepository userRepository;

    public Like toggleLike(Long photoId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new RuntimeException("Photo not found"));

        Like existingLike = likeRepository.findByUserAndPhoto(user, photo).orElse(null);
        
        if (existingLike != null) {
            likeRepository.delete(existingLike);
            return null; // Unlike
        }

        Like newLike = new Like(user, photo);
        return likeRepository.save(newLike);
    }

    public Long getLikeCount(Long photoId) {
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new RuntimeException("Photo not found"));
        return likeRepository.countByPhoto(photo);
    }

    public Boolean isLikedByUser(Long photoId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new RuntimeException("Photo not found"));
        return likeRepository.findByUserAndPhoto(user, photo).isPresent();
    }
}

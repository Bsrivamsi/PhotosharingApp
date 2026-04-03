package com.photoshare.service;

import com.photoshare.model.Follow;
import com.photoshare.model.User;
import com.photoshare.repository.FollowRepository;
import com.photoshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FollowService {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    public Follow toggleFollow(String followerUsername, String followingUsername) {
        User follower = userRepository.findByUsername(followerUsername)
            .orElseThrow(() -> new RuntimeException("Follower not found"));
        User following = userRepository.findByUsername(followingUsername)
            .orElseThrow(() -> new RuntimeException("User to follow not found"));

        if (follower.getId().equals(following.getId())) {
            throw new RuntimeException("Cannot follow yourself");
        }

        Follow existingFollow = followRepository.findByFollowerAndFollowing(follower, following).orElse(null);
        
        if (existingFollow != null) {
            followRepository.delete(existingFollow);
            return null; // Unfollow
        }

        Follow newFollow = new Follow(follower, following);
        return followRepository.save(newFollow);
    }

    public Long getFollowersCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepository.countByFollowing(user);
    }

    public Long getFollowingCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepository.countByFollower(user);
    }

    public Boolean isFollowing(String followerUsername, String followingUsername) {
        User follower = userRepository.findByUsername(followerUsername)
            .orElseThrow(() -> new RuntimeException("Follower not found"));
        User following = userRepository.findByUsername(followingUsername)
            .orElseThrow(() -> new RuntimeException("User to follow not found"));
        return followRepository.findByFollowerAndFollowing(follower, following).isPresent();
    }

    public List<Follow> getFollowers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepository.findByFollowing(user);
    }

    public List<Follow> getFollowing(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepository.findByFollower(user);
    }
}

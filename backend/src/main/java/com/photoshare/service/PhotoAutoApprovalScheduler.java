package com.photoshare.service;

import com.photoshare.model.Photo;
import com.photoshare.repository.PhotoRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Automatically approves photos that have been in PENDING state
 * for more than 30 seconds without admin action.
 */
@Component
public class PhotoAutoApprovalScheduler {

    private static final int AUTO_APPROVE_AFTER_SECONDS = 30;

    private final PhotoRepository photoRepository;

    public PhotoAutoApprovalScheduler(PhotoRepository photoRepository) {
        this.photoRepository = photoRepository;
    }

    /**
     * Runs every 10 seconds. Finds all PENDING photos whose uploadedAt timestamp
     * is older than AUTO_APPROVE_AFTER_SECONDS and auto-approves them.
     */
    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void autoApprovePendingPhotos() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(AUTO_APPROVE_AFTER_SECONDS);
        List<Photo> expiredPhotos = photoRepository
                .findByApprovalStatusAndUploadedAtBefore("PENDING", cutoff);

        if (!expiredPhotos.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            for (Photo photo : expiredPhotos) {
                photo.setApprovalStatus("APPROVED");
                photo.setReviewedBy("AUTO_APPROVAL");
                photo.setReviewedAt(now);
                photo.setReviewNotes("Auto-approved after " + AUTO_APPROVE_AFTER_SECONDS
                        + "-second admin review window expired.");
            }
            photoRepository.saveAll(expiredPhotos);
            System.out.println("[AutoApproval] Auto-approved " + expiredPhotos.size()
                    + " photo(s) — admin review window expired.");
        }
    }
}

package com.photoshare.repository;

import com.photoshare.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long>, JpaSpecificationExecutor<Photo> {
    List<Photo> findAllByOrderByUploadedAtDesc();
    List<Photo> findAllByApprovalStatusOrderByUploadedAtDesc(String approvalStatus);
    List<Photo> findByCategory(String category);
    List<Photo> findByCategoryIgnoreCase(String category);
    List<Photo> findByUploader(String uploader);
    List<Photo> findByApprovalStatusAndUploadedAtBefore(String approvalStatus, LocalDateTime cutoff);
}

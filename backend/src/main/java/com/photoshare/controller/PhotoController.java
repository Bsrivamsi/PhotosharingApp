package com.photoshare.controller;

import com.photoshare.dto.PhotoDto;
import com.photoshare.model.Photo;
import com.photoshare.repository.PhotoRepository;
import com.photoshare.service.PhotoService;
import com.photoshare.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = "*")
public class PhotoController {

    private final PhotoService photoService;
    private final PhotoRepository photoRepository;
    
    @Autowired
    private AnalyticsService analyticsService;

    public PhotoController(PhotoService photoService,
                           PhotoRepository photoRepository) {
        this.photoService = photoService;
        this.photoRepository = photoRepository;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPhoto(
            @RequestPart("file") MultipartFile file,
            @RequestPart("title") String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "category", required = false) String category,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        photoService.storePhoto(file, title, description, userDetails.getUsername(), category);
        analyticsService.recordPhotoUpload();
        return ResponseEntity.ok("Photo uploaded successfully");
    }

    @GetMapping
    public List<PhotoDto> listPhotos() {
        return photoRepository.findAllByOrderByUploadedAtDesc().stream()
                .filter(this::isPubliclyVisible)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<PhotoDto>> getPhotosByCategory(@PathVariable String category) {
        List<PhotoDto> photos = photoRepository.findByCategoryIgnoreCase(category).stream()
                .filter(this::isPubliclyVisible)
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(photos);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<PhotoDto>> getPhotosByUser(@PathVariable String username) {
        List<PhotoDto> photos = photoRepository.findByUploader(username).stream()
                .filter(this::isPubliclyVisible)
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(photos);
    }

    @PostMapping("/{id}/download")
    public ResponseEntity<Map<String, String>> downloadPhoto(@PathVariable Long id) {
        photoService.incrementDownloadCount(id);
        analyticsService.recordPhotoShare(); // Track as interaction
        return ResponseEntity.ok(Map.of("message", "Download recorded"));
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<Map<String, String>> sharePhoto(@PathVariable Long id) {
        photoService.incrementShareCount(id);
        analyticsService.recordPhotoShare();
        return ResponseEntity.ok(Map.of("message", "Share recorded"));
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        Resource resource = photoService.loadFileAsResource(filename);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("image/jpeg"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/search")
    public ResponseEntity<List<PhotoDto>> searchPhotos(@RequestParam String keyword) {
        String normalizedKeyword = keyword.toLowerCase();
        List<PhotoDto> photos = photoRepository.findAll().stream()
            .filter(this::isPubliclyVisible)
            .filter(p -> p.getTitle().toLowerCase().contains(normalizedKeyword)
                  || (p.getDescription() != null && p.getDescription().toLowerCase().contains(normalizedKeyword))
                  || p.getUploader().toLowerCase().contains(normalizedKeyword)
                  || (p.getCategory() != null && p.getCategory().toLowerCase().contains(normalizedKeyword)))
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(photos);
    }

    private boolean isPubliclyVisible(Photo photo) {
        String status = photo.getApprovalStatus();
        return status == null || Objects.equals(status, "APPROVED");
    }

    private PhotoDto toDto(Photo photo) {
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        String thumbnailUrl = baseUrl + "/api/photos/files/" + photo.getThumbnailFilename();
        String photoUrl = baseUrl + "/api/photos/files/" + photo.getOriginalFilename();
        return new PhotoDto(photo.getId(), photo.getTitle(), photo.getDescription(), photo.getUploader(), 
                           thumbnailUrl, photoUrl, photo.getUploadedAt(), photo.getCategory(), 
                           photo.getShareCount(), photo.getDownloadCount());
    }
}

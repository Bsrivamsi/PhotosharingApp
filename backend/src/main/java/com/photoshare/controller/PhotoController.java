package com.photoshare.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.photoshare.dto.PhotoDto;
import com.photoshare.model.Photo;
import com.photoshare.repository.PhotoRepository;
import com.photoshare.service.PhotoService;

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = "*")
public class PhotoController {

    private final PhotoService photoService;
    private final PhotoRepository photoRepository;

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
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        photoService.storePhoto(file, title, description, userDetails.getUsername());
        return ResponseEntity.ok("Photo uploaded successfully");
    }

    @GetMapping
    public List<PhotoDto> listPhotos() {
        return photoRepository.findAllByOrderByUploadedAtDesc().stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        Resource resource = photoService.loadFileAsResource(filename);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    private PhotoDto toDto(Photo photo) {
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        String thumbnailUrl = baseUrl + "/api/photos/files/" + photo.getThumbnailFilename();
        String photoUrl = baseUrl + "/api/photos/files/" + photo.getOriginalFilename();
        return new PhotoDto(photo.getId(), photo.getTitle(), photo.getDescription(), photo.getUploader(), thumbnailUrl, photoUrl, photo.getUploadedAt());
    }
}

package com.photoshare.service;

import com.photoshare.model.Photo;
import com.photoshare.repository.PhotoRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import net.coobird.thumbnailator.Thumbnails;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PhotoService {

    private final Path storageLocation;
    private final Path thumbnailLocation;
    private final PhotoRepository photoRepository;

    public PhotoService(@Value("${photos.storage.location}") String storagePath,
                        @Value("${photos.thumbnail.location}") String thumbnailPath,
                        PhotoRepository photoRepository) {
        this.storageLocation = Paths.get(storagePath).toAbsolutePath().normalize();
        this.thumbnailLocation = Paths.get(thumbnailPath).toAbsolutePath().normalize();
        this.photoRepository = photoRepository;
    }

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(storageLocation);
        Files.createDirectories(thumbnailLocation);
    }

    public void storePhoto(MultipartFile file, String title, String description, String uploader) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String storedFilename = UUID.randomUUID().toString() + (extension != null ? "." + extension : "");
        String thumbnailFilename = "thumb-" + storedFilename;

        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Cannot upload empty file");
            }
            Path targetLocation = storageLocation.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation);

            Path thumbnailPath = thumbnailLocation.resolve(thumbnailFilename);
            Thumbnails.of(targetLocation.toFile())
                    .size(300, 200)
                    .keepAspectRatio(true)
                    .toFile(thumbnailPath.toFile());

            Photo photo = new Photo(title, description, storedFilename, thumbnailFilename, uploader);
            photo.setUploadedAt(LocalDateTime.now());
            photoRepository.save(photo);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store photo: " + ex.getMessage(), ex);
        }
    }

    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = storageLocation.resolve(filename).normalize();
            if (!Files.exists(filePath)) {
                filePath = thumbnailLocation.resolve(filename).normalize();
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found " + filename);
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + filename, ex);
        }
    }
}

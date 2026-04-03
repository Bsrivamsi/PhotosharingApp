package com.photoshare.service;

import com.photoshare.model.Category;
import com.photoshare.model.Photo;
import com.photoshare.repository.PhotoRepository;
import jakarta.annotation.PostConstruct;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
public class PhotoService {

    private final Path storageLocation;
    private final Path thumbnailLocation;
    private final PhotoRepository photoRepository;
    private final CategoryService categoryService;

    public PhotoService(@Value("${photos.storage.location}") String storagePath,
                        @Value("${photos.thumbnail.location}") String thumbnailPath,
                        PhotoRepository photoRepository,
                        CategoryService categoryService) {
        this.storageLocation = Paths.get(storagePath).toAbsolutePath().normalize();
        this.thumbnailLocation = Paths.get(thumbnailPath).toAbsolutePath().normalize();
        this.photoRepository = photoRepository;
        this.categoryService = categoryService;
    }

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(storageLocation);
        Files.createDirectories(thumbnailLocation);
    }

    private String inferCategory(String title, String description, String uploadedCategory) {
        if (uploadedCategory != null && !uploadedCategory.trim().isEmpty()) {
            return categoryService.normalizeCategoryName(uploadedCategory);
        }

        String searchable = ((title == null ? "" : title) + " " + (description == null ? "" : description)).toLowerCase(Locale.ROOT);

        if (searchable.matches(".*(mountain|forest|lake|beach|coast|ocean|river|sunset|sunrise|nature|landscape|tree|sky|flower).*")) {
            return "Nature";
        }
        if (searchable.matches(".*(city|urban|street|building|road|night|neon|downtown).*")) {
            return "Urban";
        }
        if (searchable.matches(".*(portrait|person|people|selfie|face|model|wedding).*")) {
            return "People";
        }
        if (searchable.matches(".*(animal|wildlife|bird|cat|dog|pet|zoo).*")) {
            return "Wildlife";
        }
        if (searchable.matches(".*(food|drink|coffee|restaurant|meal|dessert).*")) {
            return "Food";
        }
        if (searchable.matches(".*(travel|trip|vacation|journey|adventure|kayak|pier|desert).*")) {
            return "Travel";
        }
        return "General";
    }

    public void storePhoto(MultipartFile file, String title, String description, String uploader, String category) {
        String original = file.getOriginalFilename();
        if (original == null || original.isBlank()) {
            original = "photo";
        }
        String originalFilename = StringUtils.cleanPath(original);
        String extension = StringUtils.getFilenameExtension(originalFilename);
        
        // Check if it's a JFIF/JFI file that needs conversion
        boolean isJfif = extension != null && (extension.equalsIgnoreCase("jfif") || extension.equalsIgnoreCase("jfi"));
        if (isJfif) {
            extension = "jpg";
        }
        
        String storedFilename = UUID.randomUUID() + (extension != null ? "." + extension : "");
        String thumbnailFilename = "thumb-" + storedFilename;

        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Cannot upload empty file");
            }

            Path targetLocation = storageLocation.resolve(storedFilename);
            
            // If JFIF, convert to JPG using ImageIO first
            if (isJfif) {
                try {
                    BufferedImage image = ImageIO.read(file.getInputStream());
                    if (image == null) {
                        throw new IOException("Could not read image data from file");
                    }
                    // Write as JPG to ensure compatibility
                    ImageIO.write(image, "jpg", targetLocation.toFile());
                } catch (IOException conversionEx) {
                    // If ImageIO conversion fails, fall back to direct copy
                    System.err.println("ImageIO conversion failed, attempting direct copy: " + conversionEx.getMessage());
                    Files.copy(file.getInputStream(), targetLocation);
                }
            } else {
                Files.copy(file.getInputStream(), targetLocation);
            }

            Path thumbnailPath = thumbnailLocation.resolve(thumbnailFilename);
            try {
                Thumbnails.of(targetLocation.toFile())
                        .size(300, 200)
                        .keepAspectRatio(true)
                        .toFile(thumbnailPath.toFile());
            } catch (Exception ex) {
                System.err.println("Thumbnail generation error: " + ex.getMessage());
                // If thumbnail generation fails, try with explicit output format
                try {
                    String thumbnailName = thumbnailFilename.replaceAll("\\.[^.]+$", "") + ".jpg";
                    Path jpgThumbnailPath = thumbnailLocation.resolve(thumbnailName);
                    Thumbnails.of(targetLocation.toFile())
                            .size(300, 200)
                            .keepAspectRatio(true)
                            .outputFormat("jpg")
                            .toFile(jpgThumbnailPath.toFile());
                } catch (Exception fallbackEx) {
                    // If all thumbnail attempts fail, log warning but continue
                    System.err.println("Warning: Could not generate thumbnail for " + storedFilename + ": " + fallbackEx.getMessage());
                }
            }

            String finalCategory = inferCategory(title, description, category);
            Category resolvedCategory = categoryService.ensureCategoryExists(finalCategory);

            Photo photo = new Photo(title, description, storedFilename, thumbnailFilename, uploader);
            photo.setUploadedAt(LocalDateTime.now());
            photo.setCategory(resolvedCategory.getName());
            photo.setShareCount(0);
            photo.setDownloadCount(0);
            photoRepository.save(photo);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store photo: " + ex.getMessage(), ex);
        }
    }

    public void storePhoto(MultipartFile file, String title, String description, String uploader) {
        storePhoto(file, title, description, uploader, null);
    }

    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = storageLocation.resolve(filename).normalize();
            if (!Files.exists(filePath)) {
                filePath = thumbnailLocation.resolve(filename).normalize();
            }
            Resource resource = new UrlResource(Objects.requireNonNull(filePath.toUri()));
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found " + filename);
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + filename, ex);
        }
    }

    public List<Photo> getPhotosByCategory(String category) {
        return photoRepository.findByCategory(category);
    }

    public void incrementDownloadCount(Long photoId) {
        if (photoId == null) {
            throw new RuntimeException("Photo id is required");
        }
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new RuntimeException("Photo not found"));
        photo.setDownloadCount(photo.getDownloadCount() + 1);
        photoRepository.save(photo);
    }

    public void incrementShareCount(Long photoId) {
        if (photoId == null) {
            throw new RuntimeException("Photo id is required");
        }
        Photo photo = photoRepository.findById(photoId).orElseThrow(() -> new RuntimeException("Photo not found"));
        photo.setShareCount(photo.getShareCount() + 1);
        photoRepository.save(photo);
    }
}

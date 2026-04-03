package com.photoshare.controller;

import com.photoshare.dto.UserProfileDto;
import com.photoshare.model.User;
import com.photoshare.model.Photo;
import com.photoshare.model.Category;
import com.photoshare.repository.UserRepository;
import com.photoshare.repository.PhotoRepository;
import com.photoshare.repository.CategoryRepository;
import com.photoshare.service.CategoryService;
import com.photoshare.service.AnalyticsService;
import com.photoshare.service.ActivityLogService;
import com.photoshare.service.PhotoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@SuppressWarnings("null")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PhotoService photoService;

    // USER MANAGEMENT
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllUsers(@RequestParam(defaultValue = "0") Integer page,
                                                           @RequestParam(defaultValue = "10") Integer size,
                                                           @RequestParam(required = false) String q,
                                                           @RequestParam(required = false) String role) {
        int safePage = sanitizePage(page);
        int safeSize = sanitizeSize(size);

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String likeQuery = "%" + q.toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), likeQuery),
                        cb.like(cb.lower(root.get("email")), likeQuery)
                ));
            }
            if (role != null && !role.isBlank() && !"ALL".equalsIgnoreCase(role)) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"));
        Page<UserProfileDto> usersPage = userRepository.findAll(spec, pageable).map(this::convertToUserProfileDto);
        return ResponseEntity.ok(toPageResponse(usersPage));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileDto> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(convertToUserProfileDto(user));
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String email = payload.get("email");
        String password = payload.get("password");
        String role = payload.getOrDefault("role", "ROLE_USER");
        String bio = payload.getOrDefault("profileBio", "");
        Set<String> allowedRoles = Set.of("ROLE_USER", "ROLE_ADMIN", "ROLE_MODERATOR");
        if (!allowedRoles.contains(role)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role. Use ROLE_USER, ROLE_ADMIN or ROLE_MODERATOR"));
        }


        if (username == null || username.isBlank() || email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "username, email and password are required"));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username already exists"));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
        }

        User user = new User(username.trim(), email.trim(), passwordEncoder.encode(password));
        user.setRole(role);
        user.setProfileBio(bio);
        user.setIsActive(true);

        User created = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToUserProfileDto(created));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileDto> updateUser(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updates.containsKey("profileBio")) {
            user.setProfileBio(updates.get("profileBio"));
        }
        if (updates.containsKey("role")) {
            String role = updates.get("role");
            Set<String> allowedRoles = Set.of("ROLE_USER", "ROLE_ADMIN", "ROLE_MODERATOR");
            if (role != null && allowedRoles.contains(role)) {
                user.setRole(role);
            }
        }
        
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(convertToUserProfileDto(updatedUser));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User deleted (soft delete)"));
    }

    @PostMapping("/users/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> suspendUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setSuspensionEndDate(LocalDateTime.now().plusDays(30));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User suspended for 30 days"));
    }

    @PostMapping("/users/batch-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> batchDeleteUsers(@RequestBody Map<String, List<Long>> payload,
                                                                Authentication authentication,
                                                                HttpServletRequest request) {
        List<Long> ids = payload.get("ids");
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No user ids provided"));
        }

        int updated = 0;
        List<Long> skipped = new ArrayList<>();
        for (Long id : ids) {
            userRepository.findById(id).ifPresentOrElse(user -> {
                user.setIsActive(false);
                userRepository.save(user);
            }, () -> skipped.add(id));
            if (!skipped.contains(id)) {
                updated++;
            }
        }

        activityLogService.logActivity(
                null,
                authentication != null ? authentication.getName() : "system",
                "BATCH_DELETE_USERS",
                "Deleted users count=" + updated,
                request.getRemoteAddr()
        );

        return ResponseEntity.ok(Map.of(
                "message", "Batch user delete completed",
                "deletedCount", updated,
                "skipped", skipped
        ));
    }

    // PHOTO MANAGEMENT
    @GetMapping("/photos")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Map<String, Object>> getAllPhotos(@RequestParam(defaultValue = "0") Integer page,
                                                            @RequestParam(defaultValue = "10") Integer size,
                                                            @RequestParam(required = false) String q,
                                                            @RequestParam(required = false) String status,
                                                            @RequestParam(required = false) String category) {
        int safePage = sanitizePage(page);
        int safeSize = sanitizeSize(size);

        Specification<Photo> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String likeQuery = "%" + q.toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), likeQuery),
                        cb.like(cb.lower(root.get("uploader")), likeQuery),
                        cb.like(cb.lower(root.get("category")), likeQuery)
                ));
            }
            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(cb.upper(root.get("approvalStatus")), status.toUpperCase(Locale.ROOT)));
            }
            if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "uploadedAt"));
        return ResponseEntity.ok(toPageResponse(photoRepository.findAll(spec, pageable)));
    }

    @GetMapping("/photos/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Map<String, Object>> getPendingPhotos(@RequestParam(defaultValue = "0") Integer page,
                                                                @RequestParam(defaultValue = "10") Integer size,
                                                                @RequestParam(required = false) String q) {
        int safePage = sanitizePage(page);
        int safeSize = sanitizeSize(size);

        Specification<Photo> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(cb.upper(root.get("approvalStatus")), "PENDING"));
            if (q != null && !q.isBlank()) {
                String likeQuery = "%" + q.toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), likeQuery),
                        cb.like(cb.lower(root.get("uploader")), likeQuery)
                ));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "uploadedAt"));
        return ResponseEntity.ok(toPageResponse(photoRepository.findAll(spec, pageable)));
    }

    @GetMapping("/photos/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Photo> getPhotoById(@PathVariable Long id) {
        Photo photo = photoRepository.findById(id).orElseThrow(() -> new RuntimeException("Photo not found"));
        return ResponseEntity.ok(photo);
    }

    @PostMapping(value = "/photos/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadPhotoByAdmin(@RequestPart("file") MultipartFile file,
                                                @RequestPart("title") String title,
                                                @RequestPart(value = "description", required = false) String description,
                                                @RequestPart(value = "category", required = false) String category,
                                                @RequestPart(value = "uploader", required = false) String uploader,
                                                Authentication authentication) {
        String finalUploader = (uploader != null && !uploader.isBlank())
                ? uploader.trim()
                : (authentication != null ? authentication.getName() : "admin");

        photoService.storePhoto(file, title, description, finalUploader, category);
        analyticsService.recordPhotoUpload();

        List<Photo> photos = photoRepository.findAllByOrderByUploadedAtDesc();
        Photo latest = photos.isEmpty() ? null : photos.get(0);
        if (latest != null) {
            latest.setApprovalStatus("APPROVED");
            latest.setReviewedBy(authentication != null ? authentication.getName() : "admin");
            latest.setReviewedAt(LocalDateTime.now());
            latest.setReviewNotes("Auto-approved by admin upload");
            photoRepository.save(latest);
        }
        Long latestId = latest != null ? latest.getId() : -1L;
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Photo uploaded successfully",
            "photoId", latestId
        ));
    }

    @DeleteMapping("/photos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deletePhoto(@PathVariable Long id) {
        photoRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Photo deleted"));
    }

    @PostMapping("/photos/batch-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> batchDeletePhotos(@RequestBody Map<String, List<Long>> payload,
                                                                 Authentication authentication,
                                                                 HttpServletRequest request) {
        List<Long> ids = payload.get("ids");
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No photo ids provided"));
        }

        int deleted = 0;
        List<Long> skipped = new ArrayList<>();
        for (Long id : ids) {
            if (photoRepository.existsById(id)) {
                photoRepository.deleteById(id);
                deleted++;
            } else {
                skipped.add(id);
            }
        }

        activityLogService.logActivity(
                null,
                authentication != null ? authentication.getName() : "system",
                "BATCH_DELETE_PHOTOS",
                "Deleted photos count=" + deleted,
                request.getRemoteAddr()
        );

        return ResponseEntity.ok(Map.of(
                "message", "Batch photo delete completed",
                "deletedCount", deleted,
                "skipped", skipped
        ));
    }

    @PutMapping("/photos/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Photo> updatePhoto(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        Photo photo = photoRepository.findById(id).orElseThrow(() -> new RuntimeException("Photo not found"));
        
        if (updates.containsKey("title")) {
            photo.setTitle(updates.get("title"));
        }
        if (updates.containsKey("description")) {
            photo.setDescription(updates.get("description"));
        }
        if (updates.containsKey("category")) {
            photo.setCategory(updates.get("category"));
        }
        
        Photo updatedPhoto = photoRepository.save(photo);
        return ResponseEntity.ok(updatedPhoto);
    }

    @PostMapping("/photos/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Photo> approvePhoto(@PathVariable Long id,
                                              @RequestBody(required = false) Map<String, String> payload,
                                              Authentication authentication) {
        Photo photo = photoRepository.findById(id).orElseThrow(() -> new RuntimeException("Photo not found"));
        photo.setApprovalStatus("APPROVED");
        photo.setReviewedAt(LocalDateTime.now());
        photo.setReviewedBy(authentication != null ? authentication.getName() : "system");
        photo.setReviewNotes(payload != null ? payload.getOrDefault("notes", "") : "");
        return ResponseEntity.ok(photoRepository.save(photo));
    }

    @PostMapping("/photos/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Photo> rejectPhoto(@PathVariable Long id,
                                             @RequestBody(required = false) Map<String, String> payload,
                                             Authentication authentication) {
        Photo photo = photoRepository.findById(id).orElseThrow(() -> new RuntimeException("Photo not found"));
        photo.setApprovalStatus("REJECTED");
        photo.setReviewedAt(LocalDateTime.now());
        photo.setReviewedBy(authentication != null ? authentication.getName() : "system");
        photo.setReviewNotes(payload != null ? payload.getOrDefault("notes", "") : "");
        return ResponseEntity.ok(photoRepository.save(photo));
    }

    // CATEGORY MANAGEMENT
    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Map<String, Object>> getAllCategories(@RequestParam(defaultValue = "0") Integer page,
                                                                @RequestParam(defaultValue = "10") Integer size,
                                                                @RequestParam(required = false) String q) {
        int safePage = sanitizePage(page);
        int safeSize = sanitizeSize(size);

        Specification<Category> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String likeQuery = "%" + q.toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likeQuery),
                        cb.like(cb.lower(root.get("description")), likeQuery)
                ));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "name"));
        return ResponseEntity.ok(toPageResponse(categoryRepository.findAll(spec, pageable)));
    }

    @GetMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, String> request) {
        Category category = categoryService.createCategory(request.get("name"), request.get("description"));
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Category category = categoryService.updateCategory(id, request.get("name"), request.get("description"));
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(Map.of("message", "Category deleted"));
    }

    // ANALYTICS
    @GetMapping("/analytics/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> data = analyticsService.getDashboardData();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/analytics/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAnalyticsHistory() {
        List<Map<String, Object>> history = analyticsService.getAnalyticsHistory().stream()
                .map(analytics -> Map.of(
                        "date", (Object) analytics.getDate(),
                        "totalVisitors", analytics.getTotalVisitors(),
                        "totalLogins", analytics.getTotalLogins(),
                        "photosUploaded", analytics.getPhotosUploaded(),
                        "photosShared", analytics.getPhotosShared(),
                        "anonymousVisitors", analytics.getAnonymousVisitors()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/analytics/export/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> exportAnalyticsCsv() {
        String csv = analyticsService.buildAnalyticsCsv();
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=analytics-report.csv")
                .body(csv);
    }

    private UserProfileDto convertToUserProfileDto(User user) {
        return new UserProfileDto(user.getId(), user.getUsername(), user.getEmail(), 
                                  user.getProfileBio(), user.getProfilePhoto(), 
                                  user.getRole(), user.getIsActive());
    }

    private int sanitizePage(Integer page) {
        if (page == null || page < 0) {
            return 0;
        }
        return page;
    }

    private int sanitizeSize(Integer size) {
        if (size == null || size < 1) {
            return 10;
        }
        return Math.min(size, 100);
    }

    private <T> Map<String, Object> toPageResponse(Page<T> pageData) {
        return Map.of(
                "content", pageData.getContent(),
                "page", pageData.getNumber(),
                "size", pageData.getSize(),
                "totalElements", pageData.getTotalElements(),
                "totalPages", pageData.getTotalPages()
        );
    }
}

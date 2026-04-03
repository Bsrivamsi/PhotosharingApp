package com.photoshare.controller;

import com.photoshare.dto.AuthResponse;
import com.photoshare.dto.LoginRequest;
import com.photoshare.dto.RegisterRequest;
import com.photoshare.dto.UserProfileDto;
import com.photoshare.model.User;
import com.photoshare.repository.UserRepository;
import com.photoshare.security.JwtTokenProvider;
import com.photoshare.service.AnalyticsService;
import com.photoshare.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final Path profilePhotoStorageLocation;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private EmailService emailService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider jwtTokenProvider,
                          @Value("${profiles.storage.location:uploads/profiles}") String profileStoragePath) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.profilePhotoStorageLocation = Paths.get(profileStoragePath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.profilePhotoStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create profile photo storage directory", ex);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        User user = new User(request.getUsername(), request.getEmail(), passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        user.setIsActive(true);
        userRepository.save(user);
        analyticsService.recordUserCreation();
        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());

        String token = jwtTokenProvider.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Validated @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        analyticsService.recordLogin();

        String jwt = jwtTokenProvider.generateToken(authentication.getName());
        return ResponseEntity.ok(new AuthResponse(jwt, authentication.getName(), user.getRole()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(toUserProfileDto(user));
    }

    @PatchMapping("/profile")
    @SuppressWarnings("null")
    public ResponseEntity<UserProfileDto> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> updates) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updates.containsKey("profileBio")) {
            user.setProfileBio(updates.get("profileBio"));
        }
        if (updates.containsKey("profilePhoto")) {
            user.setProfilePhoto(updates.get("profilePhoto"));
        }
        
        return ResponseEntity.ok(toUserProfileDto(userRepository.save(user)));
    }

    @PostMapping(value = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @SuppressWarnings("null")
    public ResponseEntity<?> uploadProfilePhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("file") MultipartFile file) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("Only image files are allowed");
        }

        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String uploadedName = file.getOriginalFilename();
        String originalFilename = StringUtils.cleanPath(
            uploadedName == null || uploadedName.isBlank() ? "profile-image" : uploadedName
        );
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String storedFilename = "profile-" + user.getId() + "-" + UUID.randomUUID() +
                (extension != null && !extension.isBlank() ? "." + extension : "");

        try {
            Path targetLocation = profilePhotoStorageLocation.resolve(storedFilename).normalize();
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String oldPhoto = user.getProfilePhoto();
            if (oldPhoto != null && !oldPhoto.isBlank() && !oldPhoto.startsWith("http") && !oldPhoto.startsWith("data:")) {
                Path oldFilePath = profilePhotoStorageLocation.resolve(oldPhoto).normalize();
                try {
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException ignored) {
                    // Best-effort old file cleanup.
                }
            }

            user.setProfilePhoto(storedFilename);
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(toUserProfileDto(updatedUser));
        } catch (IOException ex) {
            return ResponseEntity.status(500).body("Failed to store profile photo");
        }
    }

    @GetMapping("/profile/photo/{filename:.+}")
    public ResponseEntity<Resource> getProfilePhoto(@PathVariable String filename) {
        try {
            Path filePath = profilePhotoStorageLocation.resolve(filename).normalize();
            if (!filePath.startsWith(profilePhotoStorageLocation)) {
                return ResponseEntity.badRequest().build();
            }

            URI fileUri = filePath.toUri();
            if (fileUri == null) {
                return ResponseEntity.status(500).build();
            }

            Resource resource = new UrlResource(fileUri);
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String detectedType = Files.probeContentType(filePath);
            ResponseEntity.BodyBuilder responseBuilder = ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"");

            if (detectedType != null && !detectedType.isBlank()) {
                responseBuilder.header(HttpHeaders.CONTENT_TYPE, detectedType);
            } else {
                responseBuilder.header(HttpHeaders.CONTENT_TYPE, "application/octet-stream");
            }

            return responseBuilder.body(resource);
        } catch (MalformedURLException ex) {
            return ResponseEntity.notFound().build();
        } catch (IOException ex) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    @PostMapping("/account/suspend")
    public ResponseEntity<Map<String, String>> suspendAccount(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSuspensionEndDate(LocalDateTime.now().plusDays(30));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Account suspended for 30 days"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@AuthenticationPrincipal UserDetails userDetails) {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    private UserProfileDto toUserProfileDto(User user) {
        String photoValue = user.getProfilePhoto();
        if (photoValue != null
                && !photoValue.isBlank()
                && !photoValue.startsWith("http")
                && !photoValue.startsWith("data:")) {
            String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
            photoValue = baseUrl + "/api/auth/profile/photo/" + photoValue;
        }

        return new UserProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileBio(),
                photoValue,
                user.getRole(),
                user.getIsActive()
        );
    }
}

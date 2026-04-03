package com.photoshare;

import com.photoshare.model.User;
import com.photoshare.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableScheduling
public class PhotoSharingApplication {
    public static void main(String[] args) {
        SpringApplication.run(PhotoSharingApplication.class, args);
    }

    @Bean
    public CommandLineRunner initializeAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Initialize admin user if not exists
            if (!userRepository.existsByUsername("admin")) {
                User adminUser = new User("admin", "admin@phototribe.com", passwordEncoder.encode("PhotoTribeAdmin"));
                adminUser.setRole("ROLE_ADMIN");
                adminUser.setIsActive(true);
                adminUser.setProfileBio("PhotoTribe Administrator");
                userRepository.save(adminUser);
                System.out.println("✅ Admin user initialized: username=admin, password=PhotoTribeAdmin");
            } else {
                System.out.println("✓ Admin user already exists");
            }
        };
    }
}

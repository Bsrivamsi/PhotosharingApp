package com.photoshare.service;

import com.photoshare.model.Analytics;
import com.photoshare.repository.AnalyticsRepository;
import com.photoshare.repository.PhotoRepository;
import com.photoshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private AnalyticsRepository analyticsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PhotoRepository photoRepository;

    public Analytics getOrCreateAnalyticsForToday() {
        LocalDate today = LocalDate.now();
        Optional<Analytics> existingAnalytics = analyticsRepository.findByDate(today);
        if (existingAnalytics.isPresent()) {
            return existingAnalytics.get();
        }
        return new Analytics(today);
    }

    public Analytics recordVisitor(boolean isAuthenticated) {
        Analytics analytics = getOrCreateAnalyticsForToday();
        analytics.setTotalVisitors(analytics.getTotalVisitors() + 1);
        if (!isAuthenticated) {
            analytics.setAnonymousVisitors(analytics.getAnonymousVisitors() + 1);
        }
        return analyticsRepository.save(analytics);
    }

    public Analytics recordLogin() {
        Analytics analytics = getOrCreateAnalyticsForToday();
        analytics.setTotalLogins(analytics.getTotalLogins() + 1);
        return analyticsRepository.save(analytics);
    }

    public Analytics recordPhotoUpload() {
        Analytics analytics = getOrCreateAnalyticsForToday();
        analytics.setPhotosUploaded(analytics.getPhotosUploaded() + 1);
        return analyticsRepository.save(analytics);
    }

    public Analytics recordPhotoShare() {
        Analytics analytics = getOrCreateAnalyticsForToday();
        analytics.setPhotosShared(analytics.getPhotosShared() + 1);
        return analyticsRepository.save(analytics);
    }

    public Analytics recordUserCreation() {
        Analytics analytics = getOrCreateAnalyticsForToday();
        analytics.setTotalUsersCreated(analytics.getTotalUsersCreated() + 1);
        return analyticsRepository.save(analytics);
    }

    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new HashMap<>();
        
        // Overall statistics
        data.put("totalVisitors", analyticsRepository.findAll().stream()
                .mapToLong(Analytics::getTotalVisitors).sum());
        data.put("totalLogins", analyticsRepository.findAll().stream()
                .mapToLong(Analytics::getTotalLogins).sum());
        data.put("totalPhotosUploaded", analyticsRepository.findAll().stream()
                .mapToLong(Analytics::getPhotosUploaded).sum());
        data.put("totalPhotosShared", analyticsRepository.findAll().stream()
                .mapToLong(Analytics::getPhotosShared).sum());
        data.put("totalUsersCreated", userRepository.count());
        data.put("totalAnonymousVisitors", analyticsRepository.findAll().stream()
                .mapToLong(Analytics::getAnonymousVisitors).sum());

        List<Map<String, Object>> categoryDistribution = photoRepository.findAll().stream()
            .collect(Collectors.groupingBy(photo -> {
                String category = photo.getCategory();
                if (category == null || category.isBlank()) {
                return "Uncategorized";
                }
                return category.trim();
            }, Collectors.counting()))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .map(entry -> Map.<String, Object>of(
                "name", entry.getKey(),
                "value", entry.getValue()
            ))
            .toList();
        data.put("categoryDistribution", categoryDistribution);

        // Today's statistics
        Analytics todayAnalytics = getOrCreateAnalyticsForToday();
        data.put("todayVisitors", todayAnalytics.getTotalVisitors());
        data.put("todayLogins", todayAnalytics.getTotalLogins());
        data.put("todayPhotosUploaded", todayAnalytics.getPhotosUploaded());
        data.put("todayPhotosShared", todayAnalytics.getPhotosShared());

        return data;
    }

    public List<Analytics> getAnalyticsHistory() {
        return analyticsRepository.findAll();
    }

    public String buildAnalyticsCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("date,totalVisitors,totalLogins,photosUploaded,photosShared,anonymousVisitors,totalUsersCreated\n");

        List<Analytics> rows = analyticsRepository.findAll().stream()
                .sorted(Comparator.comparing(Analytics::getDate))
                .toList();

        for (Analytics analytics : rows) {
            csv.append(analytics.getDate()).append(',')
                    .append(analytics.getTotalVisitors()).append(',')
                    .append(analytics.getTotalLogins()).append(',')
                    .append(analytics.getPhotosUploaded()).append(',')
                    .append(analytics.getPhotosShared()).append(',')
                    .append(analytics.getAnonymousVisitors()).append(',')
                    .append(analytics.getTotalUsersCreated())
                    .append('\n');
        }

        return csv.toString();
    }
}

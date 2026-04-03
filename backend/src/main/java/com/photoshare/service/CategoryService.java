package com.photoshare.service;

import com.photoshare.model.Category;
import com.photoshare.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Locale;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public String normalizeCategoryName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "General";
        }

        String trimmed = name.trim().replaceAll("\\s+", " ");
        String normalizedName = Arrays.stream(trimmed.split(" "))
                .filter(part -> !part.isEmpty())
                .map(part -> part.substring(0, 1).toUpperCase(Locale.ROOT)
                        + part.substring(1).toLowerCase(Locale.ROOT))
                .reduce((a, b) -> a + " " + b)
                .orElse("General");
        return normalizedName;
    }

    public Category createCategory(String name, String description) {
        String normalizedName = normalizeCategoryName(name);
        return categoryRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> categoryRepository.save(new Category(normalizedName, description)));
    }

    public Category ensureCategoryExists(String name) {
        String normalizedName = normalizeCategoryName(name);
        return categoryRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> categoryRepository.save(new Category(normalizedName, "Auto-generated from uploaded photos")));
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        if (id == null) {
            throw new RuntimeException("Category id is required");
        }
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category getCategoryByName(String name) {
        String normalizedName = normalizeCategoryName(name);
        return categoryRepository.findByNameIgnoreCase(normalizedName).orElse(null);
    }

    public Category updateCategory(Long id, String name, String description) {
        Category category = getCategoryById(id);
        category.setName(normalizeCategoryName(name));
        category.setDescription(description);
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        if (id == null) {
            throw new RuntimeException("Category id is required");
        }
        categoryRepository.deleteById(id);
    }
}

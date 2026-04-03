package com.photoshare.controller;

import com.photoshare.dto.ContactRequestDto;
import com.photoshare.model.Contact;
import com.photoshare.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping
    public ResponseEntity<Map<String, String>> submitContact(@RequestBody ContactRequestDto request) {
        contactService.saveContact(request.getName(), request.getEmail(), request.getSubject(), request.getMessage());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Contact message received successfully"));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<Contact>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Contact> resolveContact(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.markAsResolved(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}

package com.photoshare.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@photoshare.local}")
    private String fromAddress;

    public void sendWelcomeEmail(String recipientEmail, String username) {
        if (mailSender == null || recipientEmail == null || recipientEmail.isBlank()) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipientEmail);
        message.setSubject("Welcome to PhotoShare");
        message.setText("Hi " + username + ",\n\nWelcome to PhotoShare. Your account is ready and you can start sharing photos now.\n\nThanks,\nPhotoShare Team");

        try {
            mailSender.send(message);
        } catch (MailException ignored) {
            // Do not fail registration if mail configuration is unavailable.
        }
    }
}

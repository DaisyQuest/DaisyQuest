package net.daisyquest.daisyquestgame.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.applicationinsights.boot.dependencies.apachecommons.io.IOUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.daisyquest.daisyquestgame.Model.InteractionType;
import net.daisyquest.daisyquestgame.Model.WorldObjectTraversalType;
import net.daisyquest.daisyquestgame.Model.WorldObjectType;
import net.daisyquest.daisyquestgame.Repository.ItemRepository;
import net.daisyquest.daisyquestgame.Repository.WorldObjectTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/world-object-editor")
@Slf4j
public class WorldObjectTypeEditorController {

    @Autowired
    private WorldObjectTypeRepository worldObjectTypeRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ObjectMapper objectMapper; // Add this for debugging

    @GetMapping
    public String editorPage(Model model) {
        model.addAttribute("worldObjectTypes", worldObjectTypeRepository.findAll());
        model.addAttribute("items", itemRepository.findAll());
        model.addAttribute("interactionTypes", InteractionType.values());
        model.addAttribute("traversalTypes", WorldObjectTraversalType.values());
        return "world-object-editor";
    }

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<?> saveWorldObjectType(
            @RequestBody(required = true) WorldObjectTypeSaveRequest request,
            HttpServletRequest httpRequest) {
        try {
            if (request == null) {
                return ResponseEntity.badRequest().body(
                        "Request object is null");
            }

            if (request.getWorldObjectType() == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse(
                        "WorldObjectType is null", LocalDateTime.now()));
            }

            // Validate the object
            validateWorldObjectType(request.getWorldObjectType());

            WorldObjectType savedType = worldObjectTypeRepository.save(request.getWorldObjectType());
            return ResponseEntity.ok(savedType);

        } catch (ValidationException e) {
            log.error("Validation error", e);
            return ResponseEntity.badRequest().body(new ErrorResponse(
                    "Validation error: " + e.getMessage(), LocalDateTime.now()));
        } catch (Exception e) {
            log.error("Error processing request", e);
            return ResponseEntity.badRequest().body(new ErrorResponse(
                    "Error processing request: " + e.getMessage(), LocalDateTime.now()));
        }
    }

    private void validateWorldObjectType(WorldObjectType type) throws ValidationException {
        List<String> errors = new java.util.ArrayList<>();

        if (type.getId() == null || type.getId().trim().isEmpty()) {
            errors.add("ID is required");
        }
        if (type.getName() == null || type.getName().trim().isEmpty()) {
            errors.add("Name is required");
        }
        if (type.getSpriteName() == null || type.getSpriteName().trim().isEmpty()) {
            errors.add("Sprite name is required");
        }
        if (type.getTraversalType() == null) {
            errors.add("Traversal type is required");
        }
        if (type.getInteractionType() == null) {
            errors.add("Interaction type is required");
        }
        if (type.getLength() <= 0) {
            errors.add("Length must be positive");
        }
        if (type.getWidth() <= 0) {
            errors.add("Width must be positive");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Validation failed: " + String.join(", ", errors));
        }
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseBody
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(HttpMessageNotReadableException e) {
        log.error("Message not readable", e);
        return ResponseEntity.badRequest().body(new ErrorResponse(
                "Unable to read request: " + e.getMessage(),LocalDateTime.now()));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorldObjectTypeSaveRequest {
        private WorldObjectType worldObjectType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorResponse {
        private String message;
        private LocalDateTime timestamp = LocalDateTime.now();
    }

    public static class ValidationException extends RuntimeException {
        public ValidationException(String message) {
            super(message);
        }
    }
}
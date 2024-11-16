package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.daisyquest.daisyquestgame.Model.InteractionType;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Data
@NoArgsConstructor
public class InteractionResult {
    private boolean success;
    private String message;
    private String activeInteractionId;
    private InteractionType interactionType;
    private Map<String, Object> stateData;
    private boolean completed;

    // Main constructor you specified
    public InteractionResult(
            boolean success,
            String message,
            String activeInteractionId,
            InteractionType interactionType,
            Map<String, Object> stateData) {
        this.success = success;
        this.message = message;
        this.activeInteractionId = activeInteractionId;
        this.interactionType = interactionType;
        this.stateData = stateData != null ? stateData : new HashMap<>();
        this.completed = false;
    }

    // Convenience constructor for completed interactions
    public InteractionResult(
            boolean success,
            String message,
            String activeInteractionId,
            InteractionType interactionType,
            Map<String, Object> stateData,
            boolean completed) {
        this(success, message, activeInteractionId, interactionType, stateData);
        this.completed = completed;
    }

    // Static factory methods for common results
    public static InteractionResult success(
            String message,
            String activeInteractionId,
            InteractionType interactionType) {
        return new InteractionResult(true, message, activeInteractionId, interactionType, new HashMap<>());
    }

    public static InteractionResult success(
            String message,
            String activeInteractionId,
            InteractionType interactionType,
            Map<String, Object> stateData) {
        return new InteractionResult(true, message, activeInteractionId, interactionType, stateData);
    }

    public static InteractionResult completed(
            String message,
            String activeInteractionId,
            InteractionType interactionType,
            Map<String, Object> stateData) {
        return new InteractionResult(true, message, activeInteractionId, interactionType, stateData, true);
    }

    public static InteractionResult failure(String message) {
        return new InteractionResult(false, message, null, null, new HashMap<>());
    }

    // Helper methods
    public void addStateData(String key, Object value) {
        if (this.stateData == null) {
            this.stateData = new HashMap<>();
        }
        this.stateData.put(key, value);
    }

    public Optional<Object> getStateData(String key) {
        return Optional.ofNullable(stateData != null ? stateData.get(key) : null);
    }

    public <T> Optional<T> getStateData(String key, Class<T> type) {
        Object value = stateData != null ? stateData.get(key) : null;
        if (value != null && type.isInstance(value)) {
            return Optional.of(type.cast(value));
        }
        return Optional.empty();
    }

    public void markCompleted() {
        this.completed = true;
    }
}

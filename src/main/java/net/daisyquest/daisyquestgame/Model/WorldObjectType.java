package net.daisyquest.daisyquestgame.Model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "world_object_types")
@NoArgsConstructor // Required for JSON deserialization
@AllArgsConstructor // Required for builder
public class WorldObjectType {
    private String id;
    private String name;
    private String spriteName;
    private int length;
    private int width;
    private boolean visible = true;
    private WorldObjectTraversalType traversalType;
    private boolean interactable = false;
    private InteractionOption interactionOption;
    private InteractionType interactionType;
    private long cooldownMs = 0L;
    private long interactionDurationMs = 0L;

    // Builder constructor
    private WorldObjectType(Builder builder) {
        this.id = builder.id;
        this.name = builder.name;
        this.spriteName = builder.spriteName;
        this.length = builder.length;
        this.width = builder.width;
        this.visible = builder.visible;
        this.traversalType = builder.traversalType;
        this.interactable = builder.interactable;
        this.interactionOption = builder.interactionOption;
        this.interactionType = builder.interactionType;
        this.cooldownMs = builder.cooldownMs;
        this.interactionDurationMs = builder.interactionDurationMs;
    }

    // Validation method that can be used by both builder and direct construction
    public void validate() {
        if (id == null || id.trim().isEmpty()) throw new IllegalArgumentException("id must be set");
        if (name == null || name.trim().isEmpty()) throw new IllegalArgumentException("name must be set");
        if (spriteName == null || spriteName.trim().isEmpty()) throw new IllegalArgumentException("spriteName must be set");
        if (traversalType == null) throw new IllegalArgumentException("traversalType must be set");
        if (length <= 0) throw new IllegalArgumentException("length must be positive");
        if (width <= 0) throw new IllegalArgumentException("width must be positive");

        if (interactable) {
            if (interactionOption == null) throw new IllegalArgumentException("interactionOption must be set for interactable objects");
            if (interactionType == null) throw new IllegalArgumentException("interactionType must be set for interactable objects");
        }
    }

    public static class Builder {
        private String id;
        private String name;
        private String spriteName;
        private int length;
        private int width;
        private boolean visible = true;
        private WorldObjectTraversalType traversalType;
        private boolean interactable = false;
        private InteractionOption interactionOption;
        private InteractionType interactionType;
        private long cooldownMs = 0L;
        private long interactionDurationMs = 0L;

        private Builder() {}

        public static Builder create() {
            return new Builder();
        }

        public Builder withId(String id) {
            this.id = requireNonNull(id, "id cannot be null");
            return this;
        }

        public Builder withName(String name) {
            this.name = requireNonNull(name, "name cannot be null");
            return this;
        }

        public Builder withSpriteName(String spriteName) {
            this.spriteName = requireNonNull(spriteName, "spriteName cannot be null");
            return this;
        }

        public Builder withDimensions(int length, int width) {
            if (length <= 0) throw new IllegalArgumentException("length must be positive");
            if (width <= 0) throw new IllegalArgumentException("width must be positive");
            this.length = length;
            this.width = width;
            return this;
        }

        public Builder setInvisible() {
            this.visible = false;
            return this;
        }

        public Builder withTraversalType(WorldObjectTraversalType traversalType) {
            this.traversalType = requireNonNull(traversalType, "traversalType cannot be null");
            return this;
        }

        public Builder makeInteractable(InteractionOption option, InteractionType type) {
            this.interactable = true;
            this.interactionOption = requireNonNull(option, "interactionOption cannot be null");
            this.interactionType = requireNonNull(type, "interactionType cannot be null");
            return this;
        }

        public Builder withCooldown(long cooldownMs) {
            if (cooldownMs < 0) throw new IllegalArgumentException("cooldown cannot be negative");
            this.cooldownMs = cooldownMs;
            return this;
        }

        public Builder withInteractionDuration(long durationMs) {
            if (durationMs < 0) throw new IllegalArgumentException("duration cannot be negative");
            this.interactionDurationMs = durationMs;
            return this;
        }

        public WorldObjectType build() {
            WorldObjectType obj = new WorldObjectType(this);
            obj.validate();
            return obj;
        }

        private static <T> T requireNonNull(T obj, String message) {
            if (obj == null) throw new IllegalArgumentException(message);
            return obj;
        }
    }
}
package net.daisyquest.daisyquestgame.Model;

public class SubmapEntranceDTO {
    private String submapId;
    private int x;
    private int y;

    public SubmapEntranceDTO() {}  // Default constructor for Jackson

    public SubmapEntranceDTO(String submapId, int x, int y) {
        this.submapId = submapId;
        this.x = x;
        this.y = y;
    }

    // Getters and setters
    public String getSubmapId() {
        return submapId;
    }

    public void setSubmapId(String submapId) {
        this.submapId = submapId;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }
}


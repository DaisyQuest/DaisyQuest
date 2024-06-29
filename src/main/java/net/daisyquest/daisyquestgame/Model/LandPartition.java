package net.daisyquest.daisyquestgame.Model;


import lombok.Data;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Data
public class LandPartition {
    private double area; // Percentage of the total land area (0.0 to 1.0)

    @DBRef
    private Player governor;

    private int payoutInterval;
    private int updatesTilPayout;

    public LandPartition(double area, int payoutInterval) {
        this.area = area;
        this.payoutInterval = payoutInterval;
        this.updatesTilPayout = payoutInterval;
    }

    public void resetUpdatesTilPayout() {
        this.updatesTilPayout = this.payoutInterval;
    }

    public boolean shouldPayout() {
        return this.updatesTilPayout <= 0;
    }

    public void decrementUpdatesTilPayout() {
        this.updatesTilPayout--;
    }
}


package net.daisyquest.daisyquestgame.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "lands")
@Data
public class Land {
    @Id
    private String id;

    @DBRef
    private Player owner;

    private LandType landType;

    private boolean forSale;

    private Map<String, Integer> salePrice;

    private int XCoordinate;
    private int YCoordinate;

    private List<LandPartition> partitions = new ArrayList<>(16);

    @DBRef
    private WorldMap worldMap;


    public void addPartition(double area, int payoutInterval) {
        if (partitions.size() >= 16) {
            throw new IllegalStateException("Maximum number of partitions (16) reached");
        }
        if (getTotalPartitionArea() + area > 1.0) {
            throw new IllegalArgumentException("Total partition area cannot exceed 1.0");
        }
        partitions.add(new LandPartition(area, payoutInterval));
    }

    public void removePartition(int index) {
        if (index < 0 || index >= partitions.size()) {
            throw new IllegalArgumentException("PartitionRemovalFailed at index: " + index);        }
        partitions.remove(index);
    }

    public void setGovernor(int partitionIndex, Player governor) {
        if (partitionIndex < 0 || partitionIndex >= partitions.size()) {
            throw new IllegalArgumentException("Invalid partition index");
        }
        partitions.get(partitionIndex).setGovernor(governor);
    }

    public void setPayoutInterval(int partitionIndex, int payoutInterval) {
        if (partitionIndex < 0 || partitionIndex >= partitions.size()) {
            throw new IllegalArgumentException("Invalid partition index");
        }
        LandPartition partition = partitions.get(partitionIndex);
        partition.setPayoutInterval(payoutInterval);
        partition.resetUpdatesTilPayout();
    }

    public void processUpdate() {
        for (LandPartition partition : partitions) {
            partition.decrementUpdatesTilPayout();
            if (partition.shouldPayout()) {
                // TODO: Implement payout logic
                partition.resetUpdatesTilPayout();
            }
        }
    }

    public boolean isPartitioned() {
        return !partitions.isEmpty();
    }

    public double getTotalPartitionArea() {
        return partitions.stream().mapToDouble(LandPartition::getArea).sum();
    }

    public double getUnpartitionedArea() {
        return 1.0 - getTotalPartitionArea();
    }

}
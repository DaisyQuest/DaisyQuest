package net.daisyquest.daisyquestgame.Model;



public enum LandType {
    PLAINS(0.1, 0),
    FOREST(0.2, -0.1),
    MOUNTAIN(0.3, -0.2),
    DESERT(0, 0.1),
    WATER(-0.1, 0.2);

    private final double resourceBonus;
    private final double developmentPenalty;

    LandType(double resourceBonus, double developmentPenalty) {
        this.resourceBonus = resourceBonus;
        this.developmentPenalty = developmentPenalty;
    }

    public double getResourceBonus() {
        return resourceBonus;
    }

    public double getDevelopmentPenalty() {
        return developmentPenalty;
    }
}

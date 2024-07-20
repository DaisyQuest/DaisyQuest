package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;


@Getter
@AllArgsConstructor
public enum Rarity {

    JUNK("#7F7F7F"),    // Dark gray
    COMMON("#FFFFFF"),  // White
    UNCOMMON("#1EFF00"), // Green
    RARE("#0070DD"),    // Blue
    EPIC("#A335EE"),    // Purple
    LEGENDARY("#FF8000"), // Orange
    SUPERLATIVE("#00FFFF"); // Cyan

    private final String colorHexCode;

}


package net.daisyquest.daisyquestgame.Service;

public class InventoryFullException extends RuntimeException {
    public InventoryFullException(String s) {
        super(s);
    }
}

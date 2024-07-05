package net.daisyquest.daisyquestgame.Service.Failure;

public class InsufficientItemsException extends RuntimeException {
    public InsufficientItemsException(String s) {
        super(s);
    }
}

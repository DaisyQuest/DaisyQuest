package net.daisyquest.daisyquestgame.Service.Failure;

public class UsernameAlreadyExistsException extends Exception {
    public UsernameAlreadyExistsException(String message) {
        super(message);
    }
}
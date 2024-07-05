package net.daisyquest.daisyquestgame.Service.Failure;

public class RecipeNotFoundException extends RuntimeException {
    public RecipeNotFoundException(String s) {
        super(s);
    }
}

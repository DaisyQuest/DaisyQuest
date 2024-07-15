package net.daisyquest.daisyquestgame.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class GameController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/game")
    public String game() {
        return "game";
    }

    @GetMapping("/castleDefense")
    public String castleDefense(){
        return "castleDefense";
    }
    @GetMapping("/worldMap")
    public String worldMap(){
        return "worldMap";
    }

    @GetMapping("/create-recipes")
    public String createRecipes(){
        return "create-recipe";
    }
}
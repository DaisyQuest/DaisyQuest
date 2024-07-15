package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Repository.AttributeTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/attributes/")
public class AttributeTemplateController {
    @Autowired
    AttributeTemplateRepository attributeTemplateRepository;

    @GetMapping("/all")
    public ResponseEntity<?> getAll(){
        return ResponseEntity.ok(attributeTemplateRepository.findAll());
    }
}

package net.daisyquest.daisyquestgame.Model;
    import lombok.Data;
    import org.springframework.data.mongodb.core.mapping.Document;

    @Data
    @Document(collection = "Attributes")
    public class Attribute {
        private String name;
        private int level;
        private int experience;
        private String sprite;

        public String getSpriteFileNameWithoutExtension(Attribute a){
            if(a.getName().equals("Hitpoints")){
                return "hitpoints_full_icon";
            }
            if(a.getName().equals("Combat")){
                return "combat_attribute_icon";
            }
            else return "weapon_left_0";
        }


        public Attribute(){

        }

        public Attribute(String name, int level, int experience) {
            this.name = name;
            this.level = level;
            this.experience = experience;
        }
    }



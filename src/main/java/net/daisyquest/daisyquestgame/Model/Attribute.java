package net.daisyquest.daisyquestgame.Model;
    import lombok.Data;
    import org.springframework.data.annotation.Id;
    import org.springframework.data.mongodb.core.mapping.Document;

    @Data
    @Document(collection = "attributes")
    public class Attribute {

        private String name;
        private int level;
        private int experience;
        private String sprite;

        public String getSprite(){
            return getSpriteFileNameWithoutExtension(this);
        }
        public String getSpriteFileNameWithoutExtension(Attribute a){
            if(a.getName().equals("Hitpoints")){
                return "hitpoints_full_icon";
            }
            if(a.getName().equals("Combat")){
                return "combat_attribute_icon";
            }
            if(a.getName().equals("Lapidiary")){
                return "/items/sapphire_gem_cut_2";
            }if(a.getName().equals("Crafting")){
                return "/items/brilliant_onyx_gold_ring";
            }if(a.getName().equals("Alchemy")){
                return "/spells/fireball_green";
            }
            else return "weapon_left_0";
        }


        public Attribute(){

        }

        public Attribute(String name, int level, int experience) {
            this.name = name;
            this.level = level;
            this.experience = experience;
            this.sprite = getSpriteFileNameWithoutExtension(this);
        }
    }



package net.daisyquest.daisyquestgame.Model;
    import lombok.Data;
    @Data
    public class Attribute {
        private String name;
        private int level;
        private int experience;

        public Attribute(String name, int level, int experience) {
            this.name = name;
            this.level = level;
            this.experience = experience;
        }
    }



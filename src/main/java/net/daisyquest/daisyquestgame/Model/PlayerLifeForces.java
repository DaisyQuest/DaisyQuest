package net.daisyquest.daisyquestgame.Model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class PlayerLifeForces {
List<LifeForce> lifeForces = new ArrayList<>();
public void setLifeForce(LifeForce.TYPE type, int amount){
  LifeForce lf = lifeForces.stream().filter(o-> o.type == type).findFirst().orElseThrow();
  lf.currentAmount = amount;
}
    public void addToLifeForce(LifeForce.TYPE type, int amount){
        LifeForce lf =    lifeForces.stream().filter(o-> o.type == type).findFirst().orElseThrow();
        lf.currentAmount += amount;
    }

    public void subtractFromLifeForce(LifeForce.TYPE type, int amount){
        LifeForce lf =    lifeForces.stream().filter(o-> o.type == type).findFirst().orElseThrow();
        lf.currentAmount -= amount;
    }
    PlayerLifeForces getDefaultStartingLifeForces(){
      List<LifeForce> returnList = new ArrayList<>();
      LifeForce hp = new LifeForce();
        hp.setType(LifeForce.TYPE.HITPOINTS);
        hp.setMaxAmount(50);
        hp.setModifiedMaxAmount(50);
        hp.setCurrentAmount(50);

        LifeForce mana = new LifeForce();
        mana.setType(LifeForce.TYPE.MANA);
        mana.setMaxAmount(100);
        mana.setModifiedMaxAmount(100);
        mana.setCurrentAmount(100);
        returnList.add(hp);
        returnList.add(mana);

        PlayerLifeForces pf = new PlayerLifeForces();
        pf.setLifeForces(returnList);
        return pf;
}
}

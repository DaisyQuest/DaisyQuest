package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Land;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

import org.springframework.data.mongodb.repository.Query;


public interface LandRepository extends MongoRepository<Land, String> {

    @Query("{'worldMap._id': ?0, 'xCoordinate': ?1, 'yCoordinate': ?2}")
    Land findByWorldMapIdAndCoordinates(String worldMapId, int x, int y);

    @Query("{'worldMap._id': ?0}")
    List<Land> findAllByWorldMapId(String worldMapId);
    Land findByXCoordinateAndYCoordinate(int xCoordinate, int yCoordinate);
    @Query("{'owner._id': ?0}")
    List<Land> findAllByOwnerId(String ownerId);

    @Query("{'forSale': true}")
    List<Land> findAllForSale();

    @Query("{'worldMap._id': ?0, 'forSale': true}")
    List<Land> findAllForSaleInWorldMap(String worldMapId);
}
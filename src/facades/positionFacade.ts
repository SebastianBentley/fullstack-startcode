import path from "path"
require('dotenv').config({ path: path.join(__dirname, "..", "..", '.env') })
import { Db, Collection, ObjectID } from "mongodb";
import IPosition from '../interfaces/IPosition'
import FriendsFacade from './friendFacade';
import { DbConnector } from "../config/dbConnector"
import { ApiError } from "../errors/apiError";

class PositionFacade {
  db: Db
  positionCollection: Collection
  friendFacade: FriendsFacade;

  constructor(db: Db) {
    this.db = db;
    this.positionCollection = db.collection("positions");
    this.friendFacade = new FriendsFacade(db);
  }

  async addOrUpdatePosition(email: string, longitude: number, latitude: number): Promise<IPosition> {
    // Find friend
    const friend = await this.friendFacade.getFriendFromEmail(email);
    // lav name fra firstname of lastname
    const fullName = friend.firstName + " " + friend.lastName;
    // lav position
    const location = { type: "Point", coordinates: [longitude, latitude] }
    const query = { email }
    const pos = {
      lastUpdated: new Date(),
      email: email,
      name: fullName,
      location: location
    }
    const update = {
      $set: { ...pos }
    } // Stort set hele IPosition skal gives her
    const options = { upsert: true, returnOriginal: false }
    const result = await this.positionCollection.findOneAndUpdate(query, update, options);
    return result.value;
  }

  async findNearbyFriends(email: string, longitude: number, latitude: number, distance: number, password?: string): Promise<Array<IPosition>> {
    // Check om han findes
    // const friend = await this.friendFacade.getVerifiedUser();
    // Opdater position
    await this.addOrUpdatePosition(email, longitude, latitude);

    return this.positionCollection.find({
      email: {$ne:email},
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: distance
        }
      }
    }).toArray();

  }

  async getAllPositions(): Promise<Array<IPosition>> {
    return this.positionCollection.find({}).toArray();
  }


}

export default PositionFacade;

async function tester() {
  const client = await DbConnector.connect()
  const db = client.db(process.env.DB_NAME)
  const positionFacade = new PositionFacade(db)
  await positionFacade.addOrUpdatePosition("pp@b.dk", 5, 5)
  process.exit(0)
}
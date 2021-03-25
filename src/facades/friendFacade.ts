import { IFriend } from '../interfaces/IFriend';
import { Db, Collection } from "mongodb";
import bcrypt from "bcryptjs";
import { ApiError } from '../errors/apiError';
import Joi, { ValidationError } from "joi"

const BCRYPT_ROUNDS = 10;

const USER_INPUT_SCHEMA = Joi.object({
    firstName: Joi.string().min(2).max(40).required(),
    lastName: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(4).max(30).required(),
    email: Joi.string().email().required()
})

class FriendsFacade {
    db: Db
    friendCollection: Collection

    constructor(db: Db) {
        this.db = db;
        this.friendCollection = db.collection("friends");
    }

    /**
     * 
     * @param friend 
     * @throws ApiError if validation fails
     */
    async addFriend(friend: IFriend): Promise<{ id: String }> {
        const status = USER_INPUT_SCHEMA.validate(friend);
        if (status.error) {
            throw new ApiError(status.error.message, 400)
        }
        const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
        const f = { ...friend, password: hashedpw }
        const user = await this.friendCollection.insertOne({ firstName: f.firstName, lastName: f.lastName, email: f.email, password: f.password, role: "user" })
        return user.insertedId;
    }

    /**
     * 
     * @param email 
     * @param friend 
     * @throws ApiError if validation fails or friend was not found
     */
    async editFriend(email: string, friend: IFriend): Promise<{ modifiedCount: number }> {
        const status = USER_INPUT_SCHEMA.validate(friend);
        if (status.error) {
            throw new ApiError(status.error.message, 400)
        }
        if (!(await this.friendCollection.findOne({ email: email }))) {
            throw new ApiError("user not found", 404)
        }

        const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
        const f = { ...friend, password: hashedpw }
        const filter = { email: email };
        const updateDocument = {
            $set: { firstName: f.firstName, lastName: f.lastName, email: f.email, password: f.password, },
        }
        const updated = await this.friendCollection.updateOne(filter, updateDocument)
        return { modifiedCount: updated.modifiedCount };
    }

    /**
     * 
     * @param friendEmail 
     * @returns true if deleted otherwise false
     */
    async deleteFriend(friendEmail: string): Promise<boolean> {
        if (this.friendCollection.find({ email: friendEmail })) {
            this.friendCollection.deleteOne({ email: friendEmail });
            return true;
        }
        return false;
    }

    async getAllFriends(): Promise<Array<IFriend>> {
        const users: unknown = await this.friendCollection.find({}).toArray();
        return users as Array<IFriend>
    }

    /**
     * 
     * @param friendEmail 
     * @returns 
     * @throws ApiError if not found
     */
    async getFriend(friendEmail: string): Promise<IFriend> {
        const friend = this.friendCollection.find({ email: friendEmail });
        const result = await friend.toArray();
        return result[0];
    }

    /**
     * Use this method for authentication
     * @param friendEmail 
     * @param password 
     * @returns the user if he could be authenticated, otherwise null
     */
    async getVerifiedUser(friendEmail: string, password: string): Promise<IFriend | null> {
        const friend: IFriend = await this.friendCollection.findOne({ email: friendEmail })
        if (friend && bcrypt.compare(password, friend.password)) {
            return friend
        }
        return Promise.resolve(null)
    }

}

export default FriendsFacade;
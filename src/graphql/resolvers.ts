import FriendFacade from '../facades/friendFacade';
import PositionFacade from "../facades/positionFacade";
import { IFriend } from '../interfaces/IFriend';
import { ApiError } from '../errors/apiError';
import { Request } from "express";
import fetch from "node-fetch"

interface IPositionInput {
    email: string
    longitude: number
    latitude: number
}

interface INearbyFriendInput {
    email: string
    password: string
    longitude: number
    latitude: number
    distance: number
}


let friendFacade: FriendFacade;
let positionFacade: PositionFacade;

/*
We don't have access to app or the Router so we need to set up the facade in another way
In www.ts IMPORT and CALL the method below, like so: 
      setupFacade(db);
Just before the line where you start the server
*/
export function setupFacade(db: any) {
    if (!friendFacade) {
        friendFacade = new FriendFacade(db)
    }
    if (!positionFacade) {
        positionFacade = new PositionFacade(db);
    }
}

// resolver map
export const resolvers = {
    Query: {

        getAllFriends: (root: any, _: any, req: any) => {

            if (!req.credentials || !req.credentials.role || req.credentials.role !== "admin") {
                throw new ApiError("Not Authorized", 401)
            }

            return friendFacade.getAllFriendsV2()

        },

        getAllFriendsProxy: async (root: object, _: any, context: Request) => {

            let options: any = { method: "GET" }

            //This part only required if authentication is required
            const auth = context.get("authorization");
            if (auth) {
                options.headers = { 'authorization': auth }
            }
            return fetch(`http://localhost:${process.env.PORT}/api/friends/all`, options).then(r => {
                if (r.status >= 400) { throw new Error(r.statusText) }
                return r.json()
            })
        },
        getFriendFromEmail: async (_: object, { input }: { input: IFriend }) => {
            return friendFacade.getFriendFromEmail(input.email)
        },
    },
    Mutation: {
        createFriend: async (_: object, { input }: { input: IFriend }) => {
            return friendFacade.addFriendV2(input)
        },
        editFriend: async (_: object, { input }: { input: IFriend }) => {
            return friendFacade.editFriendV2(input.email, input)
        },
        deleteFriend: async (_: object, { input }: { input: IFriend }) => {
            return friendFacade.deleteFriend(input.email)
        },
        addPosition: async (_: object, { input }: { input: IPositionInput }) => {
            try {
                await positionFacade.addOrUpdatePosition(input.email, input.longitude, input.latitude);
                return true;
            } catch (err) {
                return false;
            }
        },
        findNearbyFriends: async (_: object, { input }: { input: INearbyFriendInput }) => {
            return positionFacade.findNearbyFriends(input.email, input.longitude, input.latitude, input.distance, input.password)
        },
    },
};
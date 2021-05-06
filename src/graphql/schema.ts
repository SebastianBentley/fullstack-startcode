import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `#graphql

    type Friend {
        id: ID
        firstName: String
        lastName: String
        email: String
        role: String
    }

    type FriendWithPosition {
        email: String!
        name: String!
        location: Point
    }

    type Coordinate {
        latitude: Float!
        longitude: Float!
   }
 
     type Coordinates {
       coordinates: [[[Float]]]
    }
 
    type Point {
        """Will ALWAYS have the value Point"""
        type: String
        """Array with longitude followed by latitude [lon,lat]"""
        coordinates: [Float]
    }


    """
    Queries available for Friends
    """
     type Query {
        """
        Returns all details for all Friends
        (Should probably require 'admin' rights if your are using authentication)
        """
        getAllFriends : [Friend]!

        """
        Only required if you ALSO wan't to try a version where the result is fetched from the existing endpoint
        """
        getAllFriendsProxy: [Friend]!

        """
        Return a friend from email
        """
        getFriendFromEmail(input: FriendEmailInput): Friend!
        
    }

    input FriendInput {
        firstName: String!
        lastName: String!
        password: String!
        email: String!
    }

    input FriendEditInput {
        firstName: String
        lastName: String
        password: String
        email: String!
    }

    input FriendEmailInput {
        email: String!
    }

    input PositionInput {
        email: String!
        longitude: Float!
        latitude: Float!
    }

   input NearbyFriendsInput {
        email: String!
        password: String
        longitude: Float!
        latitude: Float!
        distance: Float!
    }
    

    type Mutation {
        """
        Allows anyone (non authenticated users) to create a new friend
        """
        createFriend(input: FriendInput): Friend
        """
        Allows you to edit a friend
        """
        editFriend(input: FriendEditInput): Friend
        """
        Allows admin to delete a friend
        """
        deleteFriend(input: FriendEmailInput): Boolean
        """
        Add a position to a friend
        """
        addPosition(input: PositionInput): Boolean
        """
        find nearby friends
        """
        findNearbyFriends(input: NearbyFriendsInput):[FriendWithPosition]
       
    }
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export { schema };
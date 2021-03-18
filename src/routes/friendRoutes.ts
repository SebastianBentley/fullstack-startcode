import { Router } from "express";
const router = Router();
import { ApiError } from "../errors/apiError";
import facade from "../facades/DummyDB-Facade";
import { IFriend } from "../interfaces/IFriend";
//import cors from "../middelware/myCors";

//router.use(cors);

import authMiddleware from "../middelware/basic-auth";
router.use(authMiddleware);


router.get("/all", async (req: any, res) => {
    const friends = await facade.getAllFriends();
    const friendsDTO = friends.map(friend => {
        const { firstName, lastName, email } = friend
        return { firstName, lastName, email }
    })
    res.json(friendsDTO);
});

router.get("/email/:email", async (req, res, next) => {
    const userEmail = req.params.email;
    try {
        const friend = await facade.getFriend(userEmail);
        if (friend == null) {
            throw new ApiError("user not found", 404);
        }
        const { firstName, lastName, email } = friend;
        const friendDTO = { firstName, lastName, email }
        res.json(friendDTO);
    } catch (err) {
        next(err)
    }
});

router.get("/me", async (req: any, res, next) => {
    const userEmail = req.credentials.userName;
    try {
        const friend = await facade.getFriend(userEmail);
        if (friend == null) {
            throw new ApiError("user not found", 404);
        }
        const { firstName, lastName, email } = friend;
        const friendDTO = { firstName, lastName, email }
        res.json(friendDTO);
    } catch (err) {
        next(err)
    }
});

router.post('/addFriend', async (req, res) => {
    const friend: IFriend = {
        id: "id" + (facade.friends.length + 1).toString(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    };

    res.send(await facade.addFriend(friend));
});

router.delete('/deleteFriend/:email', async (req, res) => {
    res.send(await facade.deleteFriend(req.params.email));
});




export default router;
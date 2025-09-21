import express from 'express';
import{ getUserProfile } from '../controllers/userControler.js';

const router = express.Router();
router.get("/check-auth", (req, res) => {
    if(req.oidc.isAuthenticated()){
        res.status(200).json({
            isAuthenticated: true,
            User: req.oidc.User
        })


    }
    else{
        return res.status(201).json(false);

    }
});

router.get('/users/:id', getUserProfile);

export default router;

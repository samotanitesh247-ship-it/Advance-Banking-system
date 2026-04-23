import express from 'express';
import { register,login, getMe, refreshToken} from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/getme", getMe);
router.get("/refresh-token",refreshToken);



export default router;
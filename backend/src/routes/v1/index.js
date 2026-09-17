import { Router } from "express";
import { userRouter } from "./users.routes.js";
import { productRouter } from "./products.routes.js";
import { reviewRouter } from "./reviews.routes.js";
import { shoppingCartRouter } from "./shoppingcart.routes.js";
import { categoryRouter } from "./categories.routes.js";
import { orderRouter } from "./orders.routes.js";
import { colorRouter } from "./colors.routes.js";
import { kbswitchRouter } from "./kb-switch.routes.js";
import { keycapRouter } from "./keycap.routes.js";
import { wishlistRouter } from "./wishlists.routes.js";
import { subcategoryRouter } from "./subcategories.routes.js";

export const router = Router();

router.use("/users", userRouter);
router.use("/products", productRouter);
router.use("/reviews", reviewRouter);
router.use("/shoppingcart", shoppingCartRouter);
router.use("/categories", categoryRouter);
router.use("/subcategories", subcategoryRouter);
router.use("/orders", orderRouter);
router.use("/colors", colorRouter);
router.use("/kbswitch", kbswitchRouter);
router.use("/keycaps", keycapRouter);
router.use("/wishlists", wishlistRouter);

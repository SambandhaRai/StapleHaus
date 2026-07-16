import { OrderService } from "../services/order.service";
import { ORDER_RESERVATION_MINUTES } from "../config";
import { logger } from "../utils/logger";

const orderService = new OrderService();

const RUN_EVERY_MS = 5 * 60 * 1000;

const runOnce = async () => {
    try {
        const released = await orderService.releaseExpiredOrders();
        if (released > 0) {
            logger.info("Expired order sweep released reservations", { released });
        }
    } catch (error) {
        logger.error("Expired order sweep failed", { error: String(error) });
    }
};

export const startReleaseExpiredOrdersJob = () => {
    logger.info("Expired order sweep scheduled", {
        reservationMinutes: ORDER_RESERVATION_MINUTES,
        everyMinutes: RUN_EVERY_MS / 60000,
    });
    void runOnce();
    const timer = setInterval(runOnce, RUN_EVERY_MS);
    timer.unref();
    return timer;
};

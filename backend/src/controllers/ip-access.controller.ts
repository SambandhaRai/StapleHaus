import { Request, Response } from "express";
import z from "zod";
import { handleControllerError } from "../errors/handle-controller-error";
import { IpAccessService } from "../services/ip-access.service";
import { CreateIpAccessDto } from "../dtos/ip-access.dto";
import { getRequestContext } from "../utils/request-context";

const ipAccessService = new IpAccessService();

export class IpAccessController {

    async getEntries(req: Request, res: Response) {
        try {
            const entries = await ipAccessService.listEntries();
            return res.status(200).json({
                success: true,
                data: entries,
                message: "IP access entries fetched successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async createEntry(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsedData = CreateIpAccessDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const entry = await ipAccessService.createEntry(parsedData.data, userId, getRequestContext(req));
            return res.status(201).json({
                success: true,
                data: entry,
                message: "IP access entry created successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async deleteEntry(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            await ipAccessService.deleteEntry(req.params.id as string, userId, getRequestContext(req));
            return res.status(200).json({
                success: true,
                message: "IP access entry removed successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }
}

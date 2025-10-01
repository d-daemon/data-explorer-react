import { Router, Request, Response, NextFunction } from 'express';
import { MetadataController } from '../controllers/MetadataController';

const router = Router();

/**
 * @swagger
 * /metadata:
 *   get:
 *     summary: Get all metadata
 *     description: Retrieve metadata for all systems and data dictionaries
 *     tags: [Metadata]
 *     responses:
 *       200:
 *         description: Metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Metadata for all systems
 *                       additionalProperties:
 *                         type: object
 *                         description: System-specific metadata
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await MetadataController.getMetadata(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /metadata/{system}:
 *   get:
 *     summary: Get system-specific metadata
 *     description: Retrieve metadata for a specific system or data dictionary
 *     tags: [Metadata]
 *     parameters:
 *       - in: path
 *         name: system
 *         required: true
 *         schema:
 *           type: string
 *         description: The system name or identifier
 *     responses:
 *       200:
 *         description: System metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: System-specific metadata
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:system', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await MetadataController.getSystemMetadata(req, res);
  } catch (err) {
    next(err);
  }
});

export { router as metadataRoutes };
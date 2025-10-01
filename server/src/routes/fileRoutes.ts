import { Router } from 'express';
import { FileController } from '../controllers/FileController';

const router = Router();

/**
 * @swagger
 * /files:
 *   get:
 *     summary: List all Excel files
 *     description: Retrieve a list of all available Excel files in the system
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: List of files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of file names
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', FileController.listFiles);

/**
 * @swagger
 * /files/{filename}:
 *   get:
 *     summary: Get file information
 *     description: Retrieve detailed information about a specific Excel file including sheet names
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the Excel file
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FileInfo'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:filename', FileController.getFileInfo);

/**
 * @swagger
 * /files/{filename}/sheets/{sheetname}:
 *   get:
 *     summary: Get sheet data
 *     description: Retrieve data from a specific sheet within an Excel file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the Excel file
 *       - in: path
 *         name: sheetname
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the sheet
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Number of rows per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter data
 *     responses:
 *       200:
 *         description: Sheet data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SheetData'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:filename/sheets/:sheetname', FileController.getSheetData);

/**
 * @swagger
 * /files/export:
 *   post:
 *     summary: Export filtered data
 *     description: Export specific rows of data based on provided filters
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Source file name
 *               sheetname:
 *                 type: string
 *                 description: Source sheet name
 *               rows:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array of row indices to export
 *               format:
 *                 type: string
 *                 enum: [xlsx, csv]
 *                 description: Export format
 *     responses:
 *       200:
 *         description: Data exported successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/export', FileController.exportData);

/**
 * @swagger
 * /files/export-full:
 *   post:
 *     summary: Export complete file
 *     description: Export an entire Excel file with all sheets
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 description: File name to export
 *               format:
 *                 type: string
 *                 enum: [xlsx, csv]
 *                 description: Export format
 *     responses:
 *       200:
 *         description: File exported successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/export-full', FileController.exportFullFile);

/**
 * @swagger
 * /files/stats/performance:
 *   get:
 *     summary: Get performance statistics
 *     description: Retrieve server performance metrics for file operations
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: Performance statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PerformanceStats'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats/performance', FileController.getPerformanceStats);

export { router as fileRoutes };
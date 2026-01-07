import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

router.use(authenticateToken);

router.post(
  '/track',
  [
    body('event').isString().trim().isLength({ min: 1 }),
    body('properties').optional().isObject(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { event, properties } = req.body;
      const userId = req.userId!;

      await prisma.analyticsEvent.create({
        data: {
          userId,
          event,
          properties: properties || {},
          timestamp: new Date(),
        },
      });

      const response: ApiResponse = {
        success: true,
        message: 'Event tracked successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Analytics tracking error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const totalPlans = await prisma.marketingPlan.count({
      where: { userId },
    });

    const completedPlans = await prisma.marketingPlan.count({
      where: { userId, status: 'completed' },
    });

    const recentActivity = await prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    const plansByStatus = await prisma.marketingPlan.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        totalPlans,
        completedPlans,
        recentActivity,
        plansByStatus,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;

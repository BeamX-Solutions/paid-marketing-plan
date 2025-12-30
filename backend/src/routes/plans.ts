import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AIService } from '../services/ai';
import { AuthRequest, ApiResponse, PlanGenerationRequest } from '../types';

const router = express.Router();

router.use(authenticateToken);

router.post('/create', [
  body('businessName').isString().trim().isLength({ min: 1 }),
  body('industry').isString().trim().isLength({ min: 1 }),
  body('targetAudience').isString().trim().isLength({ min: 1 }),
  body('budget').isNumeric({ no_symbols: false }),
  body('timeframe').isString().trim().isLength({ min: 1 }),
  body('goals').isArray({ min: 1 }),
  body('additionalInfo').optional().isString().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { businessName, industry, targetAudience, budget, timeframe, goals, additionalInfo } = req.body;
    const userId = req.userId!;

    const plan = await prisma.marketingPlan.create({
      data: {
        userId,
        businessName,
        industry,
        targetAudience,
        budget: parseFloat(budget),
        timeframe,
        goals: JSON.stringify(goals),
        content: '',
        status: 'draft',
        additionalInfo
      }
    });

    const response: ApiResponse = {
      success: true,
      data: plan
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Plan creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.post('/:id/generate', async (req: AuthRequest, res) => {
  try {
    const planId = req.params.id;
    const userId = req.userId!;

    const plan = await prisma.marketingPlan.findFirst({
      where: {
        id: planId,
        userId
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    await prisma.marketingPlan.update({
      where: { id: planId },
      data: { status: 'generating' }
    });

    try {
      const generationRequest: PlanGenerationRequest = {
        businessName: plan.businessName,
        industry: plan.industry,
        targetAudience: plan.targetAudience,
        budget: plan.budget,
        timeframe: plan.timeframe,
        goals: JSON.parse(plan.goals),
        additionalInfo: plan.additionalInfo || undefined
      };

      const content = await AIService.generateMarketingPlan(generationRequest);

      const updatedPlan = await prisma.marketingPlan.update({
        where: { id: planId },
        data: {
          content,
          status: 'completed'
        }
      });

      const response: ApiResponse = {
        success: true,
        data: updatedPlan
      };

      res.json(response);
    } catch (aiError) {
      await prisma.marketingPlan.update({
        where: { id: planId },
        data: { status: 'error' }
      });

      throw aiError;
    }
  } catch (error) {
    console.error('Plan generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate marketing plan'
    });
  }
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const plansRaw = await prisma.marketingPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        businessName: true,
        industry: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const plans = plansRaw;

    const response: ApiResponse = {
      success: true,
      data: plans
    };

    res.json(response);
  } catch (error) {
    console.error('Plans retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const planId = req.params.id;
    const userId = req.userId!;

    const planRaw = await prisma.marketingPlan.findFirst({
      where: {
        id: planId,
        userId
      }
    });

    if (!planRaw) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    const plan = {
      ...planRaw,
      goals: JSON.parse(planRaw.goals)
    };

    const response: ApiResponse = {
      success: true,
      data: plan
    };

    res.json(response);
  } catch (error) {
    console.error('Plan retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const planId = req.params.id;
    const userId = req.userId!;

    const plan = await prisma.marketingPlan.findFirst({
      where: {
        id: planId,
        userId
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    await prisma.marketingPlan.delete({
      where: { id: planId }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Plan deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Plan deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
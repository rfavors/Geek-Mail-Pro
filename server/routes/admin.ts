import express from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// Admin route to set up unlimited plan user
router.post('/setup-unlimited-user', async (req, res) => {
  try {
    const { email, plan } = req.body;
    
    // For now, we'll just create a mock user with unlimited plan
    // In production, you'd want proper admin authentication
    
    if (email === 'raymond@thegeektrepreneur.com' && plan === 'unlimited') {
      // Set up the user with unlimited plan
      const user = await storage.upsertUser({
        id: 'unlimited-user-raymond',
        email: 'raymond@thegeektrepreneur.com',
        firstName: 'Raymond',
        lastName: 'Favors',
        profileImageUrl: null,
      });
      
      res.json({ 
        success: true, 
        message: 'Unlimited plan user created successfully',
        user: {
          id: user.id,
          email: user.email,
          plan: 'unlimited'
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error setting up unlimited user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user plan info
router.get('/user-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if this is the unlimited user
    if (userId === 'unlimited-user-raymond') {
      res.json({
        plan: 'unlimited',
        limits: {
          subscribers: 'unlimited',
          emails: 'unlimited',
          campaigns: 'unlimited',
          sequences: 'unlimited'
        }
      });
    } else {
      // Default to starter plan for other users
      res.json({
        plan: 'starter',
        limits: {
          subscribers: 2500,
          emails: 15000,
          campaigns: 10,
          sequences: 5
        }
      });
    }
  } catch (error) {
    console.error('Error getting user plan:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
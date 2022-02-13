const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const AdminUser = require('../../models/AdminHost');
const NominateProducts = require('../../models/NominateProduct');

router.post('/register',
  [
    body('name', 'Please enter your name').not().isEmpty(),
    body('email', 'Please enter proper email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),

  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await AdminUser.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'Admin already exists' }] });
      }

      user = new AdminUser({
        name,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        admin_user: {
          id: user.id
        }
      };

      jwt.sign(payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

router.post('/login',
  [
    body('email', 'Please enter your email').isEmail(),
    body('password', 'Please enter the password').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let admin = await AdminUser.findOne({ email });

      if (!admin) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const payload = {
        admin_user: {
          id: admin.id
        }
      };

      jwt.sign(payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

router.get('/', adminAuth, async (req, res) => {
  try {
    console.log(req.adminAuth);
    const admin = await AdminUser.findById(req.admin_user.id).select('-password');
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/nominate', adminAuth, async (req, res) => {
  try {
    const mynominate = await NominateProducts.find({ isApproved: false }).sort({ date: -1 });
    res.json(mynominate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/start', adminAuth, async (req, res) => {
  try {
    const mynominate = await NominateProducts.find({ isApproved: true, isSold: false }).sort({ date: -1 });
    res.json(mynominate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/solditems', adminAuth, async (req, res) => {
  try {
    const mynominate = await NominateProducts.find({ isSold: true }).sort({ date: -1 });
    res.json(mynominate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/nominate/:id', adminAuth, [
  body('startDate', 'Please enter your startDate').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const nominate = await NominateProducts.findOneAndUpdate({ _id: req.params.id }, { isApproved: true, startDate: req.body.startDate });
    res.json(nominate);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Id Invalid' });
    }
    res.status(500).send('Server error');
  }
});

router.put('/start/:id', adminAuth, async (req, res) => {
  try {
    const nominate = await NominateProducts.findOneAndUpdate({ _id: req.params.id }, { isStarted: true });
    res.json(nominate);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Id Invalid' });
    }
    res.status(500).send('Server error');
  }
});



module.exports = router;

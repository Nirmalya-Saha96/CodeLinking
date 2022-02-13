const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');
const NominateProducts = require('../../models/NominateProduct');

router.post('/register',
  [
    body('name', 'Please enter your name').not().isEmpty(),
    body('email', 'Please enter proper email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    body('account', 'Please enter your account').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, account } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        password,
        account
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
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
      let admin = await User.findOne({ email });

      if (!admin) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const payload = {
        user: {
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

router.get('/', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-password');
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/nominate',
  [auth,
    [
      body('seller', 'Please enter your name').not().isEmpty(),
      body('account', 'Please enter your name').not().isEmpty(),
      body('name', 'Please enter your name').not().isEmpty(),
      body('description', 'Please enter your description').not().isEmpty(),
      body('image', 'Please enter your image').not().isEmpty(),
      body('minBid', 'Please enter your minimum bid').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      seller,
      account,
      name,
      description,
      image,
      minBid
    } = req.body;

    try {
      const product = new NominateProducts({ seller: seller, account: account, name: name, description: description, image: image, minBid: minBid, user: req.user.id });

      await product.save();
      res.json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

router.get('/mynominate', auth, async (req, res) => {
  try {
    const mynominate = await NominateProducts.find({ user: req.user.id }).sort({ date: -1 });
    res.json(mynominate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/myproducts', auth, async (req, res) => {
  try {
    const myProducts = await NominateProducts.find({ userBought: req.user.id }).sort({ date: -1 });
    res.json(myProducts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/nominate', auth, async (req, res) => {
  try {
    const mynominate = await NominateProducts.find({ isApproved: true, isSold: false }).sort({ date: -1 });
    res.json(mynominate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/nominate/:id', auth, async (req, res) => {
  try {
    const mynominate = await NominateProducts.findById(req.params.id);
    res.json(mynominate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/buy/:id', auth, [
  body('contractAddress', 'Please enter your Contract Address').not().isEmpty()
], async (req, res) => {
  try {
    const nominate = await NominateProducts.findOneAndUpdate({ _id: req.params.id, userBought: req.user.id }, { isSold: true, contractAddress: req.body.contractAddress });
    res.json(nominate);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Id Invalid' });
    }
    res.status(500).send('Server error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const admin = await User.findById(req.params.id).select('-password');
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;

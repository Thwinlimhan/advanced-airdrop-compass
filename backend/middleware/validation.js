const Joi = require('joi');

// Define AirdropStatus enum values for validation
const AirdropStatus = {
  RUMORED: 'Rumored',
  CONFIRMED: 'Confirmed',
  LIVE: 'Live',
  ENDED: 'Ended',
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const airdropSchema = Joi.object({
  projectName: Joi.string().required().min(1).max(100),
  blockchain: Joi.string().required(),
  status: Joi.string().valid(...Object.values(AirdropStatus))
});

const validateAirdrop = (req, res, next) => {
  const { error } = airdropSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validateAirdrop };

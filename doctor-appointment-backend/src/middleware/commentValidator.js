const Filter = require('bad-words');
const filter = new Filter();

// Add specific Turkish bad words
filter.addWords([
  'aptal', 'salak', 'gerizekalı', 'mal', 'dangalak', 'ahmak',
  'şerefsiz', 'haysiyetsiz', 'adi', 'pislik',
  'beceriksiz', 'zavallı', 'ezik', 'ucube'
]);

const validateComment = (req, res, next) => {
  const { comment } = req.body;

  if (!comment) {
    return next();
  }

  // Check if comment contains inappropriate words
  if (filter.isProfane(comment)) {
    return res.status(400).json({
      success: false,
      message: 'Your comment contains inappropriate language'
    });
  }

  next();
};

module.exports = validateComment; 
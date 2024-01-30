const router = require('express').Router();
const { Category, Product } = require('../../models');

router.get('/', (req, res) => {
  Category.findAll({
    attributes: ["id", "category_name"],
    include: [{
      model: Product,
      attributes: ["id", "product_name", "price", "stock", "category_id"]
    }]
  })
  .then((data) => {
    res.json(data);
  })
});

router.get('/:id', (req, res) => {
  Category.findByPk(req.params.id, {
    attributes: ["id", "category_name"],
		include: [
			{
				model: Product,
        attributes: ["id", "product_name", "price", "stock", "category_id"],
			}
		],
	})
  .then((data) => {
    res.json(data);
  })
  .catch((err) => {
    res.json(err);
  });
});

router.post('/', (req, res) => {
  Category.create(req.body)
		.then((data) => 
      res.status(200).json(data))
		.catch((err) => {
			console.log(err);
			res.status(400).json(err);
		});
});

router.put('/:id', (req, res) => {
    Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
    .then(() => 
      Category.findByPk(req.params.id))
    .then((data) => 
      res.status(200).json(data))
    .catch((err) => {
      res.json(err);
    });
});

router.delete('/:id', (req, res) => {
  Category.destroy({
		where: {
			id: req.params.id,
		},
	})
	.then(() => {
		res.json(`The category was removed from the database`);
	})
	.catch((err) => {
		res.json(err);
	});
});

module.exports = router;
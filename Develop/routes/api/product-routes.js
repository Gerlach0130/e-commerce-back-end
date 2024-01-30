const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

router.get('/', (req, res) => {
  Product.findAll({
		attributes: ["id", "product_name", "price", "stock", "category_id"],
		include: [
			{
				model: Tag,
				attributes: ["id", "tag_name"],
				through: "ProductTag",
			},
			{
				model: Category,
				attributes: ["id", "category_name"],
			},
		],
	})
		.then((data) => {
			res.json(data);
		})
		.catch((err) => {
			res.json(err);
		});
});

router.get('/:id', (req, res) => {
  Product.findByPk(req.params.id, {
		include: [
			{
				model: Tag,
				attributes: ["id", "tag_name"],
				through: "ProductTag",
			},
			{
				model: Category,
				attributes: ["id", "category_name"],
			},
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
  Product.create(req.body)
    .then((data) => {
      if (req.body.tagIds.length) {
        const productInfo = req.body.tagIds.map((tag_id) => {
          return {
            product_id: data.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productInfo);
      }
      res.status(200).json(data);
    })
    .then((data) => 
      res.status(200).json(data))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((data) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((data) => {
          const productTagIds = data.map(({ tag_id }) => tag_id);
          const newProductInfo = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });
          const productTagsToDelete = data
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToDelete } }),
            ProductTag.bulkCreate(newProductInfo),
          ]);
        });
      }
      return res.json(data);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  let deleteProduct = Product.findByPk(req.params.id);
	Product.destroy({
		where: {
			id: req.params.id,
		},
	})
	.then(() => {
		res.json(`${deleteProduct} has been deleted`);
	})
	.catch((err) => {
		res.json(err);
	});
});

module.exports = router;
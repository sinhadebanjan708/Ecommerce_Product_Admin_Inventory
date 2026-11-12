const {
  Product,
  ProductVariant,
  ProductVariantImage,
  Inventory,
  Category,
Subcategory
} = require("../models");
const { Op, Sequelize } = require("sequelize");
class CustomerProductService {

 getProductIncludes = () => [
  {
    model: Category,
    as: "category",
    attributes: ["id", "category_name"]
  },
  {
    model: Subcategory,
    as: "subcategory",
    attributes: ["id", "subcategory_name"]
  },
  {
    model: ProductVariantImage,
    as: "images",
    attributes: ["id", "image_url"]
  },
  {
    model: ProductVariant,
    as: "variants",
    attributes: [
      "id",
      "sku",
      "color",
      "size",
      "price",
      "sale_price",
      "status"
    ],
    where: { status: "ACTIVE" },
    required: false
  }
];
  

async getProducts(query) {
  const { page, limit, offset } = this.getPagination(query);

  const where = {
    status: "PUBLISHED"
  };

  if (query.categoryId) {
    where.category_id = query.categoryId;
  }

  if (query.subcategoryId) {
    where.subcategory_id = query.subcategoryId;
  }

  if (query.minPrice || query.maxPrice) {
    where.base_price = {};

    if (query.minPrice) {
      where.base_price[Op.gte] = Number(query.minPrice);
    }

    if (query.maxPrice) {
      where.base_price[Op.lte] = Number(query.maxPrice);
    }
  }

  if (query.search) {
    where.name = {
      [Op.like]: `%${query.search}%`
    };
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: this.getProductIncludes(),
    distinct: true,
    limit,
    offset,
    order: this.getSorting(query.sortBy)
  });

  return {
    products: rows,
    pagination: {
      total: count,
      currentPage: page,
      limit,
      totalPages: Math.ceil(count / limit),
      hasNextPage: page < Math.ceil(count / limit),
      hasPreviousPage: page > 1
    }
  }
}



async getProductDetails(productId){
  const product = await Product.findOne({
    where: {
      id: productId,
      status: "PUBLISHED"
    },
    include: this.getProductIncludes()
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};


  async checkAvailability(variantId) {
    const variant = await ProductVariant.findOne({
      where: {
        id: variantId,
        status: "active"
      },
      include: [
        {
          model: Product,
          as: "product",
          where: {
            status: "published"
          }
        },
        {
          model: Inventory,
          as: "inventory",
          required: false
        }
      ]
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }

    // POD variants need a separate fulfilment/availability check.
    if (variant.seller_type === "POD") {
      return {
        available: true,
        seller_type: "POD",
        message: "Available for print-on-demand"
      };
    }

    const inventory = variant.inventories || [];

    const availableQuantity = inventory.reduce(
      (total, item) =>
        total +
        Number(item.quantity_available) -
        Number(item.quantity_reserved),
      0
    );

    return {
      variant_id: variant.id,
      seller_type: variant.seller_type,
      available_quantity: availableQuantity,
      in_stock: availableQuantity > 0,
      message:
        availableQuantity > 0
          ? "In stock"
          : "Out of stock"
    };
  }
getPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);

  const limit = Math.min(
    50,
    Math.max(1, parseInt(query.limit, 10) || 10)
  );

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
}
 getPaginationResponse(count, page, limit) {
    const totalPages = Math.ceil(count / limit);

    return {
      total: count,
      currentPage: page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }
getSorting(sortBy) {
  const allowedSorts = {
    newest: [
      ["created_at", "DESC"]
    ],

    price_low: [
      [
        Sequelize.literal(`(
          SELECT MIN(
            CASE
              WHEN pv.sale_price IS NOT NULL
                AND pv.sale_price > 0
                AND pv.sale_price < pv.price
              THEN pv.sale_price
              ELSE pv.price
            END
          )
          FROM Product_Variants AS pv
          WHERE pv.product_id = Product.id
          AND pv.status = 'ACTIVE'
        )`),
        "ASC"
      ]
    ],

    price_high: [
      [
        Sequelize.literal(`(
          SELECT MIN(
            CASE
              WHEN pv.sale_price IS NOT NULL
                AND pv.sale_price > 0
                AND pv.sale_price < pv.price
              THEN pv.sale_price
              ELSE pv.price
            END
          )
          FROM Product_Variants AS pv
          WHERE pv.product_id = Product.id
          AND pv.status = 'ACTIVE'
        )`),
        "DESC"
      ]
    ],

    name: [
      ["product_name", "ASC"]
    ]
  };

  return allowedSorts[sortBy] || allowedSorts.newest;
}



  async getCategories(query) {
  try {
    const { page, limit, offset } = this.getPagination(query);

    const where = {
      status: "ACTIVE"
    };

    if (query.search) {
      where.category_name = {
        [Op.like]: `%${query.search}%`
      };
    }

    const result = await Category.findAndCountAll({
      where,
      attributes: [
        "id",
        "category_name",
        "image",
        "created_at"
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]]
    });

    return {
      categories: result.rows,
      pagination: this.getPaginationResponse(
        result.count,
        page,
        limit
      )
    };

  } catch (error) {
    console.error("CATEGORY QUERY ERROR:", error.message);
    console.error("MYSQL ERROR:", error.original);
    console.error("GENERATED SQL:", error.sql);

    throw error;
  }
}


  async getCategoryById(categoryId) {
    const category = await Category.findOne({
      where: {
        id: categoryId,
        status: "ACTIVE"
      },
      attributes: [
        "id",
        "category_name",
        "image",
        "created_at"
      ]
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }


  async getSubcategoriesByCategory(categoryId, query) {
    const category = await Category.findOne({
      where: {
        id: categoryId,
        status: "ACTIVE"
      },
      attributes: ["id", "category_name"]
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const { page, limit, offset } = this.getPagination(query);

    const where = {
      category_id: categoryId,
      status: "ACTIVE"
    };

    if (query.search) {
      where.subcategory_name = {
        [Op.like]: `%${query.search}%`
      };
    }

    const { count, rows } = await Subcategory.findAndCountAll({
      where,
      attributes: [
        "id",
        "category_id",
        "subcategory_name",
        "image",
        "created_at"
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]]
    });

    return {
      category: {
        id: category.id,
        category_name: category.category_name
      },
      subcategories: rows,
      pagination: this.getPaginationResponse(
        count,
        page,
        limit
      )
    };
  }

  async getSubcategories(query) {
    const { page, limit, offset } = this.getPagination(query);

    const where = {
      status: "ACTIVE"
    };

    if (query.categoryId) {
      where.category_id = query.categoryId;
    }

    if (query.search) {
      where.subcategory_name = {
        [Op.like]: `%${query.search}%`
      };
    }

    const { count, rows } = await Subcategory.findAndCountAll({
      where,
      attributes: [
        "id",
        "category_id",
        "subcategory_name",
        "image",
        "created_at"
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
          where: {
            status: "ACTIVE"
          },
          required: true
        }
      ],
      distinct: true,
      limit,
      offset,
      order: [["created_at", "DESC"]]
    });

    return {
      subcategories: rows,
      pagination: this.getPaginationResponse(
        count,
        page,
        limit
      )
    };
  }


  async getSubcategoryById(subcategoryId) {
    const subcategory = await Subcategory.findOne({
      where: {
        id: subcategoryId,
        status: "ACTIVE"
      },
      attributes: [
        "id",
        "category_id",
        "subcategory_name",
        "image",
        "created_at"
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
          where: {
            status: "ACTIVE"
          },
          required: true
        }
      ]
    });

    if (!subcategory) {
      throw new Error("Subcategory not found");
    }

    return subcategory;
  }


async searchProducts (query) {
  const { page, limit, offset } = getPagination(query);

  if (!query.q || !query.q.trim()) {
    throw new Error("Search keyword is required");
  }

  const keyword = query.q.trim();

  const { count, rows } = await Product.findAndCountAll({
    where: {
      status: "PUBLISHED",
      [Op.or]: [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ]
    },
    include: getProductIncludes(),
    distinct: true,
    limit,
    offset
  });

  return {
    products: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};


async getProductsByCategory  (categoryId, query)  {
  return this.getProducts({
    ...query,
    categoryId
  });
};

async getProductsBySubcategory  (
  subcategoryId,
  query
)  {
  return this.getProducts({
    ...query,
    subcategoryId
  });
};


async getProductVariantsByCategory(categoryId, query) {
  const { page, limit, offset } = this.getPagination(query);

  const category = await Category.findByPk(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  const { count, rows } = await ProductVariant.findAndCountAll({
    where: {
      status: "ACTIVE"
    },

    include: [
      {
        model: Product,
        as: "product",
        required: true,
        where: {
          category_id: categoryId,
          status: "PUBLISHED"
        }
      },
      {
        model: ProductVariantImage,
        as: "images",
        required: false,
        attributes: [
          "id",
          "variant_id",
          "image_url",
          "display_order"
        ]
      }
    ],

    distinct: true,
    limit,
    offset,
    order: [["created_at", "DESC"]]
  });

  return {
    variants: rows,
    pagination: this.getPaginationResponse(count, page, limit)
  };
}

async getProductVariantsBySubcategory(subcategoryId, query) {
  const { page, limit, offset } = this.getPagination(query);

  const subcategory = await Subcategory.findByPk(subcategoryId);

  if (!subcategory) {
    throw new Error("Subcategory not found");
  }

  const { count, rows } = await ProductVariant.findAndCountAll({
    where: {
      status: "ACTIVE"
    },

    include: [
      {
        model: Product,
        as: "product",
        required: true,
        where: {
          subcategory_id: subcategoryId,
          status: "PUBLISHED"
        }
      },
       {
        model: ProductVariantImage,
        as: "images",
        required: false,
        attributes: [
          "id",
          "variant_id",
          "image_url",
          "display_order"
        ]
      }
    ],

    distinct: true,
    limit,
    offset,
    order: [["created_at", "DESC"]]
  });

  return {
    variants: rows,
    pagination: this.getPaginationResponse(count, page, limit)
  };
}

async getProductVariants  (productId) {
  const product = await Product.findOne({
    where: {
      id: productId,
      status: "PUBLISHED"
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return ProductVariant.findAll({
    where: {
      product_id: productId,
      status: "ACTIVE"
    },
    attributes: [
      "id",
      "sku",
      "color",
      "size",
      "price",
      "sale_price",
      "fit"
    ]
  });
};


async getFeaturedProducts(query) {
  const { limit, offset, page } = getPagination(query);

  const { count, rows } = await Product.findAndCountAll({
    where: {
      status: "PUBLISHED",
      is_featured: true
    },
    include: getProductIncludes(),
    distinct: true,
    limit,
    offset,
    order: [["created_at", "DESC"]]
  });

  return {
    products: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};

async getNewArrivals (query) {
  return getProducts({
    ...query,
    sortBy: "newest"
  });
};

async getOnSaleProducts (query) {
  const { limit, offset, page } = getPagination(query);

  const { count, rows } = await Product.findAndCountAll({
    where: {
      status: "PUBLISHED",
      sale_price: {
        [Op.gt]: 0,
        [Op.lt]: Sequelize.col("price")
      }
    },
    include: getProductIncludes(),
    distinct: true,
    limit,
    offset
  });

  return {
    products: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};

async getRelatedProducts (productId, query) {
  const product = await Product.findOne({
    where: {
      id: productId,
      status: "PUBLISHED"
    },
    attributes: ["id", "category_id", "subcategory_id"]
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const { limit } = getPagination(query);

  return Product.findAll({
    where: {
      id: { [Op.ne]: productId },
      category_id: product.category_id,
      status: "PUBLISHED"
    },
    include: getProductIncludes(),
    limit,
    order: [["created_at", "DESC"]]
  });
};


}

module.exports = new CustomerProductService();
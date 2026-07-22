import { ProductRepository } from '../repositories/product.repository';
import { StockRepository } from '../repositories/stock.repository';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';
import { StockMovementInput } from '../validators/stock.validator';
import { formatPaginatedResponse, getPagination } from '../utils/pagination';
import { ApiError } from '../utils/apiError';
import { MovementType, Prisma } from '@prisma/client';

export class ProductService {
  private productRepository: ProductRepository;
  private stockRepository: StockRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.stockRepository = new StockRepository();
  }

  async createProduct(input: CreateProductInput, createdById: string) {
    const existingSku = await this.productRepository.findBySku(input.sku);
    if (existingSku) {
      throw ApiError.badRequest(`Product with SKU "${input.sku}" already exists`);
    }

    const product = await this.productRepository.create({
      name: input.name,
      sku: input.sku,
      category: input.category,
      price: new Prisma.Decimal(input.price),
      currentStock: input.currentStock,
      minimumStock: input.minimumStock,
      warehouse: input.warehouse,
      imageUrl: input.imageUrl,
      createdBy: { connect: { id: createdById } },
    });

    if (input.currentStock > 0) {
      await this.stockRepository.create({
        product: { connect: { id: product.id } },
        quantity: input.currentStock,
        movementType: MovementType.IN,
        reason: 'Initial Opening Stock',
        createdBy: { connect: { id: createdById } },
      });
    }

    return product;
  }

  async getProducts(query: any) {
    const { page, limit, skip } = getPagination({ page: query.page, limit: query.limit });
    const { search, category, lowStockOnly } = query;

    const isLowStock = lowStockOnly === 'true' || lowStockOnly === true;

    const { data, total } = await this.productRepository.findMany({
      skip,
      limit,
      search,
      category,
      lowStockOnly: isLowStock,
    });

    return formatPaginatedResponse(data, total, page, limit);
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    await this.getProductById(id);

    const updateData: any = { ...input };
    if (input.price !== undefined) {
      updateData.price = new Prisma.Decimal(input.price);
    }

    return this.productRepository.update(id, updateData);
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);
    return this.productRepository.delete(id);
  }

  async adjustStock(productId: string, input: StockMovementInput, createdById: string) {
    const product = await this.getProductById(productId);

    if (input.movementType === MovementType.OUT && product.currentStock < input.quantity) {
      throw ApiError.badRequest(
        `Cannot reduce stock by ${input.quantity}. Available current stock is ${product.currentStock}`
      );
    }

    const stockAdjustment = input.movementType === MovementType.IN ? input.quantity : -input.quantity;

    await this.productRepository.update(productId, {
      currentStock: { increment: stockAdjustment },
    });

    return this.stockRepository.create({
      product: { connect: { id: productId } },
      quantity: input.quantity,
      movementType: input.movementType,
      reason: input.reason,
      createdBy: { connect: { id: createdById } },
    });
  }
}

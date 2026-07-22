import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.salesChallanItem.deleteMany({});
  await prisma.salesChallan.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.customerNote.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  console.log('👤 Creating Users (1 Admin, 2 Sales, 2 Warehouse, 2 Accounts)...');
  const admin = await prisma.user.create({
    data: {
      name: 'Global Administrator',
      email: 'admin@minierp.com',
      password: defaultPasswordHash,
      role: Role.ADMIN,
    },
  });

  const sales1 = await prisma.user.create({
    data: {
      name: 'Sarah Connor (Sales Lead)',
      email: 'sales1@minierp.com',
      password: defaultPasswordHash,
      role: Role.SALES,
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      name: 'David Miller (Sales Exec)',
      email: 'sales2@minierp.com',
      password: defaultPasswordHash,
      role: Role.SALES,
    },
  });

  const warehouse1 = await prisma.user.create({
    data: {
      name: 'Robert Vance (Warehouse Mgr)',
      email: 'warehouse1@minierp.com',
      password: defaultPasswordHash,
      role: Role.WAREHOUSE,
    },
  });

  const warehouse2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova (Inventory Lead)',
      email: 'warehouse2@minierp.com',
      password: defaultPasswordHash,
      role: Role.WAREHOUSE,
    },
  });

  const accounts1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson (Chief Accountant)',
      email: 'accounts1@minierp.com',
      password: defaultPasswordHash,
      role: Role.ACCOUNTS,
    },
  });

  const accounts2 = await prisma.user.create({
    data: {
      name: 'Marcus Brody (Audit Exec)',
      email: 'accounts2@minierp.com',
      password: defaultPasswordHash,
      role: Role.ACCOUNTS,
    },
  });

  const salesUsers = [sales1, sales2];
  const warehouseUsers = [warehouse1, warehouse2];

  // 2. Create 20 Customers
  console.log('🏢 Creating 20 Customers...');
  const customerTypes = [CustomerType.RETAIL, CustomerType.WHOLESALE, CustomerType.DISTRIBUTOR];
  const customerStatuses = [CustomerStatus.LEAD, CustomerStatus.ACTIVE, CustomerStatus.INACTIVE];
  const companyPrefixes = ['Apex', 'Nexus', 'Vortex', 'Starlight', 'Omni', 'Trident', 'Titan', 'Zenith', 'Pinnacle', 'Horizon'];
  const companySuffixes = ['Distributors', 'Wholesale Co', 'Traders', 'Logistics', 'Suppliers', 'Enterprises'];

  const createdCustomers = [];

  for (let i = 1; i <= 20; i++) {
    const prefix = companyPrefixes[i % companyPrefixes.length];
    const suffix = companySuffixes[i % companySuffixes.length];
    const businessName = `${prefix} ${suffix} #${i}`;
    const customerName = `Contact Person ${i} (${prefix})`;
    const email = `contact${i}@${prefix.toLowerCase()}distributors.com`;
    const mobile = `+1 (555) 019-${(1000 + i).toString()}`;
    const gstNumber = i % 2 === 0 ? `27AAAAA${1000 + i}A1Z5` : null;
    const customerType = customerTypes[i % customerTypes.length];
    const status = i <= 14 ? CustomerStatus.ACTIVE : i <= 18 ? CustomerStatus.LEAD : CustomerStatus.INACTIVE;

    const customer = await prisma.customer.create({
      data: {
        customerName,
        mobile,
        email,
        businessName,
        gstNumber,
        customerType,
        address: `${100 + i} Industrial Logistics Park, Suite ${i * 5}, City Hub`,
        status,
        followUpDate: new Date(Date.now() + (i % 7) * 86400000),
        notes: `Key account registered under tier ${customerType}`,
        createdById: salesUsers[i % salesUsers.length].id,
      },
    });

    // Add 1-2 notes per customer
    await prisma.customerNote.create({
      data: {
        customerId: customer.id,
        note: `Initial CRM onboarding completed. Preferred contact time: Morning.`,
        createdById: salesUsers[i % salesUsers.length].id,
      },
    });

    createdCustomers.push(customer);
  }

  // 3. Create 50 Products
  console.log('📦 Creating 50 Products...');
  const categories = ['Industrial Machinery', 'Electronics & Sensors', 'Raw Materials', 'Packaging & Container', 'Hardware & Tools'];
  const warehouses = ['Central Warehouse A', 'North Hub Depot B', 'South Logistics Bay C'];

  const createdProducts = [];

  for (let i = 1; i <= 50; i++) {
    const category = categories[i % categories.length];
    const warehouse = warehouses[i % warehouses.length];
    const sku = `SKU-${category.slice(0, 3).toUpperCase()}-${(100 + i).toString()}`;
    const price = (25 + i * 14.5).toFixed(2);
    // Create realistic stock levels, including 5 low stock products (current <= minimum)
    const minimumStock = 15;
    const currentStock = i <= 5 ? Math.floor(Math.random() * 10) : 40 + (i * 5);

    const product = await prisma.product.create({
      data: {
        name: `${category} Part Component ${i}X`,
        sku,
        category,
        price,
        currentStock,
        minimumStock,
        warehouse,
        imageUrl: `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80`,
        createdById: warehouseUsers[i % warehouseUsers.length].id,
      },
    });

    createdProducts.push(product);
  }

  // 4. Create 100 Stock Movements
  console.log('🚚 Creating 100 Stock Movement logs...');
  const movementReasons = [
    'Vendor Supply Receipt',
    'Inventory Audit Adjustment',
    'Warehouse Transfer IN',
    'Damaged Goods Clearance',
    'Quality Inspection Sampling',
  ];

  for (let i = 1; i <= 100; i++) {
    const prod = createdProducts[i % createdProducts.length];
    const movementType = i % 3 === 0 ? MovementType.OUT : MovementType.IN;
    const quantity = Math.floor(Math.random() * 20) + 5;
    const reason = movementReasons[i % movementReasons.length];

    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        quantity,
        movementType,
        reason,
        createdById: warehouseUsers[i % warehouseUsers.length].id,
        timestamp: new Date(Date.now() - i * 3600000 * 4),
      },
    });
  }

  // 5. Create 15 Sales Challans
  console.log('📜 Creating 15 Sales Challans...');
  const challanStatuses = [ChallanStatus.CONFIRMED, ChallanStatus.DRAFT, ChallanStatus.CANCELLED];

  for (let i = 1; i <= 15; i++) {
    const cust = createdCustomers[i % createdCustomers.length];
    const status = i <= 9 ? ChallanStatus.CONFIRMED : i <= 12 ? ChallanStatus.DRAFT : ChallanStatus.CANCELLED;
    const dateStr = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10).replace(/-/g, '');
    const challanNumber = `CHN-${dateStr}-${i.toString().padStart(4, '0')}`;

    // Select 2-4 products per challan
    const itemsCount = (i % 3) + 2;
    let totalAmount = 0;
    let totalQuantity = 0;

    const itemsData = [];

    for (let j = 0; j < itemsCount; j++) {
      const prod = createdProducts[(i + j * 7) % createdProducts.length];
      const qty = (j + 1) * 4;
      const price = Number(prod.price);

      totalAmount += price * qty;
      totalQuantity += qty;

      itemsData.push({
        productId: prod.id,
        productSnapshot: {
          id: prod.id,
          name: prod.name,
          sku: prod.sku,
          category: prod.category,
          warehouse: prod.warehouse,
        },
        priceSnapshot: prod.price,
        quantity: qty,
      });
    }

    await prisma.salesChallan.create({
      data: {
        challanNumber,
        customerId: cust.id,
        status,
        totalAmount,
        totalQuantity,
        createdById: salesUsers[i % salesUsers.length].id,
        createdAt: new Date(Date.now() - i * 86400000),
        items: {
          create: itemsData,
        },
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log('--------------------------------------------------');
  console.log('Credentials Summary:');
  console.log('Admin: admin@minierp.com / Password123!');
  console.log('Sales: sales1@minierp.com / Password123!');
  console.log('Warehouse: warehouse1@minierp.com / Password123!');
  console.log('Accounts: accounts1@minierp.com / Password123!');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

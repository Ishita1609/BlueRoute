import { PrismaClient, Role, ShipmentMode, ShipmentStatus, PaymentMode, ExpenseCategory, LedgerType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Offices
  const jaipur = await prisma.office.upsert({
    where: { id: "office-jaipur" },
    update: {},
    create: {
      id: "office-jaipur",
      name: "BlueRoute Logistics Jaipur",
      city: "Jaipur",
      address: "C-15, Sindhi Camp, Jaipur, Rajasthan 302001",
      phone: "0141-2345678",
      email: "jaipur@blueroute.in",
    },
  });

  const delhi = await prisma.office.upsert({
    where: { id: "office-delhi" },
    update: {},
    create: {
      id: "office-delhi",
      name: "BlueRoute Logistics Delhi",
      city: "Delhi",
      address: "42, Transport Nagar, New Delhi 110041",
      phone: "011-23456789",
      email: "delhi@blueroute.in",
    },
  });

  const lucknow = await prisma.office.upsert({
    where: { id: "office-lucknow" },
    update: {},
    create: {
      id: "office-lucknow",
      name: "BlueRoute Logistics Lucknow",
      city: "Lucknow",
      address: "18, Aishbagh Road, Lucknow, UP 226004",
      phone: "0522-3456789",
      email: "lucknow@blueroute.in",
    },
  });

  const kanpur = await prisma.office.upsert({
    where: { id: "office-kanpur" },
    update: {},
    create: {
      id: "office-kanpur",
      name: "BlueRoute Logistics Kanpur",
      city: "Kanpur",
      address: "7, GT Road, Kanpur, UP 208001",
      phone: "0512-4567890",
      email: "kanpur@blueroute.in",
    },
  });

  // Users
  const adminPass = await bcrypt.hash("admin@123", 12);
  const managerPass = await bcrypt.hash("manager@123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@blueroute.in" },
    update: {},
    create: {
      email: "admin@blueroute.in",
      name: "Super Admin",
      password: adminPass,
      role: Role.SUPER_ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "jaipur@blueroute.in" },
    update: {},
    create: {
      email: "jaipur@blueroute.in",
      name: "Ramesh Sharma",
      password: managerPass,
      role: Role.OFFICE_MANAGER,
      officeId: jaipur.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "delhi@blueroute.in" },
    update: {},
    create: {
      email: "delhi@blueroute.in",
      name: "Suresh Gupta",
      password: managerPass,
      role: Role.OFFICE_MANAGER,
      officeId: delhi.id,
    },
  });

  // Customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: "cust-001" },
      update: {},
      create: {
        id: "cust-001",
        name: "Sharma Traders",
        phone: "9876543210",
        email: "sharma.traders@gmail.com",
        address: "Johri Bazaar, Jaipur",
        city: "Jaipur",
        defaultRateRoad: 8,
        defaultRateTrain: 6,
        defaultRateAir: 25,
        creditLimit: 50000,
      },
    }),
    prisma.customer.upsert({
      where: { id: "cust-002" },
      update: {},
      create: {
        id: "cust-002",
        name: "Gupta Enterprises",
        phone: "9765432109",
        email: "gupta.ent@gmail.com",
        address: "Chandni Chowk, Delhi",
        city: "Delhi",
        defaultRateRoad: 7.5,
        defaultRateTrain: 5.5,
        defaultRateAir: 22,
        creditLimit: 100000,
      },
    }),
    prisma.customer.upsert({
      where: { id: "cust-003" },
      update: {},
      create: {
        id: "cust-003",
        name: "Agarwal & Sons",
        phone: "9654321098",
        email: "agarwal.sons@yahoo.com",
        address: "Hazratganj, Lucknow",
        city: "Lucknow",
        gstNumber: "09AABCA1234A1Z5",
        defaultRateRoad: 9,
        defaultRateTrain: 7,
        defaultRateAir: 28,
        creditLimit: 75000,
      },
    }),
    prisma.customer.upsert({
      where: { id: "cust-004" },
      update: {},
      create: {
        id: "cust-004",
        name: "Singh Logistics",
        phone: "9543210987",
        email: "singh.log@gmail.com",
        address: "Naveen Market, Kanpur",
        city: "Kanpur",
        defaultRateRoad: 8.5,
        defaultRateTrain: 6.5,
        defaultRateAir: 26,
        creditLimit: 60000,
      },
    }),
    prisma.customer.upsert({
      where: { id: "cust-005" },
      update: {},
      create: {
        id: "cust-005",
        name: "Verma Brothers",
        phone: "9432109876",
        email: "verma.brothers@gmail.com",
        address: "Sadar Bazaar, Jaipur",
        city: "Jaipur",
        defaultRateRoad: 10,
        defaultRateTrain: 8,
        defaultRateAir: 30,
        creditLimit: 40000,
      },
    }),
  ]);

  // Delivery Partners
  const dp1 = await prisma.deliveryPartner.upsert({
    where: { id: "dp-001" },
    update: {},
    create: {
      id: "dp-001",
      name: "Rajesh Kumar",
      phone: "9876543000",
      vehicleNo: "RJ-14-AB-1234",
      area: "Jaipur City",
    },
  });

  const dp2 = await prisma.deliveryPartner.upsert({
    where: { id: "dp-002" },
    update: {},
    create: {
      id: "dp-002",
      name: "Mohan Lal",
      phone: "9765432000",
      vehicleNo: "DL-01-CX-5678",
      area: "Delhi NCR",
    },
  });

  // Sample Shipments
  const today = new Date();
  const shipmentData = [
    {
      id: "ship-001",
      trackingNumber: "CL-2024-001",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
      customerId: "cust-001",
      officeId: jaipur.id,
      mode: ShipmentMode.ROAD,
      packets: 5,
      weight: 50,
      rate: 8,
      amount: 400,
      status: ShipmentStatus.DELIVERED,
      fromCity: "Jaipur",
      toCity: "Delhi",
      deliveryPartnerId: dp1.id,
    },
    {
      id: "ship-002",
      trackingNumber: "CL-2024-002",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      customerId: "cust-002",
      officeId: delhi.id,
      mode: ShipmentMode.TRAIN,
      packets: 10,
      weight: 120,
      rate: 5.5,
      amount: 660,
      status: ShipmentStatus.IN_TRANSIT,
      fromCity: "Delhi",
      toCity: "Lucknow",
      deliveryPartnerId: dp2.id,
    },
    {
      id: "ship-003",
      trackingNumber: "CL-2024-003",
      date: today,
      customerId: "cust-003",
      officeId: lucknow.id,
      mode: ShipmentMode.AIR,
      packets: 2,
      weight: 15,
      rate: 28,
      amount: 420,
      status: ShipmentStatus.BOOKED,
      fromCity: "Lucknow",
      toCity: "Mumbai",
    },
    {
      id: "ship-004",
      trackingNumber: "CL-2024-004",
      date: today,
      customerId: "cust-004",
      officeId: kanpur.id,
      mode: ShipmentMode.ROAD,
      packets: 8,
      weight: 80,
      rate: 8.5,
      amount: 680,
      status: ShipmentStatus.IN_TRANSIT,
      fromCity: "Kanpur",
      toCity: "Jaipur",
    },
    {
      id: "ship-005",
      trackingNumber: "CL-2024-005",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
      customerId: "cust-005",
      officeId: jaipur.id,
      mode: ShipmentMode.TRAIN,
      packets: 15,
      weight: 200,
      rate: 8,
      amount: 1600,
      status: ShipmentStatus.DELIVERED,
      fromCity: "Jaipur",
      toCity: "Kanpur",
    },
  ];

  for (const s of shipmentData) {
    await prisma.shipment.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }

  // Train Manifest
  await prisma.trainManifest.upsert({
    where: { id: "manifest-001" },
    update: {},
    create: {
      id: "manifest-001",
      date: today,
      trainNumber: "12306",
      fromCity: "Jaipur",
      toCity: "Delhi",
      officeId: jaipur.id,
      totalPackets: 20,
      totalWeight: 250,
      totalAmount: 2000,
    },
  });

  // Payments
  await prisma.payment.createMany({
    data: [
      {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
        customerId: "cust-001",
        shipmentId: "ship-001",
        amount: 400,
        mode: PaymentMode.CASH,
        remarks: "Full payment received",
      },
      {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        customerId: "cust-002",
        amount: 500,
        mode: PaymentMode.UPI,
        referenceNo: "UPI2024001",
        remarks: "Advance payment",
      },
      {
        date: today,
        customerId: "cust-005",
        shipmentId: "ship-005",
        amount: 1600,
        mode: PaymentMode.BANK_TRANSFER,
        referenceNo: "NEFT2024001",
      },
    ],
    skipDuplicates: true,
  });

  // Ledger entries
  await prisma.ledgerEntry.createMany({
    data: [
      {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
        customerId: "cust-001",
        shipmentId: "ship-001",
        type: LedgerType.SHIPMENT,
        pieces: 5,
        weight: 50,
        rate: 8,
        amount: 400,
        paymentReceived: 400,
        runningBalance: 0,
      },
      {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        customerId: "cust-002",
        shipmentId: "ship-002",
        type: LedgerType.SHIPMENT,
        pieces: 10,
        weight: 120,
        rate: 5.5,
        amount: 660,
        paymentReceived: 500,
        runningBalance: 160,
      },
    ],
    skipDuplicates: true,
  });

  // Expenses
  await prisma.expense.createMany({
    data: [
      {
        date: today,
        category: ExpenseCategory.FUEL,
        amount: 3500,
        description: "Diesel for delivery vehicles",
        officeId: jaipur.id,
      },
      {
        date: today,
        category: ExpenseCategory.SALARY,
        amount: 15000,
        description: "Driver salary - June",
        officeId: jaipur.id,
        paidTo: "Rajesh Kumar",
      },
      {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        category: ExpenseCategory.RENT,
        amount: 8000,
        description: "Office rent - June",
        officeId: delhi.id,
      },
      {
        date: today,
        category: ExpenseCategory.LOADING,
        amount: 1200,
        description: "Loading charges at Jaipur depot",
        officeId: jaipur.id,
      },
      {
        date: today,
        category: ExpenseCategory.TRAIN_CHARGES,
        amount: 500,
        description: "Train booking fees",
        officeId: jaipur.id,
      },
    ],
    skipDuplicates: true,
  });

  // Tracking Events
  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: "ship-001",
        status: ShipmentStatus.BOOKED,
        location: "Jaipur",
        description: "Shipment booked",
        timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 10, 0),
      },
      {
        shipmentId: "ship-001",
        status: ShipmentStatus.IN_TRANSIT,
        location: "Jaipur",
        description: "Picked up from sender",
        timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 14, 0),
      },
      {
        shipmentId: "ship-001",
        status: ShipmentStatus.DELIVERED,
        location: "Delhi",
        description: "Delivered successfully",
        timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 11, 30),
      },
      {
        shipmentId: "ship-002",
        status: ShipmentStatus.BOOKED,
        location: "Delhi",
        description: "Shipment booked via train",
        timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 9, 0),
      },
      {
        shipmentId: "ship-002",
        status: ShipmentStatus.IN_TRANSIT,
        location: "Delhi Railway Station",
        description: "Loaded on Train 12306",
        timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 18, 0),
      },
    ],
    skipDuplicates: true,
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: "SEED",
      entity: "Database",
      newValue: { message: "Database seeded successfully" },
    },
  });

  console.log("✅ Seeding complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Super Admin: admin@blueroute.in / admin@123");
  console.log("   Jaipur Manager: jaipur@blueroute.in / manager@123");
  console.log("   Delhi Manager: delhi@blueroute.in / manager@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

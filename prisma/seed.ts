import "dotenv/config";
import { PrismaClient } from ".prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log("🌱 Seeding database...");

    // Create default customer
    const customer = await prisma.mstCustomer.upsert({
        where: { id: "default-customer-id" },
        update: {},
        create: {
            id: "default-customer-id",
            name: "Group of Institutions",
            address: "123 Education Road",
            city: "Pune",
            state: "Maharashtra",
            country: "India",
            email: "admin@institutions.org",
            phone: "9876543210",
        },
    });
    console.log("✅ Customer created:", customer.name);

    // Create admin user
    const hashedPassword = await bcrypt.hash("Admin@123", 12);
    const adminUser = await prisma.swUserDetails.upsert({
        where: { email: "admin@pms.local" },
        update: {},
        create: {
            customerId: customer.id,
            name: "System Admin",
            email: "admin@pms.local",
            mobile: "9000000001",
            password: hashedPassword,
            role: "ADMIN",
        },
    });
    console.log("✅ Admin user created:", adminUser.email);

    // Create staff user
    const staffPassword = await bcrypt.hash("Staff@123", 12);
    const staffUser = await prisma.swUserDetails.upsert({
        where: { email: "staff@pms.local" },
        update: {},
        create: {
            customerId: customer.id,
            name: "CPT Staff",
            email: "staff@pms.local",
            mobile: "9000000002",
            password: staffPassword,
            role: "STAFF",
        },
    });
    console.log("✅ Staff user created:", staffUser.email);

    // Create subsidiaries
    const institutions = [
        { code: "INST001", name: "Engineering College - North Campus", city: "Pune", state: "Maharashtra", mobile: "9111111111" },
        { code: "INST002", name: "Medical College - Main Campus", city: "Mumbai", state: "Maharashtra", mobile: "9222222222" },
        { code: "INST003", name: "Law College - East Campus", city: "Nagpur", state: "Maharashtra", mobile: "9333333333" },
    ];

    for (const inst of institutions) {
        await prisma.mstSubsidiary.upsert({
            where: { code: inst.code },
            update: {},
            create: { customerId: customer.id, ...inst, email: `${inst.code.toLowerCase()}@institution.edu` },
        });
    }
    console.log("✅ Subsidiaries created:", institutions.length);

    // Create vendors
    const vendors = [
        { name: "Tech Supplies Pvt Ltd", contactPerson: "Raj Kumar", mobile: "9400000001", email: "raj@techsupplies.com", vendorType: "GOODS", gstNo: "27AAACT1234F1Z5" },
        { name: "Office Mart India", contactPerson: "Priya Sharma", mobile: "9400000002", email: "priya@officemart.in", vendorType: "GOODS", gstNo: "27AABCO5678G1Z2" },
        { name: "Infra Services Ltd", contactPerson: "Suresh Patil", mobile: "9400000003", email: "suresh@infraservices.co", vendorType: "SERVICES" },
        { name: "Lab Equipment Corp", contactPerson: "Anita Desai", mobile: "9400000004", email: "anita@labequip.com", vendorType: "GOODS" },
    ];

    for (const vendor of vendors) {
        await prisma.mstVendor.create({ data: { customerId: customer.id, ...vendor } }).catch(() => { });
    }
    console.log("✅ Vendors created:", vendors.length);

    // Create stock categories
    const categories = ["Laboratory Equipment", "Office Supplies", "IT Equipment", "Furniture", "Electrical", "Plumbing"];
    const createdCategories: any[] = [];
    for (const name of categories) {
        const cat = await prisma.stkCategory.create({ data: { customerId: customer.id, name } }).catch(() => null);
        if (cat) createdCategories.push(cat);
    }
    console.log("✅ Categories created:", createdCategories.length);

    // Create stock groups
    const groups = ["Consumables", "Capital Equipment", "Tools", "Stationery"];
    for (const name of groups) {
        await prisma.stkGroup.create({ data: { customerId: customer.id, name } }).catch(() => { });
    }

    // Create manufacturers
    const manufacturers = ["Dell", "HP", "Samsung", "Borosil", "Merck", "Local Brand"];
    for (const name of manufacturers) {
        await prisma.stkManufacturer.create({ data: { customerId: customer.id, name } }).catch(() => { });
    }

    // Create stock items
    const items = [
        { code: "ITM001", name: "Dell Laptop 15 inch", uom: "Nos", openingQty: 5, minLevel: 2, reorderLevel: 4, categoryId: createdCategories[2]?.id },
        { code: "ITM002", name: "HP Printer LaserJet", uom: "Nos", openingQty: 3, minLevel: 1, reorderLevel: 2, categoryId: createdCategories[2]?.id },
        { code: "ITM003", name: "A4 Paper Ream 500 Sheets", uom: "Box", openingQty: 50, minLevel: 10, reorderLevel: 20, categoryId: createdCategories[1]?.id },
        { code: "ITM004", name: "Office Chair Revolving", uom: "Nos", openingQty: 20, minLevel: 5, reorderLevel: 10, categoryId: createdCategories[3]?.id },
        { code: "ITM005", name: "Beaker 250ml Borosil", uom: "Nos", openingQty: 100, minLevel: 20, reorderLevel: 40, categoryId: createdCategories[0]?.id },
        { code: "ITM006", name: "LED Bulb 18W", uom: "Nos", openingQty: 200, minLevel: 50, reorderLevel: 80, categoryId: createdCategories[4]?.id },
    ];

    for (const item of items) {
        await prisma.stkItemMaster.upsert({
            where: { code: item.code },
            update: {},
            create: { customerId: customer.id, code: item.code, name: item.name, uom: item.uom, openingQty: item.openingQty, currentQty: item.openingQty, minLevel: item.minLevel, reorderLevel: item.reorderLevel, categoryId: item.categoryId || null },
        });
    }
    console.log("✅ Stock items created:", items.length);

    console.log("\n🎉 Seeding complete!");
    console.log("\n📋 Login Details:");
    console.log("   CPT Admin:  admin@pms.local / Admin@123");
    console.log("   CPT Staff:  staff@pms.local / Staff@123");
    console.log("   Subsidiary: Code=INST001, Mobile=9111111111, OTP=123456 (dev)");
}

main()
    .catch((e) => { console.error("Seed error:", e); process.exit(1); })
    .finally(() => prisma.$disconnect());

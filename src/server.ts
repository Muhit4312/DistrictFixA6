import app from "./app";
import config from "./config/env.config";
import { transporter } from "./lib/nodemailer";
import { prisma } from "./lib/prisma";
import { RadisClient } from "./lib/radis";
import { seedAdmin, seedElectrician, seedPlumber, seedServiceHolder, seedSuperAdmin } from "./utils/seed";

const main = async () => {
	try {
		await prisma.$connect();
		console.log("Database successfully connected.");
		await RadisClient.connect();
		console.log("Connected to the Radis successfully.");
		await transporter.verify();
		console.log("Nodemailer Connected successfully.");
		await seedSuperAdmin();
		await seedAdmin();
		await seedServiceHolder();
		await seedPlumber();
		await seedElectrician();
		app.listen(config.port, () => {
			console.log(`Server app listening on port ${config.port}`);
		});
	} catch (error) {
		console.log("Error starting the server:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
};

main();

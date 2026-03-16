import { randomBytes, randomUUID, scryptSync } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function makePassword() {
  return `Seed${randomBytes(5).toString("hex")}A9`;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

const seedUsers = [
  {
    username: "admin.master",
    displayName: "Admin Master",
    email: "admin.master@example.local",
    role: "admin"
  },
  {
    username: "general.alex",
    displayName: "General Alex",
    email: "general.alex@example.local",
    role: "general"
  },
  {
    username: "general.mina",
    displayName: "General Mina",
    email: "general.mina@example.local",
    role: "general"
  }
];

const output = [];

for (const seedUser of seedUsers) {
  const password = makePassword();

  const user = await prisma.user.upsert({
    where: { username: seedUser.username },
    update: {
      displayName: seedUser.displayName,
      email: seedUser.email,
      role: seedUser.role,
      passwordHash: hashPassword(password),
      failedLoginCount: 0,
      lockedAt: null,
      mustChangePassword: false
    },
    create: {
      id: `usr_${randomUUID().slice(0, 8)}`,
      username: seedUser.username,
      displayName: seedUser.displayName,
      email: seedUser.email,
      role: seedUser.role,
      passwordHash: hashPassword(password)
    }
  });

  output.push({
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    password
  });
}

mkdirSync("docs", { recursive: true });
writeFileSync(
  "docs/user-credentials.local.md",
  [
    "# User Credentials",
    "",
    ...output.flatMap((user) => [
      `## ${user.username}`,
      "",
      `- login_id: ${user.username}`,
      `- role: ${user.role}`,
      `- email: ${user.email}`,
      `- password: ${user.password}`,
      `- internal_user_id: ${user.id}`,
      ""
    ])
  ].join("\n"),
  "utf8"
);

console.log("Seeded users and wrote docs/user-credentials.local.md");
await prisma.$disconnect();

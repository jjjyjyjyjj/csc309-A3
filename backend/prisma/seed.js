/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 * Attributions: Done with the help of Claude AI
 */
'use strict';

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const fs = require("fs");


const prisma = new PrismaClient();

const HASHED_PASSWORD = bcrypt.hashSync("123123", 10);

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function pastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const POSITION_TYPES = [
  { name: "Software Developer", description: "Builds and maintains software applications." },
  { name: "Data Analyst", description: "Analyses data and produces insights." },
  { name: "Graphic Designer", description: "Creates visual assets for digital and print media." },
  { name: "Project Manager", description: "Plans, executes, and closes projects." },
  { name: "Marketing Specialist", description: "Develops and implements marketing strategies." },
  { name: "Customer Support", description: "Assists customers with inquiries and issues." },
  { name: "Accountant", description: "Manages financial records and reporting." },
  { name: "HR Coordinator", description: "Supports recruitment and employee relations." },
  { name: "Warehouse Associate", description: "Handles inventory and logistics operations." },
  { name: "Delivery Driver", description: "Transports goods to customers on time." },
  { name: "Content Writer", description: "Produces written content for various platforms." },
  { name: "UX Designer", description: "Designs user-friendly digital experiences." },
];

const FIRST_NAMES = [
  "Alice", "Bob", "Carol", "David", "Eva", "Frank", "Grace", "Henry",
  "Isla", "Jack", "Karen", "Liam", "Mia", "Noah", "Olivia", "Paul",
  "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xander",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore",
];

const BUSINESS_NAMES = [
  "TechNova Solutions", "BrightPath Consulting", "GreenLeaf Industries",
  "Apex Logistics", "BlueSky Marketing", "ClearView Analytics",
  "Horizon Staffing", "Pinnacle Designs", "SunRise Commerce", "IronClad Security",
  "Coastal Delivery Co.", "Urban Workspace Ltd.",
];

const BIOS = [
  "Passionate professional with a drive for excellence.",
  "Results-oriented and collaborative team player.",
  "Creative thinker who loves solving complex problems.",
  "Detail-focused and highly organized individual.",
  "Dedicated to delivering quality work on every project.",
];

// ─── Main seed ───────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding database …");

  // ── 1. Position Types ──────────────────────────────────────────────────────
  const positionTypes = [];
  for (const pt of POSITION_TYPES) {
    const created = await prisma.positionType.create({
      data: { ...pt, hidden: false },
    });
    positionTypes.push(created);
  }
  console.log(`✅  ${positionTypes.length} position types created`);

  // ── 2. Administrator ───────────────────────────────────────────────────────
  await prisma.account.create({
    data: {
      email: "admin1@csc309.utoronto.ca",
      username: "admin1",
      password: HASHED_PASSWORD,
      role: "administrator",
      activated: true,
      first_name: "Admin",
      last_name: "One",
      biography: "System administrator.",
    },
  });
  console.log("✅  1 administrator created");

  // ── 3. Regular users (20) ─────────────────────────────────────────────────
  const regularUsers = [];
  for (let i = 1; i <= 20; i++) {
    const fn = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i - 1) % LAST_NAMES.length];
    const user = await prisma.account.create({
      data: {
        email: `regular${i}@csc309.utoronto.ca`,
        username: `regular${i}`,
        password: HASHED_PASSWORD,
        role: "regular",
        activated: true,
        first_name: fn,
        last_name: ln,
        biography: randomItem(BIOS),
        available: i % 3 !== 0, // mix of available / not
        birthday: new Date(1990 + (i % 15), i % 12, (i % 28) + 1),
        phone_number: `416-555-${String(i).padStart(4, "0")}`,
        postal_address: `${i * 10} Elm Street, Toronto, ON`,
        last_active: pastDate(randomInt(0, 30)),
      },
    });
    regularUsers.push(user);
  }
  console.log(`✅  ${regularUsers.length} regular users created`);

  // ── 4. Businesses (10) ────────────────────────────────────────────────────
  const businesses = [];
  for (let i = 1; i <= 10; i++) {
    const biz = await prisma.account.create({
      data: {
        email: `business${i}@csc309.utoronto.ca`,
        username: `business${i}`,
        password: HASHED_PASSWORD,
        role: "business",
        activated: true,
        business_name: BUSINESS_NAMES[(i - 1) % BUSINESS_NAMES.length],
        owner_name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
        biography: `Leading company providing top-tier services since 200${i % 10}.`,
        phone_number: `905-555-${String(i).padStart(4, "0")}`,
        postal_address: `${i * 5} Bay Street, Toronto, ON`,
        location_lat: 43.65 + randomBetween(-0.1, 0.1),
        location_lon: -79.38 + randomBetween(-0.1, 0.1),
        verified: i % 2 === 0,
      },
    });
    businesses.push(biz);
  }
  console.log(`✅  ${businesses.length} businesses created`);

    // ── 5. Qualifications (20+, mixed statuses) ───────────────────────────────
    const qualStatuses = ["created", "submitted", "revised", "approved", "rejected"];
    const qualifications = [];

    // dummy pdf
    const dummyPdfDir = `uploads/regular/dummy/qualification/`;
    fs.mkdirSync(dummyPdfDir, { recursive: true });
    const dummyPdfPath = `${dummyPdfDir}dummyPDF.pdf`;
    if (!fs.existsSync(dummyPdfPath)) {
    // Minimal valid PDF
    fs.writeFileSync(dummyPdfPath, "%PDF-1.4\n1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj 2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj 3 0 obj<</Type /Page /MediaBox [0 0 612 792]>>endobj\nxref\n0 4\ntrailer<</Size 4 /Root 1 0 R>>\nstartxref\n9\n%%EOF");
    }

    for (let i = 0; i < 25; i++) {
    const user = regularUsers[i % regularUsers.length];
    const pos = positionTypes[i % positionTypes.length];
    const exists = qualifications.find(
        (q) => q.position_id === pos.position_id && q.user_id === user.id
    );
    if (exists) continue;

    const status = qualStatuses[i % qualStatuses.length];
    const needsDoc = ["submitted", "revised", "approved", "rejected"].includes(status);

    // Store the document at the path multer would use
    let documentPath = null;
    if (needsDoc) {
        const qualDir = `uploads/regular/${user.id}/qualification/`;
        fs.mkdirSync(qualDir, { recursive: true });
        const docPath = `${qualDir}document.pdf`;
        fs.copyFileSync(dummyPdfPath, docPath);
        documentPath = docPath;
    }

    const qual = await prisma.qualification.create({
        data: {
        position_id: pos.position_id,
        user_id: user.id,
        status,
        note: i % 2 === 0 ? "Reviewed by coordinator." : "",
        document: documentPath,
        },
    });
    qualifications.push({ ...qual, position_id: pos.position_id, user_id: user.id });
    }
  console.log(`✅  ${qualifications.length} qualifications created`);

  // ── 6. Job Postings (35, across all statuses) ─────────────────────────────
  const jobStatuses = ["open", "open", "open", "filled", "expired", "canceled", "completed"];
  const jobs = [];

  for (let i = 0; i < 35; i++) {
    const biz = businesses[i % businesses.length];
    const pos = positionTypes[i % positionTypes.length];
    const status = jobStatuses[i % jobStatuses.length];
    const salMin = randomInt(18, 40);
    const salMax = salMin + randomInt(5, 20);
    const salAvg = (salMin + salMax) / 2;

    // For filled/completed jobs assign a worker
    const assignedWorker =
      status === "filled" || status === "completed"
        ? regularUsers[i % regularUsers.length]
        : null;

    const startOffset = status === "open" ? randomInt(1, 30) : -randomInt(10, 60);
    const endOffset = startOffset + randomInt(1, 30);

    const job = await prisma.job.create({
      data: {
        position_id: pos.position_id,
        business_id: biz.id,
        regularuser_id: assignedWorker ? assignedWorker.id : null,
        salary_min: salMin,
        salary_max: salMax,
        salary_avg: salAvg,
        start_time: futureDate(startOffset),
        end_time: futureDate(endOffset),
        note: `Job posting #${i + 1} for ${pos.name} at ${biz.business_name}.`,
        status,
      },
    });
    jobs.push(job);
  }
  console.log(`✅  ${jobs.length} jobs created`);

  // ── 7. Interests + Negotiations ───────────────────────────────────────────
  // We'll create interests for open jobs, then escalate some to negotiations

  const openJobs = jobs.filter((j) => j.status === "open");
  const negoStatuses = ["active", "active", "success", "failed", "expired"];
  let interestCount = 0;
  let negoCount = 0;

  // Each open job gets 2–4 interested users
  for (let ji = 0; ji < openJobs.length; ji++) {
    const job = openJobs[ji];
    const numInterested = randomInt(2, 4);
    const usedUserIds = new Set();

    for (let ui = 0; ui < numInterested && ui < regularUsers.length; ui++) {
      const user = regularUsers[(ji * 4 + ui) % regularUsers.length];
      if (usedUserIds.has(user.id)) continue;
      usedUserIds.add(user.id);

      const interest = await prisma.interest.create({
        data: {
          user_id: user.id,
          job_id: job.job_id,
          user_interest: true,
          business_interest: ji % 2 === 0 ? true : null,
        },
      });
      interestCount++;

      // Escalate some interests to negotiations
      const shouldNegotiate = ui === 0 && ji % 2 === 0;
      if (shouldNegotiate) {
        const negoStatus = negoStatuses[negoCount % negoStatuses.length];
        await prisma.negotiation.create({
          data: {
            interest_id: interest.interest_id,
            user_id: user.id,
            business_id: job.business_id,
            job_id: job.job_id,
            status: negoStatus,
            candidate_decision: negoStatus === "success" ? "accept" : negoStatus === "failed" ? "decline" : null,
            business_decision: negoStatus === "success" ? "accept" : null,
            expiresAt: futureDate(negoStatus === "expired" ? -5 : 14),
          },
        });
        negoCount++;
      }
    }
  }

  // Also add mutual interests (both sides true) on some filled/completed jobs for realism
  const filledJobs = jobs.filter((j) => j.status === "filled" || j.status === "completed");
  for (let fi = 0; fi < filledJobs.length; fi++) {
    const job = filledJobs[fi];
    const user = regularUsers[fi % regularUsers.length];
    try {
      const interest = await prisma.interest.create({
        data: {
          user_id: user.id,
          job_id: job.job_id,
          user_interest: true,
          business_interest: true,
        },
      });
      interestCount++;

      await prisma.negotiation.create({
        data: {
          interest_id: interest.interest_id,
          user_id: user.id,
          business_id: job.business_id,
          job_id: job.job_id,
          status: "success",
          candidate_decision: "accept",
          business_decision: "accept",
          expiresAt: futureDate(30),
        },
      });
      negoCount++;
    } catch (_) {
      // skip duplicate interests
    }
  }

  console.log(`✅  ${interestCount} interests created`);
  console.log(`✅  ${negoCount} negotiations created`);

  console.log("\n🎉  Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log("  admin1@csc309.utoronto.ca  /  123123");
  console.log("  regular1–20@csc309.utoronto.ca  /  123123");
  console.log("  business1–10@csc309.utoronto.ca  /  123123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
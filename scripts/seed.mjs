import { readFileSync } from "node:fs";
import dns from "node:dns";
import { Agent, setGlobalDispatcher } from "undici";
import { createClient } from "@supabase/supabase-js";

const pinnedHosts = {
  "qvrehedvcmfawcyfgqgr.supabase.co": "172.64.149.246",
};

setGlobalDispatcher(
  new Agent({
    connect: {
      lookup(hostname, options, callback) {
        const pinned = pinnedHosts[hostname];
        if (pinned) {
          callback(null, [{ address: pinned, family: 4 }]);
          return;
        }
        dns.lookup(hostname, options, callback);
      },
    },
  })
);

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const password = "Academy2026!";

const staff = [
  { key: "admin", email: "admin@avzdax.com", full_name: "Ayobami Zenthos", role: "admin" },
  { key: "cv", email: "tutor.vision@avzdax.com", full_name: "Ngozi Okafor", role: "tutor" },
  { key: "cyber", email: "tutor.security@avzdax.com", full_name: "Emeka Nwosu", role: "tutor" },
  { key: "backend", email: "tutor.backend@avzdax.com", full_name: "Tunde Adeyemi", role: "tutor" },
  { key: "data", email: "tutor.data@avzdax.com", full_name: "Fatima Bello", role: "tutor" },
];

async function upsertUser(person) {
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const found = existing.users.find((user) => user.email === person.email);
  if (found) {
    await supabase.auth.admin.updateUserById(found.id, {
      password,
      user_metadata: { full_name: person.full_name, role: person.role },
    });
    await supabase.from("profiles").upsert({
      id: found.id,
      email: person.email,
      full_name: person.full_name,
      role: person.role,
    });
    return found.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email: person.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: person.full_name, role: person.role },
  });
  if (error) throw error;
  await supabase.from("profiles").upsert({
    id: data.user.id,
    email: person.email,
    full_name: person.full_name,
    role: person.role,
  });
  return data.user.id;
}

const courses = [
  {
    tutorKey: "cv",
    title: "Computer Vision",
    summary:
      "Teach machines to see. Build image classifiers, object detectors and segmentation models with modern deep learning.",
    modules: [
      {
        title: "Seeing with Machines",
        lessons: [
          { title: "How computers represent images", youtube_id: "oXlwWbU8l2o", body: "Pixels, channels and colour spaces: the raw material every vision model works with." },
          { title: "Convolutions and feature maps", youtube_id: "bMknfKXIFA8", body: "Why convolutional layers are the backbone of visual understanding." },
        ],
        quiz: {
          title: "Computer Vision Fundamentals",
          questions: [
            { prompt: "What does a convolutional layer primarily detect?", options: ["Local spatial features like edges", "Audio frequencies", "Database rows", "Network packets"], correct_index: 0 },
            { prompt: "What does RGB stand for?", options: ["Red, Green, Blue", "Raster Graphics Buffer", "Range Gain Balance", "Row Grid Block"], correct_index: 0 },
            { prompt: "Which operation reduces the spatial size of feature maps?", options: ["Pooling", "Padding", "Flattening", "Dropout"], correct_index: 0 },
            { prompt: "What is the purpose of data augmentation?", options: ["Increase training diversity", "Shrink the model", "Encrypt images", "Label data automatically"], correct_index: 0 },
            { prompt: "Which task labels every pixel in an image?", options: ["Semantic segmentation", "Classification", "Regression", "Clustering"], correct_index: 0 },
            { prompt: "What does IoU (Intersection over Union) measure?", options: ["Overlap of predicted and true boxes", "Model size", "Learning rate", "Colour depth"], correct_index: 0 },
            { prompt: "Which library is most associated with classical computer vision?", options: ["OpenCV", "Express", "Pandas", "Redis"], correct_index: 0 },
            { prompt: "What is an epoch during training?", options: ["One full pass over the dataset", "A single pixel", "A type of layer", "A loss function"], correct_index: 0 },
          ],
        },
        assignment: {
          title: "Classify a small image dataset",
          instructions: "Train a simple classifier on any small dataset and submit a link to your notebook or repo.",
        },
      },
      {
        title: "Detection and Segmentation",
        lessons: [
          { title: "Object detection in practice", youtube_id: "OcycT1Jwsns", body: "Bounding boxes, anchors and the detectors used in industry." },
          { title: "Segmentation architectures", youtube_id: "i_LwzRVP7bg", body: "From U-Net to modern segmentation networks." },
        ],
      },
      {
        title: "Shipping Vision Models",
        lessons: [
          { title: "Deploying a vision model", youtube_id: "gSSsZReIFRk", body: "Take a trained model to a live, usable endpoint." },
        ],
      },
    ],
  },
  {
    tutorKey: "cyber",
    title: "Cybersecurity",
    summary:
      "Defend systems like an attacker thinks. Learn threat modelling, network defence, and secure engineering from the ground up.",
    modules: [
      {
        title: "Security Foundations",
        lessons: [
          { title: "The CIA triad and threat models", youtube_id: "U_P23SqJaDc", body: "Confidentiality, integrity and availability: the lens for every security decision." },
          { title: "How attacks actually happen", youtube_id: "3Kq1MIfTWCE", body: "Walk through the anatomy of common real-world attacks." },
        ],
        quiz: {
          title: "Cybersecurity Essentials",
          questions: [
            { prompt: "What does the C in the CIA triad stand for?", options: ["Confidentiality", "Control", "Compliance", "Continuity"], correct_index: 0 },
            { prompt: "Which attack floods a server to make it unavailable?", options: ["Denial of Service", "Phishing", "SQL injection", "Spoofing"], correct_index: 0 },
            { prompt: "What is phishing?", options: ["Tricking users into revealing secrets", "Encrypting a disk", "Scanning ports", "Patching software"], correct_index: 0 },
            { prompt: "What does a firewall primarily do?", options: ["Filter network traffic", "Store passwords", "Compress files", "Render web pages"], correct_index: 0 },
            { prompt: "Which is the strongest password practice?", options: ["Long, unique, with MFA", "Reusing one strong password", "Short but complex", "Writing it on a note"], correct_index: 0 },
            { prompt: "What is the purpose of encryption?", options: ["Protect data confidentiality", "Speed up the network", "Compress data", "Index a database"], correct_index: 0 },
            { prompt: "What does SQL injection target?", options: ["Databases via unsanitised input", "Firewalls", "CPU registers", "DNS servers"], correct_index: 0 },
            { prompt: "What is a zero-day vulnerability?", options: ["A flaw with no available patch", "A daily backup", "A password reset", "A type of firewall"], correct_index: 0 },
          ],
        },
        assignment: {
          title: "Threat-model a simple app",
          instructions: "Pick any small app and write a short threat model: assets, threats, and mitigations.",
        },
      },
      {
        title: "Network and Application Defence",
        lessons: [
          { title: "Securing the network layer", youtube_id: "qiQR5rTSshw", body: "Firewalls, segmentation and monitoring done right." },
          { title: "Web application security", youtube_id: "3Kq1MIfTWCE", body: "OWASP Top 10 and how to defend against each." },
        ],
      },
      {
        title: "Responding to Incidents",
        lessons: [
          { title: "Incident response basics", youtube_id: "gSSsZReIFRk", body: "Detect, contain, eradicate, recover." },
        ],
      },
    ],
  },
  {
    tutorKey: "backend",
    title: "Backend Development",
    summary:
      "Build the engine behind real products. APIs, databases, auth and deployment, taught the way production teams work.",
    modules: [
      {
        title: "APIs and the Web",
        lessons: [
          { title: "How the internet actually works", youtube_id: "7_LPdttKXPc", body: "Requests, responses and what happens between browser and server." },
          { title: "Designing REST APIs", youtube_id: "Oe421EPjeBE", body: "Resources, verbs and status codes that make sense." },
        ],
        quiz: {
          title: "Backend Fundamentals",
          questions: [
            { prompt: "What does REST primarily describe?", options: ["An architectural style for APIs", "A database engine", "A CSS framework", "A cipher"], correct_index: 0 },
            { prompt: "Which HTTP method replaces a resource idempotently?", options: ["PUT", "POST", "PATCH", "CONNECT"], correct_index: 0 },
            { prompt: "Which status code means Not Found?", options: ["404", "200", "301", "500"], correct_index: 0 },
            { prompt: "What is the purpose of a database index?", options: ["Speed up queries", "Encrypt rows", "Back up data", "Format output"], correct_index: 0 },
            { prompt: "What does JWT stand for?", options: ["JSON Web Token", "Java Web Toolkit", "Joint Web Transfer", "JSON Web Table"], correct_index: 0 },
            { prompt: "How do you best prevent SQL injection?", options: ["Parameterised queries", "String concatenation", "Disabling logs", "Using GET only"], correct_index: 0 },
            { prompt: "What is middleware?", options: ["Code between request and response", "A database table", "A CSS layer", "A CPU cache"], correct_index: 0 },
            { prompt: "What does ACID guarantee?", options: ["Reliable transactions", "Faster CSS", "Smaller images", "Better SEO"], correct_index: 0 },
          ],
        },
        assignment: {
          title: "Build a small REST API",
          instructions: "Create an API with at least two endpoints and submit the repository link.",
        },
      },
      {
        title: "Data and Persistence",
        lessons: [
          { title: "Relational databases and SQL", youtube_id: "HXV3zeQKqGY", body: "Model data and query it with confidence." },
          { title: "Authentication and sessions", youtube_id: "PkZNo7MFNFg", body: "Log users in securely and manage sessions." },
        ],
      },
      {
        title: "Deploying to Production",
        lessons: [
          { title: "From localhost to the world", youtube_id: "gSSsZReIFRk", body: "Ship your API to a live environment." },
        ],
      },
    ],
  },
  {
    tutorKey: "data",
    title: "Data Intelligence",
    summary:
      "Turn raw data into decisions. Analytics, statistics and machine learning applied to real business problems.",
    modules: [
      {
        title: "Working with Data",
        lessons: [
          { title: "The data pipeline", youtube_id: "rfscVS0vtbw", body: "Extract, transform and load: how data gets ready for analysis." },
          { title: "Exploratory analysis", youtube_id: "HXV3zeQKqGY", body: "Ask questions of data and let it answer." },
        ],
        quiz: {
          title: "Data Intelligence Basics",
          questions: [
            { prompt: "What does ETL stand for?", options: ["Extract, Transform, Load", "Encode, Test, Log", "Evaluate, Train, Learn", "Export, Table, Link"], correct_index: 0 },
            { prompt: "Which measure is the middle value of a sorted dataset?", options: ["Median", "Mean", "Mode", "Range"], correct_index: 0 },
            { prompt: "What is overfitting?", options: ["Memorising training data, failing to generalise", "Too little data", "A slow query", "A syntax error"], correct_index: 0 },
            { prompt: "Which chart best shows correlation between two variables?", options: ["Scatter plot", "Pie chart", "Bar chart", "Gauge"], correct_index: 0 },
            { prompt: "What is a feature in machine learning?", options: ["An input variable", "A bug", "A chart", "A database"], correct_index: 0 },
            { prompt: "What does SQL GROUP BY do?", options: ["Aggregate rows by column values", "Delete rows", "Encrypt columns", "Sort files"], correct_index: 0 },
            { prompt: "Why use a training/test split?", options: ["Evaluate on unseen data", "Speed up loading", "Save disk space", "Hide data"], correct_index: 0 },
            { prompt: "Which metric balances precision and recall?", options: ["F1 score", "Latency", "Throughput", "Entropy"], correct_index: 0 },
          ],
        },
        assignment: {
          title: "Analyse a dataset",
          instructions: "Explore any dataset, share three insights and a chart. Submit a link to your notebook.",
        },
      },
      {
        title: "Modelling and Prediction",
        lessons: [
          { title: "Intro to machine learning", youtube_id: "i_LwzRVP7bg", body: "How models learn patterns from data." },
          { title: "Evaluating models", youtube_id: "rfscVS0vtbw", body: "Know whether your model is actually good." },
        ],
      },
      {
        title: "Communicating Insight",
        lessons: [
          { title: "Telling stories with data", youtube_id: "gSSsZReIFRk", body: "Turn analysis into decisions people act on." },
        ],
      },
    ],
  },
];

async function main() {
  const ids = {};
  for (const person of staff) {
    ids[person.key] = await upsertUser(person);
    console.log(`user ready: ${person.email}`);
  }

  await supabase.from("submissions").delete().not("id", "is", null);
  await supabase.from("notifications").delete().not("id", "is", null);
  await supabase.from("courses").delete().not("id", "is", null);

  const courseIdByTitle = {};

  for (const course of courses) {
    const { data: courseRow } = await supabase
      .from("courses")
      .insert({
        title: course.title,
        summary: course.summary,
        created_by: ids[course.tutorKey],
        tutor_id: ids[course.tutorKey],
        is_published: true,
      })
      .select()
      .single();
    courseIdByTitle[course.title] = courseRow.id;

    let modulePosition = 0;
    for (const unit of course.modules) {
      const { data: moduleRow } = await supabase
        .from("modules")
        .insert({ course_id: courseRow.id, title: unit.title, position: modulePosition++ })
        .select()
        .single();

      let lessonPosition = 0;
      for (const lesson of unit.lessons) {
        await supabase.from("lessons").insert({
          module_id: moduleRow.id,
          title: lesson.title,
          youtube_id: lesson.youtube_id,
          body: lesson.body,
          position: lessonPosition++,
        });
      }

      if (unit.quiz) {
        const { data: quizRow } = await supabase
          .from("quizzes")
          .insert({ module_id: moduleRow.id, title: unit.quiz.title, pass_score: 70 })
          .select()
          .single();
        let questionPosition = 0;
        for (const question of unit.quiz.questions) {
          await supabase.from("quiz_questions").insert({
            quiz_id: quizRow.id,
            prompt: question.prompt,
            options: question.options,
            correct_index: question.correct_index,
            position: questionPosition++,
          });
        }
      }

      if (unit.assignment) {
        await supabase.from("assignments").insert({
          module_id: moduleRow.id,
          title: unit.assignment.title,
          instructions: unit.assignment.instructions,
          due_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        });
      }
    }

    await supabase.from("class_sessions").insert({
      course_id: courseRow.id,
      title: `${course.title} · Live Kickoff`,
      teams_url: "https://teams.microsoft.com/l/meetup-join/avzdax-kickoff",
      starts_at: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      duration_minutes: 90,
    });

    console.log(`course ready: ${course.title}`);
  }

  const learners = [
    { email: "student@avzdax.com", full_name: "Chiamaka Eze", course: "Backend Development" },
    { email: "student.vision@avzdax.com", full_name: "Zainab Yusuf", course: "Computer Vision" },
    { email: "student.security@avzdax.com", full_name: "David Okoro", course: "Cybersecurity" },
    { email: "student.backend@avzdax.com", full_name: "Grace Adeyinka", course: "Backend Development" },
    { email: "student.data@avzdax.com", full_name: "Ibrahim Sani", course: "Data Intelligence" },
  ];

  for (const learner of learners) {
    const learnerId = await upsertUser({
      email: learner.email,
      full_name: learner.full_name,
      role: "student",
    });
    await supabase.from("enrollments").upsert(
      { student_id: learnerId, course_id: courseIdByTitle[learner.course], status: "active" },
      { onConflict: "student_id,course_id" }
    );
    await supabase.from("notifications").insert({
      recipient_id: learnerId,
      title: "Welcome to Avzdax Academy",
      body: `Your ${learner.course} course is ready. Head to your dashboard to begin.`,
      href: "/learn/course",
    });
    console.log(`student ready: ${learner.email} (${learner.course})`);
  }

  console.log("seed complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

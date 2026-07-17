import { readFileSync } from "node:fs";
import dns from "node:dns";
import { Agent, setGlobalDispatcher } from "undici";
import { createClient } from "@supabase/supabase-js";

setGlobalDispatcher(
  new Agent({
    connect: {
      lookup(hostname, options, callback) {
        if (hostname === "qvrehedvcmfawcyfgqgr.supabase.co") {
          callback(null, [{ address: "172.64.149.246", family: 4 }]);
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const action = process.argv[2];
const email = "audit.student@avzdax.test";

if (action === "create") {
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  let id = existing.users.find((u) => u.email === email)?.id;
  if (!id) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: "Audit@Test2026",
      email_confirm: true,
      user_metadata: { full_name: "Audit Student", role: "student" },
    });
    if (error) throw error;
    id = data.user.id;
  }
  await supabase.from("profiles").upsert({ id, email, full_name: "Audit Student", role: "student" });
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("title", "Backend Development")
    .single();
  await supabase
    .from("enrollments")
    .upsert({ student_id: id, course_id: course.id, status: "active" }, { onConflict: "student_id,course_id" });
  console.log("temp student ready, enrolled in Backend Development");
}

if (action === "delete") {
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const id = existing.users.find((u) => u.email === email)?.id;
  if (id) await supabase.auth.admin.deleteUser(id);
  await supabase.from("submissions").delete().not("id", "is", null);
  await supabase.from("notifications").delete().not("id", "is", null);
  console.log("temp student removed, test submissions/notifications cleared");
}

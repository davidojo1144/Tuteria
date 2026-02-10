"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../components/Toast";
function slugifyTemplate(v: string) {
  return v.toLowerCase().replace(/\s+/g, "_");
}
export default function SendMailPage() {
  const [recipient, setRecipient] = useState("");
  const [template, setTemplate] = useState("Blank Email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [trackOpens, setTrackOpens] = useState(false);
  const [trackClicks, setTrackClicks] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const { show } = useToast();
  useEffect(() => {
    const s = typeof window !== "undefined" ? window.localStorage.getItem("emailflow-draft") : null;
    if (s) {
      try {
        const d = JSON.parse(s);
        setRecipient(d.recipient || "");
        setTemplate(d.template || "Blank Email");
        setSubject(d.subject || "");
        setBody(d.body || "");
        setTrackOpens(!!d.trackOpens);
        setTrackClicks(d.trackClicks !== false);
      } catch {}
    }
  }, []);
  const saveDraft = () => {
    const d = { recipient, template, subject, body, trackOpens, trackClicks };
    if (typeof window !== "undefined") window.localStorage.setItem("emailflow-draft", JSON.stringify(d));
    setMessage("Draft saved");
  };
  const applyFormat = (kind: "bold" | "italic" | "underline" | "list" | "link" | "code") => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const sel = body.slice(start, end);
    let insert = "";
    if (kind === "bold") insert = `**${sel || "text"}**`;
    else if (kind === "italic") insert = `_${sel || "text"}_`;
    else if (kind === "underline") insert = `<u>${sel || "text"}</u>`;
    else if (kind === "list") insert = sel ? sel.split("\n").map((l: string) => (l ? `- ${l}` : l)).join("\n") : "- item";
    else if (kind === "link") insert = sel ? `[${sel}](https://example.com)` : `[link text](https://example.com)`;
    else insert = `\`${sel || "code"}\``;
    const updated = body.slice(0, start) + insert + body.slice(end);
    setBody(updated);
    requestAnimationFrame(() => {
      const pos = start + insert.length;
      el.selectionStart = pos;
      el.selectionEnd = pos;
      el.focus();
    });
  };
  const canSend = useMemo(() => recipient.trim() && subject.trim() && body.trim(), [recipient, subject, body]);
  const onSend = async () => {
    if (!canSend) {
      setMessage("Please fill required fields");
      return;
    }
    setLoading(true);
    setMessage(null);
    const payload = {
      to: recipient.trim(),
      from: "Medbuddy <info@medbuddyafrica.com>",
      template: slugifyTemplate(template),
      context: {
        subject_line: subject.trim(),
        email_body: body,
        track_opens: trackOpens,
        track_clicks: trackClicks,
        referral_tracking_page_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || "https://medbuddyafrica.com"}/app/referrals`,
        recipient: recipient.trim(),
      },
      environment: "staging",
    };
    try {
      const res = await fetch("/api/send-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage("Email queued or sent via workflow");
        show({
          type: "success",
          title: "Email Sent",
          message: "Your email has been queued successfully",
          duration: 4000,
        });
      } else {
        const msg = `Error: ${data?.detail || res.statusText}`;
        setMessage(msg);
        show({ type: "error", title: "Failed", message: msg, duration: 6000 });
      }
    } catch (e) {
      setMessage((e as any)?.message || "Network error");
      show({ type: "error", title: "Network error", message: (e as any)?.message || "Check connection" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] px-6 lg:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined text-2xl">mail</span>
          </div>
          <h2 className="text-primary dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">EmailFlow</h2>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a className="hover:text-primary dark:hover:text-white transition-colors" href="#">Dashboard</a>
            <a className="text-primary dark:text-white" href="#">Campaigns</a>
            <a className="hover:text-primary dark:hover:text-white transition-colors" href="#">Analytics</a>
            <a className="hover:text-primary dark:hover:text-white transition-colors" href="#">Settings</a>
          </nav>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
          <button className="flex items-center justify-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors">
            <span>Log Out</span>
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white dark:border-gray-800 shadow-sm"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBBRWpfvoISkYOQBtFi7aD0HLYD9E74tqNBspQi_LIXNxDP5N5MVdFvM3Phujh_h0AvXyuMPnEmESc3sqitS4yxPWt6lLdB17b8TOHMnOzzVAkcWrb7DJuwQAj1OUz49RcJ4RGoEjcTvvXBqj5AIHQ-wxFG0tcYVLIsdUNByZ0PweO0QND_QtK539-UeSrDfrFqd2EANq7MjCclx9mWGaH0oq1IbJ3ZDL9MFAw_UhnqJBD3FY5yWygGhK9nvPk_LQ8uTO6D1YWIh-tO")',
            }}
          ></div>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-start py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight text-primary dark:text-white">New Campaign</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Configure and trigger automated email workflows for your subscriber lists.</p>
            </div>
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-primary dark:text-white">Workflow Status</h3>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-700 dark:text-green-400">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary dark:text-white">Backend Connected</p>
                    <p className="text-xs text-gray-500">Latency: 24ms</p>
                  </div>
                </div>
                <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Quota</span>
                  <span className="text-sm font-bold text-primary dark:text-white">8,450 / 10,000</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className="bg-primary dark:bg-white h-2 rounded-full" style={{ width: "84%" }}></div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-3">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recent Triggers</h4>
              <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-[#111111] hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-800 border border-transparent transition-all cursor-pointer">
                <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-sm">send</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary dark:text-white truncate">Onboarding Welcome</p>
                  <p className="text-xs text-gray-500 truncate">Sent to mark@example.com</p>
                </div>
                <span className="text-xs text-gray-400">2m ago</span>
              </div>
              <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-[#111111] hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-800 border border-transparent transition-all cursor-pointer">
                <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <span className="material-symbols-outlined text-sm">warning</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary dark:text-white truncate">Password Reset</p>
                  <p className="text-xs text-gray-500 truncate">Failed: Invalid SMTP</p>
                </div>
                <span className="text-xs text-gray-400">1h ago</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
              <div
                className="h-32 w-full bg-cover bg-center relative"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMQFcjmZCnhDIAaHN-_j0opcR_1NSUWXiTY8-jKs-ZzJzNlABtYm9XBEB2_rHK0l5Y-z2zEF9ph-t3XmyCG_OXX8Ovii0gTtWkXdcsyF3QVSlnkzbZvht1bLedA1-VvNqwMmdj8jU2QWwkMvbMGUgC3mEoXvJKpv6bQVPkNcpgVQEA9_sH7QPz-ciaAi-RuklK1DwxT2rHRKaIp7Ka3OBoG540A34WwEtQmAp25bwVo-c6DEq47r46EKjkNowdCRYCDk1BIp2ydSkc")',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-6 text-white">
                  <h2 className="text-2xl font-bold">Compose Email</h2>
                </div>
              </div>
              <form className="p-6 md:p-8 flex flex-col gap-6 flex-1" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary dark:text-white flex items-center gap-2" htmlFor="recipient">
                      Recipient Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400">person</span>
                      </div>
                      <input
                        className="pl-10 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] text-primary dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition-shadow py-3 placeholder-gray-400 text-sm font-medium"
                        id="recipient"
                        placeholder="client@company.com"
                        type="email"
                        value={recipient}
                      onChange={(e: any) => setRecipient(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary dark:text-white flex items-center gap-2" htmlFor="template">
                      Template
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400">description</span>
                      </div>
                      <select
                        className="pl-10 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] text-primary dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition-shadow py-3 text-sm font-medium appearance-none"
                        id="template"
                        value={template}
                        onChange={(e: any) => setTemplate(e.target.value)}
                      >
                        <option>Blank Email</option>
                        <option>Weekly Newsletter</option>
                        <option>Product Launch</option>
                        <option>Transactional Alert</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary dark:text-white flex items-center gap-2" htmlFor="subject">
                    Subject Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] text-primary dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition-shadow py-3 px-4 placeholder-gray-400 text-sm font-medium"
                    id="subject"
                    placeholder="Enter a compelling subject..."
                    type="text"
                    value={subject}
                    onChange={(e: any) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1 min-h-[300px]">
                  <label className="text-sm font-bold text-primary dark:text-white flex items-center justify-between" htmlFor="body">
                    <span>Email Body</span>
                    <span className="text-xs font-normal text-gray-400">Markdown supported</span>
                  </label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col flex-1 bg-white dark:bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-primary dark:focus-within:ring-white transition-shadow">
                    <div className="bg-gray-50 dark:bg-[#222] border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors" type="button" onClick={() => applyFormat("bold")}>
                        <span className="material-symbols-outlined text-[20px]">format_bold</span>
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors" type="button" onClick={() => applyFormat("italic")}>
                        <span className="material-symbols-outlined text-[20px]">format_italic</span>
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors" type="button" onClick={() => applyFormat("underline")}>
                        <span className="material-symbols-outlined text-[20px]">format_underlined</span>
                      </button>
                      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                      <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors" type="button" onClick={() => applyFormat("list")}>
                        <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors" type="button" onClick={() => applyFormat("link")}>
                        <span className="material-symbols-outlined text-[20px]">link</span>
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors ml-auto" type="button" onClick={() => applyFormat("code")}>
                        <span className="material-symbols-outlined text-[20px]">code</span>
                      </button>
                    </div>
                    <textarea
                      className="w-full h-full p-4 bg-transparent border-none focus:ring-0 text-primary dark:text-white text-base resize-none"
                      id="body"
                      placeholder="Start typing your email content here..."
                      value={body}
                      onChange={(e: any) => setBody(e.target.value)}
                      ref={bodyRef}
                    ></textarea>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input className="rounded border-gray-300 text-primary focus:ring-primary dark:bg-[#1a1a1a] dark:border-gray-600" type="checkbox" checked={trackOpens} onChange={(e: any) => setTrackOpens(e.target.checked)} />
                      <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-white transition-colors">Track opens</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input className="rounded border-gray-300 text-primary focus:ring-primary dark:bg-[#1a1a1a] dark:border-gray-600" type="checkbox" checked={trackClicks} onChange={(e: any) => setTrackClicks(e.target.checked)} />
                      <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-white transition-colors">Track clicks</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors" type="button" onClick={saveDraft}>
                      Save Draft
                    </button>
                    <button
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary dark:bg-white text-white dark:text-primary text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 dark:shadow-white/10 disabled:opacity-60"
                      type="button"
                      onClick={onSend}
                      disabled={loading || !canSend}
                    >
                      <span>{loading ? "Sending..." : "Send Email"}</span>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                  </div>
                </div>
                {message && <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>}
              </form>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-6 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">© 2023 EmailFlow Automation Inc. All rights reserved.</p>
      </footer>
    </>
  );
}

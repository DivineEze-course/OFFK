/* eslint-disable @typescript-eslint/no-require-imports -- Node CLI script, CommonJS by design. */
const fs = require("node:fs");
const types = fs.readFileSync("node_modules/lucide-react/dist/lucide-react.d.ts", "utf8");
const icons = ["Wifi","Zap","BatteryCharging","Droplets","WavesHorizontal","BedDouble","CookingPot","Bath","ShowerHead","ShieldCheck","Camera","Car","WashingMachine","Wind","BookOpen","MapPin","Ruler","Users","House","Building","Heart","Share2","ChevronLeft","ChevronRight","X","Clock","BadgeCheck","SearchX","SlidersHorizontal","ArrowUpDown","ListFilter","Compass","KeyRound","Sparkles","Route","ExternalLink","LocateFixed","ZoomIn","ZoomOut","Crosshair","Send","MessageSquare","CalendarDays","Mail","Lock","Eye","EyeOff","GraduationCap","LayoutDashboard","Wallet","FileText","TrendingUp","CircleCheck","CircleX","Hourglass","CircleDot","Plus","Minus","Info","Sun","Moon","SunMoon","Menu","UserRound","LogOut","LayoutGrid","FlaskConical","Armchair","Refrigerator","ShowerHead","Bath"];
const missing = icons.filter((name) => !new RegExp(`declare const ${name}[\\s:,)]`).test(types));
console.log(missing.length ? "MISSING: " + missing.join(", ") : "ALL PRESENT");

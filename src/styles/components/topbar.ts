import { cn } from "@/lib/utils";

export const topbarStyles = {
  container: cn(
    "h-16 bg-slate-900 border-b border-slate-700 fixed top-0 left-0 right-0",
    "flex items-center justify-between px-6 z-50 text-white shadow-md"
  ),

  button: {
    base: cn(
      "text-sm font-medium px-4 py-2 rounded-lg transition-all z-50",
      "text-white border border-white hover:border-white hover:bg-slate-700"
    ),
    ghost: "hover:bg-slate-800 text-white px-3 py-2 rounded-lg"
  },

  logo: {
    container: "bg-blue flex items-center justify-center text-2xl font-bold text-white",
    text: "text-xl font-bold text-white tracking-wide"
  },

  search: {
    container: "relative flex items-center",
    input: cn(
      "pl-10 pr-4 py-2 w-72 rounded-lg border transition-all",
      "bg-slate-800 border-slate-700 text-white",
      "placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
      "focus:border-transparent"
    ),
    icon: "absolute left-3 text-slate-400"
  },

  notifications: {
    container: "flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-all",
    text: "text-sm font-medium text-white",
    icon: "text-white h-5 w-5"
  },

  iaStatus: {
    container: "flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-all",
    icon: "h-5 w-5 text-blue-500",
    text: "text-sm font-medium text-white"
  },

  nav: {
    container: "flex items-center space-x-3",
    link: cn(
      "px-3 py-2 rounded-lg text-white transition-all",
      "hover:bg-slate-800 flex items-center space-x-2"
    )
  }
};

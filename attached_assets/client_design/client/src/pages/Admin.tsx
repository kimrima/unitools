import { useState } from "react";
import { Link } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  TrendingUp, 
  DollarSign, 
  HardDrive 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <Link href="/">
             <a className="flex items-center gap-1 group">
                <span className="font-extrabold text-2xl tracking-tighter text-white">
                  Uni<span className="text-primary">Tools</span>.
                </span>
                <span className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400 uppercase">Admin</span>
             </a>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
           {[
             { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
             { id: "users", icon: Users, label: "Users" },
             { id: "files", icon: FileText, label: "Files Log" },
             { id: "settings", icon: Settings, label: "Settings" }
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                 activeTab === item.id 
                   ? "bg-primary text-white shadow-lg shadow-primary/20" 
                   : "hover:bg-slate-800 hover:text-white"
               }`}
             >
               <item.icon className="w-5 h-5" />
               {item.label}
             </button>
           ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <Link href="/login">
             <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-400">
               <LogOut className="w-5 h-5" />
               Sign Out
             </button>
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
           <h2 className="font-bold text-lg capitalize">{activeTab}</h2>
           <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 outline-none"
                 />
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500" />
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Dashboard View */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: "Total Revenue", value: "$12,450", change: "+12%", icon: DollarSign, color: "bg-green-100 text-green-600" },
                   { label: "Active Users", value: "1,240", change: "+5%", icon: Users, color: "bg-blue-100 text-blue-600" },
                   { label: "Files Processed", value: "85,032", change: "+24%", icon: HardDrive, color: "bg-purple-100 text-purple-600" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                         <div className={`p-3 rounded-xl ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                         </div>
                         <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" /> {stat.change}
                         </div>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                      <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                   </div>
                 ))}
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Recent Transactions</h3>
                    <Button variant="outline" size="sm">View All</Button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                          <tr>
                             <th className="px-6 py-3">User</th>
                             <th className="px-6 py-3">Plan</th>
                             <th className="px-6 py-3">Date</th>
                             <th className="px-6 py-3">Status</th>
                             <th className="px-6 py-3 text-right">Amount</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {[
                            { user: "alex@example.com", plan: "Pro Monthly", date: "Oct 24, 2024", status: "Active", amount: "$12.00" },
                            { user: "sarah@design.co", plan: "Team Yearly", date: "Oct 23, 2024", status: "Active", amount: "$348.00" },
                            { user: "mike@dev.io", plan: "Pro Monthly", date: "Oct 23, 2024", status: "Pending", amount: "$12.00" },
                            { user: "lisa@corp.net", plan: "Team Monthly", date: "Oct 22, 2024", status: "Active", amount: "$39.00" },
                          ].map((row, i) => (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{row.user}</td>
                                <td className="px-6 py-4 text-slate-500">{row.plan}</td>
                                <td className="px-6 py-4 text-slate-500">{row.date}</td>
                                <td className="px-6 py-4">
                                   <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {row.status}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-900">{row.amount}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
          )}
          
          {activeTab !== "dashboard" && (
             <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <Settings className="w-12 h-12 mb-4 opacity-20" />
                <p>This section is under construction.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
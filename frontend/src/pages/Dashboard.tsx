import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Input, Button, WhatsAppIcon, Avatar } from '../components/ui';
import api from '../api/client';
import { Search, Filter, Calendar, RefreshCw, Phone } from 'lucide-react';


interface Record {
  id: number;
  name: string;
  category: string;
  date: string;
  status: string;
}

interface Enquiry {
  id: number;
  month: string;
  year: number;
  value: number;
}

export function Dashboard() {
  const [data, setData] = useState<Record[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setData((prev) => {
        const shuffled = [...prev];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      });
      setIsShuffling(false);
    }, 600);
  };

  const fetchRecords = async () => {
    try {
      const res = await api.get('/records', {
        params: { page, limit: 10, search }
      });
      setData(res.data.records);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/enquiries');
      setEnquiries(res.data);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, search]);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-3 sm:gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 shrink-0">
        <Card className="glass flex flex-col justify-center px-4 py-3">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Filter className="w-3.5 h-3.5" /> <span className="text-xs font-semibold uppercase tracking-wider">Daily Records</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-brand-600 dark:text-brand-400 leading-none">24</span>
            <span className="text-[10px] text-slate-500 leading-none">Records added today</span>
          </div>
        </Card>
        
        <Card className="glass sm:col-span-1 lg:col-span-2 px-4 py-3">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-2">
            <Calendar className="w-3.5 h-3.5" /> <span className="text-xs font-semibold uppercase tracking-wider">Monthly Enquiries (Jan 2026 - Dec 2030)</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x custom-scrollbar">
            {enquiries.length > 0 ? (
              enquiries.map((enq) => (
                <div key={enq.id} className="snap-start flex-none flex flex-col items-center justify-center min-w-[3.5rem] bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700 py-1 px-2">
                  <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 leading-none">{enq.month}</span>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">{enq.year}</span>
                  <span className="text-[13px] font-black text-blue-600 dark:text-blue-400 mt-1 leading-none">{enq.value}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 p-2">Loading...</span>
            )}
          </div>
        </Card>
      </div>

      <Card className="glass flex flex-col min-h-0 flex-1 overflow-hidden">
        <CardHeader className="shrink-0 border-b border-slate-200 dark:border-dark-border py-3 px-4 sm:px-6 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex items-center gap-3">
            <CardTitle>Recent Enquiries</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleShuffle} disabled={isShuffling} className="px-2 h-8" title="Shuffle Records">
              <RefreshCw className={`w-4 h-4 ${isShuffling ? 'animate-spin text-brand-600' : 'text-slate-500'}`} />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search name..." 
                className="pl-9 w-full sm:w-64"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </CardHeader>
        
        <div className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-500 dark:text-slate-400 uppercase sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-2.5 font-medium">Name</th>
                <th className="px-6 py-2.5 font-medium text-center">Contact</th>
                <th className="px-6 py-2.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-200 dark:divide-dark-border transition-opacity duration-300 ${isShuffling ? 'opacity-40' : 'opacity-100'}`}>
              {data.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-3">
                      <Avatar name={record.name} />
                      {record.name}
                    </div>
                  </td>
                  <td className="px-6 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                         <Phone className="w-3.5 h-3.5" />
                       </Button>
                       <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full text-[#25D366] hover:bg-[#25D366]/10 dark:hover:bg-[#25D366]/20">
                         <WhatsAppIcon className="w-4 h-4" />
                       </Button>
                    </div>
                  </td>
                  <td className="px-6 py-2.5 text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
                      record.status === 'Interested' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400' :
                      record.status === 'Completed' ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400' :
                      record.status === 'In Progress' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-slate-100 text-slate-700 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="shrink-0 border-t border-slate-200 dark:border-dark-border px-6 py-3 flex items-center justify-between bg-white/50 dark:bg-dark-card/50 backdrop-blur-md">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-slate-900 dark:text-slate-100">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-100">{Math.min(page * 10, total)}</span> of <span className="font-medium text-slate-900 dark:text-slate-100">{total}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

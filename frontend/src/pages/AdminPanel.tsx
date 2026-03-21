import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, WhatsAppIcon, Avatar } from '../components/ui';
import api from '../api/client';
import { Plus, Edit2, Trash2, Phone } from 'lucide-react';


interface Record {
  id?: number;
  name: string;
  category: string;
  date: string;
  status: string;
  gender?: string;
  origin?: string;
}

interface Enquiry {
  id: number;
  month: string;
  year: number;
  value: number;
}

export function AdminPanel() {
  const [data, setData] = useState<Record[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [activeTab, setActiveTab] = useState<'records' | 'enquiries'>('records');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [genderFilter, setGenderFilter] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Record | null>(null);
  const [formData, setFormData] = useState<Record>({ name: '', category: 'Design', date: new Date().toISOString().split('T')[0], status: 'Interested' });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/records', {
        params: { 
          page, 
          limit: 10,
          gender: genderFilter || undefined,
          origin: originFilter || undefined
        }
      });
      setData(res.data.records);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      console.error('Error fetching records:', error);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/enquiries');
      setEnquiries(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, genderFilter, originFilter]);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleEnquiryChange = (id: number, val: string) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, value: parseInt(val) || 0 } : e));
  };

  const saveEnquiry = async (id: number, val: number) => {
    try {
      await api.put(`/enquiries/${id}`, { value: val });
    } catch (e) {
      console.error(e);
      alert('Failed to save enquiry value');
    }
  };

  const handleOpenModal = (record?: Record) => {
    if (record) {
      setCurrentRecord(record);
      setFormData(record);
    } else {
      setCurrentRecord(null);
      setFormData({ name: '', category: 'Design', date: new Date().toISOString().split('T')[0], status: 'Interested' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentRecord?.id) {
        await api.put(`/records/${currentRecord.id}`, formData);
      } else {
        await api.post('/records', formData);
      }
      setIsModalOpen(false);
      fetchRecords(); // Refresh the data
    } catch (error) {
      console.error('Error saving record', error);
      alert('Failed to save record.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/records/${id}`);
        fetchRecords(); // Refresh
      } catch (error) {
        console.error('Error deleting record', error);
        alert('Failed to delete record.');
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Panel</h1>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Record
        </Button>
      </div>

      <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 pb-px mb-6">
        <button 
          className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'records' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          onClick={() => setActiveTab('records')}
        >
          Manage Employees
        </button>
        <button 
          className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'enquiries' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          onClick={() => setActiveTab('enquiries')}
        >
          Monthly Enquiries
        </button>
      </div>

      {activeTab === 'records' ? (
        <Card className="glass animate-in fade-in duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Manage Records</CardTitle>
            <div className="flex gap-2">
              <select 
                className="h-8 rounded-md border border-slate-300 bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:text-slate-100 dark:bg-dark-card"
                value={genderFilter}
                onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Genders</option>
                <option value="Male">Men</option>
                <option value="Female">Women</option>
              </select>
              <select 
                className="h-8 rounded-md border border-slate-300 bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:text-slate-100 dark:bg-dark-card"
                value={originFilter}
                onChange={(e) => { setOriginFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Origins</option>
                <option value="Indian">Indian Names</option>
                <option value="Foreign">Foreign Names</option>
              </select>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium text-center">Contact</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {data.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                      <div className="flex items-center gap-3">
                        <Avatar name={record.name} />
                        {record.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                         <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                           <Phone className="w-3.5 h-3.5" />
                         </Button>
                         <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full text-[#25D366] hover:bg-[#25D366]/10 dark:hover:bg-[#25D366]/20">
                           <WhatsAppIcon className="w-4 h-4" />
                         </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4">{record.status}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(record)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(record.id!)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                   <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No records found. Click "Add Record" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="border-t border-slate-200 dark:border-dark-border px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-slate-100">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-100">{Math.min(page * 10, total)}</span> of <span className="font-medium text-slate-900 dark:text-slate-100">{total}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="glass animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle>Monthly Enquiries</CardTitle>
            <p className="text-sm text-slate-500">Edit values below. Changes are saved automatically when you click away.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
              {enquiries.map(enq => (
                <div key={enq.id} className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 focus-within:ring-2 ring-brand-500/50 transition-all">
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{enq.month} {enq.year}</div>
                  <Input 
                    type="number" 
                    value={enq.value} 
                    className="h-8 text-sm font-semibold px-2"
                    onChange={(e) => handleEnquiryChange(enq.id, e.target.value)}
                    onBlur={() => saveEnquiry(enq.id, enq.value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-200">
            <CardHeader>
              <CardTitle>{currentRecord ? 'Edit Record' : 'Add New Record'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Website Overhaul" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:text-slate-100 dark:bg-dark-card"
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Interested">Interested</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-dark-border mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit">{currentRecord ? 'Save Changes' : 'Add Record'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

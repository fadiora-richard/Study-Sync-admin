import React, { useEffect, useState } from 'react';
import {
  getStats,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getReps,
  createRep,
  deleteRep,
  getLecturers,
  createLecturer,
  deleteLecturer,
  getStudents,
  deleteStudent,
  updateUser,
  getCourses,
  getCurrentSemester,
  updateCurrentSemester
} from '../utils/api';
import {
  LayoutDashboard,
  Layers,
  Users,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Mail,
  X,
  Hash,
  School,
  Key,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings as SettingsIcon
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'reps' | 'staff' | 'students' | 'settings'>('overview');
  const [currentSemester, setCurrentSemester] = useState('');
  const [currentSemesterInput, setCurrentSemesterInput] = useState('');

  // Sidebar State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // States
  const [stats, setStats] = useState<any>({ departments: 0, reps: 0, students: 0, lecturers: 0 });
  const [departments, setDepartments] = useState<any[]>([]);
  const [reps, setReps] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sorting States
  const [repSort, setRepSort] = useState<{ field: string; order: 'asc' | 'desc' }>({ field: 'name', order: 'asc' });
  const [staffSort, setStaffSort] = useState<{ field: string; order: 'asc' | 'desc' }>({ field: 'name', order: 'asc' });
  const [studentSort, setStudentSort] = useState<{ field: string; order: 'asc' | 'desc' }>({ field: 'name', order: 'asc' });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Reset filters when activeTab changes
  useEffect(() => {
    setSearchQuery('');
    setFilterDept('');
    setFilterLevel('');
    setFilterRole('');
  }, [activeTab]);

  // Department Modal States
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', levelsString: '100, 200, 300, 400' });

  // Representative Modal States
  const [repModalOpen, setRepModalOpen] = useState(false);
  const [repForm, setRepForm] = useState({ name: '', email: '', matric: '', password: '', department: '', level: '' });

  // Lecturer/HOD Staff Modal States
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', matric: '', password: '', role: 'lecturer', department: '' });

  // Universal User Edit Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', matric: '', role: '', department: '', level: '', groupDescription: '', repId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, deptsRes, repsRes, staffRes, studentsRes, coursesRes, semRes] = await Promise.all([
        getStats(),
        getDepartments(),
        getReps(),
        getLecturers(),
        getStudents(),
        getCourses(),
        getCurrentSemester()
      ]);
      setStats(statsRes.data);
      setDepartments(deptsRes.data);
      setReps(repsRes.data);
      setStaff(staffRes.data);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
      if (semRes.data) {
        setCurrentSemester(semRes.data.currentSemester || 'semester1');
        setCurrentSemesterInput(semRes.data.currentSemester || 'semester1');
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sorting Helper Functions
  const sortData = (data: any[], sortConfig: { field: string; order: 'asc' | 'desc' }) => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let aVal = '';
      let bVal = '';

      if (sortConfig.field === 'repId') {
        const repA = reps.find(r => r._id === a.repId);
        const repB = reps.find(r => r._id === b.repId);
        aVal = repA ? repA.name : '';
        bVal = repB ? repB.name : '';
      } else if (sortConfig.field === 'courses') {
        const coursesA = courses.filter(c => c.lecturerId && c.lecturerId._id === a._id).map(c => c.code).sort().join(', ');
        const coursesB = courses.filter(c => c.lecturerId && c.lecturerId._id === b._id).map(c => c.code).sort().join(', ');
        aVal = coursesA;
        bVal = coursesB;
      } else if (sortConfig.field === 'studentCourses') {
        const coursesA = courses.filter(c => c.repIds && c.repIds.some((id: any) => (id._id || id) === a.repId)).map(c => c.code).sort().join(', ');
        const coursesB = courses.filter(c => c.repIds && c.repIds.some((id: any) => (id._id || id) === b.repId)).map(c => c.code).sort().join(', ');
        aVal = coursesA;
        bVal = coursesB;
      } else if (sortConfig.field === 'repCourses') {
        const coursesA = courses.filter(c => c.repIds && c.repIds.some((id: any) => (id._id || id) === a._id)).map(c => c.code).sort().join(', ');
        const coursesB = courses.filter(c => c.repIds && c.repIds.some((id: any) => (id._id || id) === b._id)).map(c => c.code).sort().join(', ');
        aVal = coursesA;
        bVal = coursesB;
      } else {
        aVal = a[sortConfig.field] || '';
        bVal = b[sortConfig.field] || '';
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.order === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
        return 0;
      }
    });
    return sorted;
  };

  const renderSortableHeader = (
    label: string,
    field: string,
    sortConfig: { field: string; order: 'asc' | 'desc' },
    setSortConfig: React.Dispatch<React.SetStateAction<{ field: string; order: 'asc' | 'desc' }>>
  ) => {
    const isActive = sortConfig.field === field;

    const handleSortClick = () => {
      if (isActive) {
        setSortConfig({ field, order: sortConfig.order === 'asc' ? 'desc' : 'asc' });
      } else {
        setSortConfig({ field, order: 'asc' });
      }
    };

    return (
      <th
        style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}
        onClick={handleSortClick}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {label}
          {isActive ? (
            sortConfig.order === 'asc' ? <ArrowUp size={14} color="#3b82f6" /> : <ArrowDown size={14} color="#3b82f6" />
          ) : (
            <ArrowUpDown size={14} color="#6b7280" style={{ opacity: 0.5 }} />
          )}
        </div>
      </th>
    );
  };

  // Department Actions
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const levels = deptForm.levelsString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (!deptForm.name.trim() || !deptForm.code.trim() || levels.length === 0) {
      alert("Name, code, and levels are required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingDeptId) {
        await updateDepartment(editingDeptId, {
          name: deptForm.name.trim(),
          code: deptForm.code.trim().toUpperCase(),
          levels
        });
      } else {
        await createDepartment({
          name: deptForm.name.trim(),
          code: deptForm.code.trim().toUpperCase(),
          levels
        });
      }
      setDeptModalOpen(false);
      setEditingDeptId(null);
      setDeptForm({ name: '', code: '', levelsString: '100, 200, 300, 400' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save department.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEditDept = (dept: any) => {
    setEditingDeptId(dept._id);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      levelsString: dept.levels.join(', ')
    });
    setDeptModalOpen(true);
  };

  const handleDeleteDept = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the department: "${name}"?`)) return;
    try {
      await deleteDepartment(id);
      fetchData();
    } catch (err: any) {
      alert("Failed to delete department.");
    }
  };

  // Rep Actions
  const handleCreateRepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, matric, password, department, level } = repForm;

    if (!name.trim() || !email.trim() || !matric.trim() || !password.trim() || !department || !level) {
      alert("All fields are required to onboard a Representative.");
      return;
    }

    try {
      setSubmitting(true);
      await createRep({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        matric: matric.trim().toUpperCase(),
        password: password.trim(),
        department,
        level
      });
      setRepModalOpen(false);
      setRepForm({ name: '', email: '', matric: '', password: '', department: '', level: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to onboard representative.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRepClick = async (id: string, name: string) => {
    const check = window.confirm(
      `⚠️ WARNING: Cascade deleting representative "${name}" will permanently delete their account and recursively wipe all associated students, announcements, timetables, and deadlines!\n\nAre you sure you want to proceed?`
    );
    if (!check) return;

    try {
      await deleteRep(id);
      fetchData();
      alert("Representative and all related cohort data deleted successfully.");
    } catch (err) {
      alert("Failed to cascade delete representative.");
    }
  };

  // Staff (Lecturer/HOD) Actions
  const handleCreateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, matric, password, role, department } = staffForm;

    if (!name.trim() || !email.trim() || !password.trim() || !role || !department) {
      alert("Name, email, password, role, and department are required.");
      return;
    }

    try {
      setSubmitting(true);
      await createLecturer({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        matric: matric.trim().toUpperCase() || undefined,
        password: password.trim(),
        role,
        department
      });
      setStaffModalOpen(false);
      setStaffForm({ name: '', email: '', matric: '', password: '', role: 'lecturer', department: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to onboard staff.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaffClick = async (id: string, name: string, role: string) => {
    const check = window.confirm(
      `⚠️ WARNING: Cascade deleting ${role} "${name}" will permanently delete their account and recursively wipe all associated courses, class schedules, timetables, and attendance sessions/records!\n\nAre you sure you want to proceed?`
    );
    if (!check) return;

    try {
      await deleteLecturer(id);
      fetchData();
      alert(`${role} and all associated data deleted successfully.`);
    } catch (err) {
      alert("Failed to cascade delete staff member.");
    }
  };

  // Student Actions
  const handleDeleteStudentClick = async (id: string, name: string) => {
    const check = window.confirm(
      `Are you sure you want to permanently delete student "${name}"?`
    );
    if (!check) return;

    try {
      await deleteStudent(id);
      fetchData();
      alert("Student account permanently deleted.");
    } catch (err) {
      alert("Failed to delete student account.");
    }
  };

  // Universal User Editing
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const { name, email, matric, role, department, level, groupDescription, repId } = editForm;

    if (!name.trim() || !email.trim() || !role) {
      alert("Name, email, and role are required.");
      return;
    }

    try {
      setSubmitting(true);
      await updateUser(editingUser._id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        matric: matric ? matric.trim().toUpperCase() : "",
        role,
        department: department || "",
        level: (role === 'student' || role === 'rep') ? level : "",
        groupDescription: (role === 'student' || role === 'rep') ? groupDescription : "",
        repId: role === 'student' ? repId : ""
      });
      setEditModalOpen(false);
      setEditingUser(null);
      fetchData();
      alert("User updated successfully.");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      matric: user.matric || '',
      role: user.role || '',
      department: user.department || '',
      level: user.level || '',
      groupDescription: user.groupDescription || '',
      repId: user.repId || ''
    });
    setEditModalOpen(true);
  };

  // Aggregate all unique levels across departments
  const allLevels = Array.from(
    new Set(departments.flatMap(d => d.levels || []))
  ).sort();

  // Filtered lists
  const filteredReps = reps.filter(rep => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const nameMatch = rep.name?.toLowerCase().includes(q);
      const emailMatch = rep.email?.toLowerCase().includes(q);
      const matricMatch = rep.matric?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !matricMatch) return false;
    }
    if (filterDept && rep.department !== filterDept) return false;
    if (filterLevel && rep.level !== filterLevel) return false;
    return true;
  });

  const filteredStaff = staff.filter(member => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const nameMatch = member.name?.toLowerCase().includes(q);
      const emailMatch = member.email?.toLowerCase().includes(q);
      const matricMatch = member.matric?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !matricMatch) return false;
    }
    if (filterDept && member.department !== filterDept) return false;
    if (filterRole && member.role !== filterRole) return false;
    return true;
  });

  const filteredStudents = students.filter(student => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const nameMatch = student.name?.toLowerCase().includes(q);
      const emailMatch = student.email?.toLowerCase().includes(q);
      const matricMatch = student.matric?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !matricMatch) return false;
    }
    if (filterDept && student.department !== filterDept) return false;
    if (filterLevel && student.level !== filterLevel) return false;
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Top Navigation Header */}
      <header className="glass-panel" style={styles.header}>
        <div style={styles.brand}>
          <School size={28} color="#3b82f6" />
          <span style={styles.brandText}>StudySync Console</span>
        </div>
        <button onClick={onLogout} className="btn-danger" style={styles.logoutBtn}>
          <LogOut size={16} style={{ marginRight: 6 }} />
          Sign Out
        </button>
      </header>

      {/* Main Grid View */}
      <div style={{
        ...styles.mainLayout,
        gridTemplateColumns: sidebarCollapsed ? '72px 1fr' : '260px 1fr'
      }}>
        {/* Sidebar Selector */}
        <aside className="glass-panel" style={{
          ...styles.sidebar,
          padding: sidebarCollapsed ? '16px 8px' : '16px',
          alignItems: sidebarCollapsed ? 'center' : 'stretch'
        }}>
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              ...styles.collapseToggleBtn,
              alignSelf: sidebarCollapsed ? 'center' : 'flex-end',
              marginBottom: '12px'
            }}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            title="System Overview"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'overview' ? styles.tabBtnActive : {}),
              ...(sidebarCollapsed ? styles.tabBtnCollapsed : {}),
            }}
          >
            <LayoutDashboard size={18} style={sidebarCollapsed ? {} : { marginRight: 10 }} />
            {!sidebarCollapsed && <span>System Overview</span>}
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            title="Departments & Levels"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'departments' ? styles.tabBtnActive : {}),
              ...(sidebarCollapsed ? styles.tabBtnCollapsed : {}),
            }}
          >
            <Layers size={18} style={sidebarCollapsed ? {} : { marginRight: 10 }} />
            {!sidebarCollapsed && <span>Departments & Levels</span>}
          </button>

          <button
            onClick={() => setActiveTab('reps')}
            title="Representative Directory"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'reps' ? styles.tabBtnActive : {}),
              ...(sidebarCollapsed ? styles.tabBtnCollapsed : {}),
            }}
          >
            <Users size={18} style={sidebarCollapsed ? {} : { marginRight: 10 }} />
            {!sidebarCollapsed && <span>Representative Directory</span>}
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            title="Lecturers & HODs"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'staff' ? styles.tabBtnActive : {}),
              ...(sidebarCollapsed ? styles.tabBtnCollapsed : {}),
            }}
          >
            <Users size={18} style={sidebarCollapsed ? {} : { marginRight: 10 }} />
            {!sidebarCollapsed && <span>Lecturers & HODs</span>}
          </button>

          <button
            onClick={() => setActiveTab('students')}
            title="Student Directory"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'students' ? styles.tabBtnActive : {}),
              ...(sidebarCollapsed ? styles.tabBtnCollapsed : {}),
            }}
          >
            <Users size={18} style={sidebarCollapsed ? {} : { marginRight: 10 }} />
            {!sidebarCollapsed && <span>Student Directory</span>}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            title="System Settings"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'settings' ? styles.tabBtnActive : {}),
              ...(sidebarCollapsed ? styles.tabBtnCollapsed : {}),
            }}
          >
            <SettingsIcon size={18} style={sidebarCollapsed ? {} : { marginRight: 10 }} />
            {!sidebarCollapsed && <span>System Settings</span>}
          </button>
        </aside>

        {/* Dynamic Display Panel */}
        <main style={styles.mainContent}>
          {loading ? (
            <div style={styles.loaderBox}>
              <div style={styles.spinner}></div>
              <p>Syncing database parameters...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: System Overview */}
              {activeTab === 'overview' && (
                <div style={styles.tabContent}>
                  <div style={styles.sectionHeader}>
                    <h2>Administration Stats</h2>
                  </div>
                  <div style={styles.statsGrid}>
                    <div className="glass-panel" style={styles.statCard}>
                      <div style={styles.statHeader}>
                        <Layers size={24} color="#3b82f6" />
                        <span style={styles.statLabel}>Departments</span>
                      </div>
                      <span style={styles.statVal}>{stats.departments}</span>
                    </div>

                    <div className="glass-panel" style={styles.statCard}>
                      <div style={styles.statHeader}>
                        <Users size={24} color="#06b6d4" />
                        <span style={styles.statLabel}>Representatives</span>
                      </div>
                      <span style={styles.statVal}>{stats.reps}</span>
                    </div>

                    <div className="glass-panel" style={styles.statCard}>
                      <div style={styles.statHeader}>
                        <Users size={24} color="#10b981" />
                        <span style={styles.statLabel}>Registered Students</span>
                      </div>
                      <span style={styles.statVal}>{stats.students}</span>
                    </div>

                    <div className="glass-panel" style={styles.statCard}>
                      <div style={styles.statHeader}>
                        <Users size={24} color="#a855f7" />
                        <span style={styles.statLabel}>Lecturers & HODs</span>
                      </div>
                      <span style={styles.statVal}>{stats.lecturers}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Departments Manager */}
              {activeTab === 'departments' && (
                <div style={styles.tabContent}>
                  <div style={styles.sectionHeader}>
                    <div>
                      <h2>Departments ({departments.length})</h2>
                      <p>Define department level scopes (e.g. Medicine to 600)</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingDeptId(null);
                        setDeptForm({ name: '', code: '', levelsString: '100, 200, 300, 400' });
                        setDeptModalOpen(true);
                      }}
                      className="btn-primary"
                      style={styles.addBtn}
                    >
                      <Plus size={18} style={{ marginRight: 6 }} />
                      Add Department
                    </button>
                  </div>

                  <div style={styles.tableCard} className="glass-panel">
                    <table style={{ ...styles.table, minWidth: '700px' }}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Department Name</th>
                          <th style={styles.th}>Code</th>
                          <th style={styles.th}>Configured Levels</th>
                          <th style={styles.th} className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map((dept) => (
                          <tr key={dept._id} style={styles.tr}>
                            <td style={styles.td} className="font-semibold">{dept.name}</td>
                            <td style={styles.td}>
                              <span style={styles.codeBadge}>{dept.code}</span>
                            </td>
                            <td style={styles.td}>
                              <div style={styles.levelsRow}>
                                {dept.levels.map((lvl: string) => (
                                  <span key={lvl} style={styles.levelTag}>Lvl {lvl}</span>
                                ))}
                              </div>
                            </td>
                            <td style={styles.td} className="text-right">
                              <div style={styles.actionsCell}>
                                <button onClick={() => handleStartEditDept(dept)} className="btn-secondary" style={styles.iconBtn}>
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteDept(dept._id, dept.name)} className="btn-danger" style={styles.iconBtn}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Representatives Roster */}
              {activeTab === 'reps' && (
                <div style={styles.tabContent}>
                  <div style={styles.sectionHeader}>
                    <div>
                      <h2>
                        Representatives ({searchQuery || filterDept || filterLevel ? `${filteredReps.length} of ` : ''}{reps.length})
                      </h2>
                      <p>View invite codes and manage cohort leaders</p>
                    </div>
                    <button
                      onClick={() => setRepModalOpen(true)}
                      className="btn-primary"
                      style={styles.addBtn}
                    >
                      <Plus size={18} style={{ marginRight: 6 }} />
                      Onboard Representative
                    </button>
                  </div>

                  {/* Search & Filter Bar */}
                  <div style={styles.filterBar}>
                    <div style={styles.filterSearchWrapper}>
                      <Search size={16} style={styles.filterSearchIcon} />
                      <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="form-input"
                        style={styles.filterInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div style={styles.filterDropdownWrapper}>
                      <select
                        className="form-input"
                        style={styles.filterSelect}
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                      >
                        <option value="" style={{ background: '#0b0f19' }}>All Departments</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d.name} style={{ background: '#0b0f19' }}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.filterDropdownWrapper}>
                      <select
                        className="form-input"
                        style={styles.filterSelect}
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                      >
                        <option value="" style={{ background: '#0b0f19' }}>All Levels</option>
                        {allLevels.map((lvl) => (
                          <option key={lvl} value={lvl} style={{ background: '#0b0f19' }}>Level {lvl}</option>
                        ))}
                      </select>
                    </div>

                    {(searchQuery || filterDept || filterLevel) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterDept('');
                          setFilterLevel('');
                        }}
                        className="btn-secondary"
                        style={styles.clearFilterBtn}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>

                  <div style={styles.tableCard} className="glass-panel">
                    <table style={{ ...styles.table, minWidth: '950px' }}>
                      <thead>
                        <tr>
                          {renderSortableHeader("Name", "name", repSort, setRepSort)}
                          {renderSortableHeader("Identifier", "matric", repSort, setRepSort)}
                          {renderSortableHeader("Contact Email", "email", repSort, setRepSort)}
                          {renderSortableHeader("Department", "department", repSort, setRepSort)}
                          {renderSortableHeader("Level", "level", repSort, setRepSort)}
                          {renderSortableHeader("Assigned Courses", "repCourses", repSort, setRepSort)}
                          {renderSortableHeader("Join Invite Code", "inviteCode", repSort, setRepSort)}
                          <th style={styles.th} className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortData(filteredReps, repSort).map((rep) => {
                          const repCourses = courses
                            .filter(c => c.repIds && c.repIds.some((id: any) => (id._id || id) === rep._id))
                            .map(c => c.code)
                            .sort()
                            .join(', ');
                          return (
                            <tr key={rep._id} style={styles.tr}>
                              <td style={styles.td} className="font-semibold">{rep.name}</td>
                              <td style={styles.td}>{rep.matric}</td>
                              <td style={styles.td}>{rep.email}</td>
                              <td style={styles.td}>{rep.department || "No Department"}</td>
                              <td style={styles.td}>Level {rep.level || "N/A"}</td>
                              <td style={styles.td}>
                                {repCourses || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>None</span>}
                              </td>
                              <td style={styles.td}>
                                {rep.inviteCode ? (
                                  <span style={styles.inviteBadge}>{rep.inviteCode}</span>
                                ) : (
                                  <span style={{ fontStyle: 'italic', color: '#6b7280' }}>Unassigned</span>
                                )}
                              </td>
                              <td style={styles.td} className="text-right">
                                <div style={styles.actionsCell}>
                                  <button onClick={() => handleStartEditUser(rep)} className="btn-secondary" style={styles.iconBtn}>
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteRepClick(rep._id, rep.name)} className="btn-danger" style={styles.iconBtn}>
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Lecturers & HODs Directory */}
              {activeTab === 'staff' && (
                <div style={styles.tabContent}>
                  <div style={styles.sectionHeader}>
                    <div>
                      <h2>
                        Lecturers & HODs ({searchQuery || filterDept || filterRole ? `${filteredStaff.length} of ` : ''}{staff.length})
                      </h2>
                      <p>Manage faculty members, departmental roles, and course assignments</p>
                    </div>
                    <button
                      onClick={() => {
                        setStaffForm({ name: '', email: '', matric: '', password: '', role: 'lecturer', department: '' });
                        setStaffModalOpen(true);
                      }}
                      className="btn-primary"
                      style={styles.addBtn}
                    >
                      <Plus size={18} style={{ marginRight: 6 }} />
                      Onboard Staff
                    </button>
                  </div>

                  {/* Search & Filter Bar */}
                  <div style={styles.filterBar}>
                    <div style={styles.filterSearchWrapper}>
                      <Search size={16} style={styles.filterSearchIcon} />
                      <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="form-input"
                        style={styles.filterInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div style={styles.filterDropdownWrapper}>
                      <select
                        className="form-input"
                        style={styles.filterSelect}
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                      >
                        <option value="" style={{ background: '#0b0f19' }}>All Departments</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d.name} style={{ background: '#0b0f19' }}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.filterDropdownWrapper}>
                      <select
                        className="form-input"
                        style={styles.filterSelect}
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                      >
                        <option value="" style={{ background: '#0b0f19' }}>All Roles</option>
                        <option value="lecturer" style={{ background: '#0b0f19' }}>Lecturer</option>
                        <option value="hod" style={{ background: '#0b0f19' }}>HOD</option>
                      </select>
                    </div>

                    {(searchQuery || filterDept || filterRole) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterDept('');
                          setFilterRole('');
                        }}
                        className="btn-secondary"
                        style={styles.clearFilterBtn}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>

                  <div style={styles.tableCard} className="glass-panel">
                    <table style={{ ...styles.table, minWidth: '950px' }}>
                      <thead>
                        <tr>
                          {renderSortableHeader("Name", "name", staffSort, setStaffSort)}
                          {renderSortableHeader("Staff Identifier", "matric", staffSort, setStaffSort)}
                          {renderSortableHeader("Contact Email", "email", staffSort, setStaffSort)}
                          {renderSortableHeader("Department", "department", staffSort, setStaffSort)}
                          {renderSortableHeader("Taught Courses", "courses", staffSort, setStaffSort)}
                          {renderSortableHeader("Role", "role", staffSort, setStaffSort)}
                          <th style={styles.th} className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortData(filteredStaff, staffSort).map((member) => {
                          const taughtCourses = courses
                            .filter(c => c.lecturerId && c.lecturerId._id === member._id)
                            .map(c => c.code)
                            .sort()
                            .join(', ');
                          return (
                            <tr key={member._id} style={styles.tr}>
                              <td style={styles.td} className="font-semibold">{member.name}</td>
                              <td style={styles.td}>{member.matric || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>N/A</span>}</td>
                              <td style={styles.td}>{member.email}</td>
                              <td style={styles.td}>{member.department || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Unassigned</span>}</td>
                              <td style={styles.td}>
                                {taughtCourses || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>None</span>}
                              </td>
                              <td style={styles.td}>
                                <span style={member.role === 'hod' ? styles.hodBadge : styles.lecturerBadge}>
                                  {member.role.toUpperCase()}
                                </span>
                              </td>
                              <td style={styles.td} className="text-right">
                                <div style={styles.actionsCell}>
                                  <button onClick={() => handleStartEditUser(member)} className="btn-secondary" style={styles.iconBtn}>
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteStaffClick(member._id, member.name, member.role)} className="btn-danger" style={styles.iconBtn}>
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 5: Student Directory */}
              {activeTab === 'students' && (
                <div style={styles.tabContent}>
                  <div style={styles.sectionHeader}>
                    <div>
                      <h2>
                        Student Directory ({searchQuery || filterDept || filterLevel ? `${filteredStudents.length} of ` : ''}{students.length})
                      </h2>
                      <p>View, modify, and delete student accounts across all cohorts</p>
                    </div>
                  </div>

                  {/* Search & Filter Bar */}
                  <div style={styles.filterBar}>
                    <div style={styles.filterSearchWrapper}>
                      <Search size={16} style={styles.filterSearchIcon} />
                      <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="form-input"
                        style={styles.filterInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div style={styles.filterDropdownWrapper}>
                      <select
                        className="form-input"
                        style={styles.filterSelect}
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                      >
                        <option value="" style={{ background: '#0b0f19' }}>All Departments</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d.name} style={{ background: '#0b0f19' }}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.filterDropdownWrapper}>
                      <select
                        className="form-input"
                        style={styles.filterSelect}
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                      >
                        <option value="" style={{ background: '#0b0f19' }}>All Levels</option>
                        {allLevels.map((lvl) => (
                          <option key={lvl} value={lvl} style={{ background: '#0b0f19' }}>Level {lvl}</option>
                        ))}
                      </select>
                    </div>

                    {(searchQuery || filterDept || filterLevel) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterDept('');
                          setFilterLevel('');
                        }}
                        className="btn-secondary"
                        style={styles.clearFilterBtn}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>

                  <div style={styles.tableCard} className="glass-panel">
                    <table style={{ ...styles.table, minWidth: '1100px' }}>
                      <thead>
                        <tr>
                          {renderSortableHeader("Name", "name", studentSort, setStudentSort)}
                          {renderSortableHeader("Matric Number", "matric", studentSort, setStudentSort)}
                          {renderSortableHeader("Contact Email", "email", studentSort, setStudentSort)}
                          {renderSortableHeader("Department", "department", studentSort, setStudentSort)}
                          {renderSortableHeader("Level", "level", studentSort, setStudentSort)}
                          {renderSortableHeader("Enrolled Courses", "studentCourses", studentSort, setStudentSort)}
                          {renderSortableHeader("Cohort Representative", "repId", studentSort, setStudentSort)}
                          <th style={styles.th} className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortData(filteredStudents, studentSort).map((student) => {
                          const associatedRep = reps.find(r => r._id === student.repId);
                          const enrolledCourses = courses
                            .filter(c => c.repIds && c.repIds.some((id: any) => (id._id || id) === student.repId))
                            .map(c => c.code)
                            .sort()
                            .join(', ');
                          return (
                            <tr key={student._id} style={styles.tr}>
                              <td style={styles.td} className="font-semibold">{student.name}</td>
                              <td style={styles.td}>{student.matric}</td>
                              <td style={styles.td}>{student.email || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>N/A</span>}</td>
                              <td style={styles.td}>{student.department || "No Department"}</td>
                              <td style={styles.td}>Level {student.level || "N/A"}</td>
                              <td style={styles.td}>
                                {enrolledCourses || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>None</span>}
                              </td>
                              <td style={styles.td}>
                                {associatedRep ? (
                                  <span style={{ color: '#d1d5db' }}>{associatedRep.name}</span>
                                ) : (
                                  <span style={{ color: '#6b7280', fontStyle: 'italic' }}>None / Direct</span>
                                )}
                              </td>
                              <td style={styles.td} className="text-right">
                                <div style={styles.actionsCell}>
                                  <button onClick={() => handleStartEditUser(student)} className="btn-secondary" style={styles.iconBtn}>
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteStudentClick(student._id, student.name)} className="btn-danger" style={styles.iconBtn}>
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 6: System Settings */}
              {activeTab === 'settings' && (
                <div style={styles.tabContent}>
                  <div style={styles.sectionHeader}>
                    <div>
                      <h2>System Settings</h2>
                      <p>Manage global configuration parameters for StudySync</p>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                    <div style={styles.inputGroup}>
                      <label style={{ ...styles.label, fontSize: '14px', fontWeight: 700, color: '#9ca3af' }}>Current Global Semester</label>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '-4px 0 10px 0' }}>
                        This semester tags all newly created courses, classes, deadlines, reports, and announcements.
                      </p>
                      <input
                        type="text"
                        className="form-input"
                        style={{ ...styles.modalInput, background: '#0b1329', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#fff' }}
                        placeholder="e.g. Harmattan 2025/2026"
                        value={currentSemesterInput}
                        onChange={(e) => setCurrentSemesterInput(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button
                        onClick={async () => {
                          const trimSem = currentSemesterInput.trim();
                          if (!trimSem) {
                            alert("Semester name cannot be empty.");
                            return;
                          }
                          const confirmChange = window.confirm(
                            `⚠️ WARNING: Changing the active global semester to "${trimSem}" will start representatives and students with a clean slate for the new term.\n\nAll existing schedules and timetables will remain archived in the database, but active views on mobile will start empty.\n\nAre you sure you want to proceed?`
                          );
                          if (!confirmChange) return;

                          try {
                            setSubmitting(true);
                            await updateCurrentSemester(trimSem);
                            setCurrentSemester(trimSem);
                            alert("Global semester updated successfully!");
                            fetchData();
                          } catch (err: any) {
                            alert(err.response?.data?.error || "Failed to update global semester.");
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        className="btn-primary"
                        style={{ ...styles.formBtn, maxWidth: '200px' }}
                        disabled={submitting || currentSemester.trim() === currentSemesterInput.trim()}
                      >
                        {submitting ? "Updating..." : "Save Semester"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal 1: Add/Edit Department */}
      {deptModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>{editingDeptId ? "Edit Department Scope" : "Add Department"}</h3>
              <button onClick={() => setDeptModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveDept} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Department Name</label>
                <input
                  type="text"
                  className="form-input"
                  style={styles.modalInput}
                  placeholder="e.g. Medicine"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Department Code</label>
                <input
                  type="text"
                  className="form-input"
                  style={styles.modalInput}
                  placeholder="e.g. MED"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Configured Levels (Comma-separated list)</label>
                <input
                  type="text"
                  className="form-input"
                  style={styles.modalInput}
                  placeholder="e.g. 100, 200, 300, 400, 500, 600"
                  value={deptForm.levelsString}
                  onChange={(e) => setDeptForm({ ...deptForm, levelsString: e.target.value })}
                />
                <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  Provide the numeric levels supported by this department.
                </span>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setDeptModalOpen(false)} className="btn-secondary" style={styles.formBtn}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={styles.formBtn} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Onboard Representative */}
      {repModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Onboard Representative</h3>
              <button onClick={() => setRepModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateRepSubmit} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Representative Name</label>
                <div style={styles.relativeWrapper}>
                  <Users size={16} style={styles.iconDecorator} />
                  <input
                    type="text"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="e.g. John Doe"
                    value={repForm.name}
                    onChange={(e) => setRepForm({ ...repForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.relativeWrapper}>
                  <Mail size={16} style={styles.iconDecorator} />
                  <input
                    type="email"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="rep@studysync.com"
                    value={repForm.email}
                    onChange={(e) => setRepForm({ ...repForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Matric / Staff Identifier</label>
                <div style={styles.relativeWrapper}>
                  <Hash size={16} style={styles.iconDecorator} />
                  <input
                    type="text"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="CSC-REP-01"
                    value={repForm.matric}
                    onChange={(e) => setRepForm({ ...repForm, matric: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Initial Password</label>
                <div style={styles.relativeWrapper}>
                  <Key size={16} style={styles.iconDecorator} />
                  <input
                    type="password"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="Min 6 characters"
                    value={repForm.password}
                    onChange={(e) => setRepForm({ ...repForm, password: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Department</label>
                  <select
                    className="form-input"
                    style={styles.selectInput}
                    value={repForm.department}
                    onChange={(e) => {
                      const deptName = e.target.value;
                      const deptObj = departments.find(d => d.name === deptName);
                      const defaultLevel = deptObj && deptObj.levels && deptObj.levels.length > 0 ? deptObj.levels[0] : "";
                      setRepForm({ ...repForm, department: deptName, level: defaultLevel });
                    }}
                  >
                    <option value="" style={{ background: '#0b0f19' }}>Select</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d.name} style={{ background: '#0b0f19' }}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Level</label>
                  <select
                    className="form-input"
                    style={styles.selectInput}
                    value={repForm.level}
                    onChange={(e) => setRepForm({ ...repForm, level: e.target.value })}
                    disabled={!repForm.department}
                  >
                    <option value="" style={{ background: '#0b0f19' }}>Select</option>
                    {(departments.find(d => d.name === repForm.department)?.levels || []).map((lvl: string) => (
                      <option key={lvl} value={lvl} style={{ background: '#0b0f19' }}>Lvl {lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setRepModalOpen(false)} className="btn-secondary" style={styles.formBtn}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={styles.formBtn} disabled={submitting}>
                  {submitting ? "Onboarding..." : "Onboard Rep"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Onboard Lecturer / HOD */}
      {staffModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Onboard Staff (Lecturer/HOD)</h3>
              <button onClick={() => setStaffModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateStaffSubmit} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.relativeWrapper}>
                  <Users size={16} style={styles.iconDecorator} />
                  <input
                    type="text"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="e.g. Dr. Jane Smith"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.relativeWrapper}>
                  <Mail size={16} style={styles.iconDecorator} />
                  <input
                    type="email"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="lecturer@studysync.com"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Staff Identifier (optional)</label>
                <div style={styles.relativeWrapper}>
                  <Hash size={16} style={styles.iconDecorator} />
                  <input
                    type="text"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="e.g. STF-CSC-01"
                    value={staffForm.matric}
                    onChange={(e) => setStaffForm({ ...staffForm, matric: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Initial Password</label>
                <div style={styles.relativeWrapper}>
                  <Key size={16} style={styles.iconDecorator} />
                  <input
                    type="password"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="Min 6 characters"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>System Role</label>
                  <select
                    className="form-input"
                    style={styles.selectInput}
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  >
                    <option value="lecturer" style={{ background: '#0b0f19' }}>Lecturer</option>
                    <option value="hod" style={{ background: '#0b0f19' }}>HOD</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Department</label>
                  <select
                    className="form-input"
                    style={styles.selectInput}
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                  >
                    <option value="" style={{ background: '#0b0f19' }}>Select</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d.name} style={{ background: '#0b0f19' }}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setStaffModalOpen(false)} className="btn-secondary" style={styles.formBtn}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={styles.formBtn} disabled={submitting}>
                  {submitting ? "Onboarding..." : "Onboard Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Edit User Details */}
      {editModalOpen && editingUser && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Edit {editingUser.role === 'hod' ? 'HOD' : editingUser.role === 'lecturer' ? 'Lecturer' : editingUser.role === 'rep' ? 'Representative' : 'Student'} Details</h3>
              <button onClick={() => { setEditModalOpen(false); setEditingUser(null); }} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditUserSubmit} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.relativeWrapper}>
                  <Users size={16} style={styles.iconDecorator} />
                  <input
                    type="text"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="e.g. John Doe"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.relativeWrapper}>
                  <Mail size={16} style={styles.iconDecorator} />
                  <input
                    type="email"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="name@studysync.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Matric / Staff Identifier</label>
                <div style={styles.relativeWrapper}>
                  <Hash size={16} style={styles.iconDecorator} />
                  <input
                    type="text"
                    className="form-input"
                    style={styles.modalInputWithIcon}
                    placeholder="CSC-10-1234"
                    value={editForm.matric}
                    onChange={(e) => setEditForm({ ...editForm, matric: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>System Role</label>
                <select
                  className="form-input"
                  style={styles.selectInput}
                  value={editForm.role}
                  onChange={(e) => {
                    const nextRole = e.target.value;
                    let nextDept = editForm.department;
                    let nextLevel = editForm.level;
                    let nextRepId = editForm.repId;

                    // Autofill levels if role changes to rep/student and none set
                    if ((nextRole === 'student' || nextRole === 'rep') && !nextLevel) {
                      const deptObj = departments.find(d => d.name === nextDept);
                      nextLevel = deptObj && deptObj.levels && deptObj.levels.length > 0 ? deptObj.levels[0] : "";
                    }

                    // Clear student-specific fields if transitioning away
                    if (nextRole !== 'student') {
                      nextRepId = "";
                    }

                    setEditForm({
                      ...editForm,
                      role: nextRole,
                      level: nextLevel,
                      repId: nextRepId
                    });
                  }}
                >
                  <option value="student" style={{ background: '#0b0f19' }}>Student</option>
                  <option value="rep" style={{ background: '#0b0f19' }}>Representative</option>
                  <option value="lecturer" style={{ background: '#0b0f19' }}>Lecturer</option>
                  <option value="hod" style={{ background: '#0b0f19' }}>Head of Department (HOD)</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Department</label>
                <select
                  className="form-input"
                  style={styles.selectInput}
                  value={editForm.department}
                  onChange={(e) => {
                    const deptName = e.target.value;
                    const deptObj = departments.find(d => d.name === deptName);
                    const defaultLevel = deptObj && deptObj.levels && deptObj.levels.length > 0 ? deptObj.levels[0] : "";

                    setEditForm({
                      ...editForm,
                      department: deptName,
                      level: (editForm.role === 'student' || editForm.role === 'rep') ? defaultLevel : "",
                      repId: "" // reset rep selector on department change
                    });
                  }}
                >
                  <option value="" style={{ background: '#0b0f19' }}>No Department Assigned</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.name} style={{ background: '#0b0f19' }}>{d.name}</option>
                  ))}
                </select>
              </div>

              {(editForm.role === 'student' || editForm.role === 'rep') && (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Level Scope</label>
                    <select
                      className="form-input"
                      style={styles.selectInput}
                      value={editForm.level}
                      onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                      disabled={!editForm.department}
                    >
                      <option value="" style={{ background: '#0b0f19' }}>Select Level</option>
                      {(departments.find(d => d.name === editForm.department)?.levels || []).map((lvl: string) => (
                        <option key={lvl} value={lvl} style={{ background: '#0b0f19' }}>Level {lvl}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Group Description</label>
                    <input
                      type="text"
                      className="form-input"
                      style={styles.modalInput}
                      placeholder="e.g. Group A, Morning Session"
                      value={editForm.groupDescription}
                      onChange={(e) => setEditForm({ ...editForm, groupDescription: e.target.value })}
                    />
                  </div>
                </>
              )}

              {editForm.role === 'student' && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cohort Representative</label>
                  <select
                    className="form-input"
                    style={styles.selectInput}
                    value={editForm.repId}
                    onChange={(e) => setEditForm({ ...editForm, repId: e.target.value })}
                  >
                    <option value="" style={{ background: '#0b0f19' }}>None / Self-led</option>
                    {reps
                      .filter(r => !editForm.department || r.department === editForm.department)
                      .map((r) => (
                        <option key={r._id} value={r._id} style={{ background: '#0b0f19' }}>
                          {r.name} (Lvl {r.level})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div style={styles.modalActions}>
                <button type="button" onClick={() => { setEditModalOpen(false); setEditingUser(null); }} className="btn-secondary" style={styles.formBtn}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={styles.formBtn} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandText: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '16px',
  },
  tabBtn: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    background: 'transparent',
    color: '#9ca3af',
    fontWeight: 600,
    fontSize: '14px',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.25)',
  },
  tabBtnCollapsed: {
    justifyContent: 'center',
    padding: '12px 0',
  },
  collapseToggleBtn: {
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    color: '#3b82f6',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  mainContent: {
    minHeight: '400px',
    minWidth: 0,
  },
  filterBar: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: '12px',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(17, 24, 39, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '8px',
    width: '100%',
  },
  filterSearchWrapper: {
    position: 'relative' as const,
    flex: '1 1 300px',
    display: 'flex',
    alignItems: 'center',
  },
  filterSearchIcon: {
    position: 'absolute' as const,
    left: '14px',
    color: '#9ca3af',
  },
  filterInput: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    borderRadius: '10px',
    fontSize: '14px',
  },
  filterDropdownWrapper: {
    flex: '1 1 180px',
  },
  filterSelect: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  clearFilterBtn: {
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    transition: 'all 0.2s ease',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  statCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#9ca3af',
  },
  statVal: {
    fontSize: '36px',
    fontWeight: 800,
    color: '#fff',
  },
  addBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
  },
  tableCard: {
    overflowX: 'auto' as const,
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    textAlign: 'left' as const,
  },
  th: {
    padding: '16px 20px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#9ca3af',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#d1d5db',
  },
  codeBadge: {
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    color: '#3b82f6',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '12px',
  },
  inviteBadge: {
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#10b981',
    padding: '6px 10px',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '12px',
  },
  hodBadge: {
    background: 'rgba(168, 85, 247, 0.15)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    color: '#a855f7',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '12px',
    display: 'inline-block',
  },
  lecturerBadge: {
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    color: '#3b82f6',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '12px',
    display: 'inline-block',
  },
  levelsRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap' as const,
  },
  levelTag: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#d1d5db',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
  },
  actionsCell: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  iconBtn: {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 5, 15, 0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    zIndex: 1000,
  },
  modal: {
    width: '100%',
    maxWidth: '460px',
    padding: '30px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  modalInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '15px',
  },
  relativeWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  iconDecorator: {
    position: 'absolute' as const,
    left: '14px',
    color: '#6b7280',
  },
  modalInputWithIcon: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '10px',
    fontSize: '15px',
  },
  selectInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '15px',
    cursor: 'pointer',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
  },
  formBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    fontSize: '15px',
  },
  loaderBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '260px',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(59, 130, 246, 0.1)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

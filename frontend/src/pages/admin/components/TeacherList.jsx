import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { FiEye, FiEdit, FiTrash2, FiAlertTriangle, FiPlus, FiCalendar, FiX } from 'react-icons/fi';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div className="flex items-center mb-4">
          <FiAlertTriangle className="text-red-500 mr-3" size={24} />
          <h3 className="text-lg font-bold">Confirm Deletion</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const EditTeacherModal = ({ isOpen, onClose, onSave, teacher }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (teacher) {
      setName(teacher.name);
    }
  }, [teacher]);
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...teacher, name });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">Edit Teacher</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddTeacherModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, email, password });
    // Clear form
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">Add New Teacher</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
            <input
              type="text" id="add-name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="add-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" id="add-email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required
            />
          </div>
           <div className="mb-6">
            <label htmlFor="add-password"className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
            <input
              type="password" id="add-password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Add Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ViewTeacherModal = ({ isOpen, onClose, details, loading }) => {
  if (!isOpen) return null;

  const weekdayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // --- Computed Details ---
  const scheduleByDay = details?.schedule?.reduce((acc, slot) => {
    const day = weekdayMap[slot.weekday];
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  const totalPeriods = details?.schedule?.length || 0;
  const uniqueSubjects = [...new Set(details?.schedule?.map(slot => slot.subject) || [])];
  const joinedDate = details?.teacher?.createdAt ? new Date(details.teacher.createdAt).toLocaleDateString() : 'N/A';
  // --- End Computed Details ---

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <FiX size={24}/>
        </button>
        {loading ? (
          <p>Loading details...</p>
        ) : details ? (
          <>
            <h3 className="text-xl font-bold mb-1">{details.teacher.name}</h3>
            <p className="text-sm text-gray-500 mb-6">{details.teacher.email}</p>
            
            {/* --- Additional Info Section --- */}
            <div className="grid grid-cols-2 gap-4 mb-6 border-t pt-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Joined On</p>
                <p className="text-gray-800">{joinedDate}</p>
              </div>
               <div>
                <p className="text-sm font-semibold text-gray-600">Total Periods</p>
                <p className="text-gray-800">{totalPeriods} per week</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-semibold text-gray-600">Subjects Taught</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {uniqueSubjects.length > 0 ? uniqueSubjects.map(subject => (
                    <span key={subject} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {subject}
                    </span>
                  )) : <p className="text-gray-500 text-sm">No subjects assigned</p>}
                </div>
              </div>
            </div>
            {/* --- End Additional Info Section --- */}

            <h4 className="font-bold mb-2 border-t pt-4">Weekly Schedule</h4>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {scheduleByDay && Object.keys(scheduleByDay).length > 0 ? (
                Object.entries(scheduleByDay).map(([day, slots]) => (
                  <div key={day}>
                    <p className="font-semibold text-gray-700">{day}</p>
                    <ul className="list-disc list-inside pl-2 text-sm text-gray-600">
                      {slots.sort((a,b) => a.periodIndex - b.periodIndex).map(slot => (
                        <li key={slot._id}>
                          Period {slot.periodIndex}: {slot.subject} ({slot.classSection})
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No schedule assigned for this teacher.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-red-500">Could not load teacher details.</p>
        )}
      </div>
    </div>
  );
};

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/admin/teachers');
        setTeachers(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch teachers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      await api.delete(`/api/admin/teachers/${teacherToDelete._id}`);
      setTeachers(prev => prev.filter(t => t._id !== teacherToDelete._id));
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
    } catch (err) {
       // You could show an error toast here
      console.error('Failed to delete teacher:', err);
    }
  };

  const handleEditClick = (teacher) => {
    setTeacherToEdit(teacher);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async (updatedTeacher) => {
    if (!updatedTeacher) return;
    try {
      const response = await api.put(`/api/admin/teachers/${updatedTeacher._id}`, { name: updatedTeacher.name });
      setTeachers(prev => prev.map(t => t._id === updatedTeacher._id ? response.data : t));
      setIsEditModalOpen(false);
      setTeacherToEdit(null);
    } catch (err) {
      console.error('Failed to update teacher:', err);
      // You could show an error toast here
    }
  };

  const handleViewClick = async (teacher) => {
    setIsViewModalOpen(true);
    setIsViewLoading(true);
    try {
      const response = await api.get(`/api/admin/teachers/${teacher._id}`);
      setTeacherDetails(response.data);
    } catch (err) {
      console.error('Failed to fetch teacher details:', err);
      setTeacherDetails(null); // Clear previous details on error
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleAddTeacher = async (newTeacher) => {
    try {
      const response = await api.post('/api/admin/teachers', newTeacher);
      setTeachers(prev => [response.data, ...prev]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create teacher:', err);
      // You could show an error toast here based on err.response.data.message
    }
  };

  // Get all unique subjects and classes from teachers' schedules
  const allSubjects = Array.from(new Set(
    teachers.flatMap(t => (t.schedule || []).map(slot => slot.subject)).filter(Boolean)
  ));
  const allClasses = Array.from(new Set(
    teachers.flatMap(t => (t.schedule || []).map(slot => slot.classSection && slot.classSection.replace(/[^0-9]/g, ''))).filter(Boolean)
  ));

  // Filter teachers by name/email, subject, and class
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter
      ? (t.schedule || []).some(slot => slot.subject === subjectFilter)
      : true;
    const matchesClass = classFilter
      ? (t.schedule || []).some(slot => slot.classSection && slot.classSection.replace(/[^0-9]/g, '') === classFilter)
      : true;
    return matchesSearch && matchesSubject && matchesClass;
  });

  if (loading) return <p className="text-center text-gray-500">Loading teachers...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <>
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete ${teacherToDelete?.name}? This action cannot be undone.`}
      />
      <EditTeacherModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveChanges}
        teacher={teacherToEdit}
      />
      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddTeacher}
      />
      <ViewTeacherModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        details={teacherDetails}
        loading={isViewLoading}
      />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h2 className="text-xl font-bold text-gray-800">Manage Teachers</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">All Subjects</option>
              {allSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">All Classes</option>
              {allClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <FiPlus className="mr-2" />
            Add Teacher
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Joined On</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(teacher => (
                <tr key={teacher._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{teacher.name}</td>
                  <td className="p-4 text-gray-600">{teacher.email}</td>
                  <td className="p-4 text-gray-600">{new Date(teacher.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 flex justify-end space-x-2">
                    <button 
                      onClick={() => handleViewClick(teacher)}
                      className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <Link 
                      to={`/admin/teacher-schedule/${teacher._id}`}
                      className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100"
                      title="Manage Schedule"
                    >
                      <FiCalendar />
                    </Link>
                    <button 
                      onClick={() => handleEditClick(teacher)}
                      className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                      title="Edit Teacher"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(teacher)}
                      className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                      title="Delete Teacher"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {teachers.length === 0 && !loading && (
          <p className="text-center text-gray-500 pt-8">No teachers found.</p>
        )}
      </div>
    </>
  );
};

export default TeacherList;
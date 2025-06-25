import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FiX, FiArrowLeft, FiChevronDown } from 'react-icons/fi';
import Toast from '../../components/ui/Toast';

// Dynamic options will be fetched from backend

const ScheduleSlotModal = ({ isOpen, onClose, onSave, onDelete, slotInfo, subjectOptions, classOptions, sectionOptions, optionsLoading }) => {
  const [subject, setSubject] = useState('');
  const [classNum, setClassNum] = useState('');
  const [section, setSection] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  const [addingClass, setAddingClass] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const isEditing = slotInfo && slotInfo._id;

  useEffect(() => {
    if (slotInfo) {
      setSubject(slotInfo.subject || '');
      // Split classSection if possible
      if (slotInfo.classSection) {
        const match = slotInfo.classSection.match(/^(\d+)([A-Z])$/i);
        if (match) {
          setClassNum(match[1]);
          setSection(match[2].toUpperCase());
        } else {
          setClassNum('');
          setSection('');
        }
      } else {
        setClassNum('');
        setSection('');
      }
      setAddingSubject(false);
      setAddingClass(false);
      setAddingSection(false);
    }
  }, [slotInfo]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const classSection = classNum && section ? `${classNum}${section}` : '';
    onSave({ ...slotInfo, subject, classSection });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit' : 'Create'} Schedule Slot</h3>
        <p className="text-sm text-gray-500 mb-4">
          For {slotInfo.day} - Period {slotInfo.periodIndex}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <div className="relative">
              <select
                id="subject"
                value={addingSubject ? '__add_new_subject__' : subjectOptions.includes(subject) ? subject : ''}
                onChange={e => {
                  if (e.target.value === '__add_new_subject__') {
                    setAddingSubject(true);
                    setSubject('');
                  } else {
                    setAddingSubject(false);
                    setSubject(e.target.value);
                  }
                }}
                className="w-full appearance-none bg-white px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                disabled={optionsLoading}
                required={!addingSubject}
              >
                <option value="" disabled>{optionsLoading ? 'Loading...' : 'Select subject'}</option>
                {subjectOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="__add_new_subject__">Add new subject...</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {addingSubject && (
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Enter new subject"
                className="mt-2 w-full px-3 py-2 border border-indigo-400 rounded-md shadow-sm"
                required
                autoFocus
              />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <div className="relative">
              <select
                value={addingClass ? '__add_new_class__' : classOptions.includes(classNum) ? classNum : ''}
                onChange={e => {
                  if (e.target.value === '__add_new_class__') {
                    setAddingClass(true);
                    setClassNum('');
                  } else {
                    setAddingClass(false);
                    setClassNum(e.target.value);
                  }
                }}
                className="w-full appearance-none bg-white px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                disabled={optionsLoading}
                required={!addingClass}
              >
                <option value="" disabled>{optionsLoading ? 'Loading...' : 'Select class'}</option>
                {classOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="__add_new_class__">Add new class...</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {addingClass && (
              <input
                type="text"
                value={classNum}
                onChange={e => setClassNum(e.target.value)}
                placeholder="Enter new class"
                className="mt-2 w-full px-3 py-2 border border-indigo-400 rounded-md shadow-sm"
                required
                autoFocus
              />
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <div className="relative">
              <select
                value={addingSection ? '__add_new_section__' : sectionOptions.includes(section) ? section : ''}
                onChange={e => {
                  if (e.target.value === '__add_new_section__') {
                    setAddingSection(true);
                    setSection('');
                  } else {
                    setAddingSection(false);
                    setSection(e.target.value);
                  }
                }}
                className="w-full appearance-none bg-white px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                disabled={optionsLoading}
                required={!addingSection}
              >
                <option value="" disabled>{optionsLoading ? 'Loading...' : 'Select section'}</option>
                {sectionOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="__add_new_section__">Add new section...</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {addingSection && (
              <input
                type="text"
                value={section}
                onChange={e => setSection(e.target.value)}
                placeholder="Enter new section"
                className="mt-2 w-full px-3 py-2 border border-indigo-400 rounded-md shadow-sm"
                required
                autoFocus
              />
            )}
          </div>
          <div className="flex justify-between items-center">
            <div>
              {isEditing && (
                <button type="button" onClick={() => onDelete(slotInfo)}
                  className="px-4 py-2 text-red-600 rounded-md hover:bg-red-50">Delete</button>
              )}
            </div>
            <div className="flex space-x-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const ScheduleEditor = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [toast, setToast] = useState('');

  // State for batch updates
  const [pendingChanges, setPendingChanges] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const weekdayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNameToIndex = weekdayMap.reduce((acc, day, index) => ({ ...acc, [day]: index }), {});
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  // Dynamic options will be fetched from backend
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!teacherId) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/admin/teachers/${teacherId}`);
        setTeacher(response.data.teacher);
        setSchedule(response.data.schedule);
        setLastUpdated(new Date());
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch teacher data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
    // Fetch dynamic options
    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        const [subjectsRes, classesRes, sectionsRes] = await Promise.all([
          api.get('/api/schedules/subjects'),
          api.get('/api/schedules/classes'),
          api.get('/api/schedules/sections'),
        ]);
        // Sort the options before setting state
        const sortedSubjects = (subjectsRes.data.subjects || []).sort();
        const sortedClasses = (classesRes.data.classes || []).sort((a, b) => a - b);
        const sortedSections = (sectionsRes.data.sections || []).sort();

        setSubjectOptions(sortedSubjects);
        setClassOptions(sortedClasses);
        setSectionOptions(sortedSections);
      } catch (err) {
        setSubjectOptions([]);
        setClassOptions([]);
        setSectionOptions([]);
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, [teacherId]);

  // --- Data Transformation for Grid View ---
  const scheduleMatrix = React.useMemo(() => {
    const baseSchedule = schedule.reduce((acc, item) => {
      const day = weekdayMap[item.weekday];
      if (!acc[day]) acc[day] = {};
      acc[day][item.periodIndex] = { ...item, status: 'saved' };
      return acc;
    }, {});

    // Apply pending changes for UI display
    pendingChanges.forEach(change => {
      const day = weekdayMap[change.weekday];
      if (!baseSchedule[day]) baseSchedule[day] = {};

      if (change.status === 'deleted') {
        if (baseSchedule[day][change.periodIndex]) {
           baseSchedule[day][change.periodIndex].status = 'deleted';
        }
      } else {
        baseSchedule[day][change.periodIndex] = change;
      }
    });
    return baseSchedule;
  }, [schedule, pendingChanges, weekdayMap]);
  // --- End Transformation ---

  const handleCellClick = (day, periodIndex) => {
    const existingSlot = scheduleMatrix[day]?.[periodIndex];
    setSelectedSlot(existingSlot || { day, periodIndex });
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (slotData) => {
    const change = {
      ...slotData,
      weekday: dayNameToIndex[slotData.day],
      status: slotData._id ? 'updated' : 'new'
    };

    setPendingChanges(prev => {
      const otherChanges = prev.filter(p => !(p.weekday === change.weekday && p.periodIndex === change.periodIndex));
      return [...otherChanges, change];
    });

    setIsModalOpen(false);
    setToast('Change staged. Click "Save Changes" to commit.');
  };

  const handleDeleteSlot = async (slotData) => {
    const change = {
      ...slotData,
      weekday: dayNameToIndex[slotData.day],
      status: 'deleted'
    };

    setPendingChanges(prev => {
      // If deleting a slot that was just created locally, just remove it from pending.
      if (slotData.status === 'new') {
        return prev.filter(p => !(p.weekday === change.weekday && p.periodIndex === change.periodIndex));
      }
      const otherChanges = prev.filter(p => !(p.weekday === change.weekday && p.periodIndex === change.periodIndex));
      return [...otherChanges, change];
    });
    
    setIsModalOpen(false);
    setToast('Deletion staged. Click "Save Changes" to commit.');
  };

  const handleBatchSave = async () => {
    setIsSaving(true);
    setToast('Saving all changes...');

    const promises = pendingChanges.map(change => {
      const payload = { teacherId, ...change };
      switch (change.status) {
        case 'new':
          return api.post('/api/schedules/assign', payload);
        case 'updated':
          return api.put(`/api/schedules/${change._id}`, payload);
        case 'deleted':
          return api.delete(`/api/schedules/${change._id}`);
        default:
          return Promise.resolve();
      }
    });

    try {
      await Promise.all(promises);
      setToast('All changes saved successfully!');
      setPendingChanges([]);
      // Refetch data to ensure consistency
      const response = await api.get(`/api/admin/teachers/${teacherId}`);
      setTeacher(response.data.teacher);
      setSchedule(response.data.schedule);
      setLastUpdated(new Date());
    } catch (err) {
      const msg = err.response?.data?.message || 'An error occurred during save.';
      setToast(msg);
      console.error('Batch save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setPendingChanges([]);
    setToast('Changes discarded.');
  };

  // When a new value is added, add it to the options for the current session
  // useEffect(() => {
  //   if (subject && addingSubject && !subjectOptions.includes(subject)) {
  //     subjectOptions.push(subject);
  //   }
  //   if (classNum && addingClass && !classOptions.includes(classNum)) {
  //     classOptions.push(classNum);
  //   }
  //   if (section && addingSection && !sectionOptions.includes(section)) {
  //     sectionOptions.push(section);
  //   }
  // }, [subject, classNum, section]);
  

  if (loading) {
    return <p className="text-center p-8">Loading schedule editor...</p>;
  }

  if (error) {
    return <p className="text-center p-8 text-red-500">{error}</p>;
  }

  return (
    <div>
      <Toast message={toast} onClose={() => setToast('')} />
      <ScheduleSlotModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
        slotInfo={selectedSlot}
        subjectOptions={subjectOptions}
        classOptions={classOptions}
        sectionOptions={sectionOptions}
        optionsLoading={optionsLoading}
      />

      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 mr-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-800 flex-1">Schedule Editor</h1>
        {pendingChanges.length > 0 && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleBatchSave}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleDiscardChanges}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
            >
              Discard Changes
            </button>
          </div>
        )}
      </div>
      <p className="text-lg text-gray-600 mb-2">Managing schedule for: <span className="font-semibold">{teacher?.name}</span></p>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'N/A'}</p>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto p-6">
          <div
            className="grid gap-px"
            style={{ gridTemplateColumns: `100px repeat(5, 1fr)`, minWidth: '800px' }} // Display Mon-Fri
          >
            {/* Top-left empty cell */}
            <div className="bg-gray-50 p-3 rounded-tl-lg"></div>

            {/* Day headers */}
            {weekdayMap.slice(1, 6).map(day => (
              <div key={day} className="bg-gray-50 text-center font-semibold p-3">
                {day}
              </div>
            ))}

            {/* Grid rows */}
            {periods.map(periodIndex => (
              <React.Fragment key={periodIndex}>
                {/* Period header */}
                <div className="bg-gray-50 text-center font-semibold p-3 flex items-center justify-center">
                  Period {periodIndex}
                </div>

                {/* Schedule cells */}
                {weekdayMap.slice(1, 6).map(day => {
                  const slot = scheduleMatrix[day]?.[periodIndex];
                  return (
                    <div
                      key={`${day}-${periodIndex}`}
                      onClick={() => handleCellClick(day, periodIndex)}
                      className={`relative p-3 border-t border-l border-gray-200 min-h-[100px] transition-colors cursor-pointer ${
                        slot?.status === 'deleted' ? 'bg-red-100 hover:bg-red-200' : 'bg-white hover:bg-indigo-50'
                      }`}
                    >
                      {slot && slot.status !== 'deleted' ? (
                        <div>
                          <p className="font-semibold text-sm text-indigo-800">{slot.subject}</p>
                          <p className="text-xs text-gray-600 mt-1">Class: {slot.classSection}</p>
                          {slot.status === 'new' && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" title="New"></span>}
                          {slot.status === 'updated' && <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full" title="Modified"></span>}
                        </div>
                      ) : (
                        <div className="text-gray-300 flex items-center justify-center h-full">+</div>
                      )}
                      {slot?.status === 'deleted' && (
                        <div className="text-red-500 flex items-center justify-center h-full line-through">
                          Deleted
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditor; 
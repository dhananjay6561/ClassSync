import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FiX, FiArrowLeft } from 'react-icons/fi';

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              disabled={optionsLoading}
              required={!addingSubject}
            >
              <option value="" disabled>{optionsLoading ? 'Loading...' : 'Select subject'}</option>
              {subjectOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              <option value="__add_new_subject__">Add new subject...</option>
            </select>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              disabled={optionsLoading}
              required={!addingClass}
            >
              <option value="" disabled>{optionsLoading ? 'Loading...' : 'Select class'}</option>
              {classOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              <option value="__add_new_class__">Add new class...</option>
            </select>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              disabled={optionsLoading}
              required={!addingSection}
            >
              <option value="" disabled>{optionsLoading ? 'Loading...' : 'Select section'}</option>
              {sectionOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              <option value="__add_new_section__">Add new section...</option>
            </select>
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

const Toast = ({ message, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for fade-out
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg flex items-center space-x-4 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ minWidth: 200 }}
    >
      <span>{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="ml-2 text-white hover:text-gray-200"><FiX /></button>
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
        setSubjectOptions(subjectsRes.data.subjects || []);
        setClassOptions(classesRes.data.classes || []);
        setSectionOptions(sectionsRes.data.sections || []);
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
  const scheduleMatrix = schedule.reduce((acc, item) => {
    const day = weekdayMap[item.weekday];
    if (!acc[day]) acc[day] = {};
    acc[day][item.periodIndex] = item;
    return acc;
  }, {});
  // --- End Transformation ---

  const handleCellClick = (day, periodIndex) => {
    const existingSlot = scheduleMatrix[day]?.[periodIndex];
    setSelectedSlot(existingSlot || { day, periodIndex });
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (slotData) => {
    const payload = {
      teacherId,
      weekday: dayNameToIndex[slotData.day],
      periodIndex: slotData.periodIndex,
      subject: slotData.subject,
      classSection: slotData.classSection,
    };

    try {
      if (slotData._id) { // Editing existing slot
        const response = await api.put(`/api/schedules/${slotData._id}`, payload);
        setSchedule(prev => prev.map(s => s._id === slotData._id ? response.data.slot : s));
      } else { // Creating new slot
        const response = await api.post('/api/schedules/assign', payload);
        setSchedule(prev => [...prev, response.data.slot]);
      }
      setIsModalOpen(false);
      setLastUpdated(new Date());
      setToast('Schedule updated!');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg && msg.includes('already assigned to another teacher')) {
        setToast('This slot is already assigned to another teacher.');
      } else {
        setToast('Failed to save slot.');
      }
      console.error('Failed to save slot:', err);
    }
  };

  const handleDeleteSlot = async (slotData) => {
    try {
      await api.delete(`/api/schedules/${slotData._id}`);
      setSchedule(prev => prev.filter(s => s._id !== slotData._id));
      setIsModalOpen(false);
      setLastUpdated(new Date());
      setToast('Schedule updated!');
    } catch (err) {
      console.error('Failed to delete slot:', err);
      // You could show an error toast here
    }
  };

  const [subject, setSubject] = useState('');
const [classNum, setClassNum] = useState('');
const [section, setSection] = useState('');
const [addingSubject, setAddingSubject] = useState(false);
const [addingClass, setAddingClass] = useState(false);
const [addingSection, setAddingSection] = useState(false);

  // When a new value is added, add it to the options for the current session
  useEffect(() => {
    if (subject && addingSubject && !subjectOptions.includes(subject)) {
      subjectOptions.push(subject);
    }
    if (classNum && addingClass && !classOptions.includes(classNum)) {
      classOptions.push(classNum);
    }
    if (section && addingSection && !sectionOptions.includes(section)) {
      sectionOptions.push(section);
    }
  }, [subject, classNum, section]);
  

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
                      className="relative p-3 border-t border-l border-gray-200 min-h-[100px] bg-white hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      {slot ? (
                        <div>
                          <p className="font-semibold text-sm text-indigo-800">{slot.subject}</p>
                          <p className="text-xs text-gray-600 mt-1">Class: {slot.classSection}</p>
                        </div>
                      ) : (
                        <div className="text-gray-300 flex items-center justify-center h-full">+</div>
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
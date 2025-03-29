import React, { useState } from 'react';
import { Dumbbell, Brain, Heart, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const getUserId = () => {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem("userId", userId);
  }
  return userId;
};

const userId = getUserId();


interface Stats {
  strength: number;
  intelligence: number;
  endurance: number;
}

function App() {
  const [stats, setStats] = useState<Stats>({
    strength: 0,
    intelligence: 0,
    endurance: 0,
  });
  const addStat = async () => {
    try {
      await addDoc(collection(db, "stats"), {
        userId,
        strength: stats.strength,
        intelligence: stats.intelligence,
        endurance: stats.endurance,
        timestamp: new Date()
      });
      console.log("Stats saved!");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const fetchStats = async () => {
    const statsQuery = query(collection(db, "stats"), where("userId", "==", userId));
    const querySnapshot = await getDocs(statsQuery);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });
  };
  

  const [inputs, setInputs] = useState({
    weightLifted: 0,
    reps: 0,
    homeworkCompleted: 0,
    milesRun: 0,
  });

  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const calculateStrength = () => {
    const newReps = Math.floor((inputs.weightLifted / 5) * inputs.reps);
    setStats(prev => ({ ...prev, strength: prev.strength + newReps }));
  };

  const calculateIntelligence = () => {
    setStats(prev => ({ ...prev, intelligence: prev.intelligence + inputs.homeworkCompleted }));
  };

  const calculateEndurance = () => {
    const enduranceFromLifting = Math.floor((inputs.weightLifted / 5) * Math.floor(inputs.reps / 20));
    const enduranceFromRunning = inputs.milesRun;
    setStats(prev => ({ ...prev, endurance: prev.endurance + enduranceFromLifting + enduranceFromRunning }));
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">Fitness Tracker</h1>

        <button onClick={addStat} className="bg-blue-500 text-white px-4 py-2 rounded">Save Stats</button>
        <button onClick={fetchStats} className="bg-green-500 text-white px-4 py-2 rounded ml-4">Fetch Stats</button>
        
        {/* Stats Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Dumbbell size={24} />} title="Strength" value={stats.strength} unit="points" />
          <StatCard icon={<Brain size={24} />} title="Intelligence" value={stats.intelligence} unit="points" />
          <StatCard icon={<Heart size={24} />} title="Endurance" value={stats.endurance} unit="points" />
        </div>

        {/* Input Forms */}
        <div className="space-y-4">
          {/* Strength Form */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('strength')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Dumbbell size={20} />
                <h2 className="text-xl font-semibold">Track Strength</h2>
                <div className="group relative">
                  <HelpCircle size={16} className="text-gray-400" />
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    1 rep / 5 lbs = 1 strength point
                  </div>
                </div>
              </div>
              {openSection === 'strength' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openSection === 'strength' && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="weightLifted" className="block text-sm text-gray-600">
                      Weight (lbs)
                    </label>
                    <input
                      id="weightLifted"
                      type="number"
                      placeholder="Enter weight in pounds"
                      className="p-2 border rounded w-full"
                      value={inputs.weightLifted}
                      onChange={(e) => setInputs(prev => ({ ...prev, weightLifted: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="strengthReps" className="block text-sm text-gray-600">
                      Number of Reps
                    </label>
                    <input
                      id="strengthReps"
                      type="number"
                      placeholder="Enter number of reps"
                      className="p-2 border rounded w-full"
                      value={inputs.reps}
                      onChange={(e) => setInputs(prev => ({ ...prev, reps: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <button
                  onClick={calculateStrength}
                  className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Log Strength
                </button>
              </div>
            )}
          </div>

          {/* Intelligence Form */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('intelligence')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Brain size={20} />
                <h2 className="text-xl font-semibold">Track Intelligence</h2>
                <div className="group relative">
                  <HelpCircle size={16} className="text-gray-400" />
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    1 homework = 1 intelligence point
                  </div>
                </div>
              </div>
              {openSection === 'intelligence' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openSection === 'intelligence' && (
              <div className="p-6 border-t">
                <div className="space-y-2">
                  <label htmlFor="homework" className="block text-sm text-gray-600">
                    Homework Assignments Completed
                  </label>
                  <input
                    id="homework"
                    type="number"
                    placeholder="Enter number of assignments"
                    className="p-2 border rounded w-full"
                    value={inputs.homeworkCompleted}
                    onChange={(e) => setInputs(prev => ({ ...prev, homeworkCompleted: Number(e.target.value) }))}
                  />
                </div>
                <button
                  onClick={calculateIntelligence}
                  className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Log Intelligence
                </button>
              </div>
            )}
          </div>

          {/* Endurance Form */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('endurance')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart size={20} />
                <h2 className="text-xl font-semibold">Track Endurance</h2>
                <div className="group relative">
                  <HelpCircle size={16} className="text-gray-400" />
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    4 sets / 20 reps / 5 lbs = 1 endurance point<br />
                    1 mile run = 1 endurance point
                  </div>
                </div>
              </div>
              {openSection === 'endurance' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openSection === 'endurance' && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="enduranceWeight" className="block text-sm text-gray-600">
                      Weight (lbs)
                    </label>
                    <input
                      id="enduranceWeight"
                      type="number"
                      placeholder="Enter weight in pounds"
                      className="p-2 border rounded w-full"
                      value={inputs.weightLifted}
                      onChange={(e) => setInputs(prev => ({ ...prev, weightLifted: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="enduranceReps" className="block text-sm text-gray-600">
                      Number of Reps
                    </label>
                    <input
                      id="enduranceReps"
                      type="number"
                      placeholder="Enter number of reps"
                      className="p-2 border rounded w-full"
                      value={inputs.reps}
                      onChange={(e) => setInputs(prev => ({ ...prev, reps: Number(e.target.value) }))}
                    />
                  </div>
                  <br></br>
                  <div className="space-y-2">
                    <label htmlFor="milesRun" className="block text-sm text-gray-600">
                      Distance Run (miles)
                    </label>
                    <input
                      id="milesRun"
                      type="number"
                      placeholder="Enter miles run"
                      className="p-2 border rounded w-full"
                      value={inputs.milesRun}
                      onChange={(e) => setInputs(prev => ({ ...prev, milesRun: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <button
                  onClick={calculateEndurance}
                  className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Log Endurance
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, unit }: { icon: React.ReactNode; title: string; value: number; unit: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <p className="text-3xl font-bold">{value} <span className="text-lg font-normal text-gray-600">{unit}</span></p>
    </div>
  );
}

export default App;
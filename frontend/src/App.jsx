
import React, { useEffect, useState } from 'react';
import {
  Activity, Bell, BrainCircuit, ChevronDown, CircleHelp,
  ClipboardList, HeartPulse, LayoutDashboard, LogOut, Menu,
  Plus, ShieldCheck, Stethoscope, UserRound, Users, Wind,
  Droplets, Thermometer, Heart, ArrowUpRight, Search,
  Settings, Sparkles, AlertTriangle, CheckCircle2, Clock3
} from 'lucide-react';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

import api from './api';


const demoTrend = [
  {day:'Mon',value:22},{day:'Tue',value:25},{day:'Wed',value:21},
  {day:'Thu',value:29},{day:'Fri',value:27},{day:'Sat',value:31},
  {day:'Sun',value:26}
];

const demoVitals = {
  heart_rate:82,
  systolic_bp:122,
  diastolic_bp:78,
  spo2:97,
  respiratory_rate:17,
  temperature:36.8,
  glucose:108
};

const nav = [
  {label:'Overview',icon:LayoutDashboard},
  {label:'Health Monitoring',icon:Activity},
  {label:'Risk Assessment',icon:BrainCircuit},
  {label:'Health History',icon:ClipboardList},
  {label:'Notifications',icon:Bell}
];


function Login({onLogin}) {
  const [email,setEmail] = useState('patient@medisense.demo');
  const [password,setPassword] = useState('MediSense@123');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const {data} = await api.post('/api/auth/login',{email,password});
      localStorage.setItem('medisense_token',data.access_token);
      onLogin(data.user);
    } catch(err) {
      setError(
        err.response?.data?.detail ||
        'Could not connect to API. Start the backend first.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-art">
        <div className="brand">
          <div className="brand-mark"><HeartPulse/></div>
          <span>MediSense <b>AI</b></span>
        </div>

        <div className="login-copy">
          <span className="eyebrow">INTELLIGENT PATIENT MONITORING</span>
          <h1>See the signals.<br/><em>Understand the story.</em></h1>
          <p>
            A unified workspace for patient health trends,
            risk assessments and clinical review.
          </p>

          <div className="orbit">
            <div className="orbit-core"><HeartPulse size={34}/></div>
            <span className="orbit-node node-one"><Activity/></span>
            <span className="orbit-node node-two"><BrainCircuit/></span>
            <span className="orbit-node node-three"><ShieldCheck/></span>
          </div>
        </div>

        <div className="login-foot">
          EDUCATIONAL PROTOTYPE · NOT FOR CLINICAL USE
        </div>
      </div>

      <div className="login-panel">
        <div className="login-box">
          <div className="mobile-brand brand">
            <div className="brand-mark"><HeartPulse/></div>
            <span>MediSense <b>AI</b></span>
          </div>

          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your workspace</h2>
          <p className="muted">Use one of the local demonstration accounts.</p>

          <form onSubmit={submit}>
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              required
            />

            <button className="primary-btn full" disabled={busy}>
              {busy?'Signing in…':'Sign in securely'}
              <ArrowUpRight size={17}/>
            </button>

            {error && <div className="error-msg">{error}</div>}
          </form>

          <div className="demo-accounts">
            <b>Demo accounts</b>
            <span>Patient · patient@medisense.demo</span>
            <span>Doctor · doctor@medisense.demo</span>
            <span>Admin · admin@medisense.demo</span>
            <small>Password for all: MediSense@123</small>
          </div>

          <div className="login-disclaimer">
            <ShieldCheck size={15}/>
            Prototype environment. Use synthetic data only.
          </div>
        </div>
      </div>
    </div>
  );
}


function Metric({icon:Icon,label,value,unit,change,tone='teal'}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={19}/></div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value}<small>{unit}</small>
      </div>
      <div className="metric-foot">
        <span className="metric-dot"/> {change}
      </div>
    </div>
  );
}


export default function App() {
  const [user,setUser] = useState(null);
  const [page,setPage] = useState('Overview');
  const [menuOpen,setMenuOpen] = useState(false);

  const [dash,setDash] = useState(null);
  const [readings,setReadings] = useState([]);
  const [history,setHistory] = useState([]);
  const [notifications,setNotifications] = useState([]);

  const [notice,setNotice] = useState('');
  const [form,setForm] = useState(demoVitals);
  const [prediction,setPrediction] = useState(null);

  const [saving,setSaving] = useState(false);
  const [loading,setLoading] = useState(true);

  const unreadCount = notifications.filter(n=>!n.is_read).length;


  // LOAD DASHBOARD, READINGS, HISTORY AND NOTIFICATIONS
  async function refresh() {
    try {
      const [d,r,h,n] = await Promise.all([
        api.get('/api/dashboard'),
        api.get('/api/readings'),
        api.get('/api/predictions/history'),
        api.get('/api/notifications')
      ]);

      setDash(d.data);
      setReadings(r.data);
      setHistory(h.data);
      setNotifications(n.data);

    } catch(e) {
      setNotice(
        'Unable to load live data. Check that the backend is running.'
      );
    }
  }


  // RESTORE SESSION
  useEffect(()=>{
    const token = localStorage.getItem('medisense_token');

    if(!token) {
      setLoading(false);
      return;
    }

    api.get('/api/dashboard')
      .then(async res=>{
        setUser(res.data.user);
        await refresh();
      })
      .catch(()=>{
        localStorage.removeItem('medisense_token');
      })
      .finally(()=>{
        setLoading(false);
      });
  },[]);


  // MARK ALL NOTIFICATIONS AS READ
  async function markAllNotificationsRead() {
    const unread = notifications.some(n=>!n.is_read);

    if(!unread) return;

    try {
      await api.post('/api/notifications/read-all');

      setNotifications(prev=>
        prev.map(n=>({...n,is_read:true}))
      );

      setDash(prev=>prev
        ? {...prev,unread_notification_count:0}
        : prev
      );

    } catch(e) {
      setNotice(
        'Unable to update notification status. Please try again.'
      );
    }
  }


  // OPEN NOTIFICATION CENTRE
  async function openNotifications() {
    setPage('Notifications');
    setMenuOpen(false);

    try {
      const {data} = await api.get('/api/notifications');
      setNotifications(data);

      const hasUnread = data.some(n=>!n.is_read);

      if(hasUnread) {
        await api.post('/api/notifications/read-all');

        setNotifications(data.map(n=>({...n,is_read:true})));

        setDash(prev=>prev
          ? {...prev,unread_notification_count:0}
          : prev
        );
      }

    } catch(e) {
      setNotice('Unable to load notifications. Please try again.');
    }
  }


  // MARK A SINGLE NOTIFICATION AS READ
  async function markNotificationRead(id) {
    try {
      await api.post(`/api/notifications/${id}/read`);

      setNotifications(prev=>
        prev.map(n=>
          n.id===id ? {...n,is_read:true} : n
        )
      );

      setDash(prev=>prev
        ? {
            ...prev,
            unread_notification_count:Math.max(
              0,(prev.unread_notification_count || 0)-1
            )
          }
        : prev
      );

    } catch(e) {
      setNotice('Unable to mark notification as read.');
    }
  }


  function logout() {
    localStorage.removeItem('medisense_token');
    setUser(null);
    setDash(null);
    setNotifications([]);
    setReadings([]);
    setHistory([]);
    setPage('Overview');
  }


  async function saveReading(e) {
    e.preventDefault();
    setSaving(true);
    setNotice('');

    try {
      await api.post(
        '/api/readings',
        Object.fromEntries(
          Object.entries(form).map(([k,v])=>[k,Number(v)])
        )
      );

      setNotice('Health measurement saved.');
      await refresh();

    } catch(err) {
      setNotice(
        err.response?.data?.detail ||
        'Could not save measurement.'
      );
    } finally {
      setSaving(false);
    }
  }


  async function assess(e) {
    e.preventDefault();
    setSaving(true);
    setNotice('');

    try {
      const {data} = await api.post(
        '/api/predictions',
        Object.fromEntries(
          Object.entries(form).map(([k,v])=>[k,Number(v)])
        )
      );

      setPrediction(data);
      setNotice('Demo assessment generated and saved.');
      await refresh();

    } catch(err) {
      setNotice(
        err.response?.data?.detail ||
        'Could not generate assessment.'
      );
    } finally {
      setSaving(false);
    }
  }


  if(loading) {
    return (
      <div className="loading-screen">
        <div className="brand-mark"><HeartPulse/></div>
        <span>Preparing your workspace…</span>
      </div>
    );
  }

  if(!user) {
    return (
      <Login onLogin={async u=>{
        setUser(u);
        await refresh();
      }}/>
    );
  }


  const latest = readings[0] || null;
  const isPatient = user.role==='patient';
  const displayName = user.name?.split(' ')[0] || 'there';
  const metricValues = latest || demoVitals;
  const assessment = history[0];

  const sideItems = isPatient
    ? nav
    : [
        {label:'Overview',icon:LayoutDashboard},
        {label:'Patient Monitoring',icon:Users},
        {label:'Risk Assessment',icon:BrainCircuit},
        {label:'Health History',icon:ClipboardList},
        {label:'Notifications',icon:Bell}
      ];


  return (
    <div className="app-shell">

      <aside className={`sidebar ${menuOpen?'open':''}`}>
        <div className="brand sidebar-brand">
          <div className="brand-mark"><HeartPulse/></div>
          <span>MediSense <b>AI</b></span>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <div className="nav-list">
          {sideItems.map(({label,icon:Icon})=>(
            <button
              key={label}
              className={`nav-item ${page===label?'active':''}`}
              onClick={()=>{
                if(label==='Notifications') {
                  openNotifications();
                } else {
                  setPage(label);
                  setMenuOpen(false);
                }
              }}
            >
              <Icon size={18}/>
              <span>{label}</span>

              {label==='Notifications' && unreadCount>0 && (
                <i className="nav-count">{unreadCount}</i>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={17}/></div>
            <b>Need assistance?</b>
            <p>Explore the demo workspace and its features.</p>
            <span>Help centre <ArrowUpRight size={13}/></span>
          </div>

          <div className="user-mini">
            <div className="avatar">{user.name?.slice(0,1)||'M'}</div>

            <div className="user-mini-copy">
              <b>{user.name}</b>
              <small>{user.role}</small>
            </div>

            <button
              className="icon-btn"
              onClick={logout}
              title="Sign out"
            >
              <LogOut size={17}/>
            </button>
          </div>
        </div>
      </aside>


      <main className="main-area">

        <header className="topbar">
          <button
            className="icon-btn mobile-menu"
            onClick={()=>setMenuOpen(!menuOpen)}
          >
            <Menu/>
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> <b>{page}</b>
          </div>

          <div className="top-actions">
            <div className="status-pill">
              <span/> Demo environment
            </div>

            <button
              className="icon-btn notification-top-btn"
              onClick={openNotifications}
              title="Notifications"
            >
              <Bell size={18}/>

              {unreadCount>0 && (
                <span className="top-notification-count">
                  {unreadCount>99?'99+':unreadCount}
                </span>
              )}
            </button>

            <div className="avatar small">
              {user.name?.slice(0,1)||'M'}
            </div>
          </div>
        </header>


        <div className="content">

          <div className="welcome-row">
            <div>
              <span className="eyebrow">
                THURSDAY, YOUR HEALTH WORKSPACE
              </span>

              <h1>
                {page==='Overview'
                  ? `Good day, ${displayName}`
                  : page}
              </h1>

              <p className="muted">
                {isPatient
                  ? 'A clear view of your recorded health information.'
                  : 'Monitor patient records and review demonstration assessments.'}
              </p>
            </div>

            <div className="welcome-actions">
              <button
                className="secondary-btn"
                onClick={()=>setPage('Health History')}
              >
                <ClipboardList size={16}/> View history
              </button>

              <button
                className="primary-btn"
                onClick={()=>setPage('Health Monitoring')}
              >
                <Plus size={17}/> Add measurement
              </button>
            </div>
          </div>


          {notice && (
            <div className="notice">
              <span>{notice}</span>
              <button onClick={()=>setNotice('')}>×</button>
            </div>
          )}


          {page==='Overview' && (
            <>
              <div className="section-heading">
                <div>
                  <h3>Health at a glance</h3>
                  <p>
                    Latest recorded measurements · demo values where no reading exists
                  </p>
                </div>

                <span className="updated">
                  <Clock3 size={14}/>
                  {latest?'Latest record':'Sample overview'}
                </span>
              </div>


              <div className="metrics-grid">
                <Metric
                  icon={Heart}
                  label="Heart rate"
                  value={metricValues.heart_rate}
                  unit="bpm"
                  change="Latest recorded value"
                  tone="rose"
                />

                <Metric
                  icon={Activity}
                  label="Blood pressure"
                  value={`${metricValues.systolic_bp}/${metricValues.diastolic_bp}`}
                  unit="mmHg"
                  change="Systolic / diastolic"
                  tone="blue"
                />

                <Metric
                  icon={Droplets}
                  label="Oxygen saturation"
                  value={metricValues.spo2}
                  unit="%"
                  change="Latest recorded value"
                  tone="teal"
                />

                <Metric
                  icon={Wind}
                  label="Respiratory rate"
                  value={metricValues.respiratory_rate}
                  unit="/min"
                  change="Latest recorded value"
                  tone="violet"
                />
              </div>


              <div className="dashboard-grid">

                <section className="panel chart-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Risk trend overview</h3>
                      <p>
                        Illustrative trend visualization · not patient outcome data
                      </p>
                    </div>
                    <span className="tag">7 days</span>
                  </div>

                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={demoTrend}>
                        <defs>
                          <linearGradient
                            id="riskFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#22c6ad"
                              stopOpacity={0.27}
                            />
                            <stop
                              offset="95%"
                              stopColor="#22c6ad"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid stroke="#203442" vertical={false}/>
                        <XAxis
                          dataKey="day"
                          stroke="#78909d"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#78909d"
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background:'#102331',
                            border:'1px solid #294250',
                            borderRadius:12,
                            color:'#e8f2f4'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#32cdb5"
                          strokeWidth={2.5}
                          fill="url(#riskFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-legend">
                    <span/> Illustrative demo index
                  </div>
                </section>


                <section className="panel risk-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Latest risk assessment</h3>
                      <p>Machine learning demo output</p>
                    </div>
                    <div className="panel-icon"><BrainCircuit/></div>
                  </div>

                  {assessment ? (
                    <>
                      <div className="risk-score">
                        {assessment.risk_score}<small>/100</small>
                      </div>

                      <span className={`risk-label ${assessment.risk_level.toLowerCase()}`}>
                        {assessment.risk_level} · Demo estimate
                      </span>

                      <p className="risk-copy">
                        This synthetic-model output is for software demonstration only and is not clinically validated.
                      </p>
                    </>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon"><Sparkles/></div>
                      <b>No assessment yet</b>
                      <p>
                        Enter measurements to generate a demonstration prediction.
                      </p>
                      <button
                        className="secondary-btn"
                        onClick={()=>setPage('Risk Assessment')}
                      >
                        Open assessment
                      </button>
                    </div>
                  )}
                </section>

              </div>


              <section className="panel readings-panel">
                <div className="panel-head">
                  <div>
                    <h3>Recent measurements</h3>
                    <p>Your latest saved health records</p>
                  </div>

                  <button
                    className="text-btn"
                    onClick={()=>setPage('Health History')}
                  >
                    View all <ArrowUpRight size={14}/>
                  </button>
                </div>

                <ReadingTable rows={readings.slice(0,5)}/>
              </section>
            </>
          )}


          {page==='Health Monitoring' && (
            <div className="two-column">

              <section className="panel form-panel">
                <div className="panel-head">
                  <div>
                    <h3>Record health measurements</h3>
                    <p>Enter demonstration or synthetic measurements.</p>
                  </div>
                  <Activity className="teal-text"/>
                </div>

                <form className="health-form" onSubmit={saveReading}>
                  <MeasurementFields form={form} setForm={setForm}/>

                  <button className="primary-btn full" disabled={saving}>
                    {saving?'Saving…':'Save measurements'}
                    <ArrowUpRight size={16}/>
                  </button>
                </form>
              </section>


              <section className="panel info-panel">
                <div className="info-illustration">
                  <HeartPulse size={42}/>
                </div>
                <h3>Keep a consistent record</h3>
                <p>
                  Measurements are stored with timestamps so the application can display a history and demonstrate trend analysis.
                </p>
                <div className="info-note">
                  <ShieldCheck size={17}/>
                  Use synthetic data only in this prototype. Do not enter real patient information.
                </div>
              </section>

            </div>
          )}


          {page==='Risk Assessment' && (
            <div className="two-column">

              <section className="panel form-panel">
                <div className="panel-head">
                  <div>
                    <h3>Run a demo assessment</h3>
                    <p>Uses the synthetic demonstration model.</p>
                  </div>
                  <BrainCircuit className="teal-text"/>
                </div>

                <form className="health-form" onSubmit={assess}>
                  <MeasurementFields form={form} setForm={setForm}/>

                  <button className="primary-btn full" disabled={saving}>
                    {saving?'Analyzing…':'Generate demo assessment'}
                    <Sparkles size={16}/>
                  </button>
                </form>
              </section>


              <section className="panel result-panel">
                <div className="panel-head">
                  <div>
                    <h3>Assessment output</h3>
                    <p>Software demonstration only</p>
                  </div>
                  <span className="tag">Synthetic model</span>
                </div>

                {prediction ? (
                  <>
                    <div className="result-score">
                      {prediction.risk_score}<small>/100</small>
                    </div>

                    <span className={`risk-label ${prediction.risk_level.toLowerCase()}`}>
                      {prediction.risk_level} demo estimate
                    </span>

                    <h4>Configured contributing indicators</h4>

                    <ul className="factor-list">
                      {prediction.explanation.map((x,i)=>(
                        <li key={i}>
                          <span className="factor-dot"/>{x}
                        </li>
                      ))}
                    </ul>

                    <p className="risk-copy">
                      This score is generated from artificial training data and is not a real-world probability or clinical assessment.
                    </p>
                  </>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon"><BrainCircuit/></div>
                    <b>Ready for assessment</b>
                    <p>Submit measurements to test the prediction pipeline.</p>
                  </div>
                )}
              </section>

            </div>
          )}


          {page==='Health History' && (
            <section className="panel readings-panel">
              <div className="panel-head">
                <div>
                  <h3>Health measurement history</h3>
                  <p>Saved readings associated with this account</p>
                </div>
                <span className="tag">{readings.length} records</span>
              </div>

              <ReadingTable rows={readings}/>

              <div className="history-divider"/>

              <div className="panel-head">
                <div>
                  <h3>Assessment history</h3>
                  <p>Previous demonstration model outputs</p>
                </div>
              </div>

              {history.length ? (
                <div className="history-list">
                  {history.map(h=>(
                    <div className="history-item" key={h.id}>
                      <div className="history-icon"><BrainCircuit/></div>

                      <div className="history-main">
                        <b>Assessment #{h.id}</b>
                        <small>{new Date(h.created_at).toLocaleString()}</small>
                      </div>

                      <strong>{h.risk_score}%</strong>

                      <span className={`risk-label ${h.risk_level.toLowerCase()}`}>
                        {h.risk_level}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-inline">
                  No assessments have been saved yet.
                </div>
              )}
            </section>
          )}


          {page==='Notifications' && (
            <section className="panel readings-panel">
              <div className="panel-head">
                <div>
                  <h3>Notifications & alerts</h3>
                  <p>
                    Your account notifications · read status is saved
                  </p>
                </div>

                {unreadCount>0 && (
                  <button
                    className="text-btn"
                    onClick={markAllNotificationsRead}
                  >
                    Mark all as read <CheckCircle2 size={15}/>
                  </button>
                )}
              </div>


              {notifications.length ? (
                <div className="notification-list">

                  {notifications.map(n=>(
                    <div
                      className={`alert-row ${n.is_read?'notification-read':'notification-unread'}`}
                      key={n.id}
                    >
                      <div className="alert-symbol">
                        {n.is_read
                          ? <CheckCircle2/>
                          : <AlertTriangle/>
                        }
                      </div>

                      <div className="notification-content">
                        <b>{n.title}</b>
                        <p>{n.message}</p>
                        <small>
                          {new Date(n.created_at).toLocaleString()}
                        </small>
                      </div>

                      {!n.is_read && (
                        <button
                          className="text-btn"
                          onClick={()=>markNotificationRead(n.id)}
                        >
                          Mark read
                        </button>
                      )}

                      {n.is_read && (
                        <span className="notification-status">
                          Read
                        </span>
                      )}
                    </div>
                  ))}

                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><Bell/></div>
                  <b>No notifications</b>
                  <p>
                    Notifications generated by your demo assessments will appear here.
                  </p>
                </div>
              )}
            </section>
          )}


          {page==='Patient Monitoring' && (
            <section className="panel readings-panel">
              <div className="panel-head">
                <div>
                  <h3>Patient monitoring</h3>
                  <p>Demo records available to the doctor account</p>
                </div>
              </div>

              <ReadingTable rows={readings}/>
            </section>
          )}

        </div>


        <footer className="footer">
          <span>© 2026 MediSense AI</span>

          <span>
            <ShieldCheck size={14}/>
            Educational prototype · Not for clinical use
          </span>

          <span>Designed & Developed by Aashish Kumar</span>
        </footer>

      </main>
    </div>
  );
}


function MeasurementFields({form,setForm}) {
  const fields = [
    ['heart_rate','Heart rate','bpm'],
    ['systolic_bp','Systolic BP','mmHg'],
    ['diastolic_bp','Diastolic BP','mmHg'],
    ['spo2','Oxygen saturation','%'],
    ['respiratory_rate','Respiratory rate','/min'],
    ['temperature','Temperature','°C'],
    ['glucose','Glucose','mg/dL']
  ];

  return (
    <div className="fields-grid">
      {fields.map(([key,label,unit])=>(
        <div className="field" key={key}>
          <label>{label} <small>{unit}</small></label>
          <input
            type="number"
            step="0.1"
            value={form[key]}
            onChange={e=>setForm({...form,[key]:e.target.value})}
            required
          />
        </div>
      ))}
    </div>
  );
}


function ReadingTable({rows}) {
  if(!rows.length) {
    return (
      <div className="empty-inline">
        No saved measurements yet. Add a measurement to begin.
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Recorded</th>
            <th>Heart rate</th>
            <th>Blood pressure</th>
            <th>SpO₂</th>
            <th>Resp. rate</th>
            <th>Temp.</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(r=>(
            <tr key={r.id}>
              <td>{new Date(r.recorded_at).toLocaleString()}</td>
              <td>{r.heart_rate} bpm</td>
              <td>{r.systolic_bp}/{r.diastolic_bp}</td>
              <td>{r.spo2}%</td>
              <td>{r.respiratory_rate}/min</td>
              <td>{r.temperature}°C</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map(item => {
        const field = item.loc?.slice(1).join('.') || 'Input';
        return `${field}: ${item.msg}`;
      })
      .join(' | ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (detail && typeof detail === 'object') {
    return JSON.stringify(detail);
  }

  return fallback;
}

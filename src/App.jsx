import { useState, useEffect } from 'react';
import ReferralCard from './components/ReferralCard/ReferralCard';
import { Popup } from './components/Popup/Popup';
import AddReferralForm from './components/AddReferralForm/AddReferralForm';
import Login from './components/Login';
import './App.css';
import { supabase } from './lib/supabase';

// Импорт звёзд
import star1 from './assets/Star.png';
import star2 from './assets/Star2.png';


function App() {
  // ==================== STATE ====================
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupIsOpened, setPopupIsOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);

  // Смена звезды
  const [currentStarIndex, setCurrentStarIndex] = useState(0);
  const stars = [star1, star2];

  // Выбор периода (по умолчанию — текущий месяц)
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const currentDate = new Date().toLocaleDateString('ru-RU', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
});

const formattedDate =
  currentDate.charAt(0).toUpperCase() + currentDate.slice(1);




  // ==================== EFFECTS ====================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    async function fetchReferrals() {
      setLoading(true);
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('id', { ascending: false });

      if (error) console.error('Ошибка загрузки:', error);
      else setReferrals(data || []);

      setLoading(false);
    }

    fetchReferrals();
  }, [session]);

  // ==================== FUNCTIONS ====================
  const changeStyle = () => {
    setCurrentStarIndex((prev) => (prev + 1) % stars.length);
  };

  const openAddPopup = () => {
    setEditingId(null);
    setPopupIsOpened(true);
  };

  const openEditPopup = (id) => {
    setEditingId(id);
    setPopupIsOpened(true);
  };

  const closePopup = () => {
    setPopupIsOpened(false);
    setEditingId(null);
  };

  // Генерация месяцев с февраля 2026 + будущие
  const generateMonthOptions = () => {
    const options = [{ value: 'all', label: 'За всё время' }];

    let year = 2026;
    let month = 2;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    while (year < currentYear || (year === currentYear && month <= currentMonth + 3)) {
      const date = new Date(year, month - 1, 1);
      const value = `${year}-${String(month).padStart(2, '0')}`;
      const label = date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });

      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  // Фильтрация по периоду
  const getPeriodReferrals = () => {
    if (selectedPeriod === 'all') return referrals;

    const [year, month] = selectedPeriod.split('-').map(Number);

    return referrals.filter(item => {
      const dateStr = item.date2 || item.date1 || '';
      if (!dateStr) return false;

      const parts = dateStr.split('.').map(Number);
      const mon = parts[1];
      let yr = parts[2] || 2026;

      return yr === year && mon === month;
    });
  };

  const periodReferrals = getPeriodReferrals();
const currentProfit = periodReferrals
  .filter(r => r.status === 'Выплачен')
  .reduce(
    (sum, r) => sum + (Number(r.cash) || 0) - (Number(r.costs) || 0),
    0
  );

let formattedProfitPercent = '—';

if (selectedPeriod !== 'all') {
  const [year, month] = selectedPeriod.split('-').map(Number);

  const previousDate = new Date(year, month - 2, 1);
  const previousYear = previousDate.getFullYear();
  const previousMonth = previousDate.getMonth() + 1;

  const previousMonthReferrals = referrals.filter(item => {
    const dateStr = item.date2 || item.date1 || '';
    if (!dateStr) return false;

    const parts = dateStr.split('.').map(Number);
    const itemMonth = parts[1];
    const itemYear = parts[2] || 2026;

    return (
      itemYear === previousYear &&
      itemMonth === previousMonth
    );
  });

  const previousProfit = previousMonthReferrals
    .filter(r => r.status === 'Выплачен')
    .reduce(
      (sum, r) => sum + (Number(r.cash) || 0) - (Number(r.costs) || 0),
      0
    );

  if (previousProfit !== 0) {
    const percent =
      ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100;

    formattedProfitPercent =
      `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  }
}





  // Расчёты
  const countRegister = periodReferrals.filter(r => r.status === 'Оформлен').length;
  const sumRegister = periodReferrals
    .filter(r => r.status === 'Оформлен')
    .reduce((sum, r) => sum + (Number(r.cash) || 0), 0)
    .toLocaleString('ru-RU') + ' ₽';

  const countPending = periodReferrals.filter(r => r.status === 'Проверка').length;
  const sumPending = periodReferrals
    .filter(r => r.status === 'Проверка')
    .reduce((sum, r) => sum + (Number(r.cash) || 0), 0)
    .toLocaleString('ru-RU') + ' ₽';

      const countLoading = periodReferrals.filter(r => r.status === 'Ожидание').length;
  const sumLoading = periodReferrals
    .filter(r => r.status === 'Ожидание')
    .reduce((sum, r) => sum + (Number(r.cash) || 0), 0)
    .toLocaleString('ru-RU') + ' ₽';

  const countPaid = periodReferrals.filter(r => r.status === 'Выплачен').length;
  const sumPaid = periodReferrals
    .filter(r => r.status === 'Выплачен')
    .reduce((sum, r) => sum + (Number(r.cash) || 0), 0)
    .toLocaleString('ru-RU') + ' ₽';

  const totalCosts = periodReferrals
    .filter(r => r.status === 'Выплачен')
    .reduce((sum, r) => sum + (Number(r.costs) || 0), 0);

  const profit = (Number(sumPaid.replace(/\s|₽/g, '')) - totalCosts)
    .toLocaleString('ru-RU', {
      useGrouping: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    .replace(/\s/g, ',');

  // ==================== ФОРМА FUNCTIONS ====================
  const addOrUpdateReferral = async (referralData) => {
    if (editingId === null) {
      const { data, error } = await supabase
        .from('referrals')
        .insert([referralData])
        .select()
        .single();

      if (error) {
        console.error(error);
        alert('Не удалось добавить');
        return;
      }
      setReferrals(prev => [data, ...prev]);
    } else {
      const { error } = await supabase
        .from('referrals')
        .update(referralData)
        .eq('id', editingId);

      if (error) {
        console.error(error);
        alert('Не удалось сохранить');
        return;
      }

      setReferrals(prev =>
        prev.map(r => r.id === editingId ? { ...r, ...referralData } : r)
      );
    }
    closePopup();
  };

  const deleteReferral = async (id) => {
    if (!window.confirm('Точно удалить этого реферала?')) return;

    const { error } = await supabase.from('referrals').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert('Не удалось удалить');
      return;
    }

    setReferrals(prev => prev.filter(r => r.id !== id));
    closePopup();
  };

  const editingReferral = editingId ? referrals.find(r => r.id === editingId) : null;
  const filteredReferrals = activeStatus ? referrals.filter(r => r.status === activeStatus) : referrals;

  // ==================== RENDER ====================
  if (loadingSession) return <div>Проверка авторизации...</div>;
  if (!session) return <Login onSuccess={() => window.location.reload()} />;
  if (loading) return <div>Загрузка рефералов...</div>;




  return (
    <>
      <div className="container" style={{
        backgroundImage: `url(${stars[currentStarIndex]})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '80% 0px',
        backgroundSize: '450px',
      }}>
        <div className="header">
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="logout">
            Выйти
          </button>
        </div>

        {/* Выпадающий список с твоим стилем */}

<div className="topblock">
<div>
  <p className="opacitytext">{formattedDate}</p>
  <p className="profitpercent">{formattedProfitPercent}</p>
</div>

  <p className="cashAmount">{profit}<span className="ruble">₽</span></p>

<div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          style={{
            padding: '0',
            backgroundColor: 'transparent',
            width: 'fit-content',
            color: 'black',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            opacity: '0.7',
            fontWeight: '500',
          }}
        >
          {monthOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="addNewReferralButton" onClick={openAddPopup}>
          +++++
        </button>
</div>
</div>
        
<div className="podlojka">


        <div className="stats">
            <div className="register">
              <p className="registerCount">{countRegister} заказали</p>
              <p className="registerCash">({sumRegister})</p>
            </div>
              <div className="loading">
              <p className="loadingCount">{countLoading} жду цд</p>
              <p className="loadingCash">({sumLoading})</p>
            </div>
            <div className="cheking">
              <p className="chekingCount">{countPending} жду выплаты</p>
              <p className="chekingCash">({sumPending})</p>
            </div>
        </div>

        <Popup isOpened={popupIsOpened} closePopup={closePopup}>
          <AddReferralForm
            onSubmit={addOrUpdateReferral}
            onDelete={deleteReferral}
            initialData={editingReferral}
            isEditing={editingId !== null}
            editingId={editingId}
            onCancel={closePopup}
          />
        </Popup>

        <div className="sortByStatus">
          <p className={activeStatus === null ? 'active' : ''}onClick={() => setActiveStatus(null)}>все</p>
          <p className={activeStatus === 'Оформлен' ? 'active' : ''} onClick={() => setActiveStatus('Оформлен')}>заказали</p>
          <p className={activeStatus === 'Ожидание' ? 'active' : ''} onClick={() => setActiveStatus('Ожидание')}>цд</p>
          <p className={activeStatus === 'Проверка' ? 'active' : ''} onClick={() => setActiveStatus('Проверка')}>проверка</p>
          <p className={activeStatus === 'Выплачен' ? 'active' : ''} onClick={() => setActiveStatus('Выплачен')}>выплачены</p>
        </div>

        <ReferralCard datas={filteredReferrals} onEdit={openEditPopup} />
      </div>
      </div>
    </>
  );
}

export default App;
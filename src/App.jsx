import { useState, useEffect } from 'react';
import ReferralCard from './components/ReferralCard/ReferralCard';
import { Popup } from './components/Popup/Popup';
import AddReferralForm from './components/AddReferralForm/AddReferralForm';
import Login from './components/Login'; // Убедись, что этот компонент существует
import './App.css';
import courierIcon from './assets/courier.svg';
import zoomIcon from './assets/zoom.svg';
import { supabase } from './lib/supabase';

function App() {
  // Все хуки — строго в начале, до любых условий и return
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupIsOpened, setPopupIsOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);

  // Авторизация (всегда вызывается)
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

  // Загрузка рефералов — только если залогинен (но хук вызывается всегда)
  useEffect(() => {
    if (!session) return; // Просто пропускаем, если нет сессии — хук всё равно вызван

    async function fetchReferrals() {
      setLoading(true);
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки рефералов:', error);
      } else {
        setReferrals(data || []);
      }
      setLoading(false);
    }

    fetchReferrals();
  }, [session]); // Зависимость от session — перезагружается при логине

  // Все расчёты и функции — после хуков
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

  const addOrUpdateReferral = async (referralData) => {
    // ... (твой код без изменений)
    if (editingId === null) {
      const { data, error } = await supabase
        .from('referrals')
        .insert([referralData])
        .select()
        .single();

      if (error) {
        console.error('Ошибка добавления:', error);
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
        console.error('Ошибка обновления:', error);
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
    // ... (твой код без изменений)
    if (!window.confirm('Точно удалить этого реферала?')) return;

    const { error } = await supabase
      .from('referrals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить');
      return;
    }

    setReferrals(prev => prev.filter(r => r.id !== id));
    closePopup();
  };

  const editingReferral = editingId
    ? referrals.find(r => r.id === editingId)
    : null;

  const filteredReferrals = activeStatus
    ? referrals.filter(r => r.status === activeStatus)
    : referrals;

  // Расчёты (всегда выполняются, но если !session — referrals пустой)
  const countRegister = referrals.filter(item => item.status === 'Оформлен').length;
  const sumRegister = referrals
    .filter(r => r.status === 'Оформлен')
    .reduce((sum, r) => sum + (Number(r.cash) || 0), 0)
    .toLocaleString('ru-RU') + ' ₽';

  const countPending = referrals.filter(item => item.status === 'Проверка').length;
  const sumPending = referrals
    .filter(r => r.status === 'Проверка')
    .reduce((sum, r) => sum + (Number(r.cash) || 0), 0)
    .toLocaleString('ru-RU') + ' ₽';

  const countPaid = referrals.filter(item => item.status === 'Выплачен').length;
  const sumPaid = referrals
    .filter(r => r.status === 'Выплачен')
    .reduce((sum, r) => sum + (Number(r.cash) || 0), 0)
    .toLocaleString('ru-RU') + ' ₽';

  const totalCosts = referrals
    .filter(r => r.status === 'Выплачен')
    .reduce((sum, r) => sum + (Number(r.costs) || 0), 0);

  const totalPaid = referrals
    .filter(r => r.status === 'Выплачен')
    .reduce((sum, r) => sum + (Number(r.cash) || 0), 0);

  const profit = (totalPaid - totalCosts).toLocaleString('ru-RU') + ' ₽';

  const bankCounts = referrals
    .filter(r => r.status === 'Выплачен')
    .reduce((acc, r) => {
      const bank = r.bank || 'Другой';
      acc[bank] = (acc[bank] || 0) + 1;
      return acc;
    }, {});

  const bankList = Object.entries(bankCounts).map(([bank, count]) => (
    <p key={bank}>{count} {bank}</p>
  ));

  // JSX — теперь только один return
  if (loadingSession) {
    return <div>Проверка авторизации...</div>;
  }

  if (!session) {
    return <Login onSuccess={() => window.location.reload()} />;
  }

  if (loading) {
    return <div>Загрузка рефералов...</div>;
  }

  return (
    <div className="container">
      {/* Кнопка выхода */}
      <button
        onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
        style={{ margin: '10px', padding: '8px 16px' }}
        className='logout'
      >
        Выйти
      </button>

      {/* <div className="sortButtons">
        <button>день</button>
        <button>месяц</button>
        <button>все</button>
      </div> */}
<p className='opacitytext'>Заработано</p>
      <p className="cashAmount">{profit}</p>
      <p className='opacitytext'>за всё время</p>


  <button className="addNewReferralButton" onClick={openAddPopup}>
        добавить
      </button>


      <div className="stats">
        {/* <img src="src/assets/Star.png" alt="star" /> */}
        {/* ... весь твой stats блок без изменений ... */}
        <div className="left">
          <div className="register">
            <p className="registerCount">{countRegister} <img src={courierIcon} alt="" /></p>
            <p className="registerCash">на {sumRegister}</p>
          </div>
          <div className="cheking">
            <p className="chekingCount">{countPending} <img src={zoomIcon} alt="" /></p>
            <p className="chekingCash">на {sumPending}</p>
          </div>
          {/* <div className="paid">
            <p className="paidCount">{countPaid} выплачен</p>
            <p className="paidCash">{sumPaid}</p>
          </div> */}
        </div>

        <div className="right">
          <p><span className="dark">Выплачено:</span> {sumPaid}</p>
          <p><span className="dark">Затраты:</span> {totalCosts.toLocaleString('ru-RU') + ' ₽'}</p>
          <p><span className="dark">Всего карт:</span> {countPaid}</p>
          <div className="allTypeCards">{bankList}</div>
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
          close={closePopup}
        />
      </Popup>

      <div className="sortByStatus">
        {/* <p
          className={activeStatus === null ? 'active' : ''}
          onClick={() => setActiveStatus(null)}
        >
          Все
        </p> */}
        <p
          className={activeStatus === 'Оформлен' ? 'active' : ''}
          onClick={() => setActiveStatus('Оформлен')}
        >
          Оформлен
        </p>
        <p
          className={activeStatus === 'Ожидание' ? 'active' : ''}
          onClick={() => setActiveStatus('Ожидание')}
        >
          Ожидание
        </p>
        <p
          className={activeStatus === 'Проверка' ? 'active' : ''}
          onClick={() => setActiveStatus('Проверка')}
        >
          Проверка
        </p>
        <p
          className={activeStatus === 'Выплачен' ? 'active' : ''}
          onClick={() => setActiveStatus('Выплачен')}
        >
          Выплачен
        </p>
      </div>

      <ReferralCard datas={filteredReferrals} onEdit={openEditPopup} />
    </div>
  );
}

export default App;
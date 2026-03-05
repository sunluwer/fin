import { useState } from 'react'
import { useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ReferralCard from './components/ReferralCard/ReferralCard'
import { referrals as initialReferrals } from './data/data'
import { Popup } from './components/Popup/Popup'
import AddReferralForm from './components/AddReferralForm/AddReferralForm'
import './App.css'
import { supabase } from './lib/supabase'

function App() {

const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)


useEffect(() => {
    async function fetchReferrals() {
      setLoading(true)
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('id', { ascending: false })   // или по created_at desc

      if (error) {
        console.error('Ошибка загрузки рефералов:', error)
      } else {
        setReferrals(data || [])
      }
      setLoading(false)
    }

    fetchReferrals()
  }, [])
// const [referrals, setReferrals] = useState(initialReferrals);
  
  // ─── Состояние попапа и режима ────────────────────────
  const [popupIsOpened, setPopupIsOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);       // null = добавление, число = редактирование

  const openAddPopup = () => {
    setEditingId(null);          // явно режим добавления
    setPopupIsOpened(true);
  };

  const openEditPopup = (id) => {
    setEditingId(id);
    setPopupIsOpened(true);
  };

  const closePopup = () => {
    setPopupIsOpened(false);
    setEditingId(null);          // всегда сбрасываем редактирование при закрытии
  };

  // const addOrUpdateReferral = (referralData) => {
  //   if (editingId === null) {
  //     // Добавление
  //     const newId = referrals.length > 0 
  //       ? Math.max(...referrals.map(r => r.id)) + 1 
  //       : 1;
  //     setReferrals(prev => [...prev, { id: newId, ...referralData }]);
  //   } else {
  //     // Обновление
  //     setReferrals(prev =>
  //       prev.map(r => r.id === editingId ? { ...r, ...referralData } : r)
  //     );
  //   }
    
  //   // После любого действия — закрываем попап
  //   closePopup();
  // };

const addOrUpdateReferral = async (referralData) => {
    if (editingId === null) {
      // Добавление
      const { data, error } = await supabase
        .from('referrals')
        .insert([referralData])
        .select()
        .single()

      if (error) {
        console.error('Ошибка добавления:', error)
        alert('Не удалось добавить')
        return
      }
      setReferrals(prev => [data, ...prev])
    } else {
      // Обновление
      const { error } = await supabase
        .from('referrals')
        .update(referralData)
        .eq('id', editingId)

      if (error) {
        console.error('Ошибка обновления:', error)
        alert('Не удалось сохранить')
        return
      }

      setReferrals(prev =>
        prev.map(r => r.id === editingId ? { ...r, ...referralData } : r)
      )
    }

    closePopup()
  }




  const editingReferral = editingId 
    ? referrals.find(r => r.id === editingId) 
    : null;


const countRegister = referrals.filter(item => item.status === "Оформлен").length
const countPending = referrals.filter(item => item.status === "Проверка").length
const countPaid = referrals.filter(item => item.status === "Выплачен").length

// const countCash = referralsData.filter(item => item.status === "Выплачен")
const totalPaid = referrals
    .filter(r => r.status === "Выплачен")
    .reduce((sum, r) => sum + (Number(r.cash) || 0), 0);

    const formattedTotal = totalPaid.toLocaleString('ru-RU') + ' ₽';
// for(let i)
// const countCash 

// const deleteReferral = (id) => {
//     if (!window.confirm("Точно удалить этого реферала?")) return;
    
//     setReferrals(prev => prev.filter(r => r.id !== id));
//     closePopup();
//   };


const deleteReferral = async (id) => {
    if (!window.confirm("Точно удалить этого реферала?")) return

    const { error } = await supabase
      .from('referrals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Ошибка удаления:', error)
      alert('Не удалось удалить')
      return
    }

    setReferrals(prev => prev.filter(r => r.id !== id))
    closePopup()
  }


  return (
    <>
    <div className="container">
      <div className="sortButtons">
        <button>день</button>
        <button>месяц</button>
        <button>все</button>
      </div>

<p className='cashAmount'>{formattedTotal}</p>



<div className="stats">
  <p className='register'>{countRegister} оформлений</p>
  <p className='cheking'>{countPending} на проверке</p>
  <p className='paid'>{countPaid} выплачен</p>
</div>


<button 
        className="addNewReferralButton" 
        onClick={openAddPopup}
      >
        + new referral
      </button>

<Popup 
        isOpened={popupIsOpened} 
        closePopup={closePopup}
      >
        <AddReferralForm
          onSubmit={addOrUpdateReferral}
          onDelete={deleteReferral}
          initialData={editingReferral}
          isEditing={editingId !== null}
          editingId={editingId}
          onCancel={closePopup}           // отмена = просто закрыть попап
          close={closePopup}              // если форма сама хочет закрыть
        />
      </Popup>

{/* <FormFlag/> */}


<ReferralCard 
        datas={referrals} 
        onEdit={openEditPopup}           // ← теперь открывает попап
      />




    </div>
    </>
  )
}

export default App

import { useState } from 'react'
import Styles from './AddReferralForm.module.css'
import { useEffect } from 'react';

function AddReferralForm({ onSubmit, onDelete, initialData = {}, isEditing = false, editingId, onCancel }) {
  const [formData, setFormData] = useState({
    bank: '',
    user: '',
    cash: '',
    date1: '',
    date2: '',
    status: 'Проверка'
  });

  const handleDelete = () => {
    if (editingId && onDelete) {
      onDelete(editingId);
    }
  };

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        bank: initialData.bank || '',
        user: initialData.user || '',
        cash: initialData.cash || '',
        date1: initialData.date1 || '',
        date2: initialData.date2 || '',
        status: initialData.status || 'Оформлен'
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.bank || !formData.user || !formData.cash) {
      alert('Банк, профиль и выплата — обязательны');
      return;
    }

    onSubmit({
      bank: formData.bank,
      user: formData.user,
      cash: Number(formData.cash),
      date1: formData.date1,
      date2: formData.date2,
      status: formData.status
    });

    // Очищаем только при добавлении (при редактировании очистит родитель)
    if (!isEditing) {
      setFormData({
        bank: '', user: '', cash: '', date1: '', date2: '', status: 'Оформлен'
      });
    }
  };
    
  return (
    <>
<form onSubmit={handleSubmit} className={Styles.form}>
      <input
        type="text"
        name="bank"
        placeholder="Выберите банк"
        value={formData.bank}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="user"
        placeholder="Профиль реферала (@username)"
        value={formData.user}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="cash"
        placeholder="Выплата"
        value={formData.cash}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="date1"
        placeholder="Дата оформления (дд.мм)"
        value={formData.date1}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="date2"
        placeholder="Дата получения (дд.мм)"
        value={formData.date2}
        onChange={handleChange}
        required
      />
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
      >
        <option value="">Выберите статус</option>
        <option value="Проверка">Проверка</option>
        <option value="Оформлен">Оформлен</option>
        <option value="Выплачен">Выплачен</option>
      </select>

      {/* <button type="submit">Добавить</button> */}

<div className={Styles.buttons}>
        <button type="submit">
          {isEditing ? 'Сохранить изменения' : 'Добавить'}
        </button>
        
        {isEditing && (
          <button type="button" onClick={onCancel} className='cancel'>
            Отмена
          </button>
        )}
      </div>


{isEditing && (
        <p 
          className={Styles.delete} 
          onClick={handleDelete}
          style={{ 
            // color: '#ff4d4f', 
            cursor: 'pointer', 
            textAlign: 'center', 
            marginTop: '16px',
            fontWeight: '500'
          }}
        >
          Удалить реферала
        </p>
      )}



{/* <p className={Styles.delete}>Удалить</p> */}
    </form>
    </>
  )
}

export default AddReferralForm

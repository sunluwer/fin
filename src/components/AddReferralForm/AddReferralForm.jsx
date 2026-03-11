import { useState, useEffect } from 'react';
import Styles from './AddReferralForm.module.css';

function AddReferralForm({ onSubmit, onDelete, initialData = {}, isEditing = false, editingId, onCancel }) {
  const [formData, setFormData] = useState({
    bank: '',
    user: '',
    cash: '',
    date1: '',
    date2: '',
    date3: '',
    costs: '',
    status: 'Оформлен'
  });

  const handleDelete = () => {
    if (editingId && onDelete) {
      onDelete(editingId);
    }
  };

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        bank: initialData.bank || '',
        user: initialData.user || '',
        cash: initialData.cash || '',
        date1: initialData.date1 || '',
        date2: initialData.date2 || '',
        date3: initialData.date3 || '',
        costs: initialData.costs || '',
        status: initialData.status || 'Проверка'
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
      date3: formData.date3,
      costs: Number(formData.costs),
      status: formData.status
    });

    if (!isEditing) {
      setFormData({
        bank: '', user: '', cash: '', date1: '', date2: '', date3: '', costs: '', status: 'Проверка'
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
        <input
          type="text"
          name="date3"
          placeholder="Дата покупки (дд.мм)"
          value={formData.date3}
          onChange={handleChange}
        //   required
        />
        <input
          type="number"
          name="costs"
          placeholder="Затраты"
          value={formData.costs}
          onChange={handleChange}
        //   required
        />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="">Выберите статус</option>
          <option value="Оформлен">Оформлен</option>
          <option value="Ожидание">Ожидание</option>
          <option value="Проверка">Проверка</option>
          <option value="Выплачен">Выплачен</option>
        </select>

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
              cursor: 'pointer', 
              textAlign: 'center', 
              marginTop: '16px',
              fontWeight: '500'
            }}
          >
            Удалить реферала
          </p>
        )}
      </form>
    </>
  );
}

export default AddReferralForm;
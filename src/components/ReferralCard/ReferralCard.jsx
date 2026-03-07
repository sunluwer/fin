import Styles from './ReferralCard.module.css';
import { useMemo } from 'react';

const ReferralCard = ({ datas, onEdit }) => {
  const statusClasses = {
    'Выплачен': Styles['status-paid'],
    'Проверка': Styles['status-pending'],
    'Оформлен': Styles['status-register'], // Добавь в CSS если нужно
    'Ожидание': Styles['status-waiting'], // Добавь в CSS если нужно
  };
  const bankClasses = {
    'Альфа': Styles['bank-red'],
    'Тбанк': Styles['bank-yellow'],
  };

  const sortedDatas = useMemo(() => {
    const statusPriority = {
      "Проверка": 1,
      "Оформлен": 2,
      "Ожидание": 3,
      "Выплачен": 4
    };

    const parseDate = (dateStr) => {
      if (!dateStr) return 0;
      const [day, month] = dateStr.split('.').map(Number);
      return month * 100 + day;
    };

    return [...datas].sort((a, b) => {
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      return parseDate(a.date2) - parseDate(b.date2);
    });
  }, [datas]);

  return (
    <div className={Styles.referrals}>
      {sortedDatas.map((data) => (
        <div className={Styles.referral} key={data.id}>
          <div className={Styles.top}>
            <div className={Styles.left}>
              <p className={`${Styles.bank} ${bankClasses[data.bank] || ''}`}>{data.bank}</p>
              <p className={Styles.user}>{data.user}</p>
              <p 
                className={Styles.edit} 
                onClick={() => onEdit(data.id)}
                style={{ cursor: 'pointer' }}
              >
                📝
              </p>
            </div>
            <div className={Styles.right}>
              <p className={Styles.cash}>+{data.cash} ₽</p>
            </div>
          </div>
          <div className={Styles.bottom}>
            <div className={Styles.left}>
              <p className={Styles.date1}>{data.date1}</p>
              -
              <p className={Styles.date2}>{data.date2}</p>
              -
              <p className={Styles.date3}>{data.date3 || '-'}</p> {/* Добавил date3 */}
            </div>
            <p className={statusClasses[data.status] || ''}>
              {data.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReferralCard;